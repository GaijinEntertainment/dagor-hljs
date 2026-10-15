import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import hljs from 'highlight.js/lib/core';
import {expect, test} from 'vite-plus/test';

const packagesDir = new URL('../packages/', import.meta.url);
const languages = readdirSync(packagesDir).filter((dir) => existsSync(new URL(`${dir}/src/${dir}.ts`, packagesDir)));

test.for(languages)('%s.min.js registers its grammar on the global hljs', (language) => {
	const pageHljs = hljs.newInstance();
	runInNewContext(readFileSync(new URL(`${language}/dist/${language}.min.js`, packagesDir), 'utf8'), {hljs: pageHljs});
	expect(pageHljs.listLanguages()).toStrictEqual([language]);

	const markupDir = new URL(`${language}/test/markup/`, packagesDir);
	const html = pageHljs.highlight(readFileSync(new URL('default.txt', markupDir), 'utf8'), {language}).value;
	expect(html).toBe(readFileSync(new URL('default.expect.txt', markupDir), 'utf8'));
});
