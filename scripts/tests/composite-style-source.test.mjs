import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { readLosslessJson } from '../lossless-json.mjs';

const root = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root));
const json = (path) => readLosslessJson(new URL(path, root));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');

test('Composite leaf complete forward, affected and Original correspondence hashes remain current', () => {
  const current = new Map(
    json('parity/native-snippets/native-graph.json').modules.map((record) => [
      record.source,
      record,
    ]),
  );
  const forward = json('parity/composite-style/native-closure.json');
  const reached = new Set();
  function visit(path) {
    if (path.startsWith('external:') || reached.has(path)) return;
    reached.add(path);
    const record = current.get(path);
    assert.ok(record, `Missing dependency: ${path}`);
    record.imports.forEach((edge) => visit(edge.resolved));
  }
  forward.seeds.forEach(visit);
  assert.deepEqual(
    [...reached].sort(),
    forward.modules.map((record) => record.source),
  );
  for (const graph of [forward, json('parity/composite-style/affected-closure.json')]) {
    for (const record of graph.modules) {
      assert.equal(hash(read(record.source)), record.sha256, record.source);
      assert.deepEqual(record, current.get(record.source));
    }
  }
  const original = json('parity/composite-style/source-correspondence.json');
  assert.equal(original.pin, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  for (const record of original.modules) {
    assert.equal(hash(read(record.archivePath)), record.sha256, record.source);
    for (const destination of record.selectedNativeDestinations)
      assert.ok(reached.has(destination));
  }
});
