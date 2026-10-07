// Maintained metadata storage only; logical JSON bytes retain their provenance hash.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync, gunzipSync } from 'node:zlib';

const format = 'sveltery-lossless-json-gzip-v1';
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const filename = (path) => (path instanceof URL ? fileURLToPath(path) : path);

export function readLogicalJsonBytes(path) {
  const location = filename(path);
  const bytes = readFileSync(location);
  const descriptor = JSON.parse(bytes.toString('utf8'));
  if (
    typeof descriptor?.format !== 'string' ||
    !descriptor.format.startsWith('sveltery-lossless-json-')
  )
    return bytes;
  assert.equal(descriptor.format, format, 'Unsupported lossless JSON format');
  assert.equal(typeof descriptor.gzipPath, 'string', 'Missing gzip payload path');
  assert.equal(
    basename(descriptor.gzipPath),
    descriptor.gzipPath,
    'Payload must be a sibling file',
  );
  assert(descriptor.gzipPath.endsWith('.gz'), 'Payload must be gzip');
  assert(Number.isSafeInteger(descriptor.contentBytes) && descriptor.contentBytes >= 0);
  assert.match(descriptor.contentSha256, /^[a-f0-9]{64}$/);
  assert.match(descriptor.gzipSha256, /^[a-f0-9]{64}$/);
  const compressed = readFileSync(resolve(dirname(location), descriptor.gzipPath));
  assert.equal(sha256(compressed), descriptor.gzipSha256, 'Lossless JSON gzip hash mismatch');
  const content = gunzipSync(compressed, { maxOutputLength: descriptor.contentBytes + 1 });
  assert.equal(content.length, descriptor.contentBytes, 'Lossless JSON byte count mismatch');
  assert.equal(sha256(content), descriptor.contentSha256, 'Lossless JSON content hash mismatch');
  JSON.parse(content.toString('utf8'));
  return content;
}

export function readLosslessJson(path) {
  return JSON.parse(readLogicalJsonBytes(path).toString('utf8'));
}

export function writeLosslessJsonBytes(path, bytes) {
  const location = filename(path);
  const content = Buffer.from(bytes);
  JSON.parse(content.toString('utf8'));
  const compressed = gzipSync(content, { level: 9 });
  const gzipPath = `${basename(location)}.gz`;
  writeFileSync(resolve(dirname(location), gzipPath), compressed);
  writeFileSync(
    location,
    JSON.stringify(
      {
        format,
        gzipPath,
        contentSha256: sha256(content),
        contentBytes: content.length,
        gzipSha256: sha256(compressed),
      },
      null,
      2,
    ) + '\n',
  );
}
