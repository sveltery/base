// Current native component import closure. Historical preimage and Original records are immutable.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveNativePackageSource } from '../../scripts/native-package-source.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ts = createRequire(new URL('../../packages/base/package.json', import.meta.url))(
  'typescript',
);
const destination = resolve(root, 'parity/native-snippets/native-graph.json');
const roots = ['packages/base/src/lib/index.ts'];
const modules = new Map();
function resolveImport(file, specifier) {
  const utility = resolveNativePackageSource(root, specifier);
  if (utility) return resolve(root, utility);
  if (!specifier.startsWith('.')) return `external:${specifier}`;
  const path = resolve(dirname(file), specifier);
  const candidates = [
    path,
    path.replace(/\.js$/, '.ts'),
    path.replace(/\.js$/, '.svelte.ts'),
    `${path}.ts`,
    `${path}.svelte.ts`,
    resolve(path, 'index.ts'),
  ];
  const result = candidates.find(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
  );
  assert.ok(
    result,
    `Missing native source: ${relative(root, file)} -> ${specifier}`,
  );
  return result;
}
function visit(file) {
  if (modules.has(file)) return;
  const body = readFileSync(file, 'utf8');
  const code = file.endsWith('.svelte')
    ? [
        ...body.matchAll(
          /<script\b(?:[^>"']|"[^"]*"|'[^']*')*>([\s\S]*?)<\/script>/g,
        ),
      ]
        .map((match) => match[1])
        .join('\n')
    : body;
  const imports = [];
  const module = {
    source: relative(root, file),
    sha256: createHash('sha256').update(body).digest('hex'),
    imports,
  };
  modules.set(file, module);
  const ast = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  assert.equal(ast.parseDiagnostics.length, 0, `Invalid native source script: ${module.source}`);
  function record(specifier, kind) {
    const target = resolveImport(file, specifier);
    imports.push({
      specifier,
      kind,
      resolved: target.startsWith('external:')
        ? target
        : relative(root, target),
    });
    if (!target.startsWith('external:')) visit(target);
  }
  // Actual syntax excludes imports shown only in comments or string examples.
  function visitDeclaredImports(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      record(
        node.moduleSpecifier.text,
        node.isTypeOnly || node.importClause?.isTypeOnly ? 'type' : 'runtime-or-mixed',
      );
    }
    ts.forEachChild(node, visitDeclaredImports);
  }
  visitDeclaredImports(ast);
  function visitImports(node) {
    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    )
      record(node.argument.literal.text, 'import-type-or-dynamic');
    else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    )
      record(node.arguments[0].text, 'import-type-or-dynamic');
    ts.forEachChild(node, visitImports);
  }
  visitImports(ast);
  assert.ok(
    !/createRenderElement|isNativeRefAttachment|preserveUnchangedInlineStyles|<RenderElement\b/.test(
      body,
    ),
    `Retired renderer machinery: ${module.source}`,
  );
}
for (const source of roots) visit(resolve(root, source));
const output = `${JSON.stringify({ pin: '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c', roots, modules: [...modules.values()].sort((a, b) => a.source.localeCompare(b.source)) }, null, 2)}\n`;
if (process.argv.includes('--write')) writeFileSync(destination, output);
else
  assert.equal(
    readFileSync(destination, 'utf8'),
    output,
    'Current native graph is stale; run node parity/native-snippets/graph.mjs --write',
  );
console.log(
  `Native snippet graph: ${modules.size} current source modules; all declared local imports resolve.`,
);
