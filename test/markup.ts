import {readdirSync, readFileSync} from 'node:fs';
import type {LanguageFn} from 'highlight.js';
import hljs from 'highlight.js/lib/core';
import {expect, test} from 'vite-plus/test';

/**
 * Registers a test for each `<name>.txt` sample in `markupDir`: the highlighted HTML of the sample must equal
 * `<name>.expect.txt` beside it.
 */
export function testMarkup(language: string, grammar: LanguageFn, markupDir: URL): void {
	hljs.registerLanguage(language, grammar);
	for (const sample of readdirSync(markupDir).filter((file) => !file.endsWith('.expect.txt'))) {
		const name = sample.slice(0, -'.txt'.length);
		test(`highlights ${name}`, async () => {
			const html = hljs.highlight(readFileSync(new URL(sample, markupDir), 'utf8'), {language}).value;
			await expect(html).toMatchFileSnapshot(new URL(`${name}.expect.txt`, markupDir).pathname);
		});
	}
}
