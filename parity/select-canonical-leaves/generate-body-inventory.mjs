// Evidence-only syntax inventory. It never grants a whole-read/review decision.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const directory = fileURLToPath(new URL('./', import.meta.url));
const root = resolve(directory, '../..');
const hash = body => createHash('sha256').update(body).digest('hex');
function scriptBody(raw, path) {
  if (!path.endsWith('.svelte')) return raw;
  const characters = [...raw].map(character => character === '\n' ? '\n' : ' ');
  for (const match of raw.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
    const offset = match.index + match[0].indexOf('>') + 1;
    for (let index = 0; index < match[1].length; index++) characters[offset + index] = match[1][index];
  }
  return characters.join('');
}
function inventory(path, checkout, expected) {
  const raw = readFileSync(resolve(checkout, path), 'utf8');
  if (hash(raw) !== expected) throw new Error(`Stale graph: ${path}`);
  const ast = ts.createSourceFile(path, scriptBody(raw, path), ts.ScriptTarget.Latest, true, path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const functions = [];
  const imports = [];
  const line = position => ast.getLineAndCharacterOfPosition(position).line + 1;
  function name(node) { return node.name?.getText(ast) ?? (ts.isVariableDeclaration(node.parent) ? node.parent.name.getText(ast) : `<anonymous:${line(node.getStart(ast))}>`); }
  function visit(node) {
    if (ts.isFunctionLike(node) && node.body) {
      functions.push({ name: name(node), startLine: line(node.getStart(ast)), endLine: line(node.end - 1), bodySha256: hash(node.body.getText(ast)) });
    }
    if (ts.isImportDeclaration(node)) {
      const localNames = [];
      if (node.importClause?.name) localNames.push(node.importClause.name.text);
      const bindings = node.importClause?.namedBindings;
      if (bindings && ts.isNamespaceImport(bindings)) localNames.push(bindings.name.text);
      if (bindings && ts.isNamedImports(bindings)) localNames.push(...bindings.elements.map(element => element.name.text));
      const references = [];
      function referencesIn(candidate) {
        if (ts.isImportDeclaration(candidate)) return;
        if (ts.isIdentifier(candidate) && localNames.includes(candidate.text)) {
          let parent = candidate.parent;
          let typeOnlyUse = false;
          while (parent && !ts.isFunctionLike(parent)) { if (ts.isTypeNode(parent)) typeOnlyUse = true; parent = parent.parent; }
          references.push({ local: candidate.text, line: line(candidate.getStart(ast)), caller: parent ? name(parent) : '<module/type>', typeOnlyUse });
        }
        ts.forEachChild(candidate, referencesIn);
      }
      referencesIn(ast);
      imports.push({ specifier: node.moduleSpecifier.text, line: line(node.getStart(ast)), references });
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return { path, sha256: expected, functions, imports };
}
const original = JSON.parse(readFileSync(resolve(directory, 'original-graph.json'), 'utf8'));
const native = JSON.parse(readFileSync(resolve(directory, process.argv[2] ?? 'native-graph.json'), 'utf8'));
writeFileSync(resolve(directory, process.argv[3] ?? 'body-inventory.json'), JSON.stringify({
  method: 'TypeScript syntax function ranges/body hashes and actual imported-identifier use/callers; Svelte script offsets preserved. Scope/semantic review remains in individual receipts/correspondence.',
  ordinaryDeclarationCredit: 0,
  original: original.modules.map(module => inventory(module.path, resolve(directory, 'upstream'), module.sha256)),
  native: native.modules.map(module => inventory(module.path, root, module.sha256)),
}, null, 2) + '\n');
