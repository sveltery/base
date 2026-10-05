// Verify complete Original render expressions used by actual paired part fixtures; MIT.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { createRequire } from 'node:module';
const directory = import.meta.dirname;
const root = path.resolve(directory, '../..');
const ts = createRequire(path.join(root, 'packages/base/package.json'))('typescript');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const recordPath = path.join(directory, 'parts-fixture-correspondence.json');
const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
const inventory = JSON.parse(fs.readFileSync(path.join(directory, 'original-assertions.json'), 'utf8'));
if (record.pin !== inventory.pin) throw new Error('Part fixture Source pin mismatch');
const archive = gunzipSync(fs.readFileSync(path.join(directory, 'original-source.tar.gz')));
const files = new Map();
for (let offset = 0; offset < archive.length;) {
  const name = archive.subarray(offset, offset + 100).toString().replace(/\0.*$/, '');
  const size = parseInt(archive.subarray(offset + 124, offset + 136).toString().replace(/\0.*$/, '').trim(), 8) || 0;
  files.set(name.replace(/^\.\//, ''), archive.subarray(offset + 512, offset + 512 + size).toString());
  offset += 512 + Math.ceil(size / 512) * 512;
}
const reference = 'apps/fixtures/src/lib/navigation-menu-parts-source-original.tsx';
const native = 'apps/fixtures/src/lib/NavigationMenuPartsSourceFixture.svelte';
const body = fs.readFileSync(path.join(root, reference), 'utf8');
const ast = ts.createSourceFile(reference, body, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const candidates = new Map();
function visitNative(node) {
  if (ts.isCaseClause(node) && ts.isStringLiteralLike(node.expression)) {
    const statement = node.statements.find(statement => ts.isReturnStatement(statement));
    const expression = statement?.expression;
    if (expression && ts.isParenthesizedExpression(expression)) candidates.set(node.expression.text, expression.expression.getText(ast));
  }
  ts.forEachChild(node, visitNative);
}
visitNative(ast);
for (const selected of record.originalExpressions) {
  const body = files.get(selected.source);
  const authority = inventory.files.find(file => file.source === selected.source);
  if (!body || hash(body) !== selected.sourceSha256 || selected.sourceSha256 !== authority?.sha256) throw new Error(`Changed part Source authority ${selected.source}`);
  const sourceAst = ts.createSourceFile(selected.source, body, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let expression;
  function visit(node) {
    if (ts.isCallExpression(node) && sourceAst.getLineAndCharacterOfPosition(node.getStart(sourceAst)).line + 1 === selected.line && node.expression.getText(sourceAst).startsWith('it')) {
      function select(node) {
        if (ts.isCallExpression(node) && ['render', 'renderToString'].includes(node.expression.getText(sourceAst)) && node.arguments[0] && ts.isJsxElement(node.arguments[0]) && !expression) expression = node.arguments[0].getText(sourceAst);
        ts.forEachChild(node, select);
      }
      select(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceAst);
  if (!expression || hash(expression) !== selected.expressionSha256 || candidates.get(selected.scenario) !== expression) throw new Error(`Changed complete Original render expression ${selected.scenario}`);
}
for (const selected of record.originalFunctions ?? []) {
  const sourceBody = files.get(selected.source);
  if (!sourceBody || hash(sourceBody) !== selected.sourceSha256) throw new Error(`Changed helper fixture Source authority ${selected.source}`);
  const sourceAst = ts.createSourceFile(selected.source, sourceBody, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let original;
  let referenceFunction;
  function findSource(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === selected.name && sourceAst.getLineAndCharacterOfPosition(node.getStart(sourceAst)).line + 1 === selected.line) original = node.getText(sourceAst);
    ts.forEachChild(node, findSource);
  }
  function findReference(node) {
    if (!selected.wrapper && ts.isFunctionDeclaration(node) && node.name?.text === selected.name) {
      referenceFunction = node.getText(ast);
    } else if (selected.wrapper && ts.isVariableDeclaration(node) && node.name.getText(ast) === selected.wrapper) {
      // A Source describe callback owns its App type once. Require module-level
      // initialization, rather than allowing a component render to recreate it.
      const statement = node.parent?.parent;
      const call = node.initializer;
      const factory = call && ts.isCallExpression(call) && !call.arguments.length && ts.isParenthesizedExpression(call.expression) ? call.expression.expression : undefined;
      if (!statement || !ts.isVariableStatement(statement) || !ts.isSourceFile(statement.parent) || !(node.parent.flags & ts.NodeFlags.Const) || !factory || !ts.isArrowFunction(factory) || factory.parameters.length || !ts.isBlock(factory.body)) throw new Error(`App fixture must retain Source describe-owned scope ${selected.wrapper}`);
      const statements = factory.body.statements;
      const declaration = statements[0];
      const returned = statements[1];
      if (statements.length !== 2 || !ts.isFunctionDeclaration(declaration) || declaration.name?.text !== selected.name || !ts.isReturnStatement(returned) || returned.expression?.getText(ast) !== selected.name) throw new Error(`Unexpected App fixture scope ${selected.wrapper}`);
      referenceFunction = declaration.getText(ast);
    }
    ts.forEachChild(node, findReference);
  }
  findSource(sourceAst);
  findReference(ast);
  if (!original || hash(original) !== selected.sha256 || original !== referenceFunction) throw new Error(`Changed complete Original helper fixture ${selected.name}:${selected.line}`);
}
record.reference = reference;
record.referenceSha256 = hash(body);
record.native = native;
record.nativeSha256 = hash(fs.readFileSync(path.join(root, native)));
fs.writeFileSync(recordPath, JSON.stringify(record, null, 2) + '\n');
console.log(`${record.originalExpressions.length} complete Original part render expressions and ${record.originalFunctions?.length ?? 0} helper fixtures verified; ordinary credit remains zero`);
