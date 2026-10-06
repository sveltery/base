// Validate the extracted package that publint, ATTW and installed consumers receive.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifact = resolve(process.argv[2]);
const packageDirectory = resolve(process.argv[3] ?? join(repository, 'packages/base'));
const sourceMetadata = JSON.parse(readFileSync(join(packageDirectory, 'package.json'), 'utf8'));
const metadata = JSON.parse(readFileSync(join(artifact, 'package.json'), 'utf8'));
assert.equal(metadata.name, sourceMetadata.name);
assert.equal(metadata.version, sourceMetadata.version);
assert.deepEqual(metadata.exports, sourceMetadata.exports, 'actual public export map required');
assert.deepEqual(metadata.sideEffects, sourceMetadata.sideEffects);
for (const [name, version] of Object.entries(sourceMetadata.dependencies ?? {})) {
  if (version.startsWith('workspace:')) {
    assert.equal(version, 'workspace:*', `${name}: reviewed workspace version convention`);
    assert(process.argv[4], `${name}: actual workspace artifact manifest required`);
    const manifest = JSON.parse(readFileSync(process.argv[4], 'utf8'));
    assert.equal(
      metadata.dependencies[name],
      manifest.packages[name].version,
      `${name}: published workspace dependency version`,
    );
  } else {
    assert.equal(metadata.dependencies[name], version, `${name}: runtime dependency preserved`);
  }
}

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

for (const [entry, conditions] of Object.entries(metadata.exports)) {
  assert.equal(Object.keys(conditions)[0], 'types', `${entry}: declarations resolve first`);
  assert.equal(Object.keys(conditions).at(-1), 'default', `${entry}: default resolves last`);
  if (conditions.svelte)
    assert.equal(conditions.svelte, conditions.default, `${entry}: Svelte component condition`);
  for (const target of Object.values(conditions)) {
    assert.match(target, /^\.\/dist\//, `${entry}: packaged implementation`);
    assert(statSync(join(artifact, target)).isFile(), `${entry}: missing ${target}`);
  }
}
if (sourceMetadata.svelte) assert.equal(metadata.svelte, sourceMetadata.svelte);
if (sourceMetadata.types) assert.equal(metadata.types, sourceMetadata.types);
assert.equal(metadata.type, 'module');
assert.equal(metadata.license, 'MIT');
assert.equal(
  readFileSync(join(artifact, 'LICENSE'), 'utf8'),
  readFileSync(join(repository, 'LICENSE'), 'utf8'),
);
assert.equal(
  readFileSync(join(artifact, 'THIRD_PARTY_NOTICES.md'), 'utf8'),
  readFileSync(join(packageDirectory, 'THIRD_PARTY_NOTICES.md'), 'utf8'),
);
if (sourceMetadata.files.includes('patches')) {
  for (const path of files(join(packageDirectory, 'patches'))) {
    const name = relative(packageDirectory, path);
    assert.equal(
      readFileSync(join(artifact, name), 'utf8'),
      readFileSync(path, 'utf8'),
      `${name}: shipped patch bytes preserved`,
    );
  }
}

const source = join(packageDirectory, 'src/lib');
let components = 0;
let runeModules = 0;
for (const path of files(source)) {
  const name = relative(source, path);
  const target = join(
    artifact,
    'dist',
    name.endsWith('.ts') && !name.endsWith('.d.ts') ? name.slice(0, -3) + '.js' : name,
  );
  assert(statSync(target).isFile(), `missing packaged source: ${name}`);
  if (name.endsWith('.svelte') || (name.endsWith('.ts') && !name.endsWith('.d.ts'))) {
    const declaration = name.endsWith('.svelte') ? name + '.d.ts' : name.slice(0, -3) + '.d.ts';
    assert(statSync(join(artifact, 'dist', declaration)).isFile(), `missing declarations: ${name}`);
  }
  if (name.endsWith('.svelte')) {
    assert.equal(
      readFileSync(target, 'utf8'),
      readFileSync(path, 'utf8'),
      `${name}: component source must remain intact`,
    );
    components++;
  }
  if (name.endsWith('.svelte.ts')) {
    // Runes remain source for the consuming Svelte compiler, rather than svelte/internal output.
    const originalRunes =
      readFileSync(path, 'utf8').match(
        /\$(?:state|derived|effect|props|bindable|inspect|host)\b/g,
      ) ?? [];
    const output = readFileSync(target, 'utf8');
    for (const rune of new Set(originalRunes))
      assert(output.includes(rune), `${name}: ${rune} was precompiled`);
    if (originalRunes.length) runeModules++;
  }
}
assert(files(source).length > 0, 'actual library source must be shipped');
for (const path of files(artifact)) {
  const name = relative(artifact, path).replaceAll('\\', '/');
  assert(
    !/(?:^|\/)(?:node_modules|tests?|parity|\.checks|\.svelte-kit)(?:\/|$)/.test(name),
    `unexpected packed directory: ${name}`,
  );
  assert(!/\.(?:test|spec)\.[^/]+$/.test(name), `unexpected packed test: ${name}`);
  assert(
    !name.endsWith('.ts') || name.endsWith('.d.ts'),
    `untranspiled packed TypeScript: ${name}`,
  );
}
console.log(
  `${metadata.name} artifact: ${Object.keys(metadata.exports).length} exports, ${components} Svelte components, ${runeModules} rune modules, declarations and attribution PASS`,
);
