// Bounded exact Source-body proof; excludes framework wrappers and grants no parity credit.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const ts = createRequire(resolve(root, 'packages/base/package.json'))('typescript');
const upstream = resolve(process.argv[2] ?? '/workspace/direction-provider-upstream');
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const hash = (text) => createHash('sha256').update(text).digest('hex');
const printer = ts.createPrinter({ removeComments: true });
const semanticFlags =
  ts.NodeFlags.Let |
  ts.NodeFlags.Const |
  ts.NodeFlags.Using |
  ts.NodeFlags.AwaitUsing |
  ts.NodeFlags.Namespace |
  ts.NodeFlags.NestedNamespace |
  ts.NodeFlags.GlobalAugmentation |
  ts.NodeFlags.OptionalChain;
function bodyShape(node, tree) {
  const result = { kind: ts.SyntaxKind[node.kind] };
  if (node.flags & semanticFlags) result.flags = node.flags & semanticFlags;
  for (const key of ['text', 'rawText', 'isTypeOnly', 'operator', 'isExportEquals', 'isPostfix'])
    if (key in node) result[key] = node[key];
  if (ts.isTemplateLiteralToken(node)) result.rawTemplate = node.getText(tree);
  const children = [];
  ts.forEachChild(node, (child) => {
    children.push(bodyShape(child, tree));
  });
  if (children.length) result.children = children;
  return result;
}
function parseBody(path, text) {
  const tree = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  assert.equal(tree.parseDiagnostics.length, 0, `${path}: valid parsed syntax required`);
  return tree;
}
function controlShape(text) {
  const tree = parseBody('control.ts', text);
  return tree.statements.map((node) => bodyShape(node, tree));
}
const negativeControls = [
  ['directive boundary', 'function f(){"use strict";}', 'function f(){("use strict");}'],
  ['arithmetic precedence', 'function f(){return a + b * c;}', 'function f(){return (a + b) * c;}'],
  [
    'optional chain call boundary',
    'function f(){return o?.method();}',
    'function f(){return (o?.method)();}',
  ],
  ['declaration kind', 'function f(){let value = 1;}', 'function f(){const value = 1;}'],
  ['literal value', 'function f(){return "a  b";}', 'function f(){return "a b";}'],
  [
    'raw template spelling',
    'function f(){return `first\\nsecond`;}',
    'function f(){return `first\nsecond`;}',
  ],
  ['type', 'function f(value: string){return value;}', 'function f(value: number){return value;}'],
  ['modifier', 'class C { method() {} }', 'class C { static method() {} }'],
];
for (const [name, before, after] of negativeControls)
  assert.notDeepEqual(controlShape(before), controlShape(after), `${name}: mutation must fail`);
assert.throws(() => parseBody('invalid.ts', 'const = ;'), /valid parsed syntax required/);
const cases = [
  ['useAnimationFrame', ['Scheduler', 'resetAnimationFrameScheduler', 'AnimationFrame']],
  ['owner', ['ownerDocument']],
  ['formatNumber', ['getFormatter', 'formatNumber']],
  ['stringifyLocale', ['stringifyLocale']],
];
const framework = JSON.parse(
  readFileSync(resolve(root, 'parity/utils-package/native-framework-status.json'), 'utf8'),
);
if (
  !framework.sourceSuccessors?.some(
    (record) =>
      record.from === 'packages/utils/src/lib/useAnimationFrame.ts' &&
      record.currentOwners?.includes('packages/utils/src/lib/useAnimationFrame.ts'),
  )
)
  throw new Error('Class-only frame proof requires an explicit native factory successor record.');
const records = [];
for (const [module, names] of cases) {
  const originalPath = `packages/utils/src/${module}.ts`;
  const localPath = `packages/utils/src/lib/${module}.ts`;
  const original = execFileSync('git', ['-C', upstream, 'show', `${pin}:${originalPath}`], {
    encoding: 'utf8',
  });
  const local = readFileSync(resolve(root, localPath), 'utf8');
  // The only permitted business-token substitution is the browser-safe development flag.
  const originalAst = parseBody(
    originalPath,
    original.replace("process.env.NODE_ENV !== 'production'", 'DEV'),
  );
  const localAst = parseBody(localPath, local);
  for (const name of names) {
    const sourceNode = originalAst.statements.find((node) => node.name?.text === name);
    const localNode = localAst.statements.find((node) => node.name?.text === name);
    if (!sourceNode || !localNode) throw new Error(`Missing full Source body ${module}:${name}`);
    const sourcePrint = printer.printNode(ts.EmitHint.Unspecified, sourceNode, originalAst);
    const localPrint = printer.printNode(ts.EmitHint.Unspecified, localNode, localAst);
    const sourceShape = bodyShape(sourceNode, originalAst);
    assert.deepEqual(
      bodyShape(localNode, localAst),
      sourceShape,
      `Business body differs from immutable Source: ${module}:${name}`,
    );
    records.push({
      source: originalPath,
      local: localPath,
      symbol: name,
      sourceFileSha256: hash(original),
      localFileSha256: hash(local),
      sourceBodySha256: hash(sourceNode.getText(originalAst)),
      localBodySha256: hash(localNode.getText(localAst)),
      comparableAstSha256: hash(JSON.stringify(sourceShape)),
      printedBodyEqual: sourcePrint === localPrint,
      equal: true,
    });
  }
  if (
    module === 'owner' &&
    !/export\s*\{\s*getWindow\s+as\s+ownerWindow\s*\}\s*from\s*['"]@floating-ui\/utils\/dom['"]/.test(
      local,
    )
  )
    throw new Error('ownerWindow must reexport the actual Source dependency.');
}
const output = {
  immutableOriginalPin: pin,
  ordinaryDeclarationCredit: 0,
  method:
    'Full named declaration structural TypeScript AST comparison preserves every statement, branch, identifier, literal/raw template, operator, grouping tree, type, modifier, optional-chain/declaration flag, callback, cancellation and normalization body. Only positions, comments and formatting line breaks are excluded; the literal Source process.env development expression is replaced only by esm-env DEV. Parse diagnostics fail the proof. Removed setup factories are mapped separately to native class/lifecycle owners. Printed-body equality remains separately reported.',
  historicalProof: 'parity/native-framework/historical/utils-body-fidelity-pre-native.json',
  negativeControls: negativeControls.map(([name]) => ({ name, rejected: true })),
  parseDiagnosticControl: 'invalid syntax rejected',
  records,
  scope:
    'Bounded Scheduler/reset/AnimationFrame/owner/format/locale equality only; not full moved-closure or feature acceptance.',
};
writeFileSync(
  resolve(root, 'parity/utils-package/body-fidelity.json'),
  JSON.stringify(output, null, 2) + '\n',
);
console.log(`${records.length} complete pinned declarations retain exact comparable AST bodies.`);
