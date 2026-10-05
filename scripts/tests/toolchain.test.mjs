import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  readFileSync,
  rmSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const repo = fileURLToPath(new URL('../../', import.meta.url));

function run({ version, corepackVersion, bootstrap = false }) {
  const scratch = mkdtempSync(join(tmpdir(), 'sveltery-toolchain-test.'));
  try {
    const bin = join(scratch, 'bin');
    const log = join(scratch, 'calls');
    mkdirSync(bin);
    symlinkSync(process.execPath, join(bin, 'node'));
    symlinkSync('/bin/bash', join(bin, 'bash'));
    symlinkSync('/usr/bin/dirname', join(bin, 'dirname'));
    const executable = (name, body) =>
      writeFileSync(join(bin, name), `#!/bin/bash\n${body}\n`, { mode: 0o755 });
    if (version)
      executable(
        'pnpm',
        `if [[ "$1" == --version ]]; then echo ${version}; else echo "pnpm $*" >> "$SVELTERY_TEST_LOG"; fi`,
      );
    if (corepackVersion)
      executable(
        'corepack',
        `if [[ "$2" == --version ]]; then echo ${corepackVersion}; else echo "corepack $*" >> "$SVELTERY_TEST_LOG"; fi`,
      );
    const result = spawnSync(
      '/bin/bash',
      bootstrap
        ? ['scripts/bootstrap.sh']
        : ['-c', 'source scripts/toolchain.sh; pnpm direct; /bin/bash -c "pnpm nested"'],
      {
        cwd: repo,
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: bin,
          SVELTERY_TEST_LOG: log,
          COREPACK_HOME: join(scratch, 'corepack'),
          XDG_CACHE_HOME: join(scratch, 'cache'),
          XDG_DATA_HOME: join(scratch, 'data'),
        },
      },
    );
    return {
      ...result,
      calls: existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n') : [],
    };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

test('uses matching pnpm for frozen bootstrap without requiring Corepack', () => {
  const result = run({ version: '12.6.0', bootstrap: true });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, ['pnpm install --frozen-lockfile']);
});

test('replaces default pnpm 11 for direct and nested package-script commands', () => {
  const result = run({ version: '11.19.0', corepackVersion: '12.6.0' });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, ['corepack pnpm@12.6.0 direct', 'corepack pnpm@12.6.0 nested']);
});

test('Corepack fallback preserves frozen bootstrap when pnpm is absent', () => {
  const result = run({ corepackVersion: '12.6.0', bootstrap: true });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, ['corepack pnpm@12.6.0 install --frozen-lockfile']);
});

test('rejects mismatched pnpm without Corepack before running commands', () => {
  const result = run({ version: '11.19.0', bootstrap: true });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Install pnpm 12\.6\.0 or provide Corepack/);
  assert.deepEqual(result.calls, []);
});

test('rejects a fallback that fails to select the pinned version', () => {
  const result = run({ version: '11.19.0', corepackVersion: '12.8.1', bootstrap: true });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Could not select pinned pnpm 12\.6\.0/);
  assert.deepEqual(result.calls, []);
});
