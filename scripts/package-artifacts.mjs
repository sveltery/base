import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [command, input, ...args] = process.argv.slice(2);
const readJSON = (path) => JSON.parse(readFileSync(path, 'utf8'));
const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

function manifest(path) {
  const data = readJSON(path);
  assert.equal(data.schema, 1, 'known artifact manifest required');
  assert(data.packages && typeof data.packages === 'object', 'package artifacts required');
  for (const [name, entry] of Object.entries(data.packages)) {
    assert.match(name, /^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i, 'valid package name required');
    assert.equal(
      basename(entry.tarball),
      entry.tarball,
      `${name}: local artifact filename required`,
    );
    assert.equal(typeof entry.version, 'string', `${name}: package version required`);
    assert(Array.isArray(entry.dependencies), `${name}: workspace dependencies required`);
    for (const dependency of entry.dependencies) {
      assert(Object.hasOwn(data.packages, dependency), `${name}: missing ${dependency} artifact`);
    }
    assert.equal(
      digest(join(dirname(path), entry.tarball)),
      entry.sha256,
      `${name}: artifact bytes changed`,
    );
  }
  return data;
}

function closure(packages, roots) {
  const selected = new Set();
  function visit(name) {
    assert(Object.hasOwn(packages, name), `missing ${name} artifact`);
    if (selected.has(name)) return;
    selected.add(name);
    for (const dependency of packages[name].dependencies) visit(dependency);
  }
  for (const root of roots) visit(root);
  return selected;
}

if (command === 'record') {
  const directory = resolve(args[0]);
  const projects = readJSON(input);
  assert(Array.isArray(projects) && projects.length, 'selected workspace packages required');
  const names = new Set(projects.map((project) => project.name));
  assert.equal(names.size, projects.length, 'unique workspace package names required');
  const packages = {};
  for (const project of projects) {
    const metadata = readJSON(join(project.path, 'package.json'));
    assert.equal(metadata.name, project.name);
    assert.equal(metadata.version, project.version);
    const tarball = `${metadata.name.replace(/^@/, '').replaceAll('/', '-')}-${metadata.version}.tgz`;
    const dependencies = Object.entries(metadata.dependencies ?? {})
      .filter(([name, version]) => {
        if (version.startsWith('workspace:'))
          assert(names.has(name), `${name}: workspace artifact required`);
        return names.has(name);
      })
      .map(([name]) => name);
    packages[metadata.name] = {
      version: metadata.version,
      directory: relative(repository, project.path),
      tarball,
      sha256: digest(join(directory, tarball)),
      dependencies,
    };
  }
  writeFileSync(
    join(directory, 'artifacts.json'),
    JSON.stringify({ schema: 1, packages }, null, 2) + '\n',
  );
} else if (command === 'copy') {
  const [name, destination] = args;
  const { packages } = manifest(input);
  assert(Object.hasOwn(packages, name), `missing ${name} artifact`);
  mkdirSync(destination, { recursive: true });
  copyFileSync(
    join(dirname(input), packages[name].tarball),
    join(destination, packages[name].tarball),
  );
} else if (command === 'retain') {
  const destination = resolve(args[0]);
  const data = manifest(input);
  mkdirSync(destination, { recursive: true });
  for (const entry of Object.values(data.packages)) {
    const source = resolve(dirname(input), entry.tarball);
    const target = join(destination, entry.tarball);
    if (source !== target) copyFileSync(source, target);
  }
  writeFileSync(join(destination, 'artifacts.json'), JSON.stringify(data, null, 2) + '\n');
} else if (command === 'entries') {
  const { packages } = manifest(input);
  for (const [name, entry] of Object.entries(packages)) {
    console.log([name, entry.directory, entry.tarball].join('\t'));
  }
} else if (command === 'consumer') {
  const directory = resolve(args[0]);
  const { packages } = manifest(input);
  const path = join(directory, 'package.json');
  const metadata = readJSON(path);
  const roots = Object.keys({
    ...metadata.dependencies,
    ...metadata.devDependencies,
  }).filter((name) => Object.hasOwn(packages, name));
  assert(roots.length, 'consumer must install an actual workspace artifact');
  const selected = closure(packages, roots);
  const dependencies = [...selected].filter((name) => !roots.includes(name));
  if (dependencies.length) {
    const destination = join(directory, '.workspace-artifacts');
    mkdirSync(destination, { recursive: true });
    metadata.dependencies ??= {};
    for (const name of dependencies) {
      const entry = packages[name];
      const target = join(destination, entry.tarball);
      const source = resolve(dirname(input), entry.tarball);
      if (source !== target) copyFileSync(source, target);
      metadata.dependencies[name] = `file:${target}`;
    }
    writeFileSync(path, JSON.stringify(metadata, null, 2) + '\n');
  }
} else {
  throw new Error(
    'Usage: package-artifacts.mjs record <projects.json> <directory> | copy <artifacts.json> <name> <directory> | retain <artifacts.json> <directory> | entries <artifacts.json> | consumer <artifacts.json> <directory>',
  );
}
