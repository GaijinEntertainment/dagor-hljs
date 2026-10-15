/*
 * Jam and Jamfile language definition for highlight.js.
 *
 * Written from the syntax of the Jam engine (its keyword table and scanner)
 * and the Colorer definition for Jamfiles. Only classes listed in
 * CLASS_SAFELIST in gr-syntax-layer-worker.ts are shown in the diff.
 */

import type {HLJSApi, Language, Mode} from 'highlight.js';

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
	'SplitStringsOnSpace AddEscapesToMakeJamValidForWrite SimplifyComposedPath MakePathAbsolute',
	'MakePathListAbsolute DepRulePlain DepRuleDotDot',
].join(' ');

// Variables that Jam sets itself. They are shown as built-in names.
const JAM_VARIABLES = [
	'OS OSPLAT MAC NT OS2 UNIX VMS JAMDATE JAMUNAME JAMVERSION JAMSHELL',
	'HDRSCAN HDRRULE SEARCH LOCATE SPLITPATH HDRPATTERN',
	'JAM_CWD JAMTARGETS JAMFILESRC JAM_BUILTINS HDRFS',
].join(' ');

// Commands at the start of an action line.
const ACTION_COMMANDS = [
	'quietly together echo echo_cvt mkdir copyfile del rem set goto if not',
	'exist call call_filtered call_1core call_1core_filtered set_filter clr_filters enter_critsec',
	'leave_critsec',
].join(' ');

const ACTION_STRINGS = 'ERRORLEVEL errorlevel';

const NAME = '[A-Za-z_][\\w.]*';

// A word that the parser reads as a rule call. Keywords and variables are excluded.
const RESERVED = [KEYWORDS, BUILTIN_RULES, JAM_VARIABLES, ACTION_COMMANDS].join(' ').split(' ');
const NOT_RESERVED = `(?!(?:${RESERVED.join('|')})(?!\\S))`;

const STATEMENT_START = '(?<=^[ \\t]*|(?:^|\\s)(?:[;{}]|else)\\s+|(?:^|\\s)case\\s+\\S+\\s+:\\s+)';

const ASSIGNMENT_AHEAD = '(?=\\s+(?:(?:\\?=|\\+=|=)(?:\\s|$)|on(?:\\s|$)|default\\s+=(?:\\s|$)))';

const BUILTIN_RULE = `(?:${BUILTIN_RULES.split(' ').join('|')})`;

const STATEMENT_END = /(?<!\S);(?!\S)/;
const BEFORE_BLOCK = /(?=(?<!\S)\{(?!\S))/;

function words(list: string): RegExp {
	return new RegExp(`\\b(?:${list.split(' ').join('|')})\\b`);
}

export default function jam(_hljs: HLJSApi): Language {
	const KEYWORD_OBJECT = {
		$pattern: /\S+/,
		keyword: KEYWORDS,
	};

	const ACTION_OBJECT = {
		$pattern: /\S+/,
		keyword: ACTION_COMMANDS,
		string: ACTION_STRINGS,
	};

	const COMMENT: Mode = {
		scope: 'comment',
		begin: /(?:^|[ \t])#/,
		end: /$/,
	};

	// A '$(...)' reference. Its name is a built-in variable or a user variable.
	// A modifier such as ':S' or a subscript such as '[1]' is a type.
	const MODIFIER_VALUE: Mode = {
		begin: /=/,
		end: /(?=[:)])/,
		contains: [],
	};

	const VARIABLE: Mode = {
		begin: /\$\(/,
		end: /\)|$/,
		contains: [
			'self',
			{scope: 'built_in', begin: words(JAM_VARIABLES)},
			{scope: 'type', begin: /:[LUPEJGRDBSM]+/},
			{begin: /:[A-Za-z]+/},
			MODIFIER_VALUE,
			{scope: 'type', begin: /\[[\d-]+\]/},
			{scope: 'built_in', begin: /[<>]/},
			{scope: 'variable', begin: /\d+/},
			{scope: 'variable', begin: new RegExp(NAME)},
		],
	};
	MODIFIER_VALUE.contains = [VARIABLE];

	const ESCAPE: Mode = {begin: /\\./, relevance: 0};

	const STRING: Mode = {
		scope: 'string',
		begin: /"/,
		end: /"/,
		contains: [ESCAPE, VARIABLE],
	};

	const ACTION_STRING: Mode = {...STRING, end: /"|$/};

	// A brace inside an action body nests, so it does not end the body.
	const ACTION_NESTED: Mode = {
		begin: /\{/,
		end: /\}/,
		keywords: ACTION_OBJECT,
		contains: [],
	};

	const ACTION_RULES: Mode[] = [
		// Directives such as `#async` change how the action runs.
		{scope: 'meta', begin: /^[ \t]*#(?:async|respfile-ln|no-respfile|respfile)\b/},
		// The markers that flip slashes in an action line.
		{scope: 'meta', begin: /#\/\(|\)\/#|#\\\(|\)\\#/},
		{scope: 'string', begin: /^[ \t]*:\w+/},
		{scope: 'comment', begin: /^[ \t]*#/, end: /$/},
		{match: [/(?<=^[ \t]*)[rR][eE][mM](?=\s|$)/, /.*/], scope: {1: 'keyword', 2: 'comment'}},
		ACTION_STRING,
		VARIABLE,
	];
	ACTION_NESTED.contains = [...ACTION_RULES, ACTION_NESTED];

	// The body of an `actions` block. It ends the enclosing block when it closes.
	const ACTION_BODY: Mode = {
		begin: /\{/,
		end: /\}/,
		endsParent: true,
		keywords: ACTION_OBJECT,
		contains: [...ACTION_RULES, ACTION_NESTED],
	};

	// `actions [flags] NAME [bind VARS] {`. The lookahead lets the header words
	// be colored by this mode, and the body closes the mode through endsParent.
	const ACTIONS_BLOCK: Mode = {
		begin: /(?=^[ \t]*actions\b[^{}]*\{)/,
		end: /(?!)/,
		keywords: KEYWORD_OBJECT,
		contains: [
			{scope: 'keyword', begin: /\bactions\b/},
			{
				begin: /(?<!\S)bind(?!\S)/,
				beginScope: 'keyword',
				end: BEFORE_BLOCK,
				contains: [VARIABLE, {scope: 'variable', begin: new RegExp(NAME)}],
			},
			{scope: 'title.function', begin: new RegExp(`${NOT_RESERVED}${NAME}(?=\\s*(?:bind\\b|\\{|$))`)},
			ACTION_BODY,
		],
	};

	// The parameters of `rule NAME PARAMS {` are variables. The title ends
	// where the parameters start, and the parameters end at the brace.
	const RULE_PARAMETERS: Mode = {
		scope: 'variable',
		end: /(?=\{)|$/,
		endsParent: true,
	};

	const RULE_DEFINITION: Mode = {
		begin: /(?=^[ \t]*rule\b)/,
		end: /$/,
		contains: [
			{scope: 'keyword', begin: /\brule\b/},
			{scope: 'title.function', begin: new RegExp(NAME), starts: RULE_PARAMETERS},
		],
	};

	// `[ RuleName args ]`.
	const BRACKET_ARGUMENTS: Mode = {
		end: /(?=(?<!\S)\](?!\S))/,
		contains: [],
	};

	const BRACKET_CALL: Mode = {
		begin: /(?<!\S)\[(?!\S)/,
		end: /(?<!\S)\](?!\S)/,
		contains: [
			{scope: 'keyword', begin: new RegExp(`${BUILTIN_RULE}(?!\\S)`), starts: BRACKET_ARGUMENTS},
			{scope: 'keyword', begin: /on(?!\S)/},
			{scope: 'title.function', begin: new RegExp(`${NOT_RESERVED}${NAME}(?!\\S)`), starts: BRACKET_ARGUMENTS},
			STRING,
			VARIABLE,
		],
	};

	const ARGUMENT_CONTENTS: Mode[] = [COMMENT, ESCAPE, STRING, BRACKET_CALL, VARIABLE];
	BRACKET_ARGUMENTS.contains = ARGUMENT_CONTENTS;

	const ARGUMENTS: Mode = {
		end: STATEMENT_END,
		contains: ARGUMENT_CONTENTS,
	};

	const BLOCK_LIST: Mode = {
		end: BEFORE_BLOCK,
		contains: ARGUMENT_CONTENTS,
	};

	// `local` and the loop variable of `for` name variables.
	const LOCAL_DEFINITION: Mode = {
		begin: new RegExp(`${STATEMENT_START}local(?=\\s|$)`),
		beginScope: 'keyword',
		end: STATEMENT_END,
		contains: [
			{begin: /(?<!\S)=(?!\S)/, end: /(?=(?<!\S);(?!\S))/, contains: ARGUMENT_CONTENTS},
			COMMENT,
			VARIABLE,
			{scope: 'variable', begin: new RegExp(`(?<!\\S)${NAME}(?!\\S)`)},
		],
	};

	const FOR_DEFINITION: Mode = {
		match: [new RegExp(`${STATEMENT_START}for`), /\s+/, new RegExp(NAME), /\s+/, /in(?=\s|$)/],
		scope: {1: 'keyword', 3: 'variable', 5: 'keyword'},
		starts: BLOCK_LIST,
	};

	const SWITCH: Mode = {
		scope: 'keyword',
		begin: new RegExp(`${STATEMENT_START}switch(?=\\s|$)`),
		starts: BLOCK_LIST,
	};

	const LIST_STATEMENT: Mode = {
		scope: 'keyword',
		begin: new RegExp(`${STATEMENT_START}(?:include|return|break|continue)(?=\\s|$)`),
		starts: ARGUMENTS,
	};

	// An assignment to a Jam variable, such as `SEARCH = ...`.
	function assignment(name: string, scope: string): Mode[] {
		return [
			{
				match: [new RegExp(`${STATEMENT_START}${name}`), /\s+/, /on(?=\s|$)|default(?=\s+=(?:\s|$))/],
				scope: {1: scope, 3: 'keyword'},
				starts: ARGUMENTS,
			},
			{scope, begin: new RegExp(`${STATEMENT_START}${name}${ASSIGNMENT_AHEAD}`), starts: ARGUMENTS},
		];
	}

	// A statement that starts with a rule name calls that rule.
	const BUILTIN_CALL: Mode = {
		scope: 'keyword',
		begin: new RegExp(`${STATEMENT_START}${BUILTIN_RULE}(?=\\s|$)(?!${ASSIGNMENT_AHEAD})`),
		starts: ARGUMENTS,
	};

	const STATEMENT_CALL: Mode = {
		scope: 'title.function',
		begin: new RegExp(`${STATEMENT_START}${NOT_RESERVED}${NAME}(?=\\s|$)(?!${ASSIGNMENT_AHEAD})`),
		starts: ARGUMENTS,
	};

	return {
		name: 'Jam',
		aliases: ['jamfile'],
		keywords: KEYWORD_OBJECT,
		contains: [
			COMMENT,
			ESCAPE,
			STRING,
			ACTIONS_BLOCK,
			RULE_DEFINITION,
			LOCAL_DEFINITION,
			FOR_DEFINITION,
			SWITCH,
			LIST_STATEMENT,
			...assignment(`(?:${JAM_VARIABLES.split(' ').join('|')})`, 'built_in'),
			...assignment(NAME, 'variable'),
			BRACKET_CALL,
			BUILTIN_CALL,
			STATEMENT_CALL,
			VARIABLE,
		],
	};
}
