import type {PackUserConfig} from 'vite-plus/pack';

/**
 * Returns the `vp pack` configuration of the grammar package for `language`: `dist/<language>.js` as ESM with its
 * declaration, and `dist/<language>.min.js`, which registers the grammar on the global `hljs` when a page loads it.
 */
export function grammarPack(language: string): PackUserConfig {
	const globalName = `hljs${language.charAt(0).toUpperCase()}${language.slice(1)}`;
	return {
		entry: {[language]: `src/${language}.ts`},
		platform: 'neutral',
		target: 'es2022',
		dts: true,
		publint: true,
		attw: {profile: 'esm-only'},
		format: {
			esm: {},
			iife: {
				globalName,
				footer: `hljs.registerLanguage(${JSON.stringify(language)}, ${globalName});`,
				minify: true,
				outputOptions: {entryFileNames: '[name].min.js'},
			},
		},
	};
}
