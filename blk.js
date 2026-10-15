/*
 * BLK (DataBlock) language definition for highlight.js.
 *
 * Written by hand from the tree-sitter grammar in
 * GaijinEntertainment/tree-sitter-blk (MIT). Its queries/highlights.scm
 * chooses the token classes. Only classes listed in CLASS_SAFELIST in
 * gr-syntax-layer-worker.ts are shown in the diff.
 */

const TYPE_WORDS = ['i64', 'ip2', 'ip3', 'ip4', 'p2', 'p3', 'p4', 't', 'i', 'b', 'c', 'r', 'm'];

const BOOLEAN_WORDS = ['yes', 'no', 'true', 'false', 'on', 'off'];

// Block and parameter names. A name starting with `_` is a built-in name.
const NAME = '[A-Za-z0-9_.~-]+';

// A quoted name. The BLK parser accepts both triple and single quotes.
const QUOTE = '(?:"""|\'\'\'|"|\')';

function words(list) {
  return new RegExp(`\\b(?:${list.join('|')})\\b`);
}

export default function (hljs) {
  const STRING = {
    className: 'string',
    variants: [
      {begin: /"""/, end: /"""/},
      {begin: /'''/, end: /'''/},
      {begin: /"/, end: /"|(?=\n)/},
      {begin: /'/, end: /'|(?=\n)/},
    ],
  };

  const NUMBER = {
    className: 'number',
    begin: /-?\d+(?:\.\d+)?(?![\w%.])/,
  };

  const BOOLEAN = {
    className: 'literal',
    begin: words(BOOLEAN_WORDS),
  };

  // Matches the rest of an unquoted value, so `lod01.dag` and `50%pw` are
  // one token and NUMBER does not match their first digits.
  const RAW_VALUE = {
    className: 'string',
    begin: /[^\s;,[\]"{}]+/,
  };

  // The value of `name = value`. It ends at `;`, the end of the line, `}` or
  // a trailing comment. Arrays can span lines, so ARRAY is a nested mode.
  const VALUE = {
    begin: /=/,
    end: /(?=;|\n|\}|\s*\/\/)/,
    contains: [
      {
        begin: /\[/,
        end: /\]/,
        contains: ['self', STRING, NUMBER, BOOLEAN, RAW_VALUE],
      },
      STRING,
      NUMBER,
      BOOLEAN,
      RAW_VALUE,
    ],
  };

  // The type after `name:`, such as `r` in `range:r=70`.
  const TYPE = {
    begin: /:/,
    end: /(?=\[|=|;|\s|\n|$)/,
    contains: [{className: 'built_in', begin: words(TYPE_WORDS)}],
  };

  const BLOCK_COMMENT = {
    className: 'comment',
    begin: /\/\*/,
    end: /\*\//,
    contains: ['self'],
  };

  // Must come before the name rules, because `include = x` is not a name.
  const INCLUDE = {
    beginKeywords: 'include Include INCLUDE',
    end: /$/,
    contains: [STRING, {className: 'string', begin: /[^\s"=][^\n]*/}],
  };

  return {
    name: 'BLK',
    aliases: ['blk'],
    contains: [
      BLOCK_COMMENT,
      hljs.C_LINE_COMMENT_MODE,
      INCLUDE,
      // A quoted name that starts with `@` is a directive, such as
      // `"@delete:vsync"`. It is listed before the other quoted names.
      {className: 'meta', begin: new RegExp(`${QUOTE}~?@[^"'\\n]*?${QUOTE}`)},
      {className: 'title', begin: new RegExp(`${QUOTE}~?[^"'\\n]*?${QUOTE}(?=\\s*\\{)`)},
      {className: 'property', begin: new RegExp(`${QUOTE}~?[^"'\\n]*?${QUOTE}(?=\\s*[:=])`)},
      {className: 'built_in', begin: new RegExp(`_${NAME}(?=\\s*\\{)`)},
      {className: 'title', begin: new RegExp(`(?!_)${NAME}(?=\\s*\\{)`)},
      {className: 'variable language_', begin: new RegExp(`_${NAME}(?=\\s*[:=])`)},
      {className: 'property', begin: new RegExp(`(?!_)${NAME}(?=\\s*[:=])`)},
      TYPE,
      VALUE,
      STRING,
    ],
  };
}
