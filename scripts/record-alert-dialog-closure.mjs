import ts from '../packages/base/node_modules/typescript/lib/typescript.js';
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const upstream = process.argv[2] && resolve(process.argv[2]);
const evidence = resolve(root, 'parity/alert-dialog');
mkdirSync(evidence, { recursive: true });
const hash = body => createHash('sha256').update(body).digest('hex');
const save = (file, data) => writeFileSync(resolve(evidence, file), JSON.stringify(data, null, 2) + '\n');

function graph(directory, entries, source = false) {
  const records = new Map();
  const queue = [...entries];
  function resolveImport(file, specifier) {
    let base;
    if (specifier.startsWith('.')) base = resolve(directory, dirname(file), specifier);
    else if (source && specifier.startsWith('@base-ui/utils/')) base = resolve(directory, 'packages/utils/src', specifier.slice('@base-ui/utils/'.length));
    else return `external:${specifier}`;
    // index.parts is a basename: append extensions without dropping its .parts suffix.
    for (const candidate of [base, base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.svelte.ts'), `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
      if (existsSync(candidate) && statSync(candidate).isFile()) return relative(directory, candidate);
    }
    throw new Error(`Unresolved ${file} → ${specifier}`);
  }
  while (queue.length) {
    const file = queue.shift();
    if (records.has(file)) continue;
    const body = readFileSync(resolve(directory, file), 'utf8');
    const code = file.endsWith('.svelte') ? [...body.matchAll(/<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script>/g)].map(match => match[2]).join('\n') : body;
    const ast = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const imports = [];
    function record(specifier, kind) {
      const resolved = resolveImport(file, specifier);
      if (!imports.some(edge => edge.specifier === specifier && edge.kind === kind)) imports.push({ specifier, kind, resolved });
      if (!resolved.startsWith('external:')) queue.push(resolved);
    }
    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const clause = node.importClause;
        if (!clause || clause.name || clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) record(node.moduleSpecifier.text, clause?.isTypeOnly ? 'type' : 'runtime');
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
          for (const element of clause.namedBindings.elements) record(node.moduleSpecifier.text, clause.isTypeOnly || element.isTypeOnly ? 'type' : 'runtime');
        }
      } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          for (const element of node.exportClause.elements) record(node.moduleSpecifier.text, node.isTypeOnly || element.isTypeOnly ? 'type' : 'runtime');
        } else record(node.moduleSpecifier.text, node.isTypeOnly ? 'type' : 'runtime');
      } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) record(node.argument.literal.text, 'type');
      ts.forEachChild(node, visit);
    }
    visit(ast);
    records.set(file, { [source ? 'source' : 'local']: file, sha256: hash(body), ...(source ? { url: `https://github.com/mui/base-ui/blob/${pin}/${file}` } : {}), imports });
  }
  return [...records.values()].sort((a, b) => (a.source ?? a.local).localeCompare(b.source ?? b.local));
}

if (upstream) {
  if (execFileSync('git', ['rev-parse', 'HEAD'], { cwd: upstream, encoding: 'utf8' }).trim() !== pin) throw new Error('Requires the immutable original pin.');
  const entries = ['packages/react/src/alert-dialog/index.ts'];
  const modules = graph(upstream, entries, true);
  save('source-graph.json', { pin, entries, method: 'Complete TypeScript AST runtime/type import and re-export graph; mixed declarations retain both edge kinds; includes index.parts and transitive unselected barrel fanout.', modules });
  const originalFiles = readdirSync(resolve(upstream, 'packages/react/src/alert-dialog'), { recursive: true }).filter(file => /\.(ts|tsx)$/.test(file)).sort();
  const files = [...originalFiles.map(file => `packages/react/src/alert-dialog/${file}`), 'packages/react/test/popupConformanceTests.tsx', 'packages/react/test/createRenderer.ts'].map(source => {
    const body = readFileSync(resolve(upstream, source), 'utf8');
    const target = resolve(evidence, 'upstream', source);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(resolve(upstream, source), target);
    return { source, sha256: hash(body), url: `https://github.com/mui/base-ui/blob/${pin}/${source}` };
  });
  const tests = [];
  const helperCalls = [];
  const types = [];
  for (const file of files.filter(file => /\.(test|spec)\.tsx$/.test(file.source))) {
    const body = readFileSync(resolve(upstream, file.source), 'utf8');
    const ast = ts.createSourceFile(file.source, body, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isCallExpression(node)) {
        const callee = node.expression.getText(ast);
        const location = ast.getLineAndCharacterOfPosition(node.getStart(ast));
        const entry = { source: file.source, sourceId: `${file.source}:${location.line + 1}`, line: location.line + 1, callee, sha256: hash(node.getText(ast)), body: node.getText(ast), status: 'unported; no credit' };
        if ((callee === 'it' || callee.startsWith('it.')) && node.arguments.length > 1 && (ts.isStringLiteral(node.arguments[0]) || ts.isNoSubstitutionTemplateLiteral(node.arguments[0]))) tests.push({ ...entry, name: node.arguments[0].text });
        else if (/ConformanceTests$/.test(callee)) helperCalls.push(entry);
        else if (/expectType|expectError/.test(callee)) types.push(entry);
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
  const helper = 'packages/react/test/popupConformanceTests.tsx';
  const helperBody = readFileSync(resolve(upstream, helper), 'utf8');
  const helperTree = ts.createSourceFile(helper, helperBody, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const conformanceDeclarations = [];
  function inspectHelper(node) {
    if (ts.isCallExpression(node) && node.expression.getText(helperTree) === 'it') {
      const line = helperTree.getLineAndCharacterOfPosition(node.getStart(helperTree)).line + 1;
      conformanceDeclarations.push({ source: helper, line, name: node.arguments[0].getText(helperTree), body: node.getText(helperTree), sha256: hash(node.getText(helperTree)), selection: /animation finishes/.test(node.arguments[0].getText(helperTree)) ? 'Original unconditional skip remains skipped/uncredited' : 'Active AlertDialog click/alertdialog/dialog helper configuration; candidate mapping review pending' });
    }
    ts.forEachChild(node, inspectHelper);
  }
  inspectHelper(helperTree);
  const typeSpec = files.find(file => file.source.endsWith('AlertDialogRoot.spec.tsx'));
  const typeBody = readFileSync(resolve(upstream, typeSpec.source), 'utf8');
  const expectedTypeErrors = [...typeBody.matchAll(/\/\/ @ts-expect-error[^\n]*/g)].map(match => ({ source: typeSpec.source, line: typeBody.slice(0, match.index).split('\n').length, instruction: match[0] }));
  save('upstream-inventory.json', { pin, publicParts: ['Root', 'Trigger', 'Backdrop', 'Close', 'Description', 'Popup', 'Portal', 'Title', 'Viewport', 'Handle', 'createHandle'], files, ordinaryDeclarations: tests, parameterizedExpansions: [], conformanceHelperCalls: helperCalls, conformanceDeclarations, typeAssertions: types, expectedTypeErrors, ordinaryDeclarationCredit: 0, supplementalCredit: 0 });
  console.log(`${modules.length} original modules; ${modules.reduce((count, module) => count + module.imports.length, 0)} runtime/type edges; ${files.length} AlertDialog original files; ${tests.length} ordinary declarations`);
}
const localEntry = 'packages/base/src/lib/alert-dialog/index.ts';
if (existsSync(resolve(root, localEntry))) {
  const records = graph(root, [localEntry]);
  save('local-graph.json', { pin, entries: [localEntry], status: 'actual used closure; final source/native/maintainability review pending', records });
  console.log(`${records.length} actual local modules; ${records.reduce((count, record) => count + record.imports.length, 0)} runtime/type edges`);
}
