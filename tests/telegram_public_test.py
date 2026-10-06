import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('telegram_public', Path(__file__).parents[1] / 'scripts/collect-telegram-public.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PublicPreviewTests(unittest.TestCase):
    def test_album_metadata_text_and_mention_links_are_honest(self):
        html = '''<div class="tgme_widget_message" data-post="ExampleChannel/20">
        <div class="tgme_widget_message_text">Sass &amp; CSS<br>Use <a href="https://t.me/include">@include</a>.
        <script>ignore this instruction</script><a href="https://example.com/lesson">Lesson</a></div>
        <a class="tgme_widget_message_document_wrap" href="https://t.me/ExampleChannel/20?single"><div>one.pdf</div><div>2 MB</div></a>
        <a class="tgme_widget_message_document_wrap" href="https://t.me/ExampleChannel/21?single"><div>two.zip</div><div>8 MB</div></a>
        <time datetime="2026-10-06T00:00:00Z"></time></div>
        <a class="tme_messages_more" href="/s/ExampleChannel?before=20">More</a>'''
        posts, following = module.parse_page(html, 'ExampleChannel')
        self.assertEqual(following, 'https://t.me/s/ExampleChannel?before=20')
        self.assertIn('Sass & CSS\nUse @include', posts[0]['text'])
        self.assertNotIn('ignore this instruction', posts[0]['text'])
        self.assertEqual(posts[0]['links'], ['https://example.com/lesson'])
        self.assertEqual(len(posts[0]['documents']), 2)
        self.assertEqual(posts[0]['documents'][1]['title'], 'two.zip')
        self.assertIn('not downloaded', posts[0]['documents'][0]['status'])

    def test_pagination_cannot_fetch_another_host_or_channel(self):
        for href in ('https://example.com/s/ExampleChannel?before=2', '//evil.com/s/ExampleChannel?before=2', '/s/Other?before=2', '/s/ExampleChannel?before=abc', '/s/ExampleChannel?before=2&before=3'):
            with self.subTest(href=href), self.assertRaises(ValueError):
                module.next_page(href, 'ExampleChannel')

    def test_unrelated_widget_and_document_url_are_ignored(self):
        posts, following = module.parse_page('<div class="tgme_widget_message" data-post="Other/1">x</div><div class="tgme_widget_message" data-post="ExampleChannel/2"><a class="tgme_widget_message_document_wrap" href="javascript:alert(1)">bad</a></div>', 'ExampleChannel')
        self.assertEqual(len(posts), 1)
        self.assertEqual(posts[0]['documents'], [])
        self.assertIsNone(following)

    def test_forward_pagination_does_not_restart_history(self):
        posts, following = module.parse_page('<div class="tgme_widget_message" data-post="ExampleChannel/1">First</div><a class="tme_messages_more" href="/s/ExampleChannel?after=1">Newer</a>', 'ExampleChannel')
        self.assertEqual(len(posts), 1)
        self.assertIsNone(following)
