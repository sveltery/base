import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
const local = path => new URL(`../../${path}`, import.meta.url);
const read = path => readFileSync(local(path), 'utf8');
const sha = text => createHash('sha256').update(text).digest('hex');
test('CSP source ledger retains the pin, original dependent assertions and zero ordinary credit', () => {
  const ledger = JSON.parse(read('parity/csp-provider/ledger.json'));
  assert.equal(ledger.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  for (const source of ledger.sources) {
    assert.equal(sha(read(source.snapshot)), source.sha256, source.source);
    if (source.local) assert.ok(existsSync(local(source.local)), source.local);
  }
  assert.deepEqual(ledger.counts, { ordinarySites: 4, portedOrdinarySites: 0, creditedOrdinarySites: 0, parameterizedVariants: 0, conformanceCalls: 0, upstreamTypeAssertions: 0 });
  const snapshot = ledger.sources.find(source => source.kind === 'ordinary-tests');
  const source = read(snapshot.snapshot), lines = source.split('\n');
  assert.equal([...source.matchAll(/^ {2}it\('/gm)].length, 4);
  for (const declaration of ledger.ordinaryDeclarations) {
    assert.equal(declaration.source, snapshot.source);
    assert.ok(lines[declaration.line - 1].includes(declaration.title));
    const end = lines.findIndex((line, index) => index >= declaration.line && line === '  });');
    assert.equal(sha(lines.slice(declaration.line - 1, end + 1).join('\n') + '\n'), declaration.bodySha256);
    const assertions = lines.slice(declaration.line - 1, end + 1).flatMap((text, index) => text.includes('expect(') ? [{ line: declaration.line + index, text: text.trim() }] : []);
    assert.deepEqual(declaration.assertions, assertions);
    assert.equal(declaration.status, 'deferred-unimplemented-consumers');
    assert.equal(declaration.port, null); assert.equal(declaration.evidence, null);
  }
  for (const future of ledger.futureIntegration) {
    assert.match(future.sha256, /^[a-f0-9]{64}$/);
    assert.equal(future.status, 'deferred-unimplemented-consumer');
  }
  const browser = read(ledger.supplementalEvidence.browser.file);
  assert.doesNotMatch(browser, /(?:test|describe)\.(?:skip|fixme|only)\s*\(/);
  for (const key of ['dom', 'ssr', 'types', 'browser', 'publicConsumer']) assert.ok(existsSync(local(ledger.supplementalEvidence[key].file)));
  assert.ok(read('scripts/check-package.sh').includes('bash scripts/check-csp-provider-package.sh'));
  const catalog = JSON.parse(read('parity/catalog.json')).modules.find(item => item.upstreamModule === 'csp-provider');
  assert.deepEqual(catalog, { upstreamModule: 'csp-provider', status: 'bounded', localExport: 'CSPProvider', evidence: 'parity/csp-provider/README.md' });
});
