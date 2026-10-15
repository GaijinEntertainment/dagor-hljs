/*
 * BLK (DataBlock) language definition for highlight.js.
 *
 * Written by hand from the tree-sitter grammar in
 * GaijinEntertainment/tree-sitter-blk (MIT).
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

const INCLUDE_WORD = '[iI][nN][cC][lL][uU][dD][eE]';

function typeName(types: readonly string[]): string {
	return `${QUOTE}?~?(?:${types.join('|')})${QUOTE}?`;
}

function unquotedValue(stops: string): string {
	const slash = '\\/(?![/*])';
	const last = `(?:[^\\s;}/${stops}]|${slash})`;
	const first = `(?:[^\\s;}/"'${stops}]|${slash})`;
	const closedComment = `\\/\\*(?:(?!\\*\\/)[^\\r\\n])*\\*\\/(?=[ \\t]*${last})`;
	const inner = `(?:[^;}\\r\\n/${stops}]|${slash}|${closedComment})`;
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

	const value = (equals: RegExp, scope: string, end = /(?=[;}\r\n]|\s*\/\/)/): Mode => ({
		begin: equals,
		end,
		contains: [
			{...COMMENT_AFTER_UNQUOTED, endsParent: true},
			BLOCK_COMMENT,
			{...STRING, endsParent: true},
			{scope, begin: new RegExp(unquotedValue(''))},
		],
	});

	const typedEquals = (types: readonly string[]): RegExp =>
		new RegExp(`(?<=:[ \\t]*${typeName(types)}[ \\t]*(?:;[ \\t]*)?)=`);

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
		begin: /:[ \t]*/,
		end: /(?=\[|=|;|\s|\n|$)/,
		contains: [
			{
				scope: 'type',
				begin: new RegExp(`(?<![A-Za-z0-9_])${QUOTE}?~?(?:${TYPE_WORDS.join('|')})(?![A-Za-z0-9_])${QUOTE}?`),
			},
		],
	};

	// Must come before the name rules, because `include = "x` with an unclosed quote is an include of `= "x`.
	const INCLUDE: Mode = {
		begin: new RegExp(
			`(?<![A-Za-z0-9_.~-])(?:(${QUOTE})${INCLUDE_WORD}\\1|${INCLUDE_WORD}(?![A-Za-z0-9_.~-]))` +
				`(?![ \\t]*(?:[{:]|=[ \\t]*(?:[^\\s"']|"[^"\\n]*"|'[^'\\n]*')))`,
		),
		beginScope: 'keyword',
		end: /(?=[;}])/,
		contains: [
			{begin: /(?<=["'])[ \t]*;/},
			BLOCK_COMMENT,
			hljs.C_LINE_COMMENT_MODE,
			{...STRING, endsParent: true},
			{scope: 'string', begin: new RegExp(unquotedValue('')), endsParent: true},
		],
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
			{scope: 'built_in', begin: new RegExp(`${QUOTE}~?_[^"'\\n]*?${QUOTE}(?=\\s*(?:;\\s*)?\\{)`)},
			{scope: 'built_in', begin: new RegExp(`${QUOTE}~?_[^"'\\n]*?${QUOTE}(?=\\s*(?:;\\s*)?[:=])`)},
			{scope: 'title', begin: new RegExp(`${QUOTE}~?[^"'\\n]*?${QUOTE}(?=\\s*(?:;\\s*)?\\{)`)},
			{scope: 'attr', begin: new RegExp(`${QUOTE}~?[^"'\\n]*?${QUOTE}(?=\\s*(?:;\\s*)?[:=])`)},
			{scope: 'built_in', begin: new RegExp(`_${NAME}(?=\\s*\\{)`)},
			{scope: 'title', begin: new RegExp(`(?!_)${NAME}(?=\\s*\\{)`)},
			{scope: 'built_in', begin: new RegExp(`_${NAME}(?=\\s*[:=])`)},
			{scope: 'attr', begin: new RegExp(`(?!_)${NAME}(?=\\s*[:=])`)},
			TYPE,
			ARRAY,
			value(typedEquals(TEXT_TYPES), 'string'),
			value(typedEquals(BOOLEAN_TYPES), 'literal'),
			value(typedEquals(NUMBER_TYPES), 'number'),
			value(/(?<!\[\][ \t]*)=/, 'string', /(?=[;}]|\s*\/\/)|(?<!=[ \t]*)(?=[\r\n])/),
			STRING,
		],
	};
}
