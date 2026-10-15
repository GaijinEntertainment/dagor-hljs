# @gaijin/highlightjs-blk

A [highlight.js](https://highlightjs.org/) 11 grammar for BLK, the DataBlock text format of the
[Dagor Engine](https://github.com/GaijinEntertainment/DagorEngine). The language name is `blk`.

## Usage

```sh
npm install highlight.js @gaijin/highlightjs-blk
```

```js
import hljs from 'highlight.js/lib/core';
import blk from '@gaijin/highlightjs-blk';

hljs.registerLanguage('blk', blk);
const html = hljs.highlight(code, {language: 'blk'}).value;
```

In a web page, load `dist/blk.min.js` after highlight.js. The script registers the grammar on the global `hljs`:

```html
<script src="https://cdn.jsdelivr.net/npm/@gaijin/highlightjs-blk/dist/blk.min.js"></script>
```

## References

- [GaijinEntertainment/tree-sitter-blk](https://github.com/GaijinEntertainment/tree-sitter-blk), the tree-sitter
  grammar that this grammar follows.

## License

MIT. See [LICENSE](LICENSE).
