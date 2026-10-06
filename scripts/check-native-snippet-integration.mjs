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
const nativeIntegrationParent = '96ade5322d396211cc41609f244803e92dfe0169';
const cleanupPredecessor = 'e5e26961c52d324eb9075fcbff71915f79f7e922';
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
const catalog = JSON.parse(readFileSync(resolve(root, 'parity/catalog.json'), 'utf8'));
const rootEntry = graph.native.modules.find(
  (module) => module.path === 'packages/base/src/lib/index.ts',
);
assert(rootEntry);
assert.equal(hash(readFileSync(resolve(root, rootEntry.path))), rootEntry.sha256);
const sourceApi = {
  scope:
    'Actual package exports and root export AST edges only. Historical catalog module/assertion status is preserved separately; exported source does not establish complete component, type, runtime or parity acceptance.',
  baseManifestSha256: hash(readFileSync(resolve(root, 'packages/base/package.json'))),
  utilsManifestSha256: hash(readFileSync(resolve(root, 'packages/utils/package.json'))),
  rootEntry: { path: rootEntry.path, sha256: rootEntry.sha256 },
  historicalCatalog: {
    path: 'parity/catalog.json',
    sha256: hash(readFileSync(resolve(root, 'parity/catalog.json'))),
    immutableOriginalPin: catalog.upstream.commit,
  },
  originalModuleCorrespondence: catalog.modules.map((module) => {
    const subpath = `./${module.upstreamModule}`;
    const rootExports = rootEntry.imports.filter(
      (edge) => edge.kind === 'runtime' && edge.specifier.startsWith(`${subpath}/`),
    );
    return {
      originalModule: module.upstreamModule,
      currentPackageSubpath: subpath in exports ? subpath : null,
      rootExports,
      currentSourceApiStatus:
        module.upstreamModule === 'use-render'
          ? 'Explicitly retired under the native snippet directive; Original history retained.'
          : subpath in exports || rootExports.length
            ? 'Source export present; broader component acceptance remains separately pending.'
            : 'No current package/root Source export.',
    };
  }),
};
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
  const labelPublicationCorrection =
    path === 'packages/base/src/lib/utils/useRegisteredLabelId.svelte.ts';
  const installedLabelCorrection = path === 'packages/base/src/lib/menu/GroupLabel.svelte';
  const installedTreeCorrection = [
    'packages/base/src/lib/menu/positioner/createMenuPositioner.svelte.ts',
    'packages/base/src/lib/menu/Popup.svelte',
  ].includes(path);
  if (installedLabelCorrection || installedTreeCorrection) {
    let expected = git('show', `${cleanupPredecessor}:${path}`);
    if (installedLabelCorrection) {
      expected = expected
        .replace('    setLabelId(id);', '    const installedId = id;\n    setLabelId(installedId);')
        .replace('currentId === id ?', 'currentId === installedId ?');
    } else {
      const subscriptions = path.endsWith('Popup.svelte')
        ? [['close', 'handleClose']]
        : [
            ['menuopenchange', 'onMenuOpenChange'],
            ['menuopenchange', 'onParentClose'],
            ['itemhover', 'onItemHover'],
          ];
      for (const [event, callback] of subscriptions)
        expected = expected
          .replace(
            `    floatingTreeRoot.events.on('${event}', ${callback});`,
            `    const installedEvents = floatingTreeRoot.events;\n    installedEvents.on('${event}', ${callback});`,
          )
          .replace(
            `      floatingTreeRoot.events.off('${event}', ${callback});`,
            `      installedEvents.off('${event}', ${callback});`,
          );
    }
    assert.equal(after, expected, `Only the authorized complete-body cleanup delta: ${path}`);
  }
  if (semanticOwnerCorrection)
    assert.equal(
      after,
      git('show', `${native}:${path}`),
      'Inherit the exact minimal native owner correction',
    );
  if (labelPublicationCorrection)
    assert.equal(
      after,
      git('show', `${nativeIntegrationParent}:${path}`),
      'Inherit the exact narrow native registered-label publication correction',
    );
  const record = {
    path,
    rendererSha256: hash(before),
    currentSha256: hash(after),
    scriptStructuralAstEqual: equal,
    sourceSyntaxValid: true,
    disposition: installedLabelCorrection
      ? 'Root-authorized effect-local installed label ID capture, preserving conditional replacement-label protection; actual DOM witnesses unexecuted.'
      : installedTreeCorrection
        ? 'Root-authorized effect-local installed event bus captures; complete callbacks, live business reads and domain guards retained; actual owner migration/unmount witnesses unexecuted.'
        : labelPublicationCorrection
          ? 'Exact native76 tracked installed ID with narrow untracked imperative receiver publication; live receiver and conditional cleanup retained. Integrated-head execution pending.'
          : semanticOwnerCorrection
            ? 'Exact native76 ordinary tracked getter correction; integrated execution/review pending.'
            : equal
              ? 'Complete structural script AST retained; full native markup/compiled-output behavior remains separately pending.'
              : 'Explicit presentation/grouping changes retained without normalization or structural equality credit; compiled-output disposition pending.',
  };
  if (
    semanticOwnerCorrection ||
    labelPublicationCorrection ||
    installedLabelCorrection ||
    installedTreeCorrection
  )
    record.sourceBusinessCorrection = true;
  if (installedLabelCorrection || installedTreeCorrection) {
    record.sourceBusinessPredecessor = cleanupPredecessor;
    record.sourceBusinessPredecessorSha256 = hash(git('show', `${cleanupPredecessor}:${path}`));
    record.exactAuthorizedCompleteBodyDelta = true;
  }
  if (labelPublicationCorrection) {
    record.sourceBusinessPredecessor = '6ec6710c1ec6d62a7b9decf3dfdaa335a76d3ce7';
    record.sourceBusinessPredecessorSha256 = hash(
      git('show', `${record.sourceBusinessPredecessor}:${path}`),
    );
    record.exactInheritedNativeParentBody = nativeIntegrationParent;
  }
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
  nativeIntegrationParent,
  nativeGetterPredecessor: native,
  immutableOriginalPin: graph.immutableOriginalPin,
  ordinaryDeclarationCredit: 0,
  mode: 'Source/parser/hash/import evidence only; no type program, runtime, SSR/hydration, compiled markup, artifact, installed consumer, browser, CI or merge acceptance credit.',
  method:
    'Complete current native two-package AST closure, immutable f0 full-body preimages and grouping-preserving script ASTs. Deliberate PreviousValue, registered-label publication and captured Menu label/event-bus cleanup corrections are separate from formatter presentation changes. Getter and publication retain their exact inherited bodies; exact complete-body Menu cleanup deltas are checked against e5. Parse success supplies no behavior equivalence.',
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
  sourceBusinessCorrectionPaths: records
    .filter((record) => record.sourceBusinessCorrection)
    .map((record) => record.path),
  utilsExports: Object.keys(graph.utilsExports),
  baseExports: exports,
  sourceApi,
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
