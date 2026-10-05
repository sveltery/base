import { registerHooks } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { HastRoot, HastNode } from '../src/lib/docs/highlight/types.js';
// Vite's asset import is packaging only; Node's actual Starry Night filesystem
// WASM loader ignores getOnigurumaUrlFetch. Keep that SSR-only asset boundary
// explicit while executing the complete real parser/regex/token/gutter bodies.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'vscode-oniguruma/release/onig.wasm?url')
      return {
        url: 'data:text/javascript,export default "unused-node-fetch-url"',
        shortCircuit: true,
      };
    if (
      specifier.startsWith('.') &&
      specifier.endsWith('.js') &&
      context.parentURL?.startsWith(
        new URL('../src/lib/docs/', import.meta.url).href,
      )
    )
      return nextResolve(specifier.slice(0, -3) + '.ts', context);
    return nextResolve(specifier, context);
  },
});
const { createParseSource, parseSource, resetStarryNight } =
  await import('../src/lib/docs/highlight/parseSource.ts');
const { getHastTextContent } =
  await import('../src/lib/docs/highlight/getHastTextContent.ts');
const { resolveGrammarScope } =
  await import('../src/lib/docs/highlight/grammarMaps.ts');
const { areGrammarsRegistered } =
  await import('../src/lib/docs/highlight/grammarCache.ts');
function classes(node: HastRoot | HastNode): string[] {
  return [
    ...(node.type === 'element'
      ? (node.properties?.className ?? []).map(String)
      : []),
    ...('children' in node ? node.children.flatMap(classes) : []),
  ];
}
test('shared parser serializes concurrent grammar registration including real Svelte dependencies', async () => {
  resetStarryNight();
  const parsers = await Promise.all(
    [['source.svelte'], ['source.ts'], ['source.css']].map(createParseSource),
  );
  assert.equal(parsers[0], parsers[1]);
  assert.equal(parsers[1], parsers[2]);
  assert.equal(resolveGrammarScope('Demo.svelte'), 'source.svelte');
  assert.equal(
    areGrammarsRegistered([
      'source.svelte',
      'source.ts',
      'source.js',
      'source.css',
    ]),
    true,
  );
  const source =
    '<script lang="ts">let value: number = 1;</script>\n<button>{value}</button>\n';
  const tree = parseSource(source, 'Demo.svelte');
  assert.equal(getHastTextContent(tree), source);
  assert.equal(tree.data?.totalLines, 2);
  assert.ok(classes(tree).some((name) => name.startsWith('pl-')));
});
test('extended token classes and unsupported scopes preserve exact readable source', async () => {
  await createParseSource(['source.ts']);
  const source =
    'const count: number = 42;\nconst enabled = true;\nconst label = `value ${count}`;\n';
  const tree = parseSource(source, 'example.ts');
  assert.equal(getHastTextContent(tree), source);
  for (const token of ['di-bt', 'di-num', 'di-bool', 'di-te', 'di-td'])
    assert.ok(classes(tree).includes(token), token);
  const deferredJson = parseSource('{"key": true}', 'example.json');
  assert.equal(getHastTextContent(deferredJson), '{"key": true}');
  assert.equal(
    classes(deferredJson).some((name) => name.startsWith('pl-')),
    false,
  );
  const plain = parseSource(source, 'example.unknown');
  assert.equal(getHastTextContent(plain), source);
  assert.equal(
    classes(plain).some((name) => name.startsWith('pl-')),
    false,
  );
});
test('multi-frame gutters preserve terminal newline and frame fallback text', async () => {
  const source =
    Array.from({ length: 121 }, (_, index) => 'line ' + index).join('\n') +
    '\n';
  const tree = parseSource(source, 'plain.unknown');
  assert.equal(tree.data?.totalLines, 121);
  assert.equal(tree.data?.frameSize, 120);
  assert.equal(tree.children.length, 2);
  assert.equal(getHastTextContent(tree), source);
  assert.equal(
    tree.children
      .map((frame) => {
        assert.equal(frame.type, 'element');
        assert.ok(frame.data?.fallback);
        return getHastTextContent({
          type: 'root',
          children: frame.data.fallback,
        });
      })
      .join(''),
    source,
  );
});
