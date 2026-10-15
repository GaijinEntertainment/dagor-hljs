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
	// JavaScript has no type annotations; it gives its built-in type names, such as `String`, the scope `built_in`.
	const TYPE_ANNOTATION: Mode = {
		scope: 'built_in',
		match: new RegExp(`(?<=(?<!:):\\s*\\(?\\s*(?:${TYPE}\\s*\\|\\s*)*)${TYPE}\\b`),
	};

	// Matches a whole name that is not a reserved word, so `if (` is not a call.
	const NAME_START = `\\b(?!(?:${RESERVED_WORDS.join('|')})\\b)[A-Za-z_]\\w*`;

	// Interpolated code is highlighted like the rest of the file, so the
	// contains list is filled in at the end.
	const INTERPOLATION: Mode = {
		scope: 'subst',
		begin: /\{/,
		end: /\}/,
		keywords: KEYWORD_OBJECT,
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

	// `name = function`, `name <- function`, and `name = @(` give the function the name of the variable or the slot.
	const FUNCTION_VALUE: Mode = {
		match: [new RegExp(NAME_START), /\s*(?:=|<-)\s*/, /(?=function\b|@\s*[([])/],
		scope: {1: 'title.function'},
	};

	const TYPE_DEFINITION: Mode = {
		match: [/\b(?:class|enum)/, /\s+/, new RegExp(NAME_START)],
		scope: {1: 'keyword', 3: 'title.class'},
	};

	// `Name = class` and `Name <- class` give the class the name of the variable or the slot.
	const CLASS_VALUE: Mode = {
		match: [new RegExp(NAME_START), /\s*(?:=|<-)\s*/, /\bclass\b/],
		scope: {1: 'title.class', 3: 'keyword'},
	};

	const CLASS_BASE: Mode = {
		scope: 'title.class.inherited',
		match: /(?<=\bclass(?:\s+[A-Za-z_]\w*)?\s*\(\s*)[A-Za-z_]\w*(?=\s*\))/,
	};

	const CATCH_CLASS: Mode = {
		scope: 'title.class',
		match: /(?<=\bcatch\s*\(\s*)[A-Za-z_]\w*(?=\s+[A-Za-z_]\w*\s*\))/,
	};

	// The class names of the JavaScript grammar: `Point2`, `HTTPServer`, `IDs`. A single letter is not one.
	const CLASS_REFERENCE: Mode = {
		scope: 'title.class',
		match: new RegExp(
			[
				'\\b[A-Z][a-z]+(?:[A-Z][a-z]*|\\d)*',
				'\\b[A-Z]{2,}(?:[A-Z][a-z]+|\\d)+(?:[A-Z][a-z]*)*',
				'\\b[A-Z]{2,}[a-z]+(?:[A-Z][a-z]+|\\d)*(?:[A-Z][a-z]*)*',
			].join('|'),
		),
	};

	const CONSTRUCTOR: Mode = {
		scope: 'title.function',
		begin: /\bconstructor\b/,
	};

	const THIS_OR_BASE: Mode = {
		scope: 'variable.language',
		begin: /\b(?:this|base)\b/,
	};

	// The dot, `?.` or the name after it is not colored, only the name.
	const METHOD_CALL: Mode = {
		scope: 'title.function',
		begin: /(?:\?\.|\.)(?=[A-Za-z_]\w*\s*\()/,
		end: /(?!\w)/,
		excludeBegin: true,
	};

	const FIELD: Mode = {
		scope: 'property',
		begin: /(?:\?\.|\.)(?=[A-Za-z_])/,
		end: /(?!\w)/,
		excludeBegin: true,
	};

	const CALL: Mode = {
		scope: 'title.function',
		begin: new RegExp(`${NAME_START}(?=\\s*\\()`),
	};

	const CONSTANT: Mode = {
		scope: 'variable.constant',
		begin: /\b[A-Z][A-Z_0-9]+\b/,
	};

	// A brace after a token that starts an expression, such as `=` or `(`, opens a table; another brace opens a
	// block. A block inside a table is its own mode, so that the table ends at its own brace.
	const TABLE: Mode = {
		begin: /(?<=(?:[=(,[:?]|<-|\breturn|\byield)\s*)\{/,
		end: /\}/,
		keywords: KEYWORD_OBJECT,
		contains: [],
	};

	const BLOCK: Mode = {
		begin: /\{/,
		end: /\}/,
		keywords: KEYWORD_OBJECT,
		contains: [],
	};

	// The key of a slot, such as `name` in `{name = "player"}`.
	const SLOT_KEY: Mode = {
		scope: 'attr',
		match: new RegExp(`(?<=[{,\\n]\\s*)${NAME_START}(?=\\s*=(?!=))`),
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
		FUNCTION_VALUE,
		CLASS_VALUE,
		CLASS_BASE,
		CATCH_CLASS,
		CLASS_REFERENCE,
		CONSTRUCTOR,
		THIS_OR_BASE,
		METHOD_CALL,
		FIELD,
		CALL,
		CONSTANT,
		TABLE,
	];

	INTERPOLATION.contains = CODE;
	TABLE.contains = [SLOT_KEY, ...CODE, BLOCK];
	BLOCK.contains = [...CODE, BLOCK];

	return {
		name: 'Quirrel',
		aliases: ['nut'],
		keywords: KEYWORD_OBJECT,
		contains: CODE,
	};
}
