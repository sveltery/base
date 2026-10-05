import { registerHooks } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
// Native Node strip-types resolves the canonical TS metadata behind the Vite
// .js import spelling; the actual Source search/index/ranking bodies still run.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.endsWith('/fixtures/src/lib/docs/content.js'))
      return nextResolve(specifier.slice(0, -3) + '.ts', context);
    return nextResolve(specifier, context);
  },
});
const { createSearchEngine } = await import('../src/lib/docs/search/engine.js');
test('actual native declaration metadata supports nonempty Source QPS queries', async () => {
  const engine = createSearchEngine({
    sitemap: () => import('../src/lib/docs/search/sitemap.ts'),
    tolerance: 0,
    includeCategoryInGroup: true,
    excludeSections: true,
  });
  await engine.ready;
  for (const [term, path] of [
    ['button', '/docs/components/button/'],
    ['avatar', '/docs/components/avatar/'],
    ['remote form', '/docs/components/remote-form/'],
  ]) {
    await engine.search(term, {
      groupBy: { properties: ['group'], maxResult: 5 },
    });
    const results = engine.results.results.flatMap((group) => group.items);
    assert.ok(results.length > 0);
    assert.equal(engine.buildResultUrl(results[0]), path);
  }
});
