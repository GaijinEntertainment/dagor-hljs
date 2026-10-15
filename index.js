// highlight.js grammars for the Dagor languages.
import das from './packages/daslang/src/daslang.ts';
import blk from './packages/blk/src/blk.ts';
import quirrel from './packages/quirrel/src/quirrel.ts';
import dshl from './packages/dshl/src/dshl.ts';
import jam from './jam.js';

// The names are the highlight.js language names, as in { language: 'dshl' }.
export const languages = {das, blk, quirrel, dshl, jam};

// Adds every grammar to a highlight.js instance.
export function register(hljs) {
	for (const [name, definition] of Object.entries(languages)) {
		hljs.registerLanguage(name, definition);
	}
	return hljs;
}

export default languages;
