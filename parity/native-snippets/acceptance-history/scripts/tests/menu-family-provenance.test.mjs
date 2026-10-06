import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { extractNativeClosure, checkNativeClosure } from '../../parity/menu-family/native-closure.mjs';
const root = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const json = path => JSON.parse(read(path));
test('complete original Menu family runtime and test/helper archives preserve the immutable pin', () => {
  for (const [name, count, edges] of [['source', 200, 1038], ['test-helper', 745, 4418]]) {
    const graph = json(`parity/menu-family/${name}-graph.json`);
    assert.equal(graph.pin, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
    assert.equal(graph.modules.length, count); assert.equal(graph.modules.reduce((total, module) => total + module.imports.length, 0), edges);
    for (const module of graph.modules) assert.equal(createHash('sha256').update(read(`parity/menu-family/upstream/${module.source}`)).digest('hex'), module.sha256, module.source);
  }
});
test('actual used native closure resolves all public parts and Source/native correspondence bytes', () => {
  checkNativeClosure();
  execFileSync(process.execPath, ['parity/menu-family/evidence.mjs', '--check'], { cwd: root, stdio: 'pipe' });
  const closure = extractNativeClosure();
  const correspondence = json('parity/menu-family/source-correspondence.json');
  const mapped = new Map(correspondence.records.flatMap(record => Object.entries(record.localHashes)));
  for (const module of correspondence.nativeRepresentationModules) mapped.set(module.local, module.sha256);
  assert.equal(mapped.size, closure.modules.length);
  for (const module of closure.modules) assert.equal(mapped.get(module.source), module.sha256, module.source);
  assert(!correspondence.records.some(record => record.selection === 'unresolved-source-correspondence'));
  assert(closure.external.every(dependency => /^external:(svelte(?:\/.*)?|esm-env|@floating-ui\/(dom|utils)(?:\/dom)?)$/.test(dependency)));
  assert(!closure.modules.some(module => /\/dialog\/(?:Root|Popup)\.svelte$/.test(module.source)));
});
test('Original assertion declarations and conformance stay independently uncredited', () => {
  const inventory = json('parity/menu-family/original-assertions.json');
  assert.equal(inventory.declarations.length, 331); assert.equal(inventory.conformance.length, 19); assert.equal(inventory.ordinaryDeclarationCredit, 0);
  assert(inventory.declarations.every(declaration => declaration.status === 'unported' && declaration.ordinaryDeclarationCredit === 0));
  for (const declaration of inventory.declarations) for (const assertion of declaration.assertions) assert.equal(createHash('sha256').update(assertion.text).digest('hex'), assertion.sha256);
});
