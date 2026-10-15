# dagor-hljs

highlight.js 11 grammars for the languages of the Dagor Engine: Daslang, BLK, Quirrel, DSHL, and Jam. Each grammar is
an npm package of its own. The repository is public.

## Where things live

- `packages/<language>/` - the package `@gaijin/highlightjs-<language>`. The directory name is the highlight.js
  language name; it also names `src/<language>.ts`, `dist/<language>.min.js`, and the test registration.
- `grammar-pack.ts` - the `vp pack` configuration of every package.
- `test/markup.ts` - the fixture helper that each grammar test calls. `test/dist.test.ts` loads each built
  `<language>.min.js` on a fresh highlight.js instance.

## Rules

- Lexical rules (numbers, strings and escapes, comments, keywords) follow the compiler or engine of the language: the
  lexer of GaijinEntertainment/daScript, the compiler of GaijinEntertainment/quirrel, the BLK parser and the shader
  compiler of GaijinEntertainment/DagorEngine, and GaijinEntertainment/jam-G8.
- Every grammar gives a kind of token the same class, chosen for the colors of the Gerrit diff view
  (`embed/diff/gr-syntax-themes/gr-syntax-theme.ts` and `styles/themes/` of `polygerrit-ui/app`):
  - `keyword` - every keyword, also the keywords of imports, includes, modules, and macro definitions.
  - `meta` - the token of a preprocessor directive (`#if`, `##if`) or of an annotation; not the rest of its line.
  - `title.function` - the name of a function or a macro, where it is defined and where it is called.
  - `title` - the name that a declaration of a type, a shader, a block, or a class introduces.
  - `type` - built-in types, type suffixes such as `@f4` and `:r`, and type names in a type position.
  - `built_in` - built-in functions and built-in values such as `this`.
  - `literal` - `true`, `false`, `null`, and named built-in constants.
  - `attr` - render states and other built-in setting names, and HLSL semantics.
  - `template-variable` - a variable expansion, such as `$(Root)` in Jam.
  - `number`, `string`, `comment` - every number, string, and comment, also in values and directives.
- Do not use `property`, `variable`, `params`, `function`, `attribute`, `quote`, `strong`, or `emphasis`: the light
  theme of Gerrit shows them in the default text color.
- Every fixture input is code that the compiler of its language accepts.
- A grammar package also changes the language table of `README.md`.
- Give a token only a class from `CLASS_SAFELIST` in Gerrit's
  `polygerrit-ui/app/embed/diff/gr-syntax-layer/gr-syntax-layer-worker.ts`. The Gerrit diff view shows no other class.
- A fixture is `test/markup/<name>.txt` with `<name>.expect.txt` beside it. `vp test run -u` writes a new expectation;
  read its diff before the commit, because the expectation is what the test holds the grammar to.

## Verification

- Run `vp install`, then `vp check` (format, lint, and type check) and `vp test run`. The `dist` test project builds
  every package first; `vp pack` runs publint and attw on each package.
- A change reaches `main` through a pull request, merged by rebase or squash after the `ci-ok` job of
  `.github/workflows/ci.yml` passes; the `protect-main` ruleset rejects a direct push. Add each new CI job to the
  `needs` list of `ci-ok`.
- A workflow pins each action to the commit SHA of a release and names the release in a comment
  (`actions/checkout@<sha> # v7.0.1`), which Dependabot reads to update both. A checkout sets
  `persist-credentials: false`.

## Releasing

- The release procedure is the `Releasing` section of `README.md`. Change it in the same commit as
  `.github/workflows/publish.yml`.
- npm holds a trusted publisher for each package: the repository `GaijinEntertainment/dagor-hljs`, the workflow
  `publish.yml`, and the environment `npm`, which accepts deployments only from `*/v*` tags. A new name for the
  repository, the workflow file, or the environment needs a new trusted publisher for each package.
- The `restrict-release-tag-creation` ruleset lets only repository admins create a `*/v*` tag. The
  `protect-release-tags` ruleset forbids moving or deleting one and has no bypass, so it stays a separate ruleset: a
  bypass covers every rule of its ruleset.
- A job that can mint an OIDC token (`id-token: write`) runs only GitHub's own actions and the npm CLI. The packages
  are built in a separate job and reach the publishing job as an artifact.

## Public repository

- Keyword lists hold no platform names, such as the platform values of DSHL. Some platform names are confidential.
- Files and commit messages hold no internal context: no internal hosts, no links to internal Gerrit changes or tracker
  issues, and no local paths. Cite a source only when it is public on GitHub.
