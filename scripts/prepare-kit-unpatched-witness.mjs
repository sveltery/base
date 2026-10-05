// Test setup only: remove this one compatibility patch while retaining exact frozen resolutions.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const key = "'@sveltejs/kit@2.70.3':";
function withoutEntry(document) {
  const lines = document.split('\n');
  const header = lines.indexOf('patchedDependencies:');
  assert.notEqual(header, -1, 'Expected patchedDependencies in the witness setup');
  let end = header + 1;
  while (end < lines.length && lines[end].startsWith(' ')) end++;
  const entries = lines.slice(header + 1, end);
  const removed = entries.filter((line) => line.trimStart().startsWith(key));
  assert.equal(removed.length, 1, 'Expected exactly the pinned Kit patch entry');
  const retained = entries.filter((line) => !line.trimStart().startsWith(key));
  lines.splice(
    header,
    end - header,
    ...(retained.length ? ['patchedDependencies:', ...retained] : []),
  );
  return { document: lines.join('\n'), entry: removed[0].trimStart().slice(key.length).trim() };
}
export function unpatchedWitnessConfiguration(workspace, lockfile) {
  const config = withoutEntry(workspace);
  const lock = withoutEntry(lockfile);
  assert.equal(config.entry, 'packages/base/patches/@sveltejs__kit@2.70.3.patch');
  assert.match(lock.entry, /^[a-f0-9]{64}$/);
  const qualifier = `(patch_hash=${lock.entry})`;
  assert(lock.document.includes(qualifier), 'Expected patched Kit resolution qualifiers');
  return { workspace: config.document, lockfile: lock.document.replaceAll(qualifier, '') };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert.equal(process.argv.length, 3, 'Pass an isolated witness checkout directory');
  const directory = new URL(`${process.argv[2].replace(/\/$/, '')}/`, 'file://');
  const workspacePath = new URL('pnpm-workspace.yaml', directory);
  const lockPath = new URL('pnpm-lock.yaml', directory);
  const [workspace, lockfile] = await Promise.all([
    readFile(workspacePath, 'utf8'),
    readFile(lockPath, 'utf8'),
  ]);
  const output = unpatchedWitnessConfiguration(workspace, lockfile);
  await writeFile(workspacePath, output.workspace);
  await writeFile(lockPath, output.lockfile);
  console.log('Prepared isolated unpatched Kit 2.70.3 witness; use the normal frozen install.');
}
