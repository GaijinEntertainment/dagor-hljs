import hljs from 'highlight.js/lib/core';
import {expect, test} from 'vite-plus/test';
import {testMarkup} from '../../../test/markup.ts';
import blk from '../src/blk.ts';

testMarkup('blk', blk, new URL('markup/', import.meta.url));

test('a lone CR ends a value', () => {
	const target = hljs.newInstance();
	target.registerLanguage('blk', blk);
	expect(target.highlight('a:i=1\rb:i=2', {language: 'blk'}).value).toContain(
		'<span class="hljs-number">1</span>\r<span class="hljs-attr">b</span>:<span class="hljs-type">i</span>',
	);
});
