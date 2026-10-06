import { readdir, readFile } from 'node:fs/promises';
import { createChangeEventDetails, mergeProps } from '../packages/base/dist/index.js';
import assert from 'node:assert/strict';
async function scan(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${item.name}`;
    if (item.isDirectory()) await scan(path);
    else if (item.name.endsWith('.js') || item.name.endsWith('.svelte')) {
      assert(
        !/from\s*['"](?:\$app\/|@sveltejs\/kit|react(?:\/|['"]))/u.test(
          await readFile(path, 'utf8'),
        ),
        `Framework infrastructure import in ${path}`,
      );
    }
  }
}
await scan('packages/base/dist');
assert.equal(createChangeEventDetails('none').isCanceled, false);
assert.equal(mergeProps({ id: 'before' }, { id: 'after' }).id, 'after');
console.log('Packaged entry imports and runtime dependency boundary: PASS');
