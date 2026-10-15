/*
 * BLK (DataBlock) language definition for highlight.js.
 *
 * Written by hand from the tree-sitter grammar in
 * GaijinEntertainment/tree-sitter-blk (MIT). Its queries/highlights.scm
 * chooses the token classes. Only classes listed in CLASS_SAFELIST in
 * gr-syntax-layer-worker.ts are shown in the diff.
 */

import type {HLJSApi, Language, Mode} from 'highlight.js';

const TEXT_TYPES = ['t'];

const BOOLEAN_TYPES = ['b'];

const NUMBER_TYPES = ['i64', 'ip2', 'ip3', 'ip4', 'p2', 'p3', 'p4', 'i', 'c', 'r', 'm'];

const TYPE_WORDS = [...NUMBER_TYPES, ...TEXT_TYPES, ...BOOLEAN_TYPES];

const BOOLEAN_WORDS = ['yes', 'no', 'true', 'false', 'on', 'off'];

// Block and parameter names. A name starting with `_` is a built-in name.
const NAME = '[A-Za-z0-9_.~-]+';

// A quoted name. The BLK parser accepts both triple and single quotes.
const QUOTE = '(?:"""|\'\'\'|"|\')';

function words(list: readonly string[]): RegExp {
	return new RegExp(`\\b(?:${list.join('|')})\\b`);
}

function typeName(types: readonly string[]): string {
	return `${QUOTE}?~?(?:${types.join('|')})${QUOTE}?`;
}

function unquotedValue(stops: string): string {
	const slash = '\\/(?![/*])';
	const first = `(?:[^\\s;}/"'${stops}]|${slash})`;
	const inner = `(?:[^;}\\r\\n/${stops}]|${slash})`;
	const last = `(?:[^\\s;}/${stops}]|${slash})`;
	return `${first}(?:${inner}*${last})?`;
}

export default function blk(hljs: HLJSApi): Language {
	const STRING: Mode = {
		scope: 'string',
		contains: [{begin: /~[\s\S]/, relevance: 0}],
		variants: [
			{begin: /"""/, end: /"""/},
			{begin: /'''/, end: /'''/},
			{begin: /"/, end: /"|(?=\n)/},
			{begin: /'/, end: /'|(?=\n)/},
		],
	};

	const BLOCK_COMMENT: Mode = {
		scope: 'comment',
		begin: /\/\*/,
		end: /\*\//,
		contains: ['self'],
	};

	const COMMENT_AFTER_UNQUOTED: Mode = {
		scope: 'comment',
		begin: /(?<=[^\s;=[\]"'{}][ \t]*)\/\*/,
		end: /\*\//,
	};

	const value = (equals: RegExp, scope: string): Mode => ({
		begin: equals,
		end: /(?=;|\n|\}|\s*\/\/)/,
		contains: [COMMENT_AFTER_UNQUOTED, BLOCK_COMMENT, STRING, {scope, begin: new RegExp(unquotedValue(''))}],
	});

	const typedEquals = (types: readonly string[]): RegExp => new RegExp(`(?<=:[ \\t]*${typeName(types)}[ \\t]*)=`);

	const ELEMENT = unquotedValue('\\]');

	const ARRAY: Mode = {
		begin: /(?<=\[\][ \t]*=\s*)\[/,
		end: /\]/,
		contains: [
			hljs.C_LINE_COMMENT_MODE,
			COMMENT_AFTER_UNQUOTED,
			BLOCK_COMMENT,
			STRING,
			{
				scope: 'literal',
				begin: new RegExp(`(?:${BOOLEAN_WORDS.join('|')})(?=[ \\t]*(?:[;}\\]\\r\\n]|\\/[/*]|$))`),
			},
			{scope: 'number', begin: new RegExp(`(?=[-+.0-9])${ELEMENT}`)},
			{scope: 'string', begin: new RegExp(ELEMENT)},
		],
	};

	// The type after `name:`, such as `r` in `range:r=70`.
	const TYPE: Mode = {
		begin: /:/,
		end: /(?=\[|=|;|\s|\n|$)/,
		contains: [{scope: 'built_in', begin: words(TYPE_WORDS)}],
	};

	// Must come before the name rules, because `include = x` is not a name.
	const INCLUDE: Mode = {
		beginKeywords: 'include Include INCLUDE',
		end: /$/,
		contains: [STRING, {scope: 'string', begin: /[^\s"=][^\n]*/}],
	};

	return {
		name: 'BLK',
		contains: [
			BLOCK_COMMENT,
			hljs.C_LINE_COMMENT_MODE,
			INCLUDE,
			// A quoted name that starts with `@` is a directive, such as
			// `"@delete:vsync"`. It is listed before the other quoted names.
			{scope: 'meta', begin: new RegExp(`${QUOTE}~?@[^"'\\n]*?${QUOTE}`)},
			{scope: 'title', begin: new RegExp(`${QUOTE}~?[^"'\\n]*?${QUOTE}(?=\\s*\\{)`)},
			{scope: 'property', begin: new RegExp(`${QUOTE}~?[^"'\\n]*?${QUOTE}(?=\\s*[:=])`)},
			{scope: 'built_in', begin: new RegExp(`_${NAME}(?=\\s*\\{)`)},
			{scope: 'title', begin: new RegExp(`(?!_)${NAME}(?=\\s*\\{)`)},
			{scope: 'variable.language', begin: new RegExp(`_${NAME}(?=\\s*[:=])`)},
			{scope: 'property', begin: new RegExp(`(?!_)${NAME}(?=\\s*[:=])`)},
			TYPE,
			ARRAY,
			value(typedEquals(TEXT_TYPES), 'string'),
			value(typedEquals(BOOLEAN_TYPES), 'literal'),
			value(typedEquals(NUMBER_TYPES), 'number'),
			value(/(?<!\[\][ \t]*)=/, 'string'),
			STRING,
		],
	};
}
