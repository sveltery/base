// Maintained current API facts; never rewrites pinned Original assertions/receipts.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const local = (path) => resolve(root, path);
const read = (path) => readFileSync(local(path), 'utf8');
const hash = (source) => createHash('sha256').update(source).digest('hex');
function sourceForTarget(target) {
  assert.ok(target.startsWith('./dist/'), target);
  return resolveImport(
    local('packages/base/src/lib/index.ts'),
    `./${target.slice('./dist/'.length)}`,
  );
}
function resolveImport(importer, specifier) {
  assert.ok(specifier.startsWith('.'), specifier);
  const stem = resolve(dirname(importer), specifier);
  const candidates = [stem, stem.replace(/\.js$/, '.ts')];
  const found = candidates.find((path) => existsSync(path));
  assert.ok(found, `${importer}: ${specifier}`);
  return found;
}
function reexports(source) {
  return [
    ...source.matchAll(
      /export\s+(?!type\b)(\*\s+as\s+([\w$]+)|\*|\{([\s\S]*?)\})\s+from\s+['"]([^'"]+)['"]\s*;?/g,
    ),
  ].map(([, clause, namespace, members, specifier]) => ({
    namespace,
    all: clause === '*',
    members: members
      ?.split(',')
      .map((name) => name.trim())
      .filter((name) => name && !name.startsWith('type '))
      .map((name) => {
        const [imported, exported = imported] = name.split(/\s+as\s+/);
        return { imported, exported };
      }),
    specifier,
  }));
}
function runtimeExports(entry, seen = new Set()) {
  if (entry.endsWith('.svelte')) return new Set(['default']);
  if (seen.has(entry)) return new Set();
  seen.add(entry);
  const source = readFileSync(entry, 'utf8');
  const names = new Set(
    [
      ...source.matchAll(
        /export\s+(?:async\s+)?(?:const|let|var|function|class)\s+([\w$]+)/g,
      ),
    ].map((match) => match[1]),
  );
  for (const declaration of reexports(source)) {
    const resolved = resolveImport(entry, declaration.specifier);
    const available = runtimeExports(resolved, seen);
    if (declaration.namespace) names.add(declaration.namespace);
    else if (declaration.all)
      for (const name of available) {
        if (name !== 'default') names.add(name);
      }
    else
      for (const member of declaration.members) {
        assert.ok(
          available.has(member.imported),
          `${relative(root, entry)} reexports missing runtime value ${member.imported} from ${declaration.specifier}`,
        );
        names.add(member.exported);
      }
  }
  seen.delete(entry);
  return names;
}
export function currentNativeCatalog() {
  const catalog = JSON.parse(read('parity/catalog.json'));
  const manifest = JSON.parse(read('packages/base/package.json'));
  const rootSource = read('packages/base/src/lib/index.ts');
  const declarations = reexports(rootSource);
  const rootEntry = sourceForTarget(manifest.exports['.'].default);
  const modules = catalog.modules.map((item) => {
    const key = `./${item.upstreamModule}`;
    const published = manifest.exports[key];
    const target =
      typeof published === 'string'
        ? published
        : (published?.svelte ?? published?.default);
    const entry = target ? sourceForTarget(target) : null;
    const rootExports = declarations
      .filter(
        (declaration) =>
          entry && resolveImport(rootEntry, declaration.specifier) === entry,
      )
      .flatMap((declaration) =>
        declaration.namespace
          ? [declaration.namespace]
          : declaration.all
            ? [...runtimeExports(entry)].filter((name) => name !== 'default')
            : declaration.members.map((member) => member.exported),
      )
      .sort();
    return {
      upstreamModule: item.upstreamModule,
      status: item.status,
      packageSubpath: target ? key : null,
      publishedTarget: target ?? null,
      sourceEntry: entry ? relative(root, entry) : null,
      sourceEntrySha256: entry ? hash(readFileSync(entry, 'utf8')) : null,
      rootExports,
      subpathRuntimeExports: entry
        ? [...runtimeExports(entry)].filter((name) => name !== 'default').sort()
        : [],
      currentAcceptance:
        item.status === 'unimplemented'
          ? 'not-implemented'
          : item.status === 'retired-native-successor'
            ? 'retired-api-native-counterparts-pending-exact-head-execution-and-review'
            : 'pending-exact-head-execution-and-review',
    };
  });
  return {
    pin: catalog.upstream.commit,
    scope:
      'Current declared manifest/source runtime namespace facts. Structural projection only; no new Original, type, runtime, browser or installed-consumer pass credit.',
    rootEntry: relative(root, rootEntry),
    rootEntrySha256: hash(rootSource),
    rootRuntimeExports: [...runtimeExports(rootEntry)].sort(),
    counts: Object.fromEntries(
      [...new Set(modules.map((item) => item.status))]
        .sort()
        .map((status) => [
          status,
          modules.filter((item) => item.status === status).length,
        ]),
    ),
    modules,
  };
}
export function verifyCurrentNativeCatalog() {
  const current = currentNativeCatalog();
  const output = local('parity/native-snippets/catalog-projection.json');
  assert.equal(
    readFileSync(output, 'utf8'),
    JSON.stringify(current, null, 2) + '\n',
    'Current native catalog projection is stale; run node scripts/native-catalog-projection.mjs --write',
  );
  return current;
}
export function nativeCatalogCountSentence(current) {
  return `The current catalog has ${current.counts.bounded ?? 0} bounded modules, ${current.counts['native-pending-acceptance'] ?? 0} available native modules awaiting acceptance, ${current.counts.unimplemented ?? 0} unimplemented modules, and ${current.counts['retired-native-successor'] ?? 0} retired standalone renderer API.`;
}
function writeCurrentProjection() {
  const current = currentNativeCatalog();
  writeFileSync(
    local('parity/native-snippets/catalog-projection.json'),
    JSON.stringify(current, null, 2) + '\n',
  );
  const sentence = nativeCatalogCountSentence(current);
  const docs = read('docs/catalog.md');
  assert.match(
    docs,
    /<!-- native-catalog-counts:start -->[\s\S]*?<!-- native-catalog-counts:end -->/,
  );
  writeFileSync(
    local('docs/catalog.md'),
    docs.replace(
      /<!-- native-catalog-counts:start -->[\s\S]*?<!-- native-catalog-counts:end -->/,
      `<!-- native-catalog-counts:start -->\n${sentence}\n<!-- native-catalog-counts:end -->`,
    ),
  );
  const content = read('apps/fixtures/src/lib/docs/content.ts');
  assert.match(
    content,
    /(?:Pending generated current catalog counts\.|The current catalog has [^.]+\.)/,
  );
  writeFileSync(
    local('apps/fixtures/src/lib/docs/content.ts'),
    content.replace(
      /(?:Pending generated current catalog counts\.|The current catalog has [^.]+\.)/,
      sentence,
    ),
  );
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.argv.includes('--write')) writeCurrentProjection();
  else verifyCurrentNativeCatalog();
  process.stdout.write(
    'Current native catalog manifest/source namespace projection: coherent; acceptance remains pending.\n',
  );
}
