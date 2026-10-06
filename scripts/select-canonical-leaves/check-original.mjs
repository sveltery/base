// Verify archived source bytes against a fresh immutable upstream checkout.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const upstream = process.argv[2];
const graph = JSON.parse(
  readFileSync('parity/select-canonical-leaves/original-graph.json', 'utf8'),
);
assert.equal(
  execFileSync('git', ['rev-parse', 'HEAD'], { cwd: upstream, encoding: 'utf8' }).trim(),
  graph.pin,
);
const archive = 'parity/select-canonical-leaves/upstream';
for (const module of graph.modules) {
  const actual = readFileSync(join(upstream, module.path));
  assert.equal(createHash('sha256').update(actual).digest('hex'), module.sha256, module.path);
  assert.deepEqual(readFileSync(join(archive, module.path)), actual, module.path);
}
for (const path of [
  'packages/react/src/internals/itemEquality.test.ts',
  'packages/react/src/internals/resolveValueLabel.test.ts',
  'LICENSE',
]) {
  assert.deepEqual(readFileSync(join(archive, path)), readFileSync(join(upstream, path)), path);
}
console.log(
  `Immutable ${graph.pin}: all ${graph.modules.length} closure modules, both Original helper tests and MIT license byte-identical`,
);
