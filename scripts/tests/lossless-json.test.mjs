import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { gzipSync } from 'node:zlib';
import {
  readLogicalJsonBytes,
  readLosslessJson,
  writeLosslessJsonBytes,
} from '../lossless-json.mjs';

const scratch = new URL('../../.checks/', import.meta.url);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
function fixture(t) {
  mkdirSync(scratch, { recursive: true });
  const directory = mkdtempSync(new URL('lossless-json-', scratch).pathname);
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return join(directory, 'record.json');
}

test('legacy JSON preserves its exact logical bytes and ordinary parsed value', (t) => {
  const path = fixture(t);
  const bytes = Buffer.from('{ "native": ["é", 0], "format": 3 }\n\n');
  writeFileSync(path, bytes);
  assert.deepEqual(readLogicalJsonBytes(path), bytes);
  assert.deepEqual(readLosslessJson(path), { native: ['é', 0], format: 3 });
});

test('gzip container round-trips exact JSON bytes and writes deterministically', (t) => {
  const path = fixture(t);
  const bytes = Buffer.from('{\n  "text": "é", "values": [null, false, 1]\n}\n');
  writeLosslessJsonBytes(path, bytes);
  const descriptor = readFileSync(path);
  const payload = readFileSync(`${path}.gz`);
  assert.deepEqual(readLogicalJsonBytes(path), bytes);
  assert.deepEqual(readLosslessJson(new URL(`file://${path}`)), JSON.parse(bytes));
  const manifest = JSON.parse(descriptor);
  assert.equal(manifest.contentBytes, bytes.length);
  assert.equal(manifest.contentSha256, sha256(bytes));
  assert.equal(manifest.gzipSha256, sha256(payload));
  writeLosslessJsonBytes(path, bytes);
  assert.deepEqual(readFileSync(path), descriptor);
  assert.deepEqual(readFileSync(`${path}.gz`), payload);
});

test('corrupted payloads, logical hashes, counts and unsupported paths fail closed', (t) => {
  const path = fixture(t);
  const bytes = Buffer.from('{"valid":true}\n');
  writeLosslessJsonBytes(path, bytes);
  const descriptor = JSON.parse(readFileSync(path));
  const compressed = readFileSync(`${path}.gz`);
  const setDescriptor = (updates) =>
    writeFileSync(path, JSON.stringify({ ...descriptor, ...updates }));
  setDescriptor({ contentSha256: '0'.repeat(64) });
  assert.throws(() => readLogicalJsonBytes(path), /content hash mismatch/);
  setDescriptor({ contentBytes: bytes.length + 1 });
  assert.throws(() => readLogicalJsonBytes(path), /byte count mismatch/);
  setDescriptor({ gzipPath: '../outside.gz' });
  assert.throws(() => readLogicalJsonBytes(path), /sibling file/);
  setDescriptor({ format: 'sveltery-lossless-json-gzip-v2' });
  assert.throws(() => readLogicalJsonBytes(path), /Unsupported lossless JSON format/);
  setDescriptor({});
  writeFileSync(`${path}.gz`, Buffer.from('broken'));
  assert.throws(() => readLogicalJsonBytes(path), /gzip hash mismatch/);
  const substitute = gzipSync(Buffer.from('{"valid":false}'));
  writeFileSync(`${path}.gz`, substitute);
  setDescriptor({ gzipSha256: sha256(substitute), contentBytes: 15 });
  assert.throws(() => readLogicalJsonBytes(path), /content hash mismatch/);
  writeFileSync(`${path}.gz`, compressed);
  setDescriptor({});
  assert.deepEqual(readLogicalJsonBytes(path), bytes);
});
