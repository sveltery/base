import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { checkTabsApi } from '../../parity/tabs/docs-api.mjs';
test('Tabs API documentation reflects actual exported typed declarations', () => {
  checkTabsApi();
});
test('Tabs source-first evidence records complete public parts and separate unexecuted original provenance', () => {
  const read = (name) =>
    JSON.parse(
      readFileSync(
        new URL(`../../parity/tabs/${name}`, import.meta.url),
        'utf8',
      ),
    );
  const graph = read('source-graph.json'),
    publicApi = read('public-inventory.json'),
    tests = read('original-assertions.json');
  assert.equal(graph.pin, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.deepEqual(publicApi.parts, [
    'Root',
    'List',
    'Tab',
    'Panel',
    'Indicator',
  ]);
  assert(
    graph.modules.every(
      (module) =>
        module.sha256.length === 64 &&
        module.imports.every((edge) => edge.resolved),
    ),
  );
  assert.equal(tests.files.length, 5);
  assert.equal(tests.ordinaryDeclarationCredit, 0);
});
test('Tabs actual recursive runtime/type dependency inventory is current', () => {
  execFileSync(process.execPath, ['parity/tabs/local-graph.mjs', '--check'], {
    cwd: new URL('../..', import.meta.url),
  });
});
