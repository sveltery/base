import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve, posix } from 'node:path';

// Audit tooling only. Runtime code does not import this script or its source archive.
const root = resolve(import.meta.dirname, '..');
const upstream = resolve(process.argv[2] ?? '/workspace/direction-provider-upstream');
const require = createRequire(resolve(process.argv[3] ?? `${root}/packages/base/package.json`));
const ts = require('typescript');
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const families = ['popover', 'preview-card', 'tooltip'];
const git = (...args) => execFileSync('git', ['-C', upstream, ...args], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
if (git('rev-parse', `${pin}^{commit}`).trim() !== pin) throw new Error('Immutable Base UI source pin unavailable.');
const files = new Set(git('ls-tree', '-r', '--name-only', pin).trim().split('\n'));
const hash = body => createHash('sha256').update(body).digest('hex');
const bodies = new Map();
const parsed = new Map();
const read = file => {
  if (!bodies.has(file)) bodies.set(file, git('show', `${pin}:${file}`));
  return bodies.get(file);
};

function resolveImport(file, specifier) {
  let base;
  if (specifier.startsWith('.')) base = posix.normalize(posix.join(posix.dirname(file), specifier));
  else if (specifier.startsWith('@base-ui/utils/')) base = `packages/utils/src/${specifier.slice('@base-ui/utils/'.length)}`;
  else if (specifier.startsWith('@base-ui/react/')) base = `packages/react/src/${specifier.slice('@base-ui/react/'.length)}`;
  else if (specifier === '@base-ui/react') base = 'packages/react/src/index';
  else if (specifier === '#test-utils') base = 'packages/react/test/index';
  else return `external:${specifier}`;
  const candidates = [base, base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.tsx'), `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}/index.ts`, `${base}/index.tsx`, `${base}/index.js`];
  const target = candidates.find(candidate => files.has(candidate));
  if (!target) throw new Error(`Unresolved immutable import ${file} → ${specifier}`);
  return target;
}

function moduleRecord(file) {
  if (parsed.has(file)) return parsed.get(file);
  const body = read(file);
  const ast = ts.createSourceFile(file, body, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const imports = [];
  const symbols = [];
  const declaredExports = [];
  const line = node => ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
  const record = (node, specifier, kind, selections, syntax, outward = undefined) => imports.push({ specifier, kind, symbols: selections, resolved: resolveImport(file, specifier), line: line(node), syntax, ...(outward ? { outward } : {}) });
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const named = clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : undefined;
      if (named) {
        for (const element of named) record(node, node.moduleSpecifier.text, clause.isTypeOnly || element.isTypeOnly ? 'type' : 'runtime', [(element.propertyName ?? element.name).text], 'import');
        if (clause.name) record(node, node.moduleSpecifier.text, clause.isTypeOnly ? 'type' : 'runtime', ['default'], 'import');
      } else record(node, node.moduleSpecifier.text, clause?.isTypeOnly ? 'type' : 'runtime', clause?.name && !clause?.namedBindings ? ['default'] : ['*'], 'import');
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.exportClause;
      if (clause && ts.isNamedExports(clause)) {
        for (const element of clause.elements) record(node, node.moduleSpecifier.text, node.isTypeOnly || element.isTypeOnly ? 'type' : 'runtime', [(element.propertyName ?? element.name).text], 're-export', [element.name.text]);
      } else if (clause && ts.isNamespaceExport(clause)) record(node, node.moduleSpecifier.text, node.isTypeOnly ? 'type' : 'runtime', ['*'], 'namespace-export', [clause.name.text]);
      else record(node, node.moduleSpecifier.text, node.isTypeOnly ? 'type' : 'runtime', ['*'], 'export-star');
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
      record(node, node.argument.literal.text, 'type', node.qualifier ? [node.qualifier.getText(ast).split('.')[0]] : ['*'], 'import-type');
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference) && node.moduleReference.expression && ts.isStringLiteral(node.moduleReference.expression)) {
      record(node, node.moduleReference.expression.text, node.isTypeOnly ? 'type' : 'runtime', ['*'], 'import-equals');
    } else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      if (node.arguments.length !== 1 || !ts.isStringLiteral(node.arguments[0])) throw new Error(`Nonliteral module edge requires manual resolution: ${file}:${line(node)}`);
      record(node, node.arguments[0].text, 'runtime', ['*'], 'dynamic-import/require');
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  const emitted = ts.transpileModule(body, { fileName: file, compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.Preserve, verbatimModuleSyntax: false } }).outputText;
  const emittedAst = ts.createSourceFile(file, emitted, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const emittedSignatures = new Set();
  const signature = (specifier, symbol, syntax, outward) => JSON.stringify([specifier, symbol, syntax, outward]);
  for (const statement of emittedAst.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const clause = statement.importClause;
      const named = clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : undefined;
      if (named) for (const element of named) emittedSignatures.add(signature(statement.moduleSpecifier.text, (element.propertyName ?? element.name).text, 'import'));
      if (clause?.name) emittedSignatures.add(signature(statement.moduleSpecifier.text, 'default', 'import'));
      if (!clause || (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings))) emittedSignatures.add(signature(statement.moduleSpecifier.text, '*', 'import'));
    } else if (ts.isExportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
      const clause = statement.exportClause;
      if (clause && ts.isNamedExports(clause)) for (const element of clause.elements) emittedSignatures.add(signature(statement.moduleSpecifier.text, (element.propertyName ?? element.name).text, 're-export', element.name.text));
      else if (clause && ts.isNamespaceExport(clause)) emittedSignatures.add(signature(statement.moduleSpecifier.text, '*', 'namespace-export', clause.name.text));
      else emittedSignatures.add(signature(statement.moduleSpecifier.text, '*', 'export-star'));
    }
  }
  for (const edge of imports) edge.emittedRuntime = emittedSignatures.has(signature(edge.specifier, edge.symbols[0], edge.syntax, edge.outward?.[0])) || (edge.kind === 'runtime' && edge.syntax === 'dynamic-import/require');
  for (const statement of ast.statements) {
    const declarations = ts.isVariableStatement(statement) ? statement.declarationList.declarations : [statement];
    for (const declaration of declarations) if (declaration.name) {
      const name = declaration.name.getText(ast);
      symbols.push({ name, syntax: ts.SyntaxKind[declaration.kind], line: line(declaration), bodySha256: hash(declaration.getText(ast)) });
      if (statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) declaredExports.push(name);
    }
    if (ts.isExportDeclaration(statement) && !statement.moduleSpecifier && statement.exportClause && ts.isNamedExports(statement.exportClause)) declaredExports.push(...statement.exportClause.elements.map(element => element.name.text));
  }
  const pureBarrel = ast.statements.length > 0 && ast.statements.every(statement => ts.isExportDeclaration(statement) || ts.isImportDeclaration(statement) || ts.isEmptyStatement(statement));
  const result = { source: file, sha256: hash(body), url: `https://github.com/mui/base-ui/blob/${pin}/${file}`, lineCount: body.split('\n').length - 1, pureBarrel, declaredExports, symbols, imports };
  parsed.set(file, result);
  return result;
}

function exportedSymbols(file, visiting = new Set()) {
  if (visiting.has(file)) return new Set();
  const nextVisiting = new Set([...visiting, file]);
  const module = moduleRecord(file);
  const names = new Set(module.declaredExports);
  for (const edge of module.imports) {
    for (const name of edge.outward ?? []) names.add(name);
    if (edge.syntax === 'export-star' && !edge.resolved.startsWith('external:')) for (const name of exportedSymbols(edge.resolved, nextVisiting)) names.add(name);
  }
  return names;
}

function graph(entries, selected, runtimeProjection = false) {
  const requests = new Map();
  const queue = entries.map(source => ({ source, symbols: ['*'] }));
  const records = new Map();
  while (queue.length) {
    const request = queue.shift();
    const previous = requests.get(request.source) ?? new Set();
    let changed = false;
    for (const symbol of request.symbols) if (!previous.has(symbol)) { previous.add(symbol); changed = true; }
    if (!changed) continue;
    requests.set(request.source, previous);
    const module = moduleRecord(request.source);
    const imports = module.imports.map(edge => {
      const starNames = selected && module.pureBarrel && !previous.has('*') && edge.syntax === 'export-star' && !edge.resolved.startsWith('external:')
        ? [...previous].filter(symbol => exportedSymbols(edge.resolved).has(symbol)) : undefined;
      const select = (!runtimeProjection || edge.emittedRuntime) && (!selected || !module.pureBarrel || edge.syntax === 'import' || previous.has('*') || (edge.syntax === 'export-star' && (starNames === undefined || starNames.length > 0)) || edge.outward?.some(symbol => previous.has(symbol)));
      return { ...edge, selected: select, ...(starNames ? { selectedSymbols: starNames } : {}) };
    });
    records.set(request.source, { ...module, requestedSymbols: [...previous].sort(), imports });
    for (const edge of imports) if (edge.selected && !edge.resolved.startsWith('external:')) queue.push({ source: edge.resolved, symbols: edge.selectedSymbols ?? edge.symbols });
  }
  return [...records.values()].sort((a, b) => a.source.localeCompare(b.source));
}

function testInventory(roots) {
  const ordinary = [], parameterized = [], conformance = [], typeAssertions = [];
  for (const source of roots) {
    const text = read(source);
    const tree = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, source.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    function visit(node) {
      if (ts.isCallExpression(node)) {
        const expression = node.expression.getText(tree);
        let callee = node.expression;
        let factory = false, each = false;
        while (ts.isCallExpression(callee) || ts.isPropertyAccessExpression(callee) || ts.isElementAccessExpression(callee) || ts.isTaggedTemplateExpression(callee)) {
          if (ts.isPropertyAccessExpression(callee)) {
            if (['each', 'for'].includes(callee.name.text)) each = true;
            if (callee === node.expression && ['each', 'for', 'skipIf', 'runIf'].includes(callee.name.text)) factory = true;
          }
          callee = ts.isTaggedTemplateExpression(callee) ? callee.tag : callee.expression;
        }
        const entry = { source, line: tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1, expression, bodySha256: hash(node.getText(tree)), status: 'unported', ordinaryDeclarationCredit: 0 };
        const name = node.arguments[0];
        if (!factory && ts.isIdentifier(callee) && ['it', 'test'].includes(callee.text) && node.arguments.length >= 2) {
          const record = { ...entry, name: ts.isStringLiteralLike(name) ? name.text : name.getText(tree), dynamicName: !ts.isStringLiteralLike(name), variantExpansion: 'not yet enumerated' };
          (each ? parameterized : ordinary).push(record);
        } else if (/^(describeConformance|popupConformanceTests)$/.test(expression)) conformance.push(entry);
        else if (/^(expectType|expectTypeOf|expectError|expectAssignable|expectNotAssignable)(\b|[<(])/.test(expression)) typeAssertions.push(entry);
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
  }
  return { pin, ordinaryDeclarationCredit: 0, method: 'AST declaration-site/body hashing. Parameterized source sites, conformance calls and type assertion calls are separate; expansions remain pending manual enumeration. No execution or parity is claimed.', ordinary, parameterized, conformance, typeAssertions };
}

const directory = `${root}/parity/popup-family`;
mkdirSync(directory, { recursive: true });
const sourceRoots = families.map(family => `packages/react/src/${family}/index.ts`);
const testRoots = [...files].filter(file => families.some(family => file.startsWith(`packages/react/src/${family}/`)) && /\.(test|spec)(?:\.[\w-]+)?\.tsx?$/.test(file)).sort();
const surfaceRoots = [...files].filter(file => families.some(family => file.startsWith(`packages/react/src/${family}/`)) && /\.(ts|tsx)$/.test(file) && !/\.(test|spec)(?:\.[\w-]+)?\.tsx?$/.test(file)).sort();
for (const [name, entries] of [['source', sourceRoots], ['test-helper', testRoots]]) {
  const full = graph(entries, false), selected = graph(entries, true), runtime = graph(entries, true, true);
  const payload = { pin, ordinaryDeclarationCredit: 0, roots: entries, method: 'Complete recursive TypeScript AST runtime/type/import/re-export/import-type/import-equals/literal dynamic-import edges. Full-file closure is a conservative barrel superset; selected closure follows actual named re-exports through declaration-free barrels. emittedRuntimeModules separately use TypeScript 5.9.3 import erasure (ESNext, JSX preserve, verbatimModuleSyntax false) to distinguish imports used only as types despite runtime import syntax. This projection is scope evidence, not the original build or manual symbol/body review. Non-barrel bodies remain whole modules. External package entry points stay explicit; this graph is not manual body review or implementation acceptance.', conservativeModules: full, selectedModules: selected, emittedRuntimeModules: runtime };
  writeFileSync(`${directory}/${name}-graph.json`, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`${name}: conservative ${full.length} modules; selected ${selected.length} modules / ${selected.reduce((sum, module) => sum + module.imports.filter(edge => edge.selected).length, 0)} selected edges; emitted runtime ${runtime.length} modules`);
}
writeFileSync(`${directory}/public-surface.json`, `${JSON.stringify({ pin, ordinaryDeclarationCredit: 0, method: 'All feature source files, including CSS variable and data attribute declaration modules outside entry-point imports. These are contract evidence; no unused runtime modules will be installed to mimic the archive.', modules: surfaceRoots.map(moduleRecord) }, null, 2)}\n`);
writeFileSync(`${directory}/assertion-inventory.json`, `${JSON.stringify(testInventory(testRoots), null, 2)}\n`);
const combined = new Set([...parsed.keys(), 'LICENSE', 'packages/react/package.json', 'packages/utils/package.json', 'pnpm-lock.yaml']);
for (const source of [...combined].sort()) {
  const target = `${directory}/upstream/${source}`;
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, read(source));
}
writeFileSync(`${directory}/UPSTREAM_LICENSE`, read('LICENSE'));
writeFileSync(`${directory}/archive-manifest.json`, `${JSON.stringify({ pin, method: 'Exact immutable Git objects, never working-tree copies.', files: [...combined].sort().map(source => ({ source, sha256: hash(read(source)) })) }, null, 2)}\n`);
console.log(`archive: ${combined.size} immutable bodies; ordinary credits: 0`);
