// Audit recorded immutable Source/API/test hashes and exact installed reference versions.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '../..');
const graph = JSON.parse(readFileSync(resolve(import.meta.dirname, 'source-graph.json'), 'utf8'));
const tests = JSON.parse(readFileSync(resolve(import.meta.dirname, 'original-assertions.json'), 'utf8'));
const upstream = process.argv[2];
const hash = body => createHash('sha256').update(body).digest('hex');
if (upstream) for (const entry of [...graph.modules, ...tests.files]) assert.equal(hash(readFileSync(resolve(upstream, entry.source))), entry.sha256, entry.source);
for (const [name, version] of [['@base-ui/react','1.8.0'], ['react','19.2.8'], ['react-dom','19.2.8'], ['svelte','5.57.1']]) {
  const metadata = JSON.parse(readFileSync(resolve(root, 'apps/fixtures/node_modules', name, 'package.json'), 'utf8'));
  assert.equal(metadata.version, version, `Installed reference ${name}`);
}
assert.equal(graph.pin, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
assert.equal(tests.pin, graph.pin);
console.log(`${graph.modules.length} immutable Source modules and ${tests.files.length} original test/type files; exact React/ReactDOM 19.2.8 and Base UI 1.8.0/Svelte 5.57.1 reference versions: PASS`);
