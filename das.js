/*
 * Daslang (.das) language definition for highlight.js.
 *
 * Written by hand from the tree-sitter grammar in
 * GaijinEntertainment/tree-sitter-daslang (BSD-3-Clause). Its
 * queries/highlights.scm chooses the token classes. Only classes listed in
 * CLASS_SAFELIST in gr-syntax-layer-worker.ts are shown in the diff.
 */

const KEYWORDS = [
  // Declarations, modifiers and control flow.
  'let var aka assume capture default goto label pass unsafe with',
  'abstract const explicit implicit inscope override private public sealed',
  'shared static template uninitialized distinct',
  'def operator class enum struct typedef tuple variant bitfield',
  'return yield generator',
  'if static_if elif static_elif else for while where break continue',
  'try recover finally',
  'module require include options expect',
  'addr as cast delete deref in is new reinterpret type typedecl typeinfo',
  'upcast',
].join(' ');

const LITERALS = 'true false null';

const BUILT_IN_TYPES = [
  'bool string int int8 int16 int64 int2 int3 int4 uint uint8 uint16 uint64',
  'uint2 uint3 uint4 float float2 float3 float4 float16 half2 half3 half4 half8',
  'short2 short3 short4 short8 ushort2 ushort3 ushort4 ushort8',
  'byte2 byte3 byte4 byte8 byte16 ubyte2 ubyte3 ubyte4 ubyte8 ubyte16',
  'void range urange range64 urange64 double',
  'array auto block fixed_array function iterator lambda smart_ptr table',
].join(' ');

const RESERVED_WORDS = [KEYWORDS, LITERALS, BUILT_IN_TYPES].join(' ').split(' ');

export default function (hljs) {
  const KEYWORD_OBJECT = {
    keyword: KEYWORDS,
    literal: LITERALS,
    built_in: BUILT_IN_TYPES,
  };

  // Matches a whole name that is not a reserved word, so `if (` is not a call.
  const NAME_START = `\\b(?!(?:${RESERVED_WORDS.join('|')})\\b)[_a-zA-Z]\\w*`;

  // Strings and interpolated code are reached through INTERPOLATION, so the
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
    contains: [hljs.BACKSLASH_ESCAPE, INTERPOLATION],
  };

  const CHARACTER = {
    className: 'string',
    begin: /'(?:\\['btnfr\\]|[^'\\\n])'[uU]?8?/,
  };

  const NUMBER = {
    className: 'number',
    begin:
      /\b(?:0[xX][0-9a-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)(?:[uUlLfFhHdD]+8?)?\b/,
  };

  // The macro body runs up to `%%`, and it may hold a single `%`.
  const READER_MACRO = {
    className: 'meta',
    begin: /%[_a-zA-Z]\w*[~!]/,
    end: /%%/,
  };

  // The path after `include` is not Daslang code.
  const INCLUDE = {
    beginKeywords: 'include',
    end: /$/,
  };

  const BLOCK_COMMENT = {
    className: 'comment',
    begin: /\/\*/,
    end: /\*\//,
    contains: ['self'],
  };

  const LINE_DIRECTIVE = {
    className: 'meta',
    begin: /#\d+,\d+,"[^"]+"#/,
  };

  const MACRO_VARIABLE = {
    className: 'meta',
    begin: /\$[eivbatcf]\b|@@?[_a-zA-Z]\w*/,
  };

  const NEGATED_KEYWORD = {
    className: 'keyword',
    begin: /!\?as\b|!as\b|!is\b/,
  };

  // `def` and the type declarations take a name, and modifiers can come
  // between them. The name is the first part that is not a reserved word.
  const FUNCTION_DEFINITION = {
    beginKeywords: 'def',
    end: /[:(={;\n]/,
    excludeEnd: true,
    keywords: KEYWORD_OBJECT,
    contains: [{className: 'title function_', begin: NAME_START}],
  };

  const TYPE_DEFINITION = {
    beginKeywords: 'struct class enum tuple variant bitfield typedef',
    end: /[:={\n]/,
    excludeEnd: true,
    keywords: KEYWORD_OBJECT,
    contains: [{className: 'type', begin: NAME_START}],
  };

  const CALL = {
    className: 'title function_',
    begin: new RegExp(`${NAME_START}(?=\\s*\\()`),
  };

  // The dot, arrow or `?.` is not colored, only the name after it.
  const METHOD_CALL = {
    className: 'title function_',
    begin: /(?:->|[?!]?\.)(?=[_a-zA-Z]\w*\s*\()/,
    end: /(?!\w)/,
    excludeBegin: true,
  };

  const FIELD = {
    className: 'property',
    begin: /(?:->|[?!]?\.)(?=[_a-zA-Z])/,
    end: /(?!\w)/,
    excludeBegin: true,
  };

  const NAMESPACE = {
    className: 'title',
    begin: /[_a-zA-Z]\w*(?=::)/,
  };

  // Daslang writes constants in all capitals, such as `SCALE`.
  const CONSTANT = {
    className: 'literal',
    begin: /\b[A-Z][A-Z0-9_]*\b/,
  };

  const SELF = {
    className: 'variable language_',
    begin: /\bself\b/,
  };

  const CODE = [
    hljs.C_LINE_COMMENT_MODE,
    BLOCK_COMMENT,
    LINE_DIRECTIVE,
    INCLUDE,
    STRING,
    CHARACTER,
    READER_MACRO,
    MACRO_VARIABLE,
    NEGATED_KEYWORD,
    NUMBER,
    FUNCTION_DEFINITION,
    TYPE_DEFINITION,
    METHOD_CALL,
    FIELD,
    CALL,
    NAMESPACE,
    CONSTANT,
    SELF,
  ];

  INTERPOLATION.contains = CODE;

  return {
    name: 'Daslang',
    aliases: ['daslang'],
    keywords: KEYWORD_OBJECT,
    contains: CODE,
  };
}
