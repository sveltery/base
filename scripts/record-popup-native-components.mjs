import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';

// Audit tooling only: this conservative local dependency graph is not Source acceptance.
const root = resolve(import.meta.dirname, '..');
const ts = createRequire(`${root}/packages/base/package.json`)('typescript');
const hash = body => createHash('sha256').update(body).digest('hex');
const roots = ['popover', 'preview-card', 'tooltip'].flatMap(family => ['index.parts.ts', 'handle.svelte.ts'].map(file => `packages/base/src/lib/${family}/${file}`));

function resolveLocal(file, specifier) {
  const base = resolve(root, dirname(file), specifier);
  const candidates = /\.js$/.test(base)
    ? [base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.tsx'), base.replace(/\.js$/, '.svelte.ts'), base]
    : [base, `${base}.ts`, `${base}.svelte.ts`, `${base}.svelte`, `${base}/index.ts`];
  const result = candidates.find(candidate => existsSync(candidate));
  if (!result) throw new Error(`Unresolved local dependency: ${file} ${specifier}`);
  return relative(root, result);
}
const modules = new Map();
const edges = [];
const external = new Set();
const queue = [...roots];
for (let index = 0; index < queue.length; index += 1) {
  const file = queue[index];
  if (modules.has(file)) continue;
  const body = readFileSync(resolve(root, file), 'utf8');
  const scripts = file.endsWith('.svelte')
    ? [...body.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1])
    : [body];
  const symbols = [];
  scripts.forEach((script, scriptIndex) => {
    const ast = ts.createSourceFile(file, script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    function add(specifier, kind, syntax, node) {
      if (typeof specifier !== 'string') throw new Error(`Nonliteral import at ${file}:${ast.getLineAndCharacterOfPosition(node.pos).line + 1}`);
      const target = specifier.startsWith('.') ? resolveLocal(file, specifier) : null;
      if (target) queue.push(target); else external.add(specifier);
      edges.push({ from: file, to: target, external: target ? undefined : specifier, kind, syntax, scriptIndex, members: ts.isImportDeclaration(node) ? [ ...(node.importClause?.name ? [{ imported: 'default', local: node.importClause.name.text, typeOnly: !!node.importClause.isTypeOnly }] : []), ...(node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings) ? node.importClause.namedBindings.elements.map(value => ({ imported: value.propertyName?.text ?? value.name.text, local: value.name.text, typeOnly: !!node.importClause?.isTypeOnly || value.isTypeOnly })) : node.importClause?.namedBindings ? [{ imported: '*', local: node.importClause.namedBindings.name.text, typeOnly: !!node.importClause.isTypeOnly }] : []) ] : ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements.map(value => ({ imported: value.propertyName?.text ?? value.name.text, exported: value.name.text, typeOnly: node.isTypeOnly || value.isTypeOnly })) : [] });
    }
    function visit(node) {
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier) {
          const clause = node.importClause;
          const bindings = clause?.namedBindings;
          const specifiers = ts.isExportDeclaration(node) ? node.exportClause?.elements : bindings && ts.isNamedImports(bindings) ? bindings.elements : undefined;
          const typeOnly = ts.isExportDeclaration(node) ? node.isTypeOnly || !!specifiers?.length && specifiers.every(value => value.isTypeOnly)
            : clause?.isTypeOnly || !clause?.name && !!specifiers?.length && specifiers.every(value => value.isTypeOnly);
          add(node.moduleSpecifier.text, typeOnly ? 'type' : 'runtime', ts.isImportDeclaration(node) ? 'import' : 'export', node);
        }
      } else if (ts.isImportTypeNode(node)) {
        add(ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal) ? node.argument.literal.text : undefined, 'type', 'import-type', node);
      } else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || ts.isIdentifier(node.expression) && node.expression.text === 'require')) {
        add(ts.isStringLiteral(node.arguments[0]) ? node.arguments[0].text : undefined, 'runtime', 'dynamic-or-require', node);
      }
      if (node.parent === ast && (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node))) {
        symbols.push({ name: node.name?.text ?? '<anonymous>', kind: ts.SyntaxKind[node.kind], sha256: hash(node.getText(ast)), scriptIndex });
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
  });
  modules.set(file, { path: file, sha256: hash(body), symbols });
}
const result = {
  scope: 'Six actual native public family value/handle entries, reaching all 27 actual component bodies and their recursive runtime/type imports with explicit imported-member names. Named barrel module closure and unselected declarations are conservatively included; the graph records actual wired dependencies, not executed branches, independent manual review, ordinary credit or acceptance.',
  immutableOriginalPin: '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c',
  ordinaryDeclarationCredit: 0,
  roots,
  moduleCount: modules.size,
  edgeCount: edges.length,
  externalPackages: [...external].sort(),
  modules: [...modules.values()].sort((a, b) => a.path.localeCompare(b.path)),
  edges,
};
writeFileSync(`${root}/parity/popup-family/native-component-graph.json`, `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`Recorded ${modules.size} local component closure modules and ${edges.length} dependency edges.\n`);
