// Maintained source inventory only; execution, fidelity review and parity are separate gates.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const ts = createRequire(new URL('../package.json', import.meta.url))('typescript');
if (!ts.version.startsWith('6.')) throw new Error('This inventory requires TypeScript 6.');
const output = resolve(root, 'docs/receipts/docs/current-source-closure.json');
const extensions = ['.ts', '.tsx', '.js', '.mjs', '.svelte', '.css', '.json'];
const manifests = new Map(
  ['base', 'utils'].map((name) => {
    const directory = `packages/${name}`;
    return [
      `@sveltery/${name}`,
      {
        directory,
        body: JSON.parse(readFileSync(resolve(root, directory, 'package.json'), 'utf8')),
      },
    ];
  }),
);
function walk(directory) {
  return readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? walk(path) : [path];
  });
}
function sourceFile(base) {
  return [
    base,
    base.replace(/\.js$/, '.ts'),
    base.replace(/\.js$/, '.svelte.ts'),
    ...extensions.map((extension) => base + extension),
    ...extensions.map((extension) => `${base}/index${extension}`),
  ].find((path) => existsSync(path) && statSync(path).isFile());
}
function resolveEdge(file, specifier) {
  if (specifier.endsWith('?raw')) {
    const edge = resolveEdge(file, specifier.slice(0, -4));
    return {
      ...edge,
      transform:
        'Vite raw text import; source bytes inventoried conservatively, its imports do not execute through this edge',
    };
  }
  for (const [name, manifest] of manifests) {
    if (specifier !== name && !specifier.startsWith(`${name}/`)) continue;
    const key = specifier === name ? '.' : `.${specifier.slice(name.length)}`;
    const entry = manifest.body.exports[key];
    const target = typeof entry === 'string' ? entry : (entry?.svelte ?? entry?.default);
    if (!target?.startsWith('./dist/'))
      return {
        unresolved: 'workspace package export is undeclared or lacks a runtime dist target',
      };
    const owner = sourceFile(
      resolve(root, manifest.directory, 'src/lib', target.slice('./dist/'.length)),
    );
    return owner
      ? {
          local: relative(root, owner),
          packageExport: { manifest: `${manifest.directory}/package.json`, key, target },
        }
      : { unresolved: `declared export has no source owner: ${target}` };
  }
  if (specifier.startsWith('.') || specifier.startsWith('$lib/')) {
    if (/\/\$types$/.test(specifier))
      return {
        generated: 'SvelteKit route types; generated outside authored source inventory',
        boundary: 'SvelteKit app type transport',
      };
    const base = specifier.startsWith('$lib/')
      ? resolve(root, 'apps/docs/src/lib', specifier.slice(5))
      : resolve(root, dirname(file), specifier);
    const owner = sourceFile(base);
    return owner
      ? { local: relative(root, owner) }
      : { unresolved: 'local source target not found' };
  }
  const packageName = specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : specifier.split('/')[0];
  return {
    external: specifier,
    package: packageName,
    boundary:
      specifier.startsWith('$app/') || packageName === '@sveltejs/kit'
        ? 'SvelteKit app runtime'
        : packageName === 'svelte'
          ? 'native Svelte runtime/types'
          : 'external package; package-internal transitive graph excluded',
  };
}
const seeds = walk('apps/docs/src').filter(
  (file) =>
    extensions.some((extension) => file.endsWith(extension)) && !/\.(test|spec)\./.test(file),
);
const queue = [...seeds];
const records = new Map();
while (queue.length) {
  const file = queue.shift();
  if (records.has(file)) continue;
  const body = readFileSync(resolve(root, file), 'utf8');
  const edges = [];
  function record(specifier, kind, syntax) {
    const edge = { specifier, kind, syntax, ...resolveEdge(file, specifier) };
    if (
      !edges.some(
        (previous) =>
          previous.specifier === specifier && previous.kind === kind && previous.syntax === syntax,
      )
    )
      edges.push(edge);
    if (edge.local) queue.push(edge.local);
  }
  const code = file.endsWith('.svelte')
    ? [...body.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]).join('\n')
    : body;
  if (!file.endsWith('.css') && !file.endsWith('.json')) {
    const ast = ts.createSourceFile(
      file,
      code,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause;
        const elements =
          clause?.namedBindings && ts.isNamedImports(clause.namedBindings)
            ? clause.namedBindings.elements
            : [];
        const allType =
          clause?.isTypeOnly ||
          (!clause?.name && elements.length > 0 && elements.every((element) => element.isTypeOnly));
        record(node.moduleSpecifier.text, allType ? 'type' : 'runtime', 'static-import');
        if (!allType && elements.some((element) => element.isTypeOnly))
          record(node.moduleSpecifier.text, 'type', 'static-import');
      } else if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const elements =
          node.exportClause && ts.isNamedExports(node.exportClause)
            ? node.exportClause.elements
            : [];
        const allType =
          node.isTypeOnly ||
          (elements.length > 0 && elements.every((element) => element.isTypeOnly));
        record(node.moduleSpecifier.text, allType ? 'type' : 'runtime', 'static-export');
        if (!allType && elements.some((element) => element.isTypeOnly))
          record(node.moduleSpecifier.text, 'type', 'static-export');
      } else if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      ) {
        record(node.argument.literal.text, 'type', 'import-type');
      } else if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword
      ) {
        const argument = node.arguments[0];
        if (
          argument &&
          (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))
        )
          record(argument.text, 'runtime', 'dynamic-import');
        else
          edges.push({
            specifier: node.getText(ast),
            kind: 'runtime',
            syntax: 'dynamic-import',
            unresolved: 'nonliteral dynamic import cannot be statically enumerated',
          });
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
  if (file.endsWith('.css'))
    for (const match of body.matchAll(/@import\s+(?:url\(\s*)?['"]([^'"]+)['"]/g))
      record(match[1], 'runtime', 'css-import');
  records.set(file, {
    local: file,
    sha256: createHash('sha256').update(body).digest('hex'),
    imports: edges.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  });
}
const runtimeReachable = new Set();
const runtimeQueue = seeds.filter((file) => !file.endsWith('.d.ts'));
while (runtimeQueue.length) {
  const file = runtimeQueue.shift();
  if (runtimeReachable.has(file)) continue;
  runtimeReachable.add(file);
  for (const edge of records.get(file)?.imports ?? []) {
    if (edge.kind === 'runtime' && edge.local && !edge.transform) runtimeQueue.push(edge.local);
  }
}
const modules = [...records.values()]
  .map((record) => ({
    ...record,
    reachability: runtimeReachable.has(record.local)
      ? 'runtime graph (conservative full barrel fanout)'
      : 'type-only or raw-text graph',
  }))
  .sort((a, b) => a.local.localeCompare(b.local));
const unresolved = modules.flatMap((module) =>
  module.imports.filter((edge) => edge.unresolved).map((edge) => ({ from: module.local, ...edge })),
);
const receipt = {
  pin: '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c',
  infrastructureReference: '0.12.1-canary.42',
  status:
    'Actual authored local runtime/type import closure inventory; independent entire-closure review and execution remain separate and pending.',
  ordinaryDeclarationCredit: 0,
  unchangedUpstreamAssertionCredit: 0,
  method:
    'TypeScript 6 AST static imports/re-exports, import types and literal dynamic imports; all Svelte script blocks extracted; CSS @imports traced. All maintained docs src modules are seeds, including declarations/styles. Runtime barrels are conservatively followed in full without tree-shaking. Workspace package declared runtime exports map dist targets to actual src/lib owners. Both runtime and type edges recurse. Generated Kit route types are explicit boundaries. External package internals, CSS url assets, generated route manifests and markup asset URLs are excluded. Hashes cover whole local source bytes; this is inventory, not source fidelity or assertion review.',
  seeds,
  packageManifests: [...manifests.values()].map(({ directory }) => ({
    local: `${directory}/package.json`,
    sha256: createHash('sha256')
      .update(readFileSync(resolve(root, directory, 'package.json')))
      .digest('hex'),
  })),
  counts: {
    modules: modules.length,
    runtimeReachable: runtimeReachable.size,
    typeOnlyOrRawText: modules.length - runtimeReachable.size,
    edges: modules.reduce((sum, module) => sum + module.imports.length, 0),
    unresolved: unresolved.length,
  },
  modules,
  unresolved,
};
const serialized = `${JSON.stringify(receipt, null, 2)}\n`;
if (process.argv.includes('--write')) writeFileSync(output, serialized);
else if (!existsSync(output) || readFileSync(output, 'utf8') !== serialized)
  throw new Error(
    'Docs source closure receipt is stale; inspect source changes and run node scripts/record-docs-closure.mjs --write.',
  );
console.log(
  `${receipt.counts.modules} local modules; ${receipt.counts.edges} edges; ${unresolved.length} unresolved edges${process.argv.includes('--write') ? '; receipt written' : '; receipt current'}.`,
);
