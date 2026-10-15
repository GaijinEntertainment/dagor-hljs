/*
 * Jam and Jamfile language definition for highlight.js.
 *
 * Written from the syntax of the Jam engine (its keyword table and scanner)
 * and the Colorer definition for Jamfiles. Only classes listed in
 * CLASS_SAFELIST in gr-syntax-layer-worker.ts are shown in the diff.
 */

// Keywords of the Jam language.
const KEYWORDS = [
  'actions bind break case continue default else existing for if ignore in',
  'include local maxline on piecemeal quietly return rule switch together',
  'updated while',
].join(' ');

// Rules that the Jam engine provides.
const BUILTIN_RULES = [
  'Always ALWAYS Depends DEPENDS echo Echo ECHO exit Exit EXIT Glob GLOB',
  'Includes INCLUDES Leaves LEAVES Match MATCH NoCare NOCARE NOTIME NotFile',
  'NOTFILE NoUpdate NOUPDATE Temporary TEMPORARY',
].join(' ');

// Variables that Jam sets itself. They are shown as built-in names.
const JAM_VARIABLES = [
  'OS OSPLAT MAC NT OS2 UNIX VMS JAMDATE JAMUNAME JAMVERSION JAMSHELL',
  'HDRSCAN HDRRULE SEARCH LOCATE SPLITPATH HDRPATTERN',
].join(' ');

// Commands at the start of an action line.
const ACTION_COMMANDS = [
  'quietly together echo echo_cvt mkdir copyfile del rem set goto if not',
  'exist call call_filtered set_filter clr_filters enter_critsec',
  'leave_critsec',
].join(' ');

const ACTION_STRINGS = 'ERRORLEVEL errorlevel';

const NAME = '[A-Za-z_][\\w.]*';

// A word that the parser reads as a rule call. Keywords and variables are excluded.
const RESERVED = [KEYWORDS, BUILTIN_RULES, JAM_VARIABLES, ACTION_COMMANDS].join(' ').split(' ');
const NOT_RESERVED = `(?!(?:${RESERVED.join('|')})\\b)`;

function words(list) {
  return new RegExp(`\\b(?:${list.split(' ').join('|')})\\b`);
}

export default function (hljs) {
  const KEYWORD_OBJECT = {
    keyword: `${KEYWORDS} ${BUILTIN_RULES}`,
  };

  const ACTION_OBJECT = {
    keyword: ACTION_COMMANDS,
    string: ACTION_STRINGS,
  };

  const COMMENT = {
    className: 'comment',
    begin: /(?:^|[ \t])#/,
    end: /$/,
  };

  // A '$(...)' reference. Its name is a built-in variable or a user variable.
  // A modifier such as ':S' or a subscript such as '[1]' is a type.
  const VARIABLE = {
    begin: /\$\(/,
    end: /\)|$/,
    contains: [],
  };
  VARIABLE.contains = [
    'self',
    {className: 'built_in', begin: words(JAM_VARIABLES)},
    {className: 'type', begin: /:[GBSMDPULEJRTW]+/},
    {className: 'type', begin: /\[[\d-]+\]/},
    {className: 'built_in', begin: /[<>]/},
    {className: 'variable', begin: /\d+/},
    {className: 'variable', begin: new RegExp(NAME)},
  ];

  const ESCAPE = {begin: /\\./, relevance: 0};

  const STRING = {
    className: 'string',
    begin: /"/,
    end: /"|$/,
    contains: [ESCAPE, VARIABLE],
  };

  // A brace inside an action body nests, so it does not end the body.
  const ACTION_NESTED = {
    begin: /\{/,
    end: /\}/,
    keywords: ACTION_OBJECT,
    contains: [],
  };

  const ACTION_RULES = [
    // Directives such as `#async` change how the action runs.
    {className: 'meta', begin: /^[ \t]*#(?:async|respfile-ln|no-respfile|respfile)\b/},
    // The markers that flip slashes in an action line.
    {className: 'meta', begin: /#\/?\(|\)\/?#|#\\\(|\)\\#/},
    {className: 'string', begin: /^[ \t]*:\w+/},
    {className: 'comment', begin: /^[ \t]*#/, end: /$/},
    STRING,
    VARIABLE,
  ];
  ACTION_NESTED.contains = [...ACTION_RULES, ACTION_NESTED];

  // The body of an `actions` block. It ends the enclosing block when it closes.
  const ACTION_BODY = {
    begin: /\{/,
    end: /\}/,
    endsParent: true,
    keywords: ACTION_OBJECT,
    contains: [...ACTION_RULES, ACTION_NESTED],
  };

  // `actions [flags] NAME [bind VARS] {`. The lookahead lets the header words
  // be colored by this mode, and the body closes the mode through endsParent.
  const ACTIONS_BLOCK = {
    begin: /(?=^[ \t]*actions\b[^{}]*\{)/,
    end: /(?!)/,
    keywords: KEYWORD_OBJECT,
    contains: [
      {className: 'keyword', begin: /\bactions\b/},
      {className: 'title function_', begin: new RegExp(`${NOT_RESERVED}${NAME}(?=\\s*(?:bind\\b|\\{|$))`)},
      ACTION_BODY,
    ],
  };

  // The parameters of `rule NAME PARAMS {` are variables. The title ends
  // where the parameters start, and the parameters end at the brace.
  const RULE_PARAMETERS = {
    className: 'variable',
    end: /(?=\{)|$/,
    endsParent: true,
  };

  const RULE_DEFINITION = {
    begin: /(?=^[ \t]*rule\b)/,
    end: /$/,
    contains: [
      {className: 'keyword', begin: /\brule\b/},
      {className: 'title function_', begin: new RegExp(NAME), starts: RULE_PARAMETERS},
    ],
  };

  // `local` and the loop variable of `for` name variables.
  const LOCAL_DEFINITION = {
    begin: /(?=^[ \t]*local\b)/,
    end: /(?=[=;])|$/,
    contains: [
      {className: 'keyword', begin: /\blocal\b/},
      {className: 'variable', begin: new RegExp(NAME)},
    ],
  };

  const FOR_DEFINITION = {
    begin: /(?=^[ \t]*for\b)/,
    end: /(?=\s+in\b)|$/,
    contains: [
      {className: 'keyword', begin: /\bfor\b/},
      {className: 'variable', begin: new RegExp(NAME)},
    ],
  };

  // An assignment to a Jam variable, such as `SEARCH = ...`.
  const ASSIGN_BUILT_IN = {
    className: 'built_in',
    begin: new RegExp(`\\b(?:${JAM_VARIABLES.split(' ').join('|')})\\b(?=\\s*(?:\\?=|\\+=|=|on\\b))`),
  };

  const ASSIGN_USER = {
    className: 'variable',
    begin: new RegExp(`${NAME}(?=\\s*(?:\\?=|\\+=|=|on\\b))`),
  };

  // `[ RuleName args ]`. A built-in rule is a keyword, so the bracket
  // mode below handles it instead.
  const BRACKET_ARGUMENTS = {
    end: /(?=\])|$/,
    contains: [STRING, VARIABLE],
  };

  const BRACKET_RULE = {
    begin: new RegExp(`\\[[ \\t]*(?=${NOT_RESERVED}${NAME})`),
    end: /\]|$/,
    contains: [{className: 'title function_', begin: new RegExp(NAME), starts: BRACKET_ARGUMENTS}],
  };

  const BRACKET_BUILT_IN = {
    begin: /\[/,
    end: /\]|$/,
    keywords: KEYWORD_OBJECT,
    contains: [STRING, VARIABLE],
  };

  // A line that starts with a user rule name calls that rule.
  const STATEMENT_CALL = {
    className: 'title function_',
    begin: new RegExp(`^[ \\t]*${NOT_RESERVED}${NAME}(?=\\s|$)(?!\\s*(?:\\?=|\\+=|=|on\\b))`),
  };

  return {
    name: 'Jam',
    aliases: ['jam', 'jamfile'],
    keywords: KEYWORD_OBJECT,
    contains: [
      COMMENT,
      ESCAPE,
      STRING,
      ACTIONS_BLOCK,
      RULE_DEFINITION,
      LOCAL_DEFINITION,
      FOR_DEFINITION,
      ASSIGN_BUILT_IN,
      ASSIGN_USER,
      BRACKET_RULE,
      BRACKET_BUILT_IN,
      STATEMENT_CALL,
      VARIABLE,
    ],
  };
}
