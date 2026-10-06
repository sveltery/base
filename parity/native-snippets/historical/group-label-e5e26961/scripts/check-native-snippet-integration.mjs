// Complete current source comparison; grants no runtime, declaration or compiled-markup credit.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const require = createRequire(new URL('../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const compiler = require('svelte/compiler');
const renderer = 'f0dbb89a05f032af1e9aac99461c6eccfa09e0d9';
const native = '168c2717da1834fe728d76a4aeb94cb81b9b8a1f';
const hash = (body) => createHash('sha256').update(body).digest('hex');
const git = (...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const graph = JSON.parse(
  readFileSync(resolve(root, 'parity/utils-package/current-source-graph.json'), 'utf8'),
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
function syntax(path, body) {
  const code = path.endsWith('.svelte')
    ? [...body.matchAll(/<script\b(?:[^>"']|"[^"]*"|'[^']*')*>([\s\S]*?)<\/script>/g)]
        .map((match) => match[1])
        .join('\n')
    : body;
  const tree = ts.createSourceFile(path, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  assert.equal(tree.parseDiagnostics.length, 0, `Invalid source syntax: ${path}`);
  if (path.endsWith('.svelte')) compiler.parse(body, { modern: true });
  return tree;
}
function differences(before, after, beforeTree, afterTree, path = 'source') {
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
  const left = [],
    right = [];
  ts.forEachChild(before, (child) => {
    left.push(child);
  });
  ts.forEachChild(after, (child) => {
    right.push(child);
  });
  if (left.length !== right.length)
    return [{ path, before: before.getText(beforeTree), after: after.getText(afterTree) }];
  return left.flatMap((child, index) =>
    differences(
      child,
      right[index],
      beforeTree,
      afterTree,
      `${path}.${ts.SyntaxKind[child.kind]}[${index}]`,
    ),
  );
}
const retired = [
  'packages/base/src/lib/dialog/Element.svelte',
  'packages/base/src/lib/internals/RenderElement.svelte',
  'packages/base/src/lib/internals/field-register-control/useFieldControlRegistration.svelte.ts',
  'packages/base/src/lib/internals/nativeRefAttachment.ts',
  'packages/base/src/lib/internals/useRenderElement.ts',
  'packages/base/src/lib/toast/native-button.ts',
  'packages/base/src/lib/use-render/RenderElement.svelte',
  'packages/base/src/lib/use-render/UseRender.svelte',
  'packages/base/src/lib/use-render/index.ts',
  'packages/base/src/lib/use-render/types.ts',
  'packages/utils/src/lib/useMergedRefs.ts',
];
for (const path of retired)
  assert(!existsSync(resolve(root, path)), `Retired module restored: ${path}`);
const exports = JSON.parse(
  readFileSync(resolve(root, 'packages/base/package.json'), 'utf8'),
).exports;
assert(!('./use-render' in exports));
assert(!('./useMergedRefs' in graph.utilsExports));
assert.equal(graph.native.modules.length, 496);
assert.equal(Object.keys(graph.utilsExports).length, 25);
const records = [];
let effectCalls = 0,
  controlledOwners = 0;
for (const module of graph.native.modules) {
  const path = module.path;
  const before = git('show', `${renderer}:${path}`);
  const after = readFileSync(resolve(root, path), 'utf8');
  assert.equal(hash(after), module.sha256, `Stale actual current graph: ${path}`);
  assert(
    !/\b(?:UseRender|createRenderElement|isNativeRefAttachment|preserveUnchangedInlineStyles)\b|<RenderElement\b/.test(
      after,
    ),
    `Retired runtime transport: ${path}`,
  );
  const left = syntax(path, before),
    right = syntax(path, after);
  const equal = JSON.stringify(shape(left, left)) === JSON.stringify(shape(right, right));
  const semanticOwnerCorrection = path === 'packages/utils/src/lib/PreviousValue.svelte.ts';
  if (semanticOwnerCorrection)
    assert.equal(
      after,
      git('show', `${native}:${path}`),
      'Inherit the exact minimal native owner correction',
    );
  const record = {
    path,
    rendererSha256: hash(before),
    currentSha256: hash(after),
    scriptStructuralAstEqual: equal,
    sourceSyntaxValid: true,
    disposition: semanticOwnerCorrection
      ? 'Exact native76 ordinary tracked getter correction; integrated execution/review pending.'
      : equal
        ? 'Complete structural script AST retained; full native markup/compiled-output behavior remains separately pending.'
        : 'Explicit presentation/grouping changes retained without normalization or structural equality credit; compiled-output disposition pending.',
  };
  if (!equal) record.structuralDifferences = differences(left, right, left, right);
  records.push(record);
  function count(node) {
    if (
      ts.isCallExpression(node) &&
      ['$effect', '$effect.pre'].includes(node.expression.getText(right))
    )
      effectCalls++;
    if (ts.isNewExpression(node) && node.expression.getText(right) === 'Controlled')
      controlledOwners++;
    ts.forEachChild(node, count);
  }
  count(right);
}
const preimages = JSON.parse(
  readFileSync(resolve(root, 'parity/native-snippets/integration-predecessors.json'), 'utf8'),
);
for (const checkpoint of preimages.checkpoints)
  for (const file of checkpoint.files) {
    const body = readFileSync(resolve(root, file.archive));
    assert.equal(hash(body), file.sha256, `Changed exact predecessor archive: ${file.archive}`);
    assert.equal(
      body.toString(),
      git('show', `${checkpoint.commit}:${file.predecessorPath}`),
      `Archive differs from immutable object: ${file.archive}`,
    );
  }
const output = {
  rendererPredecessor: renderer,
  nativeIntegrationParent: native,
  immutableOriginalPin: graph.immutableOriginalPin,
  ordinaryDeclarationCredit: 0,
  mode: 'Source/parser/hash/import evidence only; no type program, runtime, SSR/hydration, compiled markup, artifact, installed consumer, browser, CI or merge acceptance credit.',
  method:
    'Complete current native two-package AST closure, immutable f0 full-body preimages and grouping-preserving script ASTs. Deliberate PreviousValue correction is separate from formatter presentation changes; parse success supplies no behavior equivalence.',
  parserVersions: { TypeScript: ts.version, Svelte: compiler.VERSION },
  currentGraphSha256: hash(
    readFileSync(resolve(root, 'parity/utils-package/current-source-graph.json')),
  ),
  currentPublicHostGraphSha256: hash(
    readFileSync(resolve(root, 'parity/native-snippets/native-graph.json')),
  ),
  proofToolSha256: hash(readFileSync(new URL(import.meta.url))),
  controlledOwners,
  effectCalls,
  utilsExports: Object.keys(graph.utilsExports),
  retired,
  records,
};
const destination = resolve(root, 'parity/native-snippets/integration-current.json');
const text = JSON.stringify(output, null, 2) + '\n';
if (process.argv.includes('--write')) writeFileSync(destination, text);
else
  assert.equal(
    readFileSync(destination, 'utf8'),
    text,
    'Actual native snippet integration proof is stale',
  );
console.log(
  `Native snippet source proof: ${records.length} complete current bodies; ${controlledOwners} Controlled owners; ${effectCalls} actual effect calls; ${records.filter((record) => !record.scriptStructuralAstEqual).length} explicit script changes; 25 Utils exports; eleven retirements.`,
);
