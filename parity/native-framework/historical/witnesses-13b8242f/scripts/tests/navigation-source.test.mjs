import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { checkNavigationApi, extractNavigationApi } from '../../parity/toggle-toolbar/docs-api.mjs';
import {
  checkNativeClosure,
  extractNativeClosure,
} from '../../parity/toggle-toolbar/native-closure.mjs';
const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url));
test('owned navigation API snapshot derives all actual eight exported components and types', () => {
  checkNavigationApi();
  assert.deepEqual(
    extractNavigationApi().parts.map((x) => x.name),
    ['Toggle', 'ToggleGroup', 'Root', 'Group', 'Button', 'Input', 'Link', 'Separator'],
  );
});
test('navigation actual native runtime/type closure and all selected Source mappings preserve exact local bytes', () => {
  checkNativeClosure();
  const native = extractNativeClosure();
  const correspondence = JSON.parse(read('parity/toggle-toolbar/source-correspondence.json'));
  const mapped = new Map(
    correspondence.records.flatMap((record) => Object.entries(record.localHashes ?? {})),
  );
  for (const record of correspondence.nativeRepresentationModules)
    mapped.set(record.local, record.sha256);
  assert.equal(native.modules.length, 75);
  assert.equal(mapped.size, native.modules.length);
  for (const record of native.modules)
    assert.equal(mapped.get(record.source), record.sha256, record.source);
  assert(
    native.external.every((dependency) =>
      /^external:(svelte(?:\/.*)?|esm-env|@floating-ui\/utils\/dom)$/.test(dependency),
    ),
  );
  assert(
    !native.modules.some(
      (record) =>
        /\/(dialog|field|button)\/.*\.svelte$/.test(record.source) &&
        !record.source.includes('/toolbar/'),
    ),
  );
});
test('navigation source graph resolves original index.parts and preserves immutable declaration accounting', () => {
  const graph = JSON.parse(read('parity/toggle-toolbar/source-graph.json'));
  const correspondence = JSON.parse(read('parity/toggle-toolbar/source-correspondence.json'));
  const assertions = JSON.parse(read('parity/toggle-toolbar/original-assertions.json'));
  assert.equal(graph.pin, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.equal(graph.modules.length, correspondence.records.length);
  assert(graph.modules.some((x) => x.source === 'packages/react/src/toolbar/index.parts.ts'));
  assert(graph.modules.every((x) => /^[0-9a-f]{64}$/.test(x.sha256)));
  assert.equal(assertions.declarations.length, 91);
  assert.equal(assertions.sources.length, 10);
  assert.equal(assertions.conformance.length, 8);
  assert.equal(assertions.ordinaryDeclarationCredit, 0);
  for (const entry of JSON.parse(read('parity/toggle-toolbar/historical/manifest.json')))
    assert.equal(createHash('sha256').update(read(entry.archive)).digest('hex'), entry.sha256);
});
