// Source/inventory consistency only; no product or ordinary parity credit.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
const trace = JSON.parse(readFileSync(new URL('../../parity/use-render/upstream-inventory.json', import.meta.url), 'utf8'));
test('UseRender immutable ordinary, parameterized and type scopes remain separate', () => {
  assert.equal(trace.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  const publicSites = trace.declarations.filter(site => site.source.includes('/use-render/'));
  const internalSites = trace.declarations.filter(site => site.source.includes('/internals/'));
  assert.equal(publicSites.length, 14); assert.equal(internalSites.length, 33);
  const parameterized = internalSites.filter(site => site.expression.startsWith('it.each'));
  assert.equal(parameterized.length, 1); assert.equal(parameterized[0].line, 584); assert.match(parameterized[0].expression, /\['null', null\]/);
  assert.equal(trace.typeAssertions.length, 7);
  for (const assertion of trace.typeAssertions) { assert.equal(assertion.status, 'divergent-unported'); assert.equal(assertion.port, null); }
  for (const source of trace.sources) { assert.match(source.sha256, /^[a-f0-9]{64}$/); assert(source.url.includes(trace.upstream.commit)); }
  assert.equal(new Set(trace.declarations.map(site => site.id)).size, 47);
});
test('UseRender portable browser cases map exactly to bounded candidate scopes', () => {
  const cases = readFileSync(new URL('../../apps/fixtures/src/lib/use-render-cases.ts', import.meta.url), 'utf8');
  const parse = name => cases.match(new RegExp(`export const ${name} = \\[(.*?)\\];`, 's'))[1].match(/'[^']+'/g);
  assert.equal(parse('publicCases').length, 14); assert.equal(parse('internalCases').length, 21);
  const browser = readFileSync(new URL('../../tests/browser/use-render.spec.ts', import.meta.url), 'utf8');
  assert(browser.includes('chromiumSandbox') === false); // Sandbox stays owned by the shared strict Playwright config.
  assert.match(readFileSync(new URL('../../playwright.config.ts', import.meta.url), 'utf8'), /chromiumSandbox: true/);
});
test('UseRender graph matches the actual canonical runtime and type closure', () => {
  const result = execFileSync(process.execPath, [new URL('../../parity/use-render/graph.mjs', import.meta.url).pathname, '--check'], { encoding: 'utf8' });
  assert.match(result, /21 immutable source modules, 19 actual used local modules/);
});
