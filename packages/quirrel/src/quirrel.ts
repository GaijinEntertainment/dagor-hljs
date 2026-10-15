/*
 * Quirrel (.nut) language definition for highlight.js.
 *
 * Written by hand from the tree-sitter grammar in
 * GaijinEntertainment/tree-sitter-quirrel (MIT).
 */

import type {HLJSApi, Language, Mode} from 'highlight.js';

const KEYWORDS = [
	'local let global static const class enum function return yield',
	'if else switch case default while do for foreach break continue',
	'try catch throw import from as async await resume',
	'typeof instanceof in not delete clone',
].join(' ');

const TYPE_NAMES = [
	'bool number int float string table array userdata function generator',
	'userpointer thread instance class weakref null any',
].join(' ');

const LITERALS = 'null true false __LINE__ __FILE__';

const RESERVED_WORDS = [KEYWORDS, LITERALS].join(' ').split(' ');

export default function quirrel(hljs: HLJSApi): Language {
	const KEYWORD_OBJECT = {
		keyword: KEYWORDS,
		literal: LITERALS,
	};

	const TYPE = `(?:${TYPE_NAMES.split(' ').join('|')})`;
	const TYPE_ANNOTATION: Mode = {
		scope: 'type',
		match: new RegExp(`(?<=(?<!:):\\s*\\(?\\s*(?:${TYPE}\\s*\\|\\s*)*)${TYPE}\\b`),
	};

	// Matches a whole name that is not a reserved word, so `if (` is not a call.
	const NAME_START = `\\b(?!(?:${RESERVED_WORDS.join('|')})\\b)[A-Za-z_]\\w*`;

	// Interpolated code is highlighted like the rest of the file, so the
	// contains list is filled in at the end.
	const INTERPOLATION: Mode = {
		scope: 'template-variable',
		begin: /\{/,
		end: /\}/,
		contains: [],
	};

	const STRING: Mode = {
		scope: 'string',
		begin: /"/,
		end: /"/,
		contains: [hljs.BACKSLASH_ESCAPE],
	};

	const VERBATIM_STRING: Mode = {
		scope: 'string',
		begin: /@"/,
		end: /"/,
		contains: [{begin: /""/, skip: true}],
	};

	const INTERPOLATED_STRING: Mode = {
		scope: 'string',
		begin: /\$"/,
		end: /"/,
		contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
	};

	// The `@@` form has one quote character after `@@`, then the text.
	const DOCSTRING: Mode = {
		scope: 'string',
		begin: /@@./,
		end: /"/,
		contains: [{begin: /""/, skip: true}],
	};

	const CHARACTER: Mode = {
		scope: 'string',
		begin: /'(?:\\(?:x[0-9a-fA-F]{1,2}|u[0-9a-fA-F]{1,4}|U[0-9a-fA-F]{1,8}|[abtnrvf0\\"'])|[^'\\\n])'/,
	};

	const NUMBER: Mode = {
		scope: 'number',
		begin:
			/(?<![\w.])(?:0[xX]_*[0-9a-fA-F][0-9a-fA-F_]*(?!\w)|(?:0_*(?!\d)|[1-9][\d_]*)(?:\.[\d_]*)?(?:[eE][+-]?\d[\d_]*)?(?![\w.]))/,
	};

	const DIRECTIVE: Mode = {
		scope: 'meta',
		begin: /#pos:\d+:\S*|#[a-z][a-z-]*(?::[a-z-]+)?/,
	};

	// `[pure]` and `[nodiscard]` come before the function name.
	const ATTRIBUTE: Mode = {
		begin: /\[(?=\s*(?:pure|nodiscard)\b)/,
		end: /\]/,
		contains: [{scope: 'meta', begin: /\b(?:pure|nodiscard)\b/}],
	};

	const LAMBDA: Mode = {
		scope: 'keyword',
		begin: /@(?=\s*(?:[([]|[A-Za-z_]\w*\s*\())/,
	};

	// The name follows `function`. The mode ends before `[`, and returnEnd
	// hands that `[` back, so an attribute such as `[pure]` is still colored.
	const FUNCTION_DEFINITION: Mode = {
		beginKeywords: 'function',
		end: /[([{;\n]/,
		returnEnd: true,
		keywords: KEYWORD_OBJECT,
		contains: [{scope: 'title.function', begin: NAME_START}],
	};

	const TYPE_DEFINITION: Mode = {
		match: [/\b(?:class|enum)/, /\s+/, new RegExp(NAME_START)],
		scope: {1: 'keyword', 3: 'title'},
	};

	// `Name = class` and `Name <- class` give the class the name of the variable or the slot.
	const CLASS_VALUE: Mode = {
		match: [new RegExp(NAME_START), /\s*(?:=|<-)\s*/, /\bclass\b/],
		scope: {1: 'title', 3: 'keyword'},
	};

	const CLASS_BASE: Mode = {
		scope: 'type',
		match: /(?<=\bclass(?:\s+[A-Za-z_]\w*)?\s*\(\s*)[A-Za-z_]\w*(?=\s*\))/,
	};

	const ENUM_BODY: Mode = {
		begin: /(?<=\benum\s+[A-Za-z_]\w*\s*)\{/,
		end: /\}/,
		contains: [
			hljs.C_LINE_COMMENT_MODE,
			hljs.C_BLOCK_COMMENT_MODE,
			{
				begin: /=/,
				end: /(?=[,}\n]|\/[/*])/,
				keywords: {literal: 'true false null'},
				contains: [VERBATIM_STRING, STRING, CHARACTER, NUMBER],
			},
			{scope: 'literal', match: /[A-Za-z_]\w*/},
		],
	};

	const CATCH_CLASS: Mode = {
		scope: 'type',
		match: /(?<=\bcatch\s*\(\s*)[A-Za-z_]\w*(?=\s+[A-Za-z_]\w*\s*\))/,
	};

	const CONSTRUCTOR: Mode = {
		scope: 'title.function',
		begin: /\bconstructor\b/,
	};

	const THIS_OR_BASE: Mode = {
		scope: 'built_in',
		begin: /\b(?:this|base)\b/,
	};

	// The dot, `?.` or the name after it is not colored, only the name.
	const METHOD_CALL: Mode = {
		scope: 'title.function',
		begin: /(?:\?\.|\.)(?=[A-Za-z_]\w*\s*\()/,
		end: /(?!\w)/,
		excludeBegin: true,
	};

	const PLAIN_FIELD: Mode = {
		begin: /(?:\?\.|\.)(?=[A-Za-z_])/,
		end: /(?!\w)/,
		excludeBegin: true,
	};

	const CALL: Mode = {
		scope: 'title.function',
		begin: new RegExp(`${NAME_START}(?=\\s*\\()`),
	};

	// Quirrel writes constants in all capitals, such as `MAX_COUNT`.
	const CONSTANT: Mode = {
		scope: 'literal',
		begin: /\b[A-Z][A-Z0-9_]*\b/,
	};

	const CODE: Mode[] = [
		hljs.C_LINE_COMMENT_MODE,
		hljs.C_BLOCK_COMMENT_MODE,
		DOCSTRING,
		VERBATIM_STRING,
		INTERPOLATED_STRING,
		STRING,
		CHARACTER,
		TYPE_ANNOTATION,
		NUMBER,
		DIRECTIVE,
		ATTRIBUTE,
		LAMBDA,
		FUNCTION_DEFINITION,
		TYPE_DEFINITION,
		CLASS_VALUE,
		CLASS_BASE,
		ENUM_BODY,
		CATCH_CLASS,
		CONSTRUCTOR,
		THIS_OR_BASE,
		METHOD_CALL,
		PLAIN_FIELD,
		CALL,
		CONSTANT,
	];

	INTERPOLATION.contains = CODE;

	return {
		name: 'Quirrel',
		aliases: ['nut'],
		keywords: KEYWORD_OBJECT,
		contains: CODE,
	};
}
