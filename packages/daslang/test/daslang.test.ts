import hljs from 'highlight.js/lib/core';
import {expect, test} from 'vite-plus/test';
import {testMarkup} from '../../../test/markup.ts';
import daslang from '../src/daslang.ts';

testMarkup('daslang', daslang, new URL('markup/', import.meta.url));

test('das is an alias of daslang', () => {
	const target = hljs.newInstance();
	target.registerLanguage('daslang', daslang);
	expect(target.getLanguage('daslang')).toBeDefined();
	expect(target.getLanguage('das')).toBe(target.getLanguage('daslang'));
});
