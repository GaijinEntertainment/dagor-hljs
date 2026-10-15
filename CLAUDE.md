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
  compiler of GaijinEntertainment/DagorEngine, and GaijinEntertainment/jam-G8. Token classes follow the source that
  the header comment of each grammar names, a tree-sitter highlights query or a Colorer definition.
- Every fixture input is code that the compiler of its language accepts.
- A grammar package also changes the language table of `README.md`.
- Give a token only a class from `CLASS_SAFELIST` in Gerrit's
  `polygerrit-ui/app/embed/diff/gr-syntax-layer/gr-syntax-layer-worker.ts`. The Gerrit diff view shows no other class.
- A fixture is `test/markup/<name>.txt` with `<name>.expect.txt` beside it. `vp test run -u` writes a new expectation;
  read its diff before the commit, because the expectation is what the test holds the grammar to.

## Verification

- Run `vp install`, then `vp check` (format, lint, and type check) and `vp test run`. The `dist` test project builds
  every package first; `vp pack` runs publint and attw on each package.

## Public repository

- Keyword lists hold no platform names, such as the platform values of DSHL. Some platform names are confidential.
- Files and commit messages hold no internal context: no internal hosts, no links to internal Gerrit changes or tracker
  issues, and no local paths. Cite a source only when it is public on GitHub.
