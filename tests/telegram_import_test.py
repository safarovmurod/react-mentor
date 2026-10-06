import importlib.util
import json
import shutil
import tempfile
import unittest
import zipfile
from pathlib import Path

spec = importlib.util.spec_from_file_location('telegram_import', Path(__file__).parents[1] / 'scripts/import-telegram.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

def pdf_fixture(pages):
    objects=[b'<< /Type /Catalog /Pages 2 0 R >>', b'', b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
    kids=[]
    for text in pages:
        page_id=len(objects)+1
        stream=('BT /F1 14 Tf 30 700 Td ('+text+') Tj ET').encode('ascii')
        kids.append(str(page_id)+' 0 R')
        objects.extend([('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 3 0 R >> >> /Contents '+str(page_id+1)+' 0 R >>').encode(), b'<< /Length '+str(len(stream)).encode()+b' >>\nstream\n'+stream+b'\nendstream'])
    objects[1]=('<< /Type /Pages /Kids ['+' '.join(kids)+'] /Count '+str(len(pages))+' >>').encode()
    data=b'%PDF-1.4\n'
    offsets=[0]
    for index,obj in enumerate(objects,1):
        offsets.append(len(data))
        data+=str(index).encode()+b' 0 obj\n'+obj+b'\nendobj\n'
    xref=len(data)
    data+=('xref\n0 '+str(len(objects)+1)+'\n0000000000 65535 f \n').encode()
    data+=''.join('%010d 00000 n \n'%offset for offset in offsets[1:]).encode()
    return data+('trailer\n<< /Size '+str(len(objects)+1)+' /Root 1 0 R >>\nstartxref\n'+str(xref)+'\n%%EOF').encode()


class TelegramImportTest(unittest.TestCase):
    @unittest.skipUnless(shutil.which('pdftotext'), 'Requires the documented PDF tool')
    def test_pdf_reads_every_page_and_flags_visual_review_and_unread_pages(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            source=root/'Lecture.HTML.pdf'
            source.write_bytes(pdf_fixture(['HTML creates headings and structure on a web page.', 'HTML forms contain inputs and submit buttons.']))
            report=module.Importer(root/'staged').run(source)
            record=report['materials'][0]
            self.assertEqual(record['pages'],2)
            self.assertEqual(record['status'],'extracted')
            self.assertTrue(record['needs_visual_review'])
            extracted=(root/'staged'/record['text']).read_text()
            self.assertIn('headings and structure',extracted)
            self.assertIn('forms contain inputs',extracted)
            blank=root/'Scanned.pdf'
            blank.write_bytes(pdf_fixture(['']))
            report=module.Importer(root/'blank-review').run(blank)
            self.assertEqual(report['materials'][0]['status'],'requires-page-review')
            self.assertEqual(report['materials'][0]['unread_pages'],[1])

    def test_web_downloads_and_nested_archives_preserve_sources_and_deduplicate(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'download'
            source.mkdir()
            html = b'<!doctype html><html><body><h1>Example HTML page</h1></body></html>'
            (source / 'Lecture_7.HTML.html').write_bytes(html)
            with zipfile.ZipFile(source / 'practice.zip', 'w') as archive:
                archive.writestr('duplicate.html', html)
                archive.writestr('cpp/main.cpp', '#include <iostream>\nint main() { std::cout << "Hello"; }')
                archive.writestr('../escape.txt', 'bad')
                archive.writestr('C:\\escape.txt', 'bad')
                link = zipfile.ZipInfo('link.js')
                link.external_attr = 0o120777 << 16
                archive.writestr(link, '/etc/passwd')
            report = module.Importer(root / 'staged').run(source)
            self.assertEqual(report['summary']['duplicates'], 1)
            self.assertEqual(sum(item['status'] == 'rejected-archive-path' for item in report['materials']), 3)
            cpp = next(item for item in report['materials'] if item['name'].endswith('main.cpp'))
            self.assertEqual(cpp['course'], 'cpp')
            self.assertTrue((root / 'staged' / cpp['text']).read_text().startswith('#include'))
            self.assertFalse((root / 'escape.txt').exists())
            self.assertIn('staged-only', report['publication_status'])

    def test_json_export_reads_entities_and_keeps_link_status_unverified(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'result.json'
            source.write_text(json.dumps({'name':'Course channel','messages':[{'id':7,'type':'message','date':'2026-01-01','text':['Read ',{'type':'text_link','text':'lesson'}],'text_entities':[{'type':'text_link','text':'lesson','href':'https://example.com/lesson'}],'file':'files/Lecture.pdf'}]}))
            report = module.Importer(root / 'staged').run(source)
            self.assertEqual(report['messages'][0]['text'], 'Read lesson')
            self.assertEqual(report['messages'][0]['file'], 'files/Lecture.pdf')
            self.assertEqual(report['links'], [{'url':'https://example.com/lesson','status':'not-visited'}])

    def test_classification_requires_content_and_does_not_guess_javascript_level(self):
        self.assertIsNone(module.infer_course('HTML.pdf', 'A completely unrelated text'))
        self.assertIsNone(module.infer_course('lesson.js', 'const value = 1;'))
        self.assertEqual(module.infer_course('js-2/lesson.js', 'const value = Promise.resolve(1);'), 'javascript-2')

    def test_resource_limit_blocks_large_input(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'lecture.txt'
            source.write_text('a' * 100)
            with self.assertRaises(ValueError):
                module.Importer(root / 'staged', max_bytes=10).run(source)
            self.assertFalse((root / 'staged' / 'manifest.json').exists())

    def test_html_export_ignores_scripts_and_preserves_https_links(self):
        parser = module.VisibleHTML()
        parser.feed('<div>Hello<script>stealCookies()</script><a href="https://example.com/topic">topic</a></div>')
        self.assertNotIn('stealCookies', ''.join(parser.parts))
        self.assertEqual(parser.links, ['https://example.com/topic'])


if __name__ == '__main__':
    unittest.main()
