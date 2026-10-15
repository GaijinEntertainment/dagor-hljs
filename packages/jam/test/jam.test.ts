import hljs from 'highlight.js/lib/core';
import {expect, test} from 'vite-plus/test';
import {testMarkup} from '../../../test/markup.ts';
import jam from '../src/jam.ts';

testMarkup('jam', jam, new URL('markup/', import.meta.url));

test('jamfile is an alias of jam', () => {
	const target = hljs.newInstance();
	target.registerLanguage('jam', jam);
	expect(target.getLanguage('jam')).toBeDefined();
	expect(target.getLanguage('jamfile')).toBe(target.getLanguage('jam'));
});
