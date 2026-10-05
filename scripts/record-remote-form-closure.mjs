import ts from '../packages/base/node_modules/typescript/lib/typescript.js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { createHash } from 'node:crypto';
const root = resolve(import.meta.dirname, '..');
const entries = [
  'form/Form.svelte',
  'remote-forms/index.parts.ts',
  'input/Input.svelte',
  'switch/root/SwitchRoot.svelte',
  'checkbox/root/CheckboxRoot.svelte',
  'checkbox-group/CheckboxGroup.svelte',
  'radio/root/RadioRoot.svelte',
  'radio-group/RadioGroup.svelte',
].map((file) => `packages/base/src/lib/${file}`);
const queue = [...entries],
  records = new Map();
function resolveImport(file, specifier) {
  if (!specifier.startsWith('.')) return `external:${specifier}`;
  const base = resolve(root, dirname(file), specifier);
  for (const candidate of [
    base,
    base.replace(/\.js$/, '.ts'),
    base.replace(/\.js$/, '.svelte.ts'),
    base + '.ts',
    base + '.svelte',
    base + '/index.ts',
  ])
    if (existsSync(candidate)) return relative(root, candidate);
  throw new Error(`Unresolved ${file} → ${specifier}`);
}
while (queue.length) {
  const file = queue.shift();
  if (records.has(file)) continue;
  const text = readFileSync(resolve(root, file), 'utf8');
  const code = file.endsWith('.svelte')
    ? [...text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]).join('\n')
    : text;
  const ast = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const imports = [];
  function record(specifier, kind) {
    const resolved = resolveImport(file, specifier);
    if (!imports.some((edge) => edge.specifier === specifier && edge.kind === kind))
      imports.push({ specifier, kind, resolved });
    if (!resolved.startsWith('external:')) queue.push(resolved);
  }
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause,
        elements =
          clause?.namedBindings && ts.isNamedImports(clause.namedBindings)
            ? clause.namedBindings.elements
            : undefined;
      record(
        node.moduleSpecifier.text,
        clause?.isTypeOnly ||
          (!clause?.name && elements?.length && elements.every((e) => e.isTypeOnly))
          ? 'type'
          : 'runtime',
      );
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      record(node.moduleSpecifier.text, node.isTypeOnly ? 'type' : 'runtime');
    else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    )
      record(node.argument.literal.text, 'type');
    ts.forEachChild(node, visit);
  }
  visit(ast);
  records.set(file, {
    local: file,
    sha256: createHash('sha256').update(text).digest('hex'),
    imports,
  });
}
const output = {
  pin: '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c',
  ordinaryDeclarationCredit: 0,
  status: 'actual-used-runtime-and-type-closure',
  entries,
  sourceRecords: [
    '../field-form/source-correspondence.json',
    '../boolean-controls/source-correspondence.json',
    '../radio/source-correspondence.json',
    '../rendering/source-graph.json',
    '../shared-utils/source-graph.json',
  ],
  records: [...records.values()].sort((a, b) => a.local.localeCompare(b.local)),
};
writeFileSync(
  root + '/parity/remote-form-api/local-graph.json',
  JSON.stringify(output, null, 2) + '\n',
);
console.log(`${records.size} actual used runtime/type modules`);
