/*
 * Quirrel (.nut) language definition for highlight.js.
 *
 * Written by hand from the tree-sitter grammar in
 * GaijinEntertainment/tree-sitter-quirrel (MIT). Its queries/highlights.scm
 * chooses the token classes. Only classes listed in CLASS_SAFELIST in
 * gr-syntax-layer-worker.ts are shown in the diff.
 */

const KEYWORDS = [
  'local let global static const class enum function return yield',
  'if else switch case default while do for foreach break continue',
  'try catch throw import from as async await resume',
  'typeof instanceof in not delete clone',
].join(' ');

const BUILT_IN_TYPES = [
  'bool number int float string table array userdata generator',
  'userpointer thread instance weakref any',
].join(' ');

const LITERALS = 'null true false __LINE__ __FILE__';

const RESERVED_WORDS = [KEYWORDS, BUILT_IN_TYPES, LITERALS].join(' ').split(' ');

export default function (hljs) {
  const KEYWORD_OBJECT = {
    keyword: KEYWORDS,
    built_in: BUILT_IN_TYPES,
    literal: LITERALS,
  };

  // Matches a whole name that is not a reserved word, so `if (` is not a call.
  const NAME_START = `\\b(?!(?:${RESERVED_WORDS.join('|')})\\b)[A-Za-z_]\\w*`;

  // Interpolated code is highlighted like the rest of the file, so the
  // contains list is filled in at the end.
  const INTERPOLATION = {
    className: 'template-variable',
    begin: /\{/,
    end: /\}/,
    contains: [],
  };

  const STRING = {
    className: 'string',
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const VERBATIM_STRING = {
    className: 'string',
    begin: /@"/,
    end: /"/,
    contains: [{begin: /""/, skip: true}],
  };

  const INTERPOLATED_STRING = {
    className: 'string',
    begin: /\$"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
  };

  // The `@@` form has one quote character after `@@`, then the text.
  const DOCSTRING = {
    className: 'string',
    begin: /@@./,
    end: /"/,
    contains: [{begin: /""/, skip: true}],
  };

  const CHARACTER = {
    className: 'string',
    begin: /'(?:\\[^'\n]*|[^'\\\n])'/,
  };

  const NUMBER = {
    className: 'number',
    begin: /\b(?:0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/,
  };

  const DIRECTIVE = {
    className: 'meta',
    begin: /#pos:\d+:\S*|#[a-z][a-z-]*(?::[a-z-]+)?/,
  };

  // `[pure]` and `[nodiscard]` come before the function name.
  const ATTRIBUTE = {
    begin: /\[(?=\s*(?:pure|nodiscard)\b)/,
    end: /\]/,
    contains: [{className: 'attr', begin: /\b(?:pure|nodiscard)\b/}],
  };

  const LAMBDA = {
    className: 'keyword',
    begin: /@(?=\s*\()/,
  };

  // The name follows `function`. The mode ends before `[`, and returnEnd
  // hands that `[` back, so an attribute such as `[pure]` is still colored.
  const FUNCTION_DEFINITION = {
    beginKeywords: 'function',
    end: /[([{;\n]/,
    returnEnd: true,
    keywords: KEYWORD_OBJECT,
    contains: [{className: 'title function_', begin: NAME_START}],
  };

  const TYPE_DEFINITION = {
    beginKeywords: 'class enum',
    end: /[{\n]/,
    returnEnd: true,
    keywords: KEYWORD_OBJECT,
    contains: [{className: 'type', begin: NAME_START}],
  };

  const CONSTRUCTOR = {
    className: 'title function_',
    begin: /\bconstructor\b/,
  };

  const THIS_OR_BASE = {
    className: 'variable language_',
    begin: /\b(?:this|base)\b/,
  };

  // The dot, `?.` or the name after it is not colored, only the name.
  const METHOD_CALL = {
    className: 'title function_',
    begin: /(?:\?\.|\.)(?=[A-Za-z_]\w*\s*\()/,
    end: /(?!\w)/,
    excludeBegin: true,
  };

  const FIELD = {
    className: 'property',
    begin: /(?:\?\.|\.)(?=[A-Za-z_])/,
    end: /(?!\w)/,
    excludeBegin: true,
  };

  const CALL = {
    className: 'title function_',
    begin: new RegExp(`${NAME_START}(?=\\s*\\()`),
  };

  // Quirrel writes constants in all capitals, such as `MAX_COUNT`.
  const CONSTANT = {
    className: 'literal',
    begin: /\b[A-Z][A-Z0-9_]*\b/,
  };

  const CODE = [
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    DOCSTRING,
    VERBATIM_STRING,
    INTERPOLATED_STRING,
    STRING,
    CHARACTER,
    NUMBER,
    DIRECTIVE,
    ATTRIBUTE,
    LAMBDA,
    FUNCTION_DEFINITION,
    TYPE_DEFINITION,
    CONSTRUCTOR,
    THIS_OR_BASE,
    METHOD_CALL,
    FIELD,
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
