import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, it } from 'node:test';

const command = resolve('scripts/package-artifacts.mjs');
const temporary = [];
afterEach(() => {
  for (const path of temporary.splice(0))
    rmSync(path, { recursive: true, force: true });
});

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'sveltery-artifacts-test.'));
  temporary.push(root);
  const artifacts = join(root, 'artifacts');
  const consumer = join(root, 'consumer');
  mkdirSync(artifacts);
  mkdirSync(consumer);
  const projects = [];
  for (const name of ['utils', 'base']) {
    const path = join(root, name);
    mkdirSync(path);
    writeFileSync(
      join(path, 'package.json'),
      JSON.stringify({
        name: `@test/${name}`,
        version: '0.0.0',
        dependencies: name === 'base' ? { '@test/utils': 'workspace:*' } : {},
      }),
    );
    projects.push({ name: `@test/${name}`, version: '0.0.0', path });
    writeFileSync(
      join(artifacts, `test-${name}-0.0.0.tgz`),
      `actual-${name}-artifact`,
    );
  }
  const selection = join(root, 'projects.json');
  writeFileSync(selection, JSON.stringify(projects));
  execFileSync(process.execPath, [command, 'record', selection, artifacts]);
  const manifest = join(artifacts, 'artifacts.json');
  return { root, artifacts, consumer, manifest };
}

it('reuses the exact Base archive and prepares its local Utils dependency without changing consumer peers', () => {
  const { artifacts, consumer, manifest } = fixture();
  execFileSync(process.execPath, [
    command,
    'copy',
    manifest,
    '@test/base',
    consumer,
  ]);
  const base = join(consumer, 'test-base-0.0.0.tgz');
  const path = join(consumer, 'package.json');
  writeFileSync(
    path,
    JSON.stringify({
      dependencies: { '@test/base': `file:${base}`, svelte: '5.57.1' },
    }),
  );
  execFileSync(process.execPath, [command, 'consumer', manifest, consumer]);
  const metadata = JSON.parse(readFileSync(path, 'utf8'));
  assert.equal(metadata.dependencies['@test/base'], `file:${base}`);
  assert.equal(metadata.dependencies.svelte, '5.57.1');
  const utils = join(consumer, '.workspace-artifacts/test-utils-0.0.0.tgz');
  assert.equal(metadata.dependencies['@test/utils'], `file:${utils}`);
  assert.deepEqual(
    readFileSync(base),
    readFileSync(join(artifacts, 'test-base-0.0.0.tgz')),
  );
  assert.deepEqual(
    readFileSync(utils),
    readFileSync(join(artifacts, 'test-utils-0.0.0.tgz')),
  );
});

it('fails closed when an artifact changes after packing or a requested package is absent', () => {
  const { artifacts, consumer, manifest } = fixture();
  assert.throws(
    () =>
      execFileSync(
        process.execPath,
        [command, 'copy', manifest, '@test/unknown', consumer],
        { stdio: 'pipe' },
      ),
    /missing @test\/unknown artifact/,
  );
  writeFileSync(
    join(artifacts, 'test-utils-0.0.0.tgz'),
    'changed-utils-artifact',
  );
  assert.throws(
    () =>
      execFileSync(
        process.execPath,
        [command, 'copy', manifest, '@test/base', consumer],
        { stdio: 'pipe' },
      ),
    /artifact bytes changed/,
  );
});
