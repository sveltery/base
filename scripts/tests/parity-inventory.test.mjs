import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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

test('credited Dialog leaves retain immutable assertions, real fixtures and browser evidence', () => {
  const localPath = (path) => new URL(`../../${path}`, import.meta.url);
  const manifest = JSON.parse(readFileSync(localPath('parity/manifest.json'), 'utf8'));
  const trace = JSON.parse(readFileSync(localPath('parity/dialog/upstream-inventory.json'), 'utf8'));
  assert.equal(manifest.upstream.commit, trace.upstream.commit);
  const credited = manifest.cases.filter(item => item.source.includes('/dialog/') && item.status === 'passing');
  assert.deepEqual(credited.map(item => item.sourceId), [92, 287, 310, 333].map(line => `packages/react/src/dialog/popup/DialogPopup.test.tsx:${line}`));
  for (const item of credited) {
    const source = trace.declarations.find(declaration => declaration.id === item.sourceId);
    assert.ok(source, `Missing immutable source: ${item.sourceId}`);
    assert.equal(item.sourceId, `${item.source}:${item.line}`);
    assert.equal(item.name, source.title);
    assert.equal(item.sourceBodySha256, source.bodySha256);
    assert.deepEqual(item.assertionLines, source.assertions.map(assertion => assertion.line));
    assert.deepEqual(source.parameterAxes, []);
    assert.deepEqual(source.variants, [{}]);
    assert.deepEqual(source.appliesTo, ['Popup']);
    assert.deepEqual(source.sourceConditions, []);
    assert.deepEqual(source.upstreamGuards, []);
    // Execution credit must not rewrite the immutable provenance placeholders.
    assert.equal(source.status, 'unported');
    assert.equal(source.port, null);
    for (const path of [item.port, item.adaptations, ...item.fixtures]) {
      assert.equal(typeof path, 'string');
      assert.ok(existsSync(localPath(path)), `Missing port evidence file: ${path}`);
    }
    assert.match(readFileSync(localPath(item.port), 'utf8'), new RegExp(`\\[${item.line}, '${item.scenario}'\\]`));
    assert.deepEqual(item.evidence.executions, [
      `P:${item.line} Svelte initialFocus ${item.scenario}`,
      `P:${item.line} React reference initialFocus ${item.scenario}`,
    ]);
    assert.match(item.evidence.testedCommit, /^[0-9a-f]{40}$/);
    assert.match(item.evidence.workflowRun, /^https:\/\/github\.com\/sveltery\/base\/actions\/runs\/\d+$/);
    assert.ok(Number.isSafeInteger(item.evidence.browserJob) && item.evidence.browserJob > 0);
    assert.ok(item.verification.includes(item.evidence.testedCommit));
  }
});

test('documented aggregate credit agrees with the shared manifest and overlapping Dialog trace', () => {
  const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
  const manifest = JSON.parse(read('parity/manifest.json'));
  const trace = JSON.parse(read('parity/dialog/upstream-inventory.json'));
  const passing = manifest.cases.filter(item => item.status === 'passing');
  const unported = manifest.cases.filter(item => item.status === 'unported');
  const report = read('parity/dialog/initial-focus-ports.md');
  const globalSummary = `${passing.length} passing ports / ${unported.length} unported`;
  assert.ok(read('parity/README.md').includes(globalSummary));
  assert.ok(report.includes(globalSummary));
  assert.equal(passing.length + unported.length, manifest.cases.length);
  const creditedIds = new Set(passing.map(item => `${item.source}:${item.line}`));
  const credited = trace.declarations.filter(item => creditedIds.has(item.id));
  const records = items => items.reduce((count, item) => count + item.variants.length * item.appliesTo.length, 0);
  assert.ok(report.includes(`${credited.length} complete ports / ${trace.declarations.length - credited.length} unported declarations`));
  assert.ok(report.includes(`${records(credited)} complete ports / ${records(trace.declarations) - records(credited)} unported candidate records`));
});
