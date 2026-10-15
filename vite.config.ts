import {defineConfig} from 'vite-plus';
import javascript from '@ver0/oxlint-config/javascript.js';
import typescript from '@ver0/oxlint-config/typescript.js';
import vitest from '@ver0/oxlint-config/vitest.js';

export default defineConfig({
	fmt: {
		printWidth: 120,
		useTabs: true,
		tabWidth: 2,
		semi: true,
		singleQuote: true,
		trailingComma: 'all',
		bracketSpacing: false,
	},
	lint: {
		extends: [javascript, typescript, vitest],
		ignorePatterns: ['**/dist/**'],
		options: {
			typeAware: true,
			typeCheck: true,
		},
		rules: {
			// HLJSApi, the parameter of every grammar, is a mutable type of highlight.js.
			'typescript/prefer-readonly-parameter-types': 'off',
		},
	},
	test: {
		projects: [
			{test: {name: 'source', include: ['packages/*/test/**/*.test.ts']}},
			{test: {name: 'dist', include: ['test/dist.test.ts'], globalSetup: ['test/build.ts']}},
		],
	},
});
