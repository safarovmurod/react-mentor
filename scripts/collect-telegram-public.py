#!/usr/bin/env python3
"""Collect an HTTPS public channel preview, not an authenticated Telegram session.

Stages message text and attachment metadata. Telegram document links do not
provide original bytes; no attachment is marked downloaded or analyzed.
"""
import argparse
import json
import re
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, parse_qs
from urllib.request import Request, urlopen

VOID = {'br', 'hr', 'img', 'meta', 'link', 'input', 'source', 'wbr', 'area', 'base', 'embed', 'param', 'track', 'col'}


class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def select(self, name):
        return [node for node in self.walk() if name in node.attrs.get('class', '').split()]

    def text(self):
        if self.tag in ('script', 'style'):
            return ''
        return ''.join(child.text() if isinstance(child, Node) else child for child in self.children) + ('\n' if self.tag in ('br', 'p', 'div', 'pre') else '')


class DOM(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                self.stack = self.stack[:index]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def next_page(href, channel):
    url = urljoin('https://t.me/', href)
    parsed = urlparse(url)
    before = parse_qs(parsed.query).get('before', [])
    if parsed.scheme != 'https' or parsed.netloc != 't.me' or parsed.path != '/s/' + channel:
        raise ValueError('Unexpected pagination destination')
    if len(before) != 1 or not re.fullmatch(r'[1-9][0-9]*', before[0]):
        raise ValueError('Invalid pagination cursor')
    return 'https://t.me/s/' + channel + '?before=' + before[0]


def parse_page(html, channel):
    dom = DOM()
    dom.feed(html)
    posts = []
    for message in dom.root.select('tgme_widget_message'):
        post = message.attrs.get('data-post', '')
        if not re.fullmatch(re.escape(channel) + r'/[1-9][0-9]*', post):
            continue
        texts = message.select('tgme_widget_message_text')
        times = [node.attrs.get('datetime') for node in message.walk() if node.tag == 'time']
        documents = []
        for node in message.select('tgme_widget_message_document_wrap'):
            href = node.attrs.get('href', '')
            if not re.fullmatch(r'https://t\.me/' + re.escape(channel) + r'/[1-9][0-9]*(?:\?single)?', href):
                continue
            title = node.text().strip().splitlines()
            documents.append({'title':title[0], 'size_label':title[-1].strip() if len(title)>1 else '', 'url':href, 'status':'telegram-only; original not downloaded'})
        photos = []
        for node in message.select('tgme_widget_message_photo_wrap'):
            match = re.search(r"url\(['\"]?(.*?)['\"]?\)", node.attrs.get('style', ''))
            if match and urlparse(match.group(1)).scheme == 'https':
                photos.append(match.group(1))
        links = []
        for text in texts:
            for node in text.walk():
                href = node.attrs.get('href', '')
                # Telegram auto-links Sass @include/@each as account mentions.
                if node.tag == 'a' and href.startswith('https://') and not href.startswith('https://t.me/'):
                    links.append(href)
        videos = []
        for node in message.select('tgme_widget_message_video_player'):
            duration = node.select('message_video_duration')
            videos.append({'url':node.attrs.get('href', 'https://t.me/' + post),
                           'duration':duration[0].text().strip() if duration else '',
                           'status':'telegram-only; video not watched'})
        posts.append({'id':post, 'url':'https://t.me/' + post, 'date':times[0] if times else None,
                      'text':texts[0].text().strip() if texts else '', 'documents':documents,
                      'photos':photos, 'videos':videos, 'links':sorted(set(links))})
    # At the beginning of history Telegram may retain only an `after` link.
    more = [node for node in dom.root.select('tme_messages_more') if 'before' in parse_qs(urlparse(node.attrs.get('href', '')).query)]
    return posts, next_page(more[0].attrs.get('href', ''), channel) if more else None


def collect(channel, output, max_pages=100):
    if not re.fullmatch(r'[A-Za-z][A-Za-z0-9_]{4,31}', channel):
        raise ValueError('Expected a Telegram channel username')
    output = Path(output)
    output.mkdir(parents=True, exist_ok=False)
    seen, posts, pages = set(), {}, []
    url, finished = 'https://t.me/s/' + channel, False
    for index in range(max_pages):
        if url in seen:
            raise ValueError('Repeated pagination cursor')
        seen.add(url)
        with urlopen(Request(url, headers={'User-Agent':'ReactMentor source review'}), timeout=25) as response:
            if urlparse(response.url).hostname != 't.me':
                raise ValueError('Unexpected preview redirect')
            data = response.read(2 * 1024 * 1024 + 1)
        if len(data) > 2 * 1024 * 1024:
            raise ValueError('Preview page exceeds size bound')
        (output / ('page-%03d.html' % index)).write_bytes(data)
        items, following = parse_page(data.decode('utf-8'), channel)
        if not items:
            raise ValueError('No public messages; this is not authenticated channel access')
        posts.update((item['id'], item) for item in items)
        pages.append({'url':url, 'message_widgets':len(items)})
        print('Page %d: %d public message widgets collected' % (index + 1, len(posts)), flush=True)
        if not following:
            finished = True
            break
        url = following
    report = {'channel':'https://t.me/' + channel, 'collected_at':datetime.now(timezone.utc).isoformat(),
              'public_preview_finished':finished, 'scope':'Public preview only; deleted, private and hidden messages may be absent. No original attachments downloaded.',
              'pages':pages, 'messages':sorted(posts.values(), key=lambda item:int(item['id'].split('/')[-1]))}
    (output / 'public-history.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--channel', default='programmerPOdCapot')
    parser.add_argument('--output', required=True)
    parser.add_argument('--max-pages', type=int, default=100)
    args = parser.parse_args()
    if not 1 <= args.max_pages <= 100:
        parser.error('--max-pages must be 1–100')
    result = collect(args.channel, args.output, args.max_pages)
    print('Collected %d public widgets. Attachments remain unread.' % len(result['messages']))
