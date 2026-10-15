import hljs from 'highlight.js/lib/core';
import {expect, test} from 'vite-plus/test';
import {testMarkup} from '../../../test/markup.ts';
import quirrel from '../src/quirrel.ts';

testMarkup('quirrel', quirrel, new URL('markup/', import.meta.url));

test('nut is an alias of quirrel', () => {
	const target = hljs.newInstance();
	target.registerLanguage('quirrel', quirrel);
	expect(target.getLanguage('quirrel')).toBeDefined();
	expect(target.getLanguage('nut')).toBe(target.getLanguage('quirrel'));
});
