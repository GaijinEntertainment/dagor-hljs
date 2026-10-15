# @gaijin/highlightjs-daslang

A [highlight.js](https://highlightjs.org/) 11 grammar for the [Daslang](https://github.com/GaijinEntertainment/daScript)
programming language. The language name is `daslang`, with the alias `das`.

## Usage

```sh
npm install highlight.js @gaijin/highlightjs-daslang
```

```js
import hljs from 'highlight.js/lib/core';
import daslang from '@gaijin/highlightjs-daslang';

hljs.registerLanguage('daslang', daslang);
const html = hljs.highlight(code, {language: 'daslang'}).value;
```

In a web page, load `dist/daslang.min.js` after highlight.js. The script registers the grammar on the global `hljs`:

```html
<script src="https://cdn.jsdelivr.net/npm/@gaijin/highlightjs-daslang/dist/daslang.min.js"></script>
```

## References

- [GaijinEntertainment/tree-sitter-daslang](https://github.com/GaijinEntertainment/tree-sitter-daslang), the
  tree-sitter grammar that this grammar follows.

## License

MIT. See [LICENSE](LICENSE).
