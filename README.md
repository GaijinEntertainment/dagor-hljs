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

## License

MIT. See [LICENSE](LICENSE).
