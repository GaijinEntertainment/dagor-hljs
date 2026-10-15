# daglangs_grammars

highlight.js grammars for the Dagor languages. Use them in any project that
highlights code with highlight.js 11.

| Language | Name in highlight.js | File extensions |
|----------|----------------------|-----------------|
| Daslang  | `das`                | `.das`          |
| BLK      | `blk`                | `.blk`          |
| Quirrel  | `quirrel`            | `.nut`          |
| DSHL     | `dshl`               | `.dshl`         |
| Jam      | `jam`                | `.jam`, `Jamfile` |

## Usage

```js
import hljs from 'highlight.js';
import {register} from 'daglangs_grammars';

register(hljs);
const html = hljs.highlight(code, {language: 'dshl'}).value;
```

Or register one grammar at a time:

```js
import dshl from 'daglangs_grammars/dshl.js';
hljs.registerLanguage('dshl', dshl);
```

## Notes

- Tested with highlight.js 11.12.0.
- Each grammar is a plain highlight.js language definition. It only uses
  highlight.js features, so it does not depend on the Gerrit code base.
- The grammars are written by hand from the language sources. The header of
  each file names the source it follows.

## Tests

```sh
npm install
npm test
```

## License

MIT. See `LICENSE`.
