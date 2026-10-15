/*
 * DSHL (Dagor shader) language definition for highlight.js.
 *
 * Written by hand from the grammar of the shader compiler (the lexer rules
 * and the syntax rules). The keyword groups follow the Colorer definition
 * that ships with the compiler.
 */

import type {HLJSApi, Language, Mode} from 'highlight.js';

// Keywords of the DSHL layer, outside an hlsl block.
const DSHL_KEYWORDS = [
	'shader block supports channel compile interval local static dynamic',
	'const global literal always_referenced no_warnings if else hardware',
	'maybe two_sided real_two_sided assume assume_if_not_assumed error',
	'render_stage dont_render no_ablend no_dynstcode render_trans',
	'signed_pack unsigned_pack mul_1k mul_2k mul_4k mul_8k mul_16k mul_32767',
	'bounding_pack register max_recursion allow_opacity_micromaps material',
	'immediate_dword_count texture sampler buffer const_buffer tlas',
	'pixel vertex render_pass multi_render_pass framebuffer_layout subpass pass',
	'hlsl include include_optional macro endmacro define_macro_if_not_defined',
].join(' ');

// Functions of the preshader expressions (shFunc.cpp of the compiler). int4 is a type.
const DSHL_INTRINSICS = [
	'anim_frame cos exists_buf exists_tex fade_val fsel get_dimensions get_size get_viewport',
	'int2 int3 uint2 uint3 uint4 max min pow request_sampler sRGBread sin sqrt time_phase vecpow wind_coeff',
].join(' ');

// Channel and variable types.
const DSHL_TYPES = [
	'float float1 float2 float3 float4 float4x3 float4x4 int int4 bool',
	'short2 short4 ubyte4 color8 short2n short4n ushort2n ushort4n',
	'half2 half4 udec3 dec3n',
].join(' ');

// Render states and vertex channel usages.
const DSHL_STATES = [
	'blend_src blend_dst blend_asrc blend_adst blend_op blend_aop blend_factor',
	'cull_mode alpha_to_coverage view_instances stencil stencil_func stencil_ref',
	'stencil_pass stencil_fail stencil_zfail color_write z_write z_test z_func',
	'z_bias slope_z_bias pos norm tc vcol extra diffuse emissive specular ambient',
].join(' ');

const DSHL_LITERALS = 'none true false NULL';

// Values that states, supports and assume take, and the built-in bindings of a shader.
const DSHL_VALUES = [
	'fsh_4_0 fsh_5_0 fsh_6_0 fsh_6_2 fsh_6_6 bindless mesh globtm projtm viewprojtm',
	'local_view_x local_view_y local_view_z local_view_pos',
	'world_local_x world_local_y world_local_z world_local_pos',
].join(' ');

// Keywords of the HLSL body. Colorer matches them in any case, so both cases
// are listed below.
const HLSL_KEYWORDS_LIST = [
	'BlendState Bool Break Case CBuffer Class Compile Const Continue Default',
	'DepthStencilState DepthStencilView Discard Do Double Else Enum Extern',
	'False Float For GeometryShader Half If In Inline Inout Int Matrix',
	'Namespace Nointerpolation Operator Out Pass PixelShader RasterizerState',
	'RenderTargetView Return Register Sampler Sampler1D Sampler2D Sampler3D',
	'SamplerCUBE hsampler hsampler1D hsampler2D hsampler3D hsamplerCUBE',
	'fxsampler fxsampler1D fxsampler2D fxsampler3D fxsamplerCUBE',
	'fltsampler fltsampler1D fltsampler2D fltsampler3D fltsamplerCUBE',
	'sampler_state SamplerComparisonState Shared Sizeof Stateblock',
	'Stateblock_state Static String Struct Switch TBuffer Technique Technique10',
	'Template texture1 Texture1D Texture1DArray texture2D Texture2D',
	'Texture2DArray Texture2DMS Texture2DMSArray texture3D Texture3D',
	'texturecube TextureCube This True Typedef Typename Uniform Unsigned Using',
	'Vector VertexShader Void Volatile While',
].join(' ');

// Scalar and object types of the HLSL body, shown as types.
const HLSL_TYPE_WORDS = [
	'bool int uint float double half fixed void matrix vector string',
	'Bool Int Float Double Half Matrix Vector String Void',
	'Sampler Sampler1D Sampler2D Sampler3D SamplerCUBE SamplerComparisonState',
	'Texture1D Texture1DArray Texture2D Texture2DArray Texture2DMS Texture2DMSArray',
	'Texture3D TextureCube texture1 texture2D texture3D texturecube TBuffer',
].join(' ');

const HLSL_INTRINSICS = [
	'abs acos all any asfloat asin asint asuint atan atan2 ceil clamp clip cos',
	'cosh cross D3DCOLORtoUBYTE4 ddx ddy degrees determinant distance dot exp',
	'exp2 faceforward floor fmod frac frexp fwidth GetRenderTargetSampleCount',
	'GetRenderTargetSamplePosition isfinite isinf isnan ldexp length lerp lit',
	'log log10 log2 max min modf mul noise normalize pow radians reflect refract',
	'round rsqrt saturate sign sin sincos sinh smoothstep sqrt step tan tanh',
	'tex1D tex1Dbias tex1Dgrad tex1Dlod tex1Dproj tex2D tex2Dbias tex2Dgrad',
	'tex2Dlod tex2Dproj tex3D tex3Dbias tex3Dgrad tex3Dlod tex3Dproj texCUBE',
	'texCUBEbias texCUBEgrad texCUBElod texCUBEproj h4tex2D h4tex2Dbias',
	'h4tex2Dgrad h4tex2Dlod h4tex2Dproj h4tex3D h4tex3Dbias h4tex3Dgrad',
	'h4tex3Dlod h4tex3Dproj h4texCUBE h4texCUBEbias h4texCUBEgrad h4texCUBElod',
	'h4texCUBEproj transpose',
].join(' ');

const HLSL_SEMANTICS = [
	'BINORMAL BINORMAL0 BLENDINDICES BLENDINDICES0 BLENDWEIGHT BLENDWEIGHT0',
	'COLOR NORMAL POSITION POSITIONT PSIZE TANGENT TANGENT0 TEXCOORD FOG',
	'PSIZE0 TESSFACTOR TESSFACTOR0 VFACE VPOS DEPTH DEPTH0',
].join(' ');

const HLSL_TYPE_SET = new Set(HLSL_TYPE_WORDS.split(' '));

const HLSL_VECTOR_TYPE = String.raw`(?:bool|int|uint|fixed|half|float|double)[1-4](?:x[1-4])?`;

// Qualifiers that C++ shows as types.
const HLSL_TYPE_QUALIFIERS = 'const static unsigned Const Static Unsigned';

/**
 * Returns the mode of a function call: a name before `(` that is none of `words` and does not match `pattern`. C++
 * shows a call as `built_in`.
 */
function functionCall(words: string, pattern?: string): Mode {
	const alternatives = [...new Set(words.split(/\s+/).filter((word) => word !== ''))];
	if (pattern !== undefined) {
		alternatives.push(pattern);
	}
	return {
		scope: 'built_in',
		match: new RegExp(String.raw`\b(?!(?:${alternatives.join('|')})\b)[A-Za-z_]\w*(?=\s*\()`),
		relevance: 0,
	};
}

// highlight.js keywords are case sensitive, so each word is listed in both
// cases. Types are left out here, so that each word has one class.
const HLSL_KEYWORDS = [...new Set(HLSL_KEYWORDS_LIST.split(/\s+/).flatMap((w) => [w, w.toLowerCase()]))]
	.filter((w) => w !== '' && !HLSL_TYPE_SET.has(w) && !HLSL_TYPE_QUALIFIERS.split(' ').includes(w))
	.join(' ');

export default function dshl(hljs: HLJSApi): Language {
	// Render states, built-in values, and built-in bindings take the scope of the built-in variables of GLSL.
	const DSHL_KEYWORD_OBJECT = {
		keyword: DSHL_KEYWORDS,
		type: DSHL_TYPES,
		literal: DSHL_LITERALS,
		built_in: [DSHL_INTRINSICS, DSHL_STATES, DSHL_VALUES].join(' '),
	};

	const HLSL_KEYWORD_OBJECT = {
		keyword: HLSL_KEYWORDS,
		type: `${HLSL_TYPE_WORDS} ${HLSL_TYPE_QUALIFIERS}`,
		literal: 'true false',
		built_in: [
			HLSL_INTRINSICS,
			HLSL_SEMANTICS,
			// Built-in bindings that a shader can read from the HLSL body.
			'globtm projtm viewprojtm immediate_dword_count',
			'local_view_x local_view_y local_view_z local_view_pos',
			'world_local_x world_local_y world_local_z world_local_pos',
		].join(' '),
	};

	const DSHL_CALL = functionCall(Object.values(DSHL_KEYWORD_OBJECT).join(' '));
	const HLSL_CALL = functionCall(Object.values(HLSL_KEYWORD_OBJECT).join(' '), HLSL_VECTOR_TYPE);

	// `~` escapes the next character, so `~"` does not end the string.
	const STRING: Mode = {
		scope: 'string',
		begin: /"/,
		end: /"|$/,
		contains: [{begin: /~./, relevance: 0}],
	};

	const NUMBER: Mode = {
		scope: 'number',
		begin:
			/(?<![\w.])(?:0[xX][0-9a-fA-F]+|\d[0-9a-fA-F]*[hH]|(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?)[uUlLfFhH]*(?!\w)/,
	};

	// `name@type` binds a shader variable to a resource type, such as `@tex2d`.
	const BINDING_TYPE: Mode = {
		scope: 'type',
		begin: /@[A-Za-z_]\w*/,
	};

	// Used by the DSHL layer and by the HLSL body, which both allow `##` and `#rb`.
	const MACRO_TOKEN: Mode = {
		scope: 'meta',
		begin: /##|#rb\b/,
	};

	const HLSL_TYPE_VECTOR: Mode = {
		scope: 'type',
		begin: new RegExp(String.raw`\b${HLSL_VECTOR_TYPE}\b`),
	};

	const COMMENTS: Mode[] = [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE];

	const LINE_CONTINUATION: Mode = {begin: /\\\r?\n/, relevance: 0};

	// A preprocessor directive is meta to the end of its line, as in C++, with the directive word as a keyword.
	const directive = (marker: string, words: string, contains: Mode[]): Mode => ({
		scope: 'meta',
		begin: [new RegExp(String.raw`(?<=^[ \t]*)${marker}[ \t]*`), new RegExp(String.raw`(?:${words})\b`)],
		beginScope: {2: 'keyword'},
		end: /$/,
		contains: [LINE_CONTINUATION, STRING, ...contains, ...COMMENTS],
	});

	// Only `#include` takes a header in angle brackets.
	const HLSL_INCLUDE = directive('#', 'include', [{scope: 'string', begin: /<[^<>\n]*>/}]);
	const HLSL_PREPROCESSOR = directive(
		'#',
		'if|ifdef|ifndef|elif|else|endif|define|undef|pragma|line|error|warning',
		[],
	);

	// A `##` directive of the shader compiler.
	const SHADER_DIRECTIVE = directive('##', 'if|elif|else|endif|bool|declare|assert', []);

	const HLSL_SEMANTIC: Mode = {
		scope: 'built_in',
		begin: /\bSV_[A-Za-z]+\d*\b|\b(?:COLOR|NORMAL|POSITION)[0-1]\b|\bTEXCOORD(?:1[0-5]|\d)\b/,
	};

	const HLSL_STRUCT_DECLARATION: Mode = {
		match: [/\b(?:struct|class|interface)\b/, /\s+/, /[A-Za-z_]\w*/],
		scope: {1: 'keyword', 3: 'title.class'},
	};

	// The name of a function definition: a name before `(` after a return type that starts a line or a statement.
	const HLSL_FUNCTION_DEFINITION: Mode = {
		scope: 'title',
		match:
			/(?<=(?:^|[{};])[ \t]*(?:(?!(?:return|else|case|do|goto|throw)\b)[A-Za-z_]\w*(?:<[^<>\n]*>)?[ \t]+)+)[A-Za-z_]\w*(?=\s*\()/,
		relevance: 0,
	};

	// Rules that apply inside an HLSL body. The HLSL body is plain HLSL, so the
	// DSHL keywords do not apply there.
	const HLSL_RULES: Mode[] = [
		...COMMENTS,
		STRING,
		HLSL_STRUCT_DECLARATION,
		SHADER_DIRECTIVE,
		HLSL_INCLUDE,
		HLSL_PREPROCESSOR,
		MACRO_TOKEN,
		NUMBER,
		BINDING_TYPE,
		HLSL_SEMANTIC,
		HLSL_TYPE_VECTOR,
		HLSL_FUNCTION_DEFINITION,
		HLSL_CALL,
	];

	// A brace inside an HLSL body opens a nested block, which can hold more braces.
	const HLSL_NESTED: Mode = {
		begin: /\{/,
		end: /\}/,
		keywords: HLSL_KEYWORD_OBJECT,
		contains: [],
	};
	HLSL_NESTED.contains = [...HLSL_RULES, HLSL_NESTED];

	// The body of `hlsl { ... }`. It ends the enclosing HLSL_BLOCK when it closes.
	const HLSL_BODY: Mode = {
		begin: /\{/,
		end: /\}/,
		endsParent: true,
		keywords: HLSL_KEYWORD_OBJECT,
		contains: [...HLSL_RULES, HLSL_NESTED],
	};

	// `hlsl`, an optional stage in brackets, and the body. The begin is a
	// lookahead, so the header is colored by the rules below it. The body
	// closes this mode through endsParent.
	const HLSL_BLOCK: Mode = {
		begin: /(?=\bhlsl\b\s*(?:\(\s*[A-Za-z_]\w*\s*\)\s*)?\{)/,
		end: /(?!)/,
		contains: [{scope: 'keyword', begin: /\bhlsl\b/}, {scope: 'built_in', begin: /\(\s*[A-Za-z_]\w*\s*\)/}, HLSL_BODY],
	};

	// A stage block such as `(ps) { ... }`. Its braces can hold `@f44 = { ... }`.
	const STAGE_NESTED: Mode = {
		begin: /\{/,
		end: /\}/,
		keywords: DSHL_KEYWORD_OBJECT,
		contains: [],
	};

	const STAGE_BODY: Mode = {
		begin: /\{/,
		end: /\}/,
		endsParent: true,
		keywords: DSHL_KEYWORD_OBJECT,
		contains: [],
	};

	const NAME = /[A-Za-z_]\w*/;

	// `shader name1, name2` names one shader under several names.
	const SHADER_DECLARATION: Mode = {
		match: [/\bshader\b/, /\s+/, /[A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*/],
		scope: {1: 'keyword', 3: 'title.class'},
	};

	const BLOCK_DECLARATION: Mode = {
		match: [/\bblock\b/, /\s*\(\s*[A-Za-z_]\w*\s*\)\s*/, NAME],
		scope: {1: 'keyword', 3: 'title.class'},
	};

	const MACRO_DEFINITION: Mode = {
		match: [/\b(?:macro|define_macro_if_not_defined)\b/, /\s+/, NAME],
		scope: {1: 'keyword', 3: 'title'},
	};

	const DSHL_RULES: Mode[] = [
		...COMMENTS,
		STRING,
		HLSL_BLOCK,
		SHADER_DIRECTIVE,
		MACRO_TOKEN,
		BINDING_TYPE,
		NUMBER,
		SHADER_DECLARATION,
		BLOCK_DECLARATION,
		MACRO_DEFINITION,
		DSHL_CALL,
	];

	STAGE_NESTED.contains = [...DSHL_RULES, STAGE_NESTED];
	STAGE_BODY.contains = [...DSHL_RULES, STAGE_NESTED];

	const STAGE_BLOCK: Mode = {
		begin: /(?=^\s*\(\s*(?:[acdeghlmpv]s|[A-Za-z_]\w{2,})\s*\)\s*\{)/,
		end: /(?!)/,
		contains: [{scope: 'built_in', begin: /\(\s*[A-Za-z_]\w*\s*\)/}, STAGE_BODY],
	};

	return {
		name: 'DSHL',
		keywords: DSHL_KEYWORD_OBJECT,
		contains: [...DSHL_RULES, STAGE_BLOCK],
	};
}
