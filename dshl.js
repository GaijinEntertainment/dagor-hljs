/*
 * DSHL (Dagor shader) language definition for highlight.js.
 *
 * Written by hand from the grammar of the shader compiler (the lexer rules
 * and the syntax rules). The keyword groups and the colors follow the
 * Colorer definition that ships with the compiler. Only classes listed in
 * CLASS_SAFELIST in gr-syntax-layer-worker.ts are shown in the diff.
 */

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
  'hlsl',
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

// Values that states, supports and assume take.
const DSHL_VALUES = [
  'fsh_4_0 fsh_5_0 fsh_6_0 fsh_6_2 fsh_6_6 bindless mesh',
  'none true false NULL globtm projtm viewprojtm',
  'local_view_x local_view_y local_view_z local_view_pos',
  'world_local_x world_local_y world_local_z world_local_pos',
].join(' ');

const DSHL_DIRECTIVES = [
  'include include_optional macro endmacro define_macro_if_not_defined',
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

// highlight.js keywords are case sensitive, so each word is listed in both
// cases. Types are left out here, so that each word has one class.
const HLSL_KEYWORDS = [
  ...new Set(HLSL_KEYWORDS_LIST.split(/\s+/).flatMap(w => [w, w.toLowerCase()])),
]
  .filter(w => w && !HLSL_TYPE_SET.has(w))
  .join(' ');

export default function (hljs) {
  const DSHL_KEYWORD_OBJECT = {
    keyword: DSHL_KEYWORDS,
    type: DSHL_TYPES,
    property: DSHL_STATES,
    literal: DSHL_VALUES,
    meta: DSHL_DIRECTIVES,
  };

  // Builtin bindings that a shader can read from the HLSL body.
  const HLSL_KEYWORD_OBJECT = {
    keyword: HLSL_KEYWORDS,
    type: HLSL_TYPE_WORDS,
    built_in: HLSL_INTRINSICS,
    attr: HLSL_SEMANTICS,
    literal: [
      'true false globtm projtm viewprojtm immediate_dword_count',
      'local_view_x local_view_y local_view_z local_view_pos',
      'world_local_x world_local_y world_local_z world_local_pos',
    ].join(' '),
  };

  // `~` escapes the next character, so `~"` does not end the string.
  const STRING = {
    className: 'string',
    begin: /"/,
    end: /"/,
    contains: [{begin: /~./, relevance: 0}],
  };

  const NUMBER = {
    className: 'number',
    begin:
      /\b(?:0[xX][0-9a-fA-F]+|\d[0-9a-fA-F]*[hH]|(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?)[uUlLfFhH]*\b/,
  };

  // `name@type` binds a shader variable to a resource type, such as `@tex2d`.
  const BINDING_TYPE = {
    className: 'built_in',
    begin: /@[A-Za-z_]\w*/,
  };

  // Used by the DSHL layer and by the HLSL body, which both allow `##` and `#rb`.
  const MACRO_TOKEN = {
    className: 'meta',
    begin: /##|#rb\b/,
  };

  // A line in an HLSL body that starts with `#` is a preprocessor line.
  const HLSL_PREPROCESSOR = {
    className: 'meta',
    begin: /^\s*#/,
    end: /$/,
  };

  const HLSL_SEMANTIC = {
    className: 'attr',
    begin: /\b(?:SV_(?:IsFrontFace|InstanceID|Depth|Position|Target)|COLOR|NORMAL|POSITION)[0-1]\b|\bTEXCOORD(?:1[0-5]|\d)\b/,
  };

  const HLSL_TYPE_VECTOR = {
    className: 'type',
    begin: /\b(?:bool|int|uint|fixed|half|float|double)[1-4](?:x[1-4])?\b/,
  };

  const COMMENTS = [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE];

  // Rules that apply inside an HLSL body. The HLSL body is plain HLSL, so the
  // DSHL keywords do not apply there.
  const HLSL_RULES = [
    ...COMMENTS,
    STRING,
    HLSL_PREPROCESSOR,
    MACRO_TOKEN,
    NUMBER,
    BINDING_TYPE,
    HLSL_SEMANTIC,
    HLSL_TYPE_VECTOR,
  ];

  // A brace inside an HLSL body opens a nested block, which can hold more braces.
  const HLSL_NESTED = {
    begin: /\{/,
    end: /\}/,
    keywords: HLSL_KEYWORD_OBJECT,
    contains: [],
  };
  HLSL_NESTED.contains = [...HLSL_RULES, HLSL_NESTED];

  // The body of `hlsl { ... }`. It ends the enclosing HLSL_BLOCK when it closes.
  const HLSL_BODY = {
    begin: /\{/,
    end: /\}/,
    endsParent: true,
    keywords: HLSL_KEYWORD_OBJECT,
    contains: [...HLSL_RULES, HLSL_NESTED],
  };

  // `hlsl`, an optional stage in brackets, and the body. The begin is a
  // lookahead, so the header is colored by the rules below it. The body
  // closes this mode through endsParent.
  const HLSL_BLOCK = {
    begin: /(?=\bhlsl\b\s*(?:\(\s*[A-Za-z_]\w*\s*\)\s*)?\{)/,
    end: /(?!)/,
    contains: [
      {className: 'keyword', begin: /\bhlsl\b/},
      {className: 'built_in', begin: /\(\s*[A-Za-z_]\w*\s*\)/},
      HLSL_BODY,
    ],
  };

  // A stage block such as `(ps) { ... }`. Its braces can hold `@f44 = { ... }`.
  const STAGE_NESTED = {
    begin: /\{/,
    end: /\}/,
    keywords: DSHL_KEYWORD_OBJECT,
    contains: [],
  };

  const STAGE_BODY = {
    begin: /\{/,
    end: /\}/,
    endsParent: true,
    keywords: DSHL_KEYWORD_OBJECT,
    contains: [],
  };

  const DSHL_RULES = [
    ...COMMENTS,
    STRING,
    HLSL_BLOCK,
    MACRO_TOKEN,
    BINDING_TYPE,
    NUMBER,
  ];

  STAGE_NESTED.contains = [...DSHL_RULES, STAGE_NESTED];
  STAGE_BODY.contains = [...DSHL_RULES, STAGE_NESTED];

  const STAGE_BLOCK = {
    begin: /(?=^\s*\(\s*(?:[acdeghlmpv]s|[A-Za-z_]\w{2,})\s*\)\s*\{)/,
    end: /(?!)/,
    contains: [
      {className: 'built_in', begin: /\(\s*[A-Za-z_]\w*\s*\)/},
      STAGE_BODY,
    ],
  };

  return {
    name: 'DSHL',
    aliases: ['dshl'],
    keywords: DSHL_KEYWORD_OBJECT,
    contains: [...DSHL_RULES, STAGE_BLOCK],
  };
}
