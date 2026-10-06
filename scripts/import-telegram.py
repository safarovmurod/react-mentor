#!/usr/bin/env python3
"""Stage Telegram exports or Web downloads for source review; never publish them."""
import argparse
import hashlib
import json
import os
import re
import shutil
import stat
import subprocess
import tempfile
import zipfile
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath

COURSES = ('html', 'css', 'git', 'cpp', 'javascript-1', 'javascript-2', 'react')
CODE = {'.html', '.htm', '.css', '.js', '.jsx', '.ts', '.tsx', '.cpp', '.cc', '.cxx', '.h', '.hpp', '.c', '.json', '.md', '.txt'}
IMAGES = {'.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff', '.bmp'}


class VisibleHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts, self.links, self.hidden = [], [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.hidden += 1
        if tag in ('p', 'div', 'br', 'li', 'tr', 'h1', 'h2', 'h3'):
            self.parts.append('\n')
        if tag == 'a':
            href = dict(attrs).get('href', '')
            if href.startswith('https://'):
                self.links.append(href)

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.hidden = max(0, self.hidden - 1)

    def handle_data(self, data):
        if not self.hidden:
            self.parts.append(data)


def flatten_text(value):
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return ''.join(flatten_text(item) for item in value)
    if isinstance(value, dict):
        return flatten_text(value.get('text', ''))
    return ''


def infer_course(name, text):
    """Suggestions only: ambiguous JavaScript levels remain unclassified."""
    name = name.lower()
    sample = text.lower()
    signals = {
        'html': (r'html', r'<!doctype|<html|<body|html|семантик|тег'),
        'css': (r'css', r'css|flexbox|grid-template|селектор'),
        'cpp': (r'c\+\+|cpp|\.hpp\b|\.cc\b', r'c\+\+|#include|std::|cout|cin'),
        'git': (r'github|\bgit\b', r'git commit|git branch|git merge|github'),
        'react': (r'react|\.jsx\b|\.tsx\b', r'react|usestate|useeffect|jsx'),
        'javascript-1': (r'js[-_ ]?1\b|javascript[-_ ]?1\b', r'javascript|\bconst\b|\blet\b|document\.'),
        'javascript-2': (r'js[-_ ]?2\b|javascript[-_ ]?2\b', r'javascript|\bconst\b|\blet\b|promise|async'),
    }
    candidates = [course for course, (filename, body) in signals.items()
                  if re.search(filename, name) and re.search(body, sample)]
    if len(candidates) == 1:
        return candidates[0]
    # Source code extensions plus actual syntax provide a second independent cue.
    extension = Path(name).suffix
    if extension in ('.cpp', '.cc', '.cxx', '.hpp') and re.search(signals['cpp'][1], sample):
        return 'cpp'
    return None


def safe_member(info):
    name = info.filename.replace('\\', '/')
    parts = PurePosixPath(name)
    return not (parts.is_absolute() or '..' in parts.parts or ':' in name or '\x00' in name
                or stat.S_ISLNK(info.external_attr >> 16))


class Importer:
    def __init__(self, output, *, course=None, ocr=False, tessdata=None, max_bytes=512 * 1024 * 1024, max_file=64 * 1024 * 1024):
        self.output = Path(output)
        self.output.mkdir(parents=True, exist_ok=False)
        (self.output / 'files').mkdir()
        (self.output / 'text').mkdir()
        self.course, self.ocr = course, ocr
        self.max_bytes, self.max_file, self.bytes, self.count = max_bytes, max_file, 0, 0
        self.records, self.messages, self.links, self.seen = [], [], set(), {}
        directory=tessdata or os.environ.get('TESSDATA_PREFIX')
        cache=Path('/workspace/.cache/react-mentor-ocr/tessdata')
        if not directory and cache.is_dir():
            directory=cache
        self.tessdata_args=['--tessdata-dir',str(directory)] if directory else []
        self.languages = []
        if ocr and shutil.which('tesseract'):
            languages = subprocess.run(['tesseract', '--list-langs', *self.tessdata_args], capture_output=True, text=True, timeout=20).stdout.splitlines()[1:]
            self.languages = [lang for lang in ('eng', 'rus', 'tgk') if lang in languages]

    def run(self, source):
        source = Path(source).resolve()
        if source.is_dir():
            if self.output.resolve().is_relative_to(source):
                raise ValueError('Output must be outside the input export')
            for file in sorted(source.rglob('*')):
                if file.is_symlink():
                    self.records.append({'name':str(file.relative_to(source)), 'status':'rejected-symlink'})
                elif file.is_file():
                    self.local_file(file, str(file.relative_to(source)))
        else:
            self.local_file(source, source.name)
        report = {
            'channel_url':'https://t.me/programmerPOdCapot',
            'publication_status':'staged-only; explanations and visual review still required',
            'ocr_languages':self.languages,
            'materials':self.records, 'messages':self.messages,
            'links':[{'url':url, 'status':'not-visited'} for url in sorted(self.links)],
            'summary':{
                'unique_files':len(self.seen), 'duplicates':sum(record['status']=='duplicate' for record in self.records),
                'messages':len(self.messages), 'files_by_course':{course:sum(record.get('course')==course and record['status']!='duplicate' for record in self.records) for course in COURSES},
                'issues':sum(record['status'] not in ('extracted', 'archive', 'duplicate') for record in self.records),
            },
        }
        (self.output / 'manifest.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        return report

    def local_file(self, file, label):
        if file.stat().st_size > self.max_file:
            self.records.append({'name':label,'status':'file-limit-exceeded'})
            return
        self.process(file.read_bytes(), label)

    def process(self, data, label, depth=0):
        self.count += 1
        self.bytes += len(data)
        if self.count > 20000 or self.bytes > self.max_bytes or len(data) > self.max_file:
            raise ValueError('Import resource limit exceeded; nothing has been published')
        digest = hashlib.sha256(data).hexdigest()
        if digest in self.seen:
            self.records.append({'name':label,'sha256':digest,'status':'duplicate','duplicate_of':self.seen[digest]})
            return
        self.seen[digest] = label
        suffix = Path(label).suffix.lower()
        suffix = suffix if re.fullmatch(r'\.[a-z0-9]+', suffix) else '.bin'
        stored = self.output / 'files' / (digest + suffix)
        stored.write_bytes(data)
        record = {'name':label,'sha256':digest,'bytes':len(data),'file':str(stored.relative_to(self.output)), 'course':None,'status':'unread','needs_visual_review':False}
        self.records.append(record)
        try:
            if suffix == '.zip':
                if depth >= 4:
                    record['status'] = 'archive-depth-limit'
                    return
                record['status'] = 'archive'
                with zipfile.ZipFile(stored) as archive:
                    for entry in archive.infolist():
                        if entry.is_dir():
                            continue
                        nested = label + '!' + entry.filename
                        if not safe_member(entry):
                            self.records.append({'name':nested,'status':'rejected-archive-path'})
                            continue
                        if entry.file_size > self.max_file or entry.file_size + self.bytes > self.max_bytes:
                            self.records.append({'name':nested,'status':'file-limit-exceeded'})
                            continue
                        with archive.open(entry) as handle:
                            child = handle.read(self.max_file + 1)
                        self.process(child, nested, depth + 1)
                return
            if suffix == '.pdf':
                if not shutil.which('pdftotext'):
                    record['status'] = 'missing-pdftotext'
                    return
                result = subprocess.run(['pdftotext','-layout','-enc','UTF-8',str(stored),'-'], capture_output=True, text=True, timeout=120, check=True)
                pages = result.stdout.split('\f')
                if pages and not pages[-1].strip():
                    pages.pop()
                record['needs_visual_review'] = True
                record['pages'] = len(pages)
                unread = []
                for index, page in enumerate(pages):
                    if len(re.findall(r'[^\W\d_]', page)) < 20:
                        if self.ocr and self.languages and shutil.which('pdftoppm'):
                            with tempfile.TemporaryDirectory(prefix='mentor-pdf-ocr-') as directory:
                                prefix = str(Path(directory) / 'page')
                                subprocess.run(['pdftoppm','-f',str(index+1),'-l',str(index+1),'-singlefile','-r','150','-png',str(stored),prefix], capture_output=True, timeout=120, check=True)
                                pages[index] = self.image_text(prefix + '.png')
                        if len(re.findall(r'[^\W\d_]', pages[index])) < 20:
                            unread.append(index+1)
                text = '\n\n'.join('[Page %d]\n%s' % (index+1,page) for index,page in enumerate(pages))
                record['unread_pages'] = unread
                record['status'] = 'requires-page-review' if unread else 'extracted'
            elif suffix in IMAGES:
                record['needs_visual_review'] = True
                if not self.ocr or not self.languages:
                    record['status'] = 'requires-image-review'
                    return
                text = self.image_text(stored)
                record['status'] = 'extracted' if text.strip() else 'requires-image-review'
            elif suffix in CODE:
                try:
                    text = data.decode('utf-8-sig')
                except UnicodeDecodeError:
                    record['status'] = 'requires-encoding-review'
                    return
                if suffix == '.json':
                    parsed = json.loads(text)
                    if isinstance(parsed, dict) and isinstance(parsed.get('messages'), list):
                        for message in parsed['messages']:
                            if message.get('type') == 'message':
                                body = flatten_text(message.get('text',''))
                                self.messages.append({'id':message.get('id'),'date':message.get('date'),'text':body,'file':message.get('file'),'photo':message.get('photo')})
                                self.links.update(re.findall(r'https://[^\s<>\"]+', body))
                                for entity in message.get('text_entities', []):
                                    if str(entity.get('href','')).startswith('https://'):
                                        self.links.add(entity['href'])
                if suffix in ('.html', '.htm'):
                    parser = VisibleHTML()
                    parser.feed(text)
                    self.links.update(parser.links)
                    # Retain actual HTML source code; chat export HTML gets a visible-text copy.
                    if Path(label).name.lower().startswith('messages'):
                        text = ''.join(parser.parts)
                record['status'] = 'extracted'
            else:
                record['status'] = 'unsupported-format'
                return
            text_file = self.output / 'text' / (digest + '.txt')
            text_file.write_text(text, encoding='utf-8')
            record['text'] = str(text_file.relative_to(self.output))
            record['course'] = self.course or infer_course(label, text)
            record['classification'] = 'owner-selected' if self.course else 'suggestion; verify before publishing'
        except (subprocess.SubprocessError, OSError, ValueError, RuntimeError, zipfile.BadZipFile):
            record['status'] = 'read-error'

    def image_text(self, file):
        result = subprocess.run(['tesseract',str(file),'stdout',*self.tessdata_args,'-l','+'.join(self.languages)], capture_output=True, text=True, timeout=120, check=True)
        return result.stdout


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--course', choices=COURSES)
    parser.add_argument('--ocr', action='store_true')
    parser.add_argument('--tessdata',type=Path)
    args = parser.parse_args()
    importer = Importer(args.output, course=args.course, ocr=args.ocr, tessdata=args.tessdata)
    report = importer.run(args.source)
    print(json.dumps(report['summary'], ensure_ascii=False))
    print('Staged for review:', args.output / 'manifest.json')


if __name__ == '__main__':
    main()
