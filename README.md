# dagor-hljs

[highlight.js](https://highlightjs.org/) 11 grammars for the languages of the
[Dagor Engine](https://github.com/GaijinEntertainment/DagorEngine). Each grammar is an npm package of its own.

| Package                                           | Language | Name in highlight.js | Alias     | File extensions   |
| ------------------------------------------------- | -------- | -------------------- | --------- | ----------------- |
| [`@gaijin/highlightjs-daslang`](packages/daslang) | Daslang  | `daslang`            | `das`     | `.das`            |
| [`@gaijin/highlightjs-blk`](packages/blk)         | BLK      | `blk`                |           | `.blk`            |
| [`@gaijin/highlightjs-quirrel`](packages/quirrel) | Quirrel  | `quirrel`            | `nut`     | `.nut`            |
| [`@gaijin/highlightjs-dshl`](packages/dshl)       | DSHL     | `dshl`               |           | `.dshl`           |
| [`@gaijin/highlightjs-jam`](packages/jam)         | Jam      | `jam`                | `jamfile` | `.jam`, `jamfile` |

## Development

The workspace uses [Vite+](https://viteplus.dev/) and yarn 4.

```sh
vp install
vp check
vp test run
```

`vp test run` builds every package before it tests the built scripts. `vp run -r build` builds the packages alone.

## Releasing

Each package has its own version and is released on its own. Only a repository admin can create a release tag.

1. In a pull request, set `version` in `packages/<language>/package.json`. Merge the pull request.
2. Tag the merged commit with `<language>/vX.Y.Z`, and push the tag. For BLK 1.2.0:

   ```sh
   git fetch origin
   git tag blk/v1.2.0 origin/main
   git push origin blk/v1.2.0
   ```

3. Watch the run that the tag starts: `gh run watch`.

The tag starts the workflow `.github/workflows/publish.yml`. The workflow makes sure that the tag agrees with `version`,
builds and tests every package, and publishes the tagged package to npm with provenance. Then it creates a GitHub
release with the attested tarball. A version with a prerelease part, such as `1.2.0-rc.0`, goes to the npm dist-tag
`next`. All other versions go to `latest`.

Nobody can move or delete a release tag. If a job fails for a reason outside the repository, such as an npm outage,
run the failed jobs again. The workflow does not publish a version that npm already has. If the fix needs a commit,
release the next version.

To rehearse a release, start the workflow manually with `gh workflow run publish.yml`. The run builds, tests, and
packs every package, and publishes nothing.

## License

MIT. See [LICENSE](LICENSE).
