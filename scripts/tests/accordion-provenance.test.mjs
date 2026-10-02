import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
test('Accordion trace preserves ordinary, parameterized, Activity, helper and type scopes', () => {
  const trace = JSON.parse(read('parity/accordion/upstream-inventory.json'));
  const ledger = JSON.parse(read('parity/accordion/ports.json'));
  assert.deepEqual(ledger.upstream, trace.upstream);
  assert.equal(trace.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.equal(trace.declarations.length, 39); assert.equal(ledger.ports.length, 39);
  assert.equal(new Set(trace.declarations.map(item => item.id)).size, 39);
  assert.equal(trace.declarations.reduce((count, item) => count + item.variants.length, 0), 43);
  const portable = trace.declarations.filter(item => item.scope === 'portable');
  assert.equal(portable.length, 38); assert.equal(portable.reduce((count, item) => count + item.variants.length, 0), 42);
  assert.deepEqual(trace.declarations.filter(item => item.scope !== 'portable').map(item => item.id), ['packages/react/src/accordion/panel/AccordionPanel.test.tsx:201']);
  assert.equal(trace.parameterized.length, 1); assert.deepEqual(trace.parameterized[0].variants, ['root', 'item']);
  assert.equal(trace.parameterized[0].line, 431); assert.equal(trace.conformance.length, 5);
  assert.equal(trace.typeAssertions.length, 7); assert.equal(trace.expectedErrors.length, 1);
  const browser = read('tests/browser/accordion.spec.ts');
  assert.doesNotMatch(browser, /(?:test|describe)\.(?:skip|fixme|only)\s*\(/);
  const titles = new Map([...browser.matchAll(/test\(`([RIHTP]:\d+) ([^`]+)`/g)].map(match => [match[1], `${match[1]} ${match[2]}`]));
  for (const source of trace.sources) {
    assert.match(source.sha256, /^[0-9a-f]{64}$/);
    assert.ok(source.url.includes(`/${trace.upstream.commit}/`));
  }
  for (const [sources, ports] of [[trace.declarations, ledger.ports], [trace.parameterized, ledger.parameterizedPorts]]) {
    assert.equal(ports.length, sources.length);
    for (const [index, port] of ports.entries()) {
      const source = sources[index];
      assert.equal(port.sourceId, source.id); assert.equal(port.sourceTitle, source.title);
      assert.equal(port.sourceBodySha256, source.bodySha256); assert.match(port.sourceBodySha256, /^[0-9a-f]{64}$/);
      assert.deepEqual(port.assertionLines, source.assertions.map(item => item.line));
      assert.deepEqual(port.assertionSha256, source.assertions.map(item => hash(item.text)));
      for (const assertion of source.assertions) assert.equal(assertion.assertionSha256, hash(assertion.text));
      assert.deepEqual(port.variants, source.variants);
      assert.equal(source.status, 'unported'); assert.equal(source.port, null);
      if (source.scope !== 'portable') {
        assert.equal(port.status, 'deferred'); assert.equal(port.port, null); assert.deepEqual(port.executions, []); assert.equal(port.evidence, null);
      } else {
        assert.ok(['candidate', 'passing'].includes(port.status));
        for (const path of [port.port, ...port.fixtures, ...port.localPorts]) assert.ok(existsSync(new URL(`../../${path}`, import.meta.url)), path);
        if (port.pairedExecutionPrefix) {
          const title = titles.get(port.pairedExecutionPrefix); assert.ok(title, port.sourceId);
          const names = ['Svelte', 'React reference'].flatMap(framework => source.variants.map(variant => {
            let name = title.replace('${framework}', framework);
            if (variant && typeof variant === 'object') name = name.replace("${native ? 'native' : 'custom'}", variant.nativeButton ? 'native' : 'custom').replace('${key}', variant.key ?? '');
            else if (typeof variant === 'string') name = name.replace('${disabledPart}', variant);
            assert.ok(!name.includes('${'), name);
            return name;
          }));
          assert.deepEqual(port.executions, names);
        } else {
          assert.equal(port.port, 'packages/base/tests/dom/accordion.test.ts');
          assert.ok(read(port.port).includes(`it('${port.executions[0]}'`), port.sourceId);
        }
        if (port.status === 'passing') {
          assert.match(port.evidence.testedCommit, /^[0-9a-f]{40}$/); assert.equal(port.evidence.pairedSecuredBrowser, true);
          assert.ok(port.executions.length >= source.variants.length);
        } else assert.equal(port.evidence, null);
      }
    }
  }
  assert.equal(ledger.conformancePorts.length, 5);
  for (const [index, port] of ledger.conformancePorts.entries()) {
    assert.equal(port.source, trace.conformance[index].source); assert.equal(port.line, trace.conformance[index].line);
    assert.equal(port.sourceDeclarationSha256, trace.conformance[index].declarationSha256);
  }
  assert.equal(ledger.typePorts.length, 7); assert.equal(ledger.expectedErrorPorts.length, 1);
  for (const [index, port] of ledger.typePorts.entries()) assert.equal(port.sourceAssertionSha256, hash(trace.typeAssertions[index].text));
  const types = read('packages/base/tests/accordion-types.ts');
  assert.equal((types.match(/^\s*expectType</gm) ?? []).length, 7);
  assert.equal((types.match(/@ts-expect-error/g) ?? []).length, 1);
  assert.match(read('parity/accordion/UPSTREAM_LICENSE'), /Copyright \(c\) 2019 Material-UI SAS/);
});
