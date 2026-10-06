import { resolveNativePackageSource } from '../../scripts/native-package-source.mjs';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '../..');
const ts = createRequire(new URL('../../packages/base/package.json', import.meta.url))(
  'typescript',
);
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const upstreamArgument = process.argv.slice(2).find((value) => value !== '--check');
const upstream = upstreamArgument && resolve(upstreamArgument);
if (
  upstream &&
  execFileSync('git', ['rev-parse', 'HEAD'], { cwd: upstream, encoding: 'utf8' }).trim() !== pin
)
  throw new Error('Composite source graph requires the immutable upstream pin.');
function graph(directory, entries, source = false) {
  const records = new Map();
  const queue = [...entries];
  function resolveImport(file, specifier) {
    const owned = !source && resolveNativePackageSource(directory, specifier);
    if (owned) return owned;
    let base;
    if (specifier.startsWith('.')) base = resolve(directory, dirname(file), specifier);
    else if (source && specifier.startsWith('@base-ui/utils/'))
      base = resolve(directory, 'packages/utils/src', specifier.slice('@base-ui/utils/'.length));
    else return `external:${specifier}`;
    // Append source extensions: index.parts must not be mistaken for index.ts.
    for (const candidate of [
      base,
      base.replace(/\.js$/, '.ts'),
      base.replace(/\.js$/, '.svelte.ts'),
      `${base}.ts`,
      `${base}.tsx`,
      `${base}/index.ts`,
      `${base}/index.tsx`,
    ]) {
      if (existsSync(candidate) && statSync(candidate).isFile())
        return relative(directory, candidate);
    }
    throw new Error(`Unresolved ${file} → ${specifier}`);
  }
  while (queue.length) {
    const file = queue.shift();
    if (records.has(file)) continue;
    const body = source
      ? execFileSync('git', ['show', `${pin}:${file}`], { cwd: directory, encoding: 'utf8' })
      : readFileSync(resolve(directory, file), 'utf8');
    const code = file.endsWith('.svelte')
      ? [...body.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]).join('\n')
      : body;
    const ast = ts.createSourceFile(
      file,
      code,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const imports = [];
    function record(specifier, kind, symbols = [], edge = 'import') {
      const resolved = resolveImport(file, specifier);
      if (!imports.some((edge) => edge.specifier === specifier && edge.kind === kind))
        imports.push({ specifier, kind, symbols, edge, resolved });
      if (!resolved.startsWith('external:')) queue.push(resolved);
    }
    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause;
        const elements =
          clause?.namedBindings && ts.isNamedImports(clause.namedBindings)
            ? clause.namedBindings.elements
            : undefined;
        record(
          node.moduleSpecifier.text,
          clause?.isTypeOnly ||
            (!clause?.name && elements?.length && elements.every((element) => element.isTypeOnly))
            ? 'type'
            : 'runtime',
          elements?.map((element) => ({
            imported: (element.propertyName ?? element.name).text,
            typeOnly: !!element.isTypeOnly,
          })) ?? ['*'],
          ts.isExportDeclaration(node) ? 'export' : 'import',
        );
      } else if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const elements =
          node.exportClause && ts.isNamedExports(node.exportClause)
            ? node.exportClause.elements
            : undefined;
        record(
          node.moduleSpecifier.text,
          node.isTypeOnly || (elements?.length && elements.every((element) => element.isTypeOnly))
            ? 'type'
            : 'runtime',
          elements?.map((element) => ({
            imported: (element.propertyName ?? element.name).text,
            typeOnly: !!element.isTypeOnly,
          })) ?? ['*'],
          ts.isExportDeclaration(node) ? 'export' : 'import',
        );
      } else if (
        ts.isImportTypeNode(node) &&
        ts.isLiteralTypeNode(node.argument) &&
        ts.isStringLiteral(node.argument.literal)
      )
        record(node.argument.literal.text, 'type', ['*'], 'import-type');
      else if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0])
      )
        record(node.arguments[0].text, 'runtime', ['*'], 'dynamic-import');
      ts.forEachChild(node, visit);
    }
    visit(ast);
    records.set(file, {
      [source ? 'source' : 'local']: file,
      sha256: createHash('sha256').update(body).digest('hex'),
      ...(source ? { url: `https://github.com/mui/base-ui/blob/${pin}/${file}` } : {}),
      imports,
    });
  }
  return [...records.values()].sort((a, b) =>
    (a.source ?? a.local).localeCompare(b.source ?? b.local),
  );
}
const nativePrefix = 'packages/base/src/lib/internals/composite/';
const nativeEntries = execFileSync('rg', ['--files', nativePrefix], { cwd: root, encoding: 'utf8' })
  .trim()
  .split('\n')
  .sort();
const ownerGraph = graph(root, nativeEntries);
const maintained = execFileSync('rg', ['--files', 'packages', 'apps', 'scripts'], {
  cwd: root,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter(
    (file) => /\.(?:ts|tsx|svelte|mjs)$/.test(file) && !/(?:\/dist\/|\/node_modules\/)/.test(file),
  )
  .sort();
const callerUses = maintained.flatMap((file) => {
  const body = readFileSync(resolve(root, file), 'utf8');
  return body
    .split('\n')
    .flatMap((line, index) =>
      /(?:useCompositeRoot|createCompositeList|useCompositeListItem|useCompositeItem|composite\/)/.test(
        line,
      )
        ? [{ file, line: index + 1, text: line.trim() }]
        : [],
    );
});
const callerEntries = [
  ...new Set(
    callerUses
      .map((use) => use.file)
      .filter(
        (file) =>
          file.startsWith('packages/') && !file.includes('/tests/') && !/\.test\./.test(file),
      ),
  ),
].sort();
const native = graph(root, [...nativeEntries, ...callerEntries]);
const canonicalSourceEntries = ['packages/react/src/internals/composite/index.ts'];
// Explicit immutable counterparts of actual native production callers; never basename guesses.
// Accordion/list.ts is a conservative comment-only use and does not import a canonical owner.
const sourceCallerEntries = [
  'dialog/popup/DialogPopup.tsx',
  'floating-ui-react/utils/composite.ts',
  'internals/use-button/useButton.ts',
  'menu/checkbox-item/MenuCheckboxItem.tsx',
  'menu/item/MenuItem.tsx',
  'menu/link-item/MenuLinkItem.tsx',
  'menu/popup/MenuPopup.tsx',
  'menu/positioner/MenuPositioner.tsx',
  'menu/radio-item/MenuRadioItem.tsx',
  'menu/submenu-trigger/MenuSubmenuTrigger.tsx',
  'menu/trigger/MenuTrigger.tsx',
  'menubar/Menubar.tsx',
  'popover/popup/PopoverPopup.tsx',
  'radio-group/RadioGroup.tsx',
  'radio/root/RadioRoot.tsx',
  'toggle-group/ToggleGroup.tsx',
  'toggle/Toggle.tsx',
  'toolbar/button/ToolbarButton.tsx',
  'toolbar/input/ToolbarInput.tsx',
  'toolbar/link/ToolbarLink.tsx',
  'toolbar/root/ToolbarRoot.tsx',
]
  .map((file) => `packages/react/src/${file}`)
  .sort();
const sourceEntries = [...canonicalSourceEntries, ...sourceCallerEntries];
function save(name, value) {
  const path = resolve(root, 'parity/composite-owners', name);
  const body = JSON.stringify(value, null, 2) + '\n';
  if (process.argv.includes('--check')) {
    if (readFileSync(path, 'utf8') !== body)
      throw new Error(`${name} differs from current closure`);
  } else writeFileSync(path, body);
}
if (upstream) {
  const canonicalSource = graph(upstream, canonicalSourceEntries, true);
  const source = graph(upstream, sourceEntries, true);
  save('source-closure.json', {
    pin,
    roots: sourceEntries,
    canonicalRoots: canonicalSourceEntries,
    callerRoots: sourceCallerEntries,
    canonicalModules: canonicalSource,
    historicalTraceLimit:
      'The pre-edit source checkpoint contained only 118 canonical Composite modules. Full pinned caller counterpart closure was added before final-head review; initial118 did not establish complete caller tracing or acceptance.',
    status: 'immutable source dependency inventory; no acceptance or assertion credit',
    modules: source,
  });
  console.log(
    `${canonicalSource.length} canonical Source modules; ${source.length} Source modules including caller counterparts`,
  );
}
save('native-closure.json', {
  pin,
  ordinaryDeclarationCredit: 0,
  status:
    'actual Composite dependency and production caller dependency closure; final review pending',
  method:
    'TypeScript AST runtime/type import and re-export graph; Svelte script blocks parsed as TypeScript and full bytes hashed. Caller uses inventory scans maintained packages/apps/scripts including tests; production caller entries seed their complete forward dependencies. External entries remain explicit. Regex caller-use inventory is conservative and includes comments/type uses.',
  roots: nativeEntries,
  callerEntries,
  callerUses,
  ownerModules: ownerGraph,
  modules: native,
});
console.log(
  `${ownerGraph.length} owner modules, ${native.length} modules including callers, ${callerUses.length} caller-use lines`,
);
