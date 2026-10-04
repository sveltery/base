import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { checkAlertDialogApi, extractAlertDialogApi } from '../../parity/alert-dialog/docs-api.mjs';
const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
test('AlertDialog immutable originals and ordinary/type/helper provenance remain intact', () => {
  const inventory = JSON.parse(read('parity/alert-dialog/upstream-inventory.json'));
  assert.equal(inventory.pin, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.equal(inventory.ordinaryDeclarations.length, 35);
  for (const file of inventory.files) assert.equal(createHash('sha256').update(read(`parity/alert-dialog/upstream/${file.source}`)).digest('hex'), file.sha256);
  assert.equal(inventory.conformanceHelperCalls.length, 1);
  assert.equal(inventory.ordinaryDeclarationCredit, 0);
  const graph = JSON.parse(read('parity/alert-dialog/source-graph.json'));
  assert(graph.modules.some(module => module.source.endsWith('alert-dialog/index.parts.ts')));
  assert(graph.modules.find(module => module.source.endsWith('alert-dialog/root/AlertDialogRoot.tsx')).imports.some(edge => edge.resolved.endsWith('dialog/root/useRenderDialogRoot.tsx') && edge.kind === 'runtime'));
});
test('AlertDialog docs derive all nine part contracts from actual public native declarations', () => {
  checkAlertDialogApi();
  assert.deepEqual(extractAlertDialogApi().parts.map(part => part.name).sort(), ['Root', 'Trigger', 'Backdrop', 'Close', 'Description', 'Popup', 'Portal', 'Title', 'Viewport'].sort());
});
