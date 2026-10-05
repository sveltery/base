// Validate the extracted package that publint, ATTW and installed consumers receive.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const artifact = resolve(process.argv[2]);
const metadata = JSON.parse(readFileSync(join(artifact, 'package.json'), 'utf8'));

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

for (const [entry, conditions] of Object.entries(metadata.exports)) {
  assert.equal(Object.keys(conditions)[0], 'types', `${entry}: declarations resolve first`);
  assert.equal(Object.keys(conditions).at(-1), 'default', `${entry}: default resolves last`);
  if (entry !== './merge-props') assert.equal(conditions.svelte, conditions.default, `${entry}: Svelte component condition`);
  for (const target of Object.values(conditions)) {
    assert.match(target, /^\.\/dist\//, `${entry}: packaged implementation`);
    assert(statSync(join(artifact, target)).isFile(), `${entry}: missing ${target}`);
  }
}
assert.equal(metadata.svelte, metadata.exports['.'].svelte);
assert.equal(metadata.type, 'module');
assert.equal(metadata.license, 'MIT');
assert.equal(readFileSync(join(artifact, 'LICENSE'), 'utf8'), readFileSync(join(repository, 'LICENSE'), 'utf8'));
assert.equal(readFileSync(join(artifact, 'THIRD_PARTY_NOTICES.md'), 'utf8'), readFileSync(join(repository, 'packages/base/THIRD_PARTY_NOTICES.md'), 'utf8'));
assert.equal(readFileSync(join(artifact, 'patches/@sveltejs__kit@2.70.3.patch'), 'utf8'), readFileSync(join(repository, 'packages/base/patches/@sveltejs__kit@2.70.3.patch'), 'utf8'));

const source = join(repository, 'packages/base/src/lib');
let components = 0;
let runeModules = 0;
for (const path of files(source)) {
  const name = relative(source, path);
  const target = join(artifact, 'dist', name.endsWith('.ts') && !name.endsWith('.d.ts') ? name.slice(0, -3) + '.js' : name);
  assert(statSync(target).isFile(), `missing packaged source: ${name}`);
  if (name.endsWith('.svelte') || (name.endsWith('.ts') && !name.endsWith('.d.ts'))) {
    const declaration = name.endsWith('.svelte') ? name + '.d.ts' : name.slice(0, -3) + '.d.ts';
    assert(statSync(join(artifact, 'dist', declaration)).isFile(), `missing declarations: ${name}`);
  }
  if (name.endsWith('.svelte')) components++;
  if (name.endsWith('.svelte.ts')) {
    // Runes remain source for the consuming Svelte compiler, rather than svelte/internal output.
    const originalRunes = readFileSync(path, 'utf8').match(/\$(?:state|derived|effect|props|bindable|inspect|host)\b/g) ?? [];
    const output = readFileSync(target, 'utf8');
    for (const rune of new Set(originalRunes)) assert(output.includes(rune), `${name}: ${rune} was precompiled`);
    if (originalRunes.length) runeModules++;
  }
}
assert(components > 0 && runeModules > 0, 'actual components and rune modules must be shipped');
for (const path of files(artifact)) {
  const name = relative(artifact, path).replaceAll('\\', '/');
  assert(!/(?:^|\/)(?:node_modules|tests?|parity|\.checks|\.svelte-kit)(?:\/|$)/.test(name), `unexpected packed directory: ${name}`);
  assert(!/\.(?:test|spec)\.[^/]+$/.test(name), `unexpected packed test: ${name}`);
  assert(!name.endsWith('.ts') || name.endsWith('.d.ts'), `untranspiled packed TypeScript: ${name}`);
}
console.log(`Package artifact: ${Object.keys(metadata.exports).length} exports, ${components} Svelte components, ${runeModules} rune modules, declarations and attribution PASS`);
