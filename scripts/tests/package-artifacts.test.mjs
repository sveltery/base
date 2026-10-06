import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, it } from 'node:test';

const command = resolve('scripts/package-artifacts.mjs');
const temporary = [];
afterEach(() => {
  for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true });
});

function fixture({ realArchives = false } = {}) {
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
    const archive = join(artifacts, `test-${name}-0.0.0.tgz`);
    if (realArchives) {
      const packed = join(path, 'package');
      mkdirSync(packed);
      writeFileSync(
        join(packed, 'package.json'),
        JSON.stringify({
          name: `@test/${name}`,
          version: '0.0.0',
          type: 'module',
          exports: './index.js',
          dependencies: name === 'base' ? { '@test/utils': '0.0.0' } : {},
        }),
      );
      writeFileSync(
        join(packed, 'index.js'),
        name === 'base'
          ? "export { marker } from '@test/utils';\nexport const utilsURL = import.meta.resolve('@test/utils');\n"
          : "export const marker = 'packed-utils';\n",
      );
      execFileSync('tar', ['-czf', archive, '-C', path, 'package']);
    } else {
      writeFileSync(archive, `byte-marker-${name}-artifact`);
    }
  }
  const selection = join(root, 'projects.json');
  writeFileSync(selection, JSON.stringify(projects));
  execFileSync(process.execPath, [command, 'record', selection, artifacts]);
  const manifest = join(artifacts, 'artifacts.json');
  return { root, artifacts, consumer, manifest };
}

it('reuses the exact Base archive and prepares its local Utils dependency without changing consumer peers', () => {
  const { artifacts, consumer, manifest } = fixture();
  execFileSync(process.execPath, [command, 'copy', manifest, '@test/base', consumer]);
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
  assert.equal(
    readFileSync(join(consumer, 'pnpm-workspace.yaml'), 'utf8'),
    `packages: []\noverrides:\n  "@test/base": ${JSON.stringify(`file:${base}`)}\n  "@test/utils": ${JSON.stringify(`file:${utils}`)}\n`,
  );
  execFileSync(process.execPath, [command, 'consumer', manifest, consumer]);
  assert.deepEqual(readFileSync(base), readFileSync(join(artifacts, 'test-base-0.0.0.tgz')));
  assert.deepEqual(readFileSync(utils), readFileSync(join(artifacts, 'test-utils-0.0.0.tgz')));
});

it('installs the real archive closure offline and preserves the same transitive Utils through a frozen reinstall', () => {
  const { root, consumer, manifest } = fixture({ realArchives: true });
  // A parent workspace with source packages must never replace this installation.
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ name: 'parent-workspace', private: true }),
  );
  writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - base\n  - utils\n');
  execFileSync(process.execPath, [command, 'copy', manifest, '@test/base', consumer]);
  const base = join(consumer, 'test-base-0.0.0.tgz');
  writeFileSync(
    join(consumer, 'package.json'),
    JSON.stringify({
      name: 'isolated-artifact-consumer',
      private: true,
      type: 'module',
      dependencies: { '@test/base': `file:${base}` },
    }),
  );
  execFileSync(process.execPath, [command, 'consumer', manifest, consumer]);
  const pnpm = (args) =>
    execFileSync(
      '/bin/bash',
      [
        '-c',
        'source scripts/toolchain.sh; pnpm --dir "$1" "${@:2}"',
        'sveltery-artifact-test',
        consumer,
        ...args,
      ],
      {
        encoding: 'utf8',
        timeout: 60_000,
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=2048' },
      },
    );
  const initial = pnpm(['install', '--offline', '--no-frozen-lockfile', '--ignore-scripts']);
  console.log(JSON.stringify({ phase: 'initial offline install', stdout: initial.trim() }));
  const frozen = pnpm(['install', '--offline', '--frozen-lockfile', '--ignore-scripts']);
  console.log(JSON.stringify({ phase: 'frozen offline reinstall', stdout: frozen.trim() }));
  const projects = JSON.parse(pnpm(['list', '--depth', '-1', '--json']));
  assert.equal(projects.length, 1, 'only the consumer workspace root is selected');
  assert.equal(projects[0].name, 'isolated-artifact-consumer');
  const probe = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import assert from 'node:assert/strict';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { marker, utilsURL } from '@test/base';
import { marker as directMarker } from '@test/utils';
assert.equal(marker, 'packed-utils');
assert.equal(directMarker, marker);
assert.equal(realpathSync(fileURLToPath(utilsURL)), realpathSync(fileURLToPath(import.meta.resolve('@test/utils'))));
console.log('Base and the direct dependency resolve the same packed Utils module.');`,
    ],
    { cwd: consumer, encoding: 'utf8' },
  );
  assert.match(probe, /same packed Utils module/);
  const installedBase = JSON.parse(
    readFileSync(join(consumer, 'node_modules/@test/base/package.json'), 'utf8'),
  );
  assert.equal(installedBase.dependencies['@test/utils'], '0.0.0');
  const lockfile = readFileSync(join(consumer, 'pnpm-lock.yaml'), 'utf8');
  assert.match(lockfile, /overrides:/);
  assert.match(lockfile, /test-utils-0\.0\.0\.tgz/);
  console.log(lockfile);
  console.log(
    JSON.stringify({ artifacts: JSON.parse(readFileSync(manifest, 'utf8')), probe: probe.trim() }),
  );
});

it('fails closed when an artifact changes after packing or a requested package is absent', () => {
  const { artifacts, consumer, manifest } = fixture();
  assert.throws(
    () =>
      execFileSync(process.execPath, [command, 'copy', manifest, '@test/unknown', consumer], {
        stdio: 'pipe',
      }),
    /missing @test\/unknown artifact/,
  );
  writeFileSync(join(artifacts, 'test-utils-0.0.0.tgz'), 'changed-utils-artifact');
  assert.throws(
    () =>
      execFileSync(process.execPath, [command, 'copy', manifest, '@test/base', consumer], {
        stdio: 'pipe',
      }),
    /artifact bytes changed/,
  );
});
