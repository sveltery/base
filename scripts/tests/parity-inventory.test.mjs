import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extractTestDeclarations, locateTypeAssertion, reconcileCases } from '../parity-inventory.mjs';

test('extracts multiline conditional names and keeps their declaration lines', () => {
  const declarations = extractTestDeclarations('fixture.test.tsx', `
it.skipIf(isJSDOM)(
  'native trailing click',
  async () => {}
);
test.runIf(browser).only(
  'owner-document cleanup', () => {}
);
it('simple', () => {});
it.skipIf('condition string')('conditional', () => {});
other('unrelated', () => {});
`);
  assert.deepEqual(declarations, [
    { source: 'fixture.test.tsx', line: 2, name: 'native trailing click' },
    { source: 'fixture.test.tsx', line: 6, name: 'owner-document cleanup' },
    { source: 'fixture.test.tsx', line: 9, name: 'simple' },
    { source: 'fixture.test.tsx', line: 10, name: 'conditional' },
  ]);
});

test('counts existing template declarations once and excludes parameterized factories', () => {
  const text = 'it(`open=${open}`, () => {});\nit.each(cases)("parameter %s", () => {});\n' +
    'test.for(cases)("parameter", () => {});\nit(`constant`, () => {});';
  assert.deepEqual(extractTestDeclarations('fixture.test.ts', text).map(({ name }) => name), ['open=${open}', 'constant']);
});

test('preserves verification metadata, marks added declarations unported, and rejects lost cases', () => {
  const declaration = { source: 'fixture.test.ts', line: 1, name: 'ported' };
  const port = { ...declaration, status: 'passing', port: 'local.test.ts', verification: 'verified' };
  const added = { source: 'fixture.test.ts', line: 2, name: 'new' };
  assert.deepEqual(reconcileCases([port], [declaration, added]), [port, { ...added, status: 'unported', port: null }]);
  assert.throws(() => reconcileCases([port], [added]), /discard existing cases/);
  assert.throws(() => reconcileCases([], [added, added]), /Duplicate declaration/);
});

test('locates the exact pinned type assertion and rejects missing assertions', () => {
  const assertion = { source: 'fixture.spec.ts', name: 'exact reason', expression: 'expectType<Reason, typeof value>(value)' };
  assert.deepEqual(locateTypeAssertion(assertion, '\nconst value = makeDetails();\nexpectType<Reason, typeof value>(value);'),
    { source: 'fixture.spec.ts', line: 3, name: 'exact reason' });
  assert.throws(() => locateTypeAssertion(assertion, 'expectType<string, typeof value>(value);'), /found 0/);
});
