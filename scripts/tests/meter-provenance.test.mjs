import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
const root = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
test('Meter preserves 22 ordinary declarations, four parameterized variants and separate full conformance', () => {
  const trace = JSON.parse(read('parity/meter/upstream-inventory.json'));
  const ledger = JSON.parse(read('parity/meter/ports.json'));
  assert.equal(trace.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.deepEqual(ledger.upstream, trace.upstream);
  assert.equal(trace.declarations.length, 23);
  assert.equal(ledger.ports.filter((port) => port.kind === 'ordinary').length, 22);
  const parameterized = ledger.ports.filter((port) => port.kind === 'parameterized');
  assert.equal(parameterized.length, 1);
  assert.equal(parameterized[0].sourceId, 'packages/react/src/meter/root/MeterRoot.test.tsx:188');
  assert.equal(parameterized[0].variants, 4);
  for (const [part, count] of Object.entries({
    root: 11,
    indicator: 5,
    label: 2,
    track: 0,
    value: 4,
  })) {
    assert.equal(
      ledger.ports.filter((port) => port.kind === 'ordinary' && port.sourceId.includes(`/${part}/`))
        .length,
      count,
    );
  }
  assert.equal(ledger.ports.filter((port) => port.sourceId.includes('/track/')).length, 0);
  assert.equal(new Set(ledger.ports.map((port) => port.sourceId)).size, trace.declarations.length);
  for (const source of trace.sources) {
    assert.equal(
      createHash('sha256')
        .update(read(`parity/meter/upstream/${source.source}`))
        .digest('hex'),
      source.sha256,
    );
    assert.equal(
      source.url,
      `https://github.com/mui/base-ui/blob/${trace.upstream.commit}/${source.source}`,
    );
  }
  for (const dependency of [
    'packages/react/src/internals/useRenderElement.tsx',
    'packages/utils/src/useMergedRefs.ts',
    'packages/utils/src/getReactElementRef.ts',
    'packages/react/src/merge-props/mergeProps.ts',
    'packages/react/src/utils/useRegisteredLabelId.ts',
    'packages/utils/src/useIsoLayoutEffect.ts',
    'packages/react/src/internals/useBaseUiId.ts',
    'packages/utils/src/useId.ts',
    'packages/utils/src/safeReact.ts',
    'packages/react/src/utils/valueToPercent.ts',
    'packages/utils/src/clamp.ts',
    'packages/utils/src/formatNumber.ts',
    'packages/utils/src/stringifyLocale.ts',
    'packages/utils/src/visuallyHidden.ts',
  ]) {
    assert.ok(
      trace.sources.some((source) => source.source === dependency),
      dependency,
    );
  }
  for (const port of ledger.ports) {
    const source = trace.declarations.find((item) => item.id === port.sourceId);
    assert.ok(source);
    assert.equal(port.sourceBodySha256, source.bodySha256);
    assert.deepEqual(
      port.assertionLines,
      source.assertions.map((item) => item.line),
    );
    assert.equal(port.kind, source.expression.startsWith('it.each') ? 'parameterized' : 'ordinary');
    assert.equal(source.status, 'unported');
    assert.equal(source.port, null);
    assert.ok(['ported-pending-verification', 'passing'].includes(port.status));
    assert.ok(existsSync(new URL(port.port, root)));
    assert.ok(read(port.port).includes(port.pairedExecutionPrefix), port.sourceId);
    if (port.directCallbackWitness)
      assert.ok(existsSync(new URL(port.directCallbackWitness, root)));
    if (port.status === 'passing') {
      assert.match(port.evidence.testedCommit, /^[0-9a-f]{40}$/);
      assert.match(
        port.evidence.workflowRun,
        /^https:\/\/github\.com\/sveltery\/base\/actions\/runs\/\d+$/,
      );
    } else assert.equal(port.evidence, null);
  }
  assert.equal(ledger.conformance.length, 15);
  for (const helper of ledger.conformance) {
    assert.equal(helper.ordinaryCredit, 0);
    assert.deepEqual(helper.parts, ['Root', 'Label', 'Track', 'Indicator', 'Value']);
    assert.ok(trace.sources.some((source) => source.source === helper.source));
    assert.ok(['ported-pending-verification', 'passing'].includes(helper.status));
    if (helper.status === 'ported-pending-verification') assert.equal(helper.evidence, null);
    else {
      assert.match(helper.evidence.testedCommit, /^[0-9a-f]{40}$/);
      assert.match(
        helper.evidence.workflowRun,
        /^https:\/\/github\.com\/sveltery\/base\/actions\/runs\/\d+$/,
      );
    }
  }
  assert.doesNotMatch(
    read('tests/browser/meter.spec.ts'),
    /(?:test|describe)\.(?:skip|fixme|only)\s*\(/,
  );
});
