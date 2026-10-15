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

test.for(['01', '0_1', '1f', '0x', '1.5.3', '1e_5', '1e+_5', '5.tostring()'])(
	'the malformed number %s is not a number',
	(code) => {
		const target = hljs.newInstance();
		target.registerLanguage('quirrel', quirrel);
		expect(target.highlight(code, {language: 'quirrel'}).value).not.toContain('hljs-number');
	},
);

test.for([String.raw`'\q'`, `'ab'`, String.raw`'\x'`, String.raw`'\u00041'`])(
	'the malformed character %s is not a string',
	(code) => {
		const target = hljs.newInstance();
		target.registerLanguage('quirrel', quirrel);
		expect(target.highlight(code, {language: 'quirrel'}).value).not.toContain('hljs-string');
	},
);
