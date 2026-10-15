# @gaijin/highlightjs-jam

A [highlight.js](https://highlightjs.org/) 11 grammar for Jam build files, such as the jamfiles of the
[Dagor Engine](https://github.com/GaijinEntertainment/DagorEngine). It colors the Jam language and the shell commands
inside `actions` blocks. The language name is `jam`, with the alias `jamfile`.

## Usage

```sh
npm install highlight.js @gaijin/highlightjs-jam
```

```js
import hljs from 'highlight.js/lib/core';
import jam from '@gaijin/highlightjs-jam';

hljs.registerLanguage('jam', jam);
const html = hljs.highlight(code, {language: 'jam'}).value;
```

In a web page, load `dist/jam.min.js` after highlight.js. The script registers the grammar on the global `hljs`:

```html
<script src="https://cdn.jsdelivr.net/npm/@gaijin/highlightjs-jam/dist/jam.min.js"></script>
```

## References

- [GaijinEntertainment/jam-G8](https://github.com/GaijinEntertainment/jam-G8), the Jam engine whose keyword table and
  scanner this grammar follows.
- [`jamfile.hrc`](https://github.com/GaijinEntertainment/DagorEngine/blob/main/prog/_jBuild/_colorer5/jamfile.hrc), the
  Colorer definition for jamfiles.

## License

MIT. See [LICENSE](LICENSE).
