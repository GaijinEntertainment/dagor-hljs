# @gaijin/highlightjs-quirrel

A [highlight.js](https://highlightjs.org/) 11 grammar for the [Quirrel](https://github.com/GaijinEntertainment/quirrel)
scripting language. The language name is `quirrel`, with the alias `nut`.

## Usage

```sh
npm install highlight.js @gaijin/highlightjs-quirrel
```

```js
import hljs from 'highlight.js/lib/core';
import quirrel from '@gaijin/highlightjs-quirrel';

hljs.registerLanguage('quirrel', quirrel);
const html = hljs.highlight(code, {language: 'quirrel'}).value;
```

In a web page, load `dist/quirrel.min.js` after highlight.js. The script registers the grammar on the global `hljs`:

```html
<script src="https://cdn.jsdelivr.net/npm/@gaijin/highlightjs-quirrel/dist/quirrel.min.js"></script>
```

## References

- [GaijinEntertainment/tree-sitter-quirrel](https://github.com/GaijinEntertainment/tree-sitter-quirrel), the
  tree-sitter grammar that this grammar follows.

## License

MIT. See [LICENSE](LICENSE).
