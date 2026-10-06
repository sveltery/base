// Read-only native source comparison; compiled markup/runtime evidence is a separate final gate.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const require = createRequire(resolve(root, 'packages/base/package.json'));
const ts = require('typescript');
const compiler = require('svelte/compiler');
const currentReceipt = resolve(root, 'parity/native-framework/integration-formatting.json');
const input = JSON.parse(
  readFileSync(
    existsSync(currentReceipt)
      ? currentReceipt
      : resolve(root, '.checks/native-integration/formatting-candidates.json'),
    'utf8',
  ),
);
const hash = (text) => createHash('sha256').update(text).digest('hex');
const semanticPolicyPath = resolve(root, 'parity/native-framework/native-policy.json');
const semanticSources = new Map(
  existsSync(semanticPolicyPath)
    ? JSON.parse(readFileSync(semanticPolicyPath, 'utf8')).semanticSources.map((record) => [
        record.path,
        record,
      ])
    : [],
);
const flags =
  ts.NodeFlags.Let |
  ts.NodeFlags.Const |
  ts.NodeFlags.Using |
  ts.NodeFlags.AwaitUsing |
  ts.NodeFlags.Namespace |
  ts.NodeFlags.NestedNamespace |
  ts.NodeFlags.GlobalAugmentation |
  ts.NodeFlags.OptionalChain;
function shape(node, tree) {
  const result = { kind: ts.SyntaxKind[node.kind] };
  if (node.flags & flags) result.flags = node.flags & flags;
  for (const key of ['text', 'rawText', 'isTypeOnly', 'operator', 'isExportEquals', 'isPostfix'])
    if (key in node && !ts.isSourceFile(node)) result[key] = node[key];
  if (ts.isTemplateLiteralToken(node)) result.rawTemplate = node.getText(tree);
  const children = [];
  ts.forEachChild(node, (child) => {
    children.push(shape(child, tree));
  });
  if (children.length) result.children = children;
  return result;
}
function ast(file, text) {
  const code = file.endsWith('.svelte')
    ? [...text.matchAll(/<script\b(?:[^>"']|"[^"]*"|'[^']*')*>([\s\S]*?)<\/script>/g)]
        .map((match) => match[1])
        .join('\n')
    : text;
  const tree = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  assert.equal(tree.parseDiagnostics.length, 0, file);
  return tree;
}
function describeDifferences(before, after, beforeTree, afterTree, path = 'source') {
  if (before.kind !== after.kind)
    return [
      {
        path,
        beforeKind: ts.SyntaxKind[before.kind],
        afterKind: ts.SyntaxKind[after.kind],
        before: before.getText(beforeTree),
        after: after.getText(afterTree),
      },
    ];
  const beforeChildren = [];
  const afterChildren = [];
  ts.forEachChild(before, (child) => {
    beforeChildren.push(child);
  });
  ts.forEachChild(after, (child) => {
    afterChildren.push(child);
  });
  if (beforeChildren.length !== afterChildren.length)
    return [
      {
        path,
        before: before.getText(beforeTree),
        after: after.getText(afterTree),
      },
    ];
  return beforeChildren.flatMap((child, index) =>
    describeDifferences(
      child,
      afterChildren[index],
      beforeTree,
      afterTree,
      `${path}.${ts.SyntaxKind[child.kind]}[${index}]`,
    ),
  );
}
let effects = 0;
let controlled = 0;
const mismatches = [];
for (const record of input.files) {
  const before = execFileSync('git', ['show', `${input.baseline}:${record.path}`], {
    cwd: root,
    encoding: 'utf8',
  });
  const after = readFileSync(resolve(root, record.path), 'utf8');
  const original = ast(record.path, before);
  const current = ast(record.path, after);
  let equal = true;
  try {
    assert.deepEqual(shape(original, original), shape(current, current));
  } catch {
    equal = false;
    mismatches.push(record.path);
  }
  record.actualSuccessorSha256 = hash(after);
  const semanticSource = semanticSources.get(record.path);
  if (semanticSource) {
    assert.equal(record.actualSuccessorSha256, semanticSource.currentSha256);
    assert.equal(
      hash(readFileSync(resolve(root, semanticSource.predecessorArchive))),
      semanticSource.predecessorSha256,
    );
    record.semanticSuccessor = semanticSource;
  }
  record.scriptStructuralAstEqual = equal;
  if (!equal)
    record.structuralDifferences = describeDifferences(original, current, original, current);
  if (record.path.endsWith('.svelte')) {
    compiler.parse(before, { modern: true });
    compiler.parse(after, { modern: true });
    record.svelteParseValid = true;
  }
  if (record.path.includes('/src/lib/')) {
    function visit(node) {
      if (
        ts.isCallExpression(node) &&
        ['$effect', '$effect.pre'].includes(node.expression.getText(current))
      )
        effects++;
      if (ts.isNewExpression(node) && node.expression.getText(current) === 'Controlled')
        controlled++;
      ts.forEachChild(node, visit);
    }
    visit(current);
  }
}
input.method =
  'Exact immutable native predecessor bodies were formatted to a deterministic fixed point; actual successor hashes bind inherited ESLint-comment placement and separately recorded native semantic successors. Semantic successors receive no formatter equality credit. Full structural script AST retains grouping, declaration/optional-chain flags, operators, literal/raw templates, types and modifiers. Svelte syntax parses before/after. Initial compiled client/server formatting semantics are a separate checkpoint comparison.';
input.mode =
  'Source/parser/formatter evidence only; no execution, compiled-output or acceptance credit';
input.parserVersions = { TypeScript: ts.version, Svelte: compiler.VERSION };
input.effects = effects;
input.controlledOwners = controlled;
input.scriptAstMismatches = mismatches;
input.structuralDifferenceDisposition =
  'Explicit formatter-produced grouping changes and separately annotated native semantic successors are retained above without normalization or equality credit. Independent Source/maintainability disposition and actual compiled client/server formatting proof remain pending.';
input.proofToolSha256 = hash(readFileSync(new URL(import.meta.url)));
assert.equal(controlled, 11);
assert.equal(effects, 150);
writeFileSync(
  resolve(root, 'parity/native-framework/integration-formatting.json'),
  JSON.stringify(input, null, 2) + '\n',
);
console.log(
  `Native source comparison: ${controlled} Controlled owners, ${effects} effects; structural script mismatches: ${JSON.stringify(mismatches)}`,
);
