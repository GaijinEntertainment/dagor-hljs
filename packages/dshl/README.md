# @gaijin/highlightjs-dshl

A [highlight.js](https://highlightjs.org/) 11 grammar for DSHL, the shader language of the
[Dagor Engine](https://github.com/GaijinEntertainment/DagorEngine). It colors the DSHL layer and the HLSL code inside
`hlsl` blocks. The language name is `dshl`.

## Usage

```sh
npm install highlight.js @gaijin/highlightjs-dshl
```

```js
import hljs from 'highlight.js/lib/core';
import dshl from '@gaijin/highlightjs-dshl';

hljs.registerLanguage('dshl', dshl);
const html = hljs.highlight(code, {language: 'dshl'}).value;
```

In a web page, load `dist/dshl.min.js` after highlight.js. The script registers the grammar on the global `hljs`:

```html
<script src="https://cdn.jsdelivr.net/npm/@gaijin/highlightjs-dshl/dist/dshl.min.js"></script>
```

## References

- [The shader compiler](https://github.com/GaijinEntertainment/DagorEngine/tree/main/prog/tools/ShaderCompiler2) of
  the Dagor Engine, whose lexer and syntax rules this grammar follows.
- [`dshl.hrc`](https://github.com/GaijinEntertainment/DagorEngine/blob/main/prog/tools/ShaderCompiler2/_colorer5/dshl.hrc),
  the Colorer definition that sets the keyword groups and their colors.

## License

MIT. See [LICENSE](LICENSE).
