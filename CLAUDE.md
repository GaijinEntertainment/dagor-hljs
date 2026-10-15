# dagor-hljs

highlight.js 11 grammars for the languages of the Dagor Engine: Daslang, BLK, Quirrel, DSHL, and Jam. The repository is
public.

## Rules

- The header comment of each grammar names the source that the grammar follows. Settle a token question in that source.
- A grammar file, its key in `languages` of `index.js`, its entry in `files` of `package.json`, its row in the table of
  `README.md`, and its sample in `test/smoke.test.mjs` change together.
- Give a token only a class from `CLASS_SAFELIST` in Gerrit's
  `polygerrit-ui/app/embed/diff/gr-syntax-layer/gr-syntax-layer-worker.ts`. The Gerrit diff view shows no other class.

## Verification

- Run `npm install`, then `npm test`.

## Public repository

- Keyword lists hold no platform names, such as the platform values of DSHL. Some platform names are confidential.
- Files and commit messages hold no internal context: no internal hosts, no links to internal Gerrit changes or tracker
  issues, and no local paths. Cite a source only when it is public on GitHub.
