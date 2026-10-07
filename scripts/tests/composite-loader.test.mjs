// Newly authored loader regression; zero Original assertion credit.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';

test('Composite witness loader resolves actual packages without reentering its hook', () => {
  const root = new URL('../../', import.meta.url);
  const original = new URL(
    'parity/composite-owners/recovery/original/packages/react/src/internals/composite/list/CompositeList.tsx',
    root,
  ).href;
  const witness = new URL('parity/composite-owners/recovery/source-array-witness.tsx', root).href;
  const base = new URL('packages/base/package.json', root).href;
  const output = execFileSync(
    process.execPath,
    [
      '--conditions=browser',
      '--import',
      new URL('../composite-recovery-loader.mjs', import.meta.url).pathname,
      '--input-type=module',
      '-e',
      `import assert from 'node:assert/strict';import {createRequire} from 'node:module';import React from 'react';import {CompositeList} from ${JSON.stringify(original)};import {createArrayWitness} from ${JSON.stringify(witness)};assert.equal(React.version,'19.2.8');assert.equal(createRequire(${JSON.stringify(base)})('svelte/compiler').VERSION,'5.57.1');assert.match(import.meta.resolve('svelte/internal/client'),/svelte\\/src\\/internal\\/client\\/index.js$/);assert.equal(typeof CompositeList,'function');assert.equal(typeof createArrayWitness,'function');console.log('actual package and Original module imports');`,
    ],
    { encoding: 'utf8', timeout: 10000 },
  );
  assert.equal(output.trim(), 'actual package and Original module imports');
});

test('Composite witness loader preserves real CommonJS dependency directory resolution', () => {
  const directory = mkdtempSync(join(tmpdir(), 'composite-loader-'));
  try {
    mkdirSync(join(directory, 'folder'));
    writeFileSync(join(directory, 'package.json'), '{"type":"commonjs"}');
    writeFileSync(join(directory, 'index.js'), 'module.exports = require("./folder");');
    writeFileSync(join(directory, 'folder/index.js'), 'module.exports = "directory resolved";');
    const output = execFileSync(
      process.execPath,
      [
        '--import',
        new URL('../composite-recovery-loader.mjs', import.meta.url).pathname,
        '--input-type=module',
        '-e',
        `import {createRequire} from 'node:module';const require=createRequire(${JSON.stringify(pathToFileURL(join(directory, 'package.json')).href)});console.log(require('./index.js'));`,
      ],
      { encoding: 'utf8', timeout: 10000 },
    );
    assert.equal(output.trim(), 'directory resolved');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
