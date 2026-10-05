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
  // Namespace values in Original fixture consumers select their actual referenced members.
  // A bare/escaped/dynamic namespace value remains a conservative `*` request.
  function memberRequests(localName, importedName, declaration) {
    const requests = new Set();
    function inspect(node) {
      if (node === declaration) return;
      if (ts.isIdentifier(node) && node.text === localName) {
        let expression = node;
        const members = [];
        while (true) {
          const parent = expression.parent;
          if (ts.isPropertyAccessExpression(parent) && parent.expression === expression) {
            members.push(parent.name.text);
            expression = parent;
          } else if (ts.isElementAccessExpression(parent) && parent.expression === expression && ts.isStringLiteralLike(parent.argumentExpression)) {
            members.push(parent.argumentExpression.text);
            expression = parent;
          } else if (ts.isQualifiedName(parent) && parent.left === expression) {
            members.push(parent.right.text);
            expression = parent;
          } else break;
        }
        requests.add([...(importedName === '*' ? [] : [importedName]), ...members].join('.') || '*');
      }
      ts.forEachChild(node, inspect);
    }
    inspect(ast);
    return [...requests].sort();
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const named = clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : undefined;
      if (named) {
        for (const element of named) {
          const importedName = (element.propertyName ?? element.name).text;
          record(node, node.moduleSpecifier.text, clause.isTypeOnly || element.isTypeOnly ? 'type' : 'runtime', [importedName], 'import');
          imports.at(-1).consumerSymbols = memberRequests(element.name.text, importedName, node);
        }
        if (clause.name) record(node, node.moduleSpecifier.text, clause.isTypeOnly ? 'type' : 'runtime', ['default'], 'import');
      } else {
        record(node, node.moduleSpecifier.text, clause?.isTypeOnly ? 'type' : 'runtime', clause?.name && !clause?.namedBindings ? ['default'] : ['*'], 'import');
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) imports.at(-1).consumerSymbols = memberRequests(clause.namedBindings.name.text, '*', node);
      }
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

function graph(entries, selected, runtimeProjection = false, consumerProjection = false) {
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
        ? [...previous].filter(symbol => exportedSymbols(edge.resolved).has(symbol.split('.')[0])) : undefined;
      const outwardRequests = edge.outward ? [...previous].filter(symbol => edge.outward.some(name => symbol === name || (consumerProjection && symbol.startsWith(`${name}.`)))) : [];
      const select = Boolean((!runtimeProjection || edge.emittedRuntime) && (!selected || !module.pureBarrel || edge.syntax === 'import' || previous.has('*') || (edge.syntax === 'export-star' && (starNames === undefined || starNames.length > 0)) || outwardRequests.length));
      let selectedSymbols = starNames;
      if (consumerProjection && edge.syntax === 'import' && edge.consumerSymbols?.length) selectedSymbols = edge.consumerSymbols;
      if (consumerProjection && module.pureBarrel && !previous.has('*') && edge.outward && outwardRequests.length) selectedSymbols = outwardRequests.map(symbol => {
        const outwardName = edge.outward.find(name => symbol === name || symbol.startsWith(`${name}.`));
        const suffix = symbol.slice(outwardName.length);
        return edge.syntax === 'namespace-export' ? (suffix.slice(1) || '*') : `${edge.symbols[0]}${suffix}`;
      });
      return { ...edge, selected: select, ...(selectedSymbols ? { selectedSymbols } : {}) };
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

function testVariantInventory(roots) {
  const sites = [], parameterScopes = [], negativeTypeSamples = [], registrationLoops = [];
  for (const source of roots) {
    const body = read(source);
    const tree = ts.createSourceFile(source, body, ts.ScriptTarget.Latest, true, source.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const line = node => tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1;
    function registration(node) {
      if (!ts.isCallExpression(node) || node.arguments.length < 2 || !node.arguments.some(argument => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument))) return;
      let callee = node.expression;
      let parameter, guards = [];
      while (ts.isCallExpression(callee) || ts.isPropertyAccessExpression(callee) || ts.isElementAccessExpression(callee)) {
        if (ts.isCallExpression(callee) && ts.isPropertyAccessExpression(callee.expression)) {
          const name = callee.expression.name.text;
          if (['each', 'for'].includes(name)) {
            let array = callee.arguments[0];
            while (array && (ts.isAsExpression(array) || ts.isSatisfiesExpression(array) || ts.isParenthesizedExpression(array))) array = array.expression;
            if (!array || !ts.isArrayLiteralExpression(array)) throw new Error(`Nonliteral registration parameter requires manual resolution: ${source}:${line(node)}`);
            parameter = { source, line: line(callee), factory: name, rows: array.elements.map((row, index) => ({ index, literalSource: row.getText(tree), bodySha256: hash(row.getText(tree)) })) };
          }
          if (['skipIf', 'runIf'].includes(name)) guards.push({ factory: name, expression: callee.arguments[0]?.getText(tree) });
        }
        callee = callee.expression;
      }
      if (!ts.isIdentifier(callee) || !['it', 'test', 'describe'].includes(callee.text)) return;
      return { kind: callee.text, parameter, guards };
    }
    function visit(node) {
      const own = registration(node);
      if (own?.kind === 'describe' && own.parameter) parameterScopes.push({ ...own.parameter, name: node.arguments[0].getText(tree), ordinaryDeclarationCredit: 0 });
      if (own && ['it', 'test'].includes(own.kind)) {
        const ancestors = [];
        for (let parent = node.parent; parent; parent = parent.parent) {
          const outer = registration(parent);
          if (outer?.kind === 'describe' && outer.parameter) ancestors.push(outer.parameter);
          if (ts.isForStatement(parent) || ts.isForOfStatement(parent) || ts.isForInStatement(parent) || ts.isWhileStatement(parent) || ts.isDoStatement(parent)) registrationLoops.push({ source, testLine: line(node), loopLine: line(parent), loop: parent.getText(tree), ordinaryDeclarationCredit: 0 });
        }
        const count = (own.parameter?.rows.length ?? 1) * ancestors.reduce((total, scope) => total * scope.rows.length, 1);
        sites.push({ source, line: line(node), name: node.arguments[0].getText(tree), bodySha256: hash(node.getText(tree)), ownParameter: own.parameter ?? null, enclosingParameterScopes: ancestors, sourceVariantCount: count, guards: own.guards, status: 'unported and unexecuted', ordinaryDeclarationCredit: 0 });
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
    body.split('\n').forEach((text, index) => {
      if (text.includes('@ts-expect-error')) negativeTypeSamples.push({ source, line: index + 1, directive: text.trim(), followingSourceLine: body.split('\n')[index + 1], status: 'native packed strict negative witness unstarted', ordinaryDeclarationCredit: 0 });
    });
  }
  const perFamily = Object.fromEntries(families.map(family => {
    const own = sites.filter(site => site.source.startsWith(`packages/react/src/${family}/`));
    return [family, { declarationSites: own.length, sourceVariantCount: own.reduce((sum, site) => sum + site.sourceVariantCount, 0), ordinaryDeclarationCredit: 0 }];
  }));
  return { pin, ordinaryDeclarationCredit: 0, method: 'Declaration bodies and literal it.each/describe.for rows read and hashed separately. Counts expand explicit Original parameter registration only; they are inventory obligations, not passing tests or unchanged parity credit. Source conditional skip guards remain explicit. Conformance-generated declarations are separate helper obligations. No registration loop was inferred from runtime loops inside test bodies.', perFamily, parameterScopes, sites, negativeTypeSamples, registrationLoops };
}

// An optional output directory lets successor compiler checks preserve frozen audit receipts.
const directory = resolve(process.argv[4] ?? `${root}/parity/popup-family`);
mkdirSync(directory, { recursive: true });
// Namespace-use discovery is internal; the graph's selectedSymbols carries its public evidence.
const publicRecords = modules => modules.map(module => ({ ...module, imports: module.imports.map(({ consumerSymbols: _consumerSymbols, ...edge }) => edge) }));
const sourceRoots = families.map(family => `packages/react/src/${family}/index.ts`);
const testRoots = [...files].filter(file => families.some(family => file.startsWith(`packages/react/src/${family}/`)) && /\.(test|spec)(?:\.[\w-]+)?\.tsx?$/.test(file)).sort();
const missingHelperTestRoots = [
  'packages/react/src/floating-ui-react/components/FloatingDelayGroup.test.tsx',
  'packages/react/src/floating-ui-react/components/FloatingPortal.test.tsx',
  'packages/react/src/floating-ui-react/hooks/useClientPoint.test.tsx',
  'packages/react/src/utils/popups/inlineRect.test.ts',
];
const surfaceRoots = [...files].filter(file => families.some(family => file.startsWith(`packages/react/src/${family}/`)) && /\.(ts|tsx)$/.test(file) && !/\.(test|spec)(?:\.[\w-]+)?\.tsx?$/.test(file)).sort();
for (const [name, entries] of [['source', sourceRoots], ['test-helper', testRoots]]) {
  const full = graph(entries, false), selected = graph(entries, true), runtime = graph(entries, true, true), consumers = graph(entries, true, false, true);
  const payload = { pin, ordinaryDeclarationCredit: 0, roots: entries, method: `Complete recursive TypeScript AST runtime/type/import/re-export/import-type/import-equals/literal dynamic-import edges. Full-file closure is a conservative barrel superset; selected closure follows actual named re-exports through declaration-free barrels. emittedRuntimeModules separately use TypeScript ${ts.version} import erasure (ESNext, JSX preserve, verbatimModuleSyntax false) to distinguish imports used only as types despite runtime import syntax. This projection is scope evidence, not the original build or manual symbol/body review. Non-barrel bodies remain whole modules. External package entry points stay explicit; this graph is not manual body review or implementation acceptance.`, conservativeModules: publicRecords(full), selectedModules: publicRecords(selected), emittedRuntimeModules: publicRecords(runtime) };
  writeFileSync(`${directory}/${name}-graph.json`, `${JSON.stringify(payload, null, 2)}\n`);
  if (name === 'test-helper') writeFileSync(`${directory}/test-consumer-graph.json`, `${JSON.stringify({ pin, ordinaryDeclarationCredit: 0, roots: entries, method: 'Additional AST namespace-member demand projection for Original test consumers. Member accesses and literal element accesses retain the actually requested namespace exports; bare, escaped or dynamic namespace references retain wildcard selection. Non-barrel selected bodies remain whole modules, including complete runtime/type/helper recursion. This supplements, and does not replace, the conservative and named-export graphs. Manual body review and dependency acceptance remain separate.', selectedModules: publicRecords(consumers) }, null, 2)}\n`);
  console.log(`${name}: conservative ${full.length} modules; selected ${selected.length} modules / ${selected.reduce((sum, module) => sum + module.imports.filter(edge => edge.selected).length, 0)} selected edges; emitted runtime ${runtime.length} modules`);
}
writeFileSync(`${directory}/public-surface.json`, `${JSON.stringify({ pin, ordinaryDeclarationCredit: 0, method: 'All feature source files, including CSS variable and data attribute declaration modules outside entry-point imports. These are contract evidence; no unused runtime modules will be installed to mimic the archive.', modules: publicRecords(surfaceRoots.map(moduleRecord)) }, null, 2)}\n`);
writeFileSync(`${directory}/assertion-inventory.json`, `${JSON.stringify(testInventory(testRoots), null, 2)}\n`);
writeFileSync(`${directory}/assertion-variants.json`, `${JSON.stringify(testVariantInventory(testRoots), null, 2)}\n`);
writeFileSync(`${directory}/missing-helper-test-graph.json`, `${JSON.stringify({ pin, ordinaryDeclarationCredit: 0, roots: missingHelperTestRoots, method: 'Immutable complete runtime/type/helper recursion for the four direct Original test files of the leased missing helpers and canonical portal extraction. Selected namespace-member projection only; non-barrel bodies stay complete. This is additional helper validation evidence, separate from family ordinary declarations and unchanged credit.', selectedModules: publicRecords(graph(missingHelperTestRoots, true, false, true)), assertionInventory: testInventory(missingHelperTestRoots) }, null, 2)}\n`);
const combined = new Set([...parsed.keys(), 'LICENSE', 'packages/react/package.json', 'packages/utils/package.json', 'pnpm-lock.yaml']);
for (const source of [...combined].sort()) {
  const target = `${directory}/upstream/${source}`;
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, read(source));
}
writeFileSync(`${directory}/UPSTREAM_LICENSE`, read('LICENSE'));
writeFileSync(`${directory}/archive-manifest.json`, `${JSON.stringify({ pin, method: 'Exact immutable Git objects, never working-tree copies.', files: [...combined].sort().map(source => ({ source, sha256: hash(read(source)) })) }, null, 2)}\n`);
console.log(`archive: ${combined.size} immutable bodies; ordinary credits: 0`);
