// Each grammar must load, color its sample, and keep the text unchanged.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import hljs from 'highlight.js';
import {register, languages} from '../index.js';

const samples = {
  das: 'def main() : int {\n  return 1\n}\n',
  blk: 'lod{\n  range:r=70\n  fname:t="lod01.dag"\n}\n',
  quirrel: 'local MAX = 10;\nfunction f(a) { return a?.b ?? 0 }\n',
  dshl: 'shader s {\n  (ps) { a@tex2d = b; }\n  hlsl(ps) {\n    float4 x;\n  }\n}\n',
  jam: 'rule Foo\n{\n  Echo $(x) ;\n}\n',
};

register(hljs);

for (const name of Object.keys(languages)) {
  test(`${name} highlights its sample`, () => {
    const code = samples[name];
    const html = hljs.highlight(code, {language: name}).value;
    assert.match(html, /<span class="hljs-/, 'expected at least one highlighted token');
    const text = html.replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    assert.equal(text, code);
  });
}
