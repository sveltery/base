import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
const root = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const sha = body => createHash('sha256').update(body).digest('hex');
test('private anchor foundation keeps immutable source/assertions and zero deferred ordinary credit', () => {
  const ledger = JSON.parse(read('parity/anchor-positioning/ledger.json'));
  assert.equal(ledger.upstream.commit, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  for (const source of ledger.sources) assert.equal(sha(read(source.snapshot)), source.sha256, source.source);
  assert.deepEqual(ledger.counts, { anchorWiringSites: 2, anchorWiringVariants: 3, hideSites: 2, hideVariants: 6, floatingLifecycleSites: 2, creditedOrdinarySites: 0, creditedOrdinaryVariants: 0 });
  for (const port of ledger.assertionPorts) {
    const source = ledger.sources.find(item => item.source === port.source);
    const lines = read(source.snapshot).split('\n');
    const assertions = [];
    for (const declaration of port.declarations) {
      const end = lines.findIndex((line, i) => i >= declaration.line && (line === '  });' || line === '  );'));
      const body = lines.slice(declaration.line - 1, end + 1).join('\n') + '\n';
      assert.equal(sha(body), declaration.bodySha256);
      assert.deepEqual(body.match(/expect\([\s\S]*?;/g), declaration.assertions);
      assertions.push(...declaration.assertions);
    }
    const normalize = text => text.replace(/\s+/g, '');
    assert.deepEqual(read(port.local).match(/expect\([\s\S]*?;/g).map(normalize), assertions.map(normalize));
    assert.equal(port.status, 'deferred-browser-gate');
  }
  assert.deepEqual(ledger.familyCredit, { menu: 0, popover: 0, tooltip: 0, select: 0 });
  for (const license of ['UPSTREAM_LICENSE', 'FLOATING_UI_LICENSE']) assert.match(read(`parity/anchor-positioning/${license}`), /Permission is hereby granted/);
  for (const path of ['packages/base/tests/dom/anchor-positioning-lifecycle.test.ts', 'tests/browser/anchor-positioning.spec.ts', 'scripts/check-anchor-positioning-package.sh']) assert.ok(existsSync(new URL(path, root)));
  const browser = read('tests/browser/anchor-positioning.spec.ts'); assert.doesNotMatch(browser, /(?:test|describe)\.(?:skip|fixme|only)\s*\(/);
  const controller = read('packages/base/src/lib/internals/anchor-positioning/useFloating.svelte.ts');
  assert.doesNotMatch(controller.replace(/\/\/[^\n]*/g, ''), /platform\s*:/); assert.match(controller, /await computePosition\(currentReference, currentFloating, config\)/);
  const anchor = read('packages/base/src/lib/internals/anchor-positioning/useAnchorPositioning.svelte.ts');
  assert.match(anchor, /const position = useFloating\(/);
  assert.match(anchor, /createPositioningPolicy\(currentOptions, \(\) => currentArrow, isCurrent, currentMountSide\)/);
  const pkg = JSON.parse(read('packages/base/package.json')); assert.equal(pkg.exports['./anchor-positioning'], undefined);
  assert.equal(pkg.dependencies['@floating-ui/dom'], '1.8.0'); assert.equal(pkg.dependencies['@floating-ui/utils'], '0.2.12');
});
