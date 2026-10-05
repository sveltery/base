// Refresh current projections while preserving immutable predecessor receipts.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const hashFile = path => createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex');
const write = (path, data) => writeFileSync(resolve(root, path), JSON.stringify(data, null, 2) + '\n');
const graph = read('parity/utils-package/current-source-graph.json');
const moves = new Map(graph.currentMoves.map(move => [move.from, move]));
const successorsPath = 'parity/utils-package/feature-successors.json';
const successors = read(successorsPath);

function verifiedOwner(path, sha256) {
  if (hashFile(path) !== sha256) throw new Error(`Current Source graph is stale for ${path}; regenerate it first.`);
  return { path, sha256 };
}

for (const record of successors.records) {
  if (hashFile(record.predecessorRecord) !== record.predecessorSha256) throw new Error(`Historical receipt changed: ${record.predecessorRecord}`);
  record.moves = record.moves.map(previous => {
    const move = moves.get(previous.old);
    if (!move) throw new Error(`Unknown extracted predecessor: ${previous.old}`);
    if (move.currentOwners) {
      return {
        old: previous.old,
        currentReplacement: move.currentReplacement,
        currentOwners: move.currentOwners.map(owner => verifiedOwner(owner.path, owner.sha256)),
      };
    }
    const owner = verifiedOwner(move.to, move.currentLocalSha256);
    return { old: previous.old, current: owner.path, currentSha256: owner.sha256 };
  });
}
write(successorsPath, successors);

const lineagePath = 'parity/utils-package/correspondence-lineage.json';
const lineage = read(lineagePath);
for (const record of lineage.records) record.currentSha256 = hashFile(record.record);
write(lineagePath, lineage);
console.log(`Refreshed ${successors.records.length} historical successor projections and ${lineage.records.length} current correspondence hashes; predecessor receipts unchanged.`);
