// Newly authored loader regression; zero Original assertion credit.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';

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
