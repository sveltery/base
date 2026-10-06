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
const focusPredecessor = '42c04c5c4fb1d8a698435fee40e1d2bcb41d30e7';
const registrationPredecessor = 'f2a99979a04a98c8bc60709a75d0db2397ec2470';
const ownershipCommentPredecessor = '336062b3be2dfe90db5899714aed6457f78836ae';
const nativeOwnerPredecessor = 'c39271eaf4f893fc64131b22209dee50e74de657';
const bindingCommentPredecessor = '0d88a4e3fcb0ce57dab9b058b86a85e412f9d07c';
const initialFocusPredecessor = 'ec36fc9cc5a8819260c2c6635e0a128acd563d4a';
const popoverSlotPredecessor = '0ba754026de455a9647c32dde29b024924150cc2';
const popoverSlotRuntime = 'packages/base/src/lib/popover/store/PopoverStore.svelte.ts';
function reactivePopoverFocusTarget(body) {
  return body
    .replace(
      '    const triggerElements = new PopupTriggerMap();\n    super(',
      '    const triggerElements = new PopupTriggerMap();\n' +
        '    const triggerFocusTargetRef = $state<{ current: HTMLElement | null }>({ current: null });\n    super(',
    )
    .replace(
      '      createInitialContext(triggerElements),',
      '      createInitialContext(triggerElements, triggerFocusTargetRef),',
    )
    .replace(
      'function createInitialContext(triggerElements: PopupTriggerMap): Context {',
      "function createInitialContext(\n  triggerElements: PopupTriggerMap,\n  triggerFocusTargetRef: Context['triggerFocusTargetRef'] = { current: null },\n): Context {",
    )
    .replace('    triggerFocusTargetRef: { current: null },', '    triggerFocusTargetRef,');
}
const initialFocusRuntime =
  'packages/base/src/lib/floating-ui/components/createFloatingFocusManager.svelte.ts';
function disposeQueuedInitialFocus(body) {
  const predicate = '        shouldFocus() {\n';
  assert.equal(body.split(predicate).length, 2);
  return body
    .replace(
      predicate,
      predicate +
        '          // Avoid reading rune-backed state after this owner is destroyed.\n' +
        '          if (disposed) return false;\n',
    )
    .replace(
      '    // Wait for any layout effect state setters to execute to set `tabIndex`.',
      '    // Wait for native state updates to set `tabIndex`.',
    );
}
// Exactly the unused directive paths reported by the actual 9bdc Standards run.
const obsoleteBindingDirectivePaths = new Set([
  'packages/base/src/lib/context-menu/Trigger.svelte',
  'packages/base/src/lib/menu/Arrow.svelte',
  'packages/base/src/lib/menu/Backdrop.svelte',
  'packages/base/src/lib/menu/CheckboxItem.svelte',
  'packages/base/src/lib/menu/CheckboxItemIndicator.svelte',
  'packages/base/src/lib/menu/Item.svelte',
  'packages/base/src/lib/menu/LinkItem.svelte',
  'packages/base/src/lib/menu/Popup.svelte',
  'packages/base/src/lib/menu/Portal.svelte',
  'packages/base/src/lib/menu/RadioItem.svelte',
  'packages/base/src/lib/menu/RadioItemIndicator.svelte',
  'packages/base/src/lib/menubar/Menubar.svelte',
  'packages/base/src/lib/popover/Arrow.svelte',
  'packages/base/src/lib/popover/Backdrop.svelte',
  'packages/base/src/lib/popover/Close.svelte',
  'packages/base/src/lib/popover/Description.svelte',
  'packages/base/src/lib/popover/Popup.svelte',
  'packages/base/src/lib/popover/Positioner.svelte',
  'packages/base/src/lib/popover/Title.svelte',
  'packages/base/src/lib/popover/Trigger.svelte',
  'packages/base/src/lib/popover/Viewport.svelte',
  'packages/base/src/lib/preview-card/Arrow.svelte',
  'packages/base/src/lib/preview-card/Backdrop.svelte',
  'packages/base/src/lib/preview-card/Popup.svelte',
  'packages/base/src/lib/preview-card/Positioner.svelte',
  'packages/base/src/lib/preview-card/Trigger.svelte',
  'packages/base/src/lib/preview-card/Viewport.svelte',
  'packages/base/src/lib/tooltip/Arrow.svelte',
  'packages/base/src/lib/tooltip/Popup.svelte',
  'packages/base/src/lib/tooltip/Positioner.svelte',
  'packages/base/src/lib/tooltip/Trigger.svelte',
  'packages/base/src/lib/tooltip/Viewport.svelte',
]);
const radioBindingPath = 'packages/base/src/lib/radio-group/RadioGroup.svelte';
function bindingDirectiveHygiene(path, body) {
  if (obsoleteBindingDirectivePaths.has(path)) {
    const directive =
      /^ +\/\/ eslint-disable-next-line no-useless-assignment -- (?:Publishes native bindable host\/action outputs to the owner\.|Native bindable ref output is published through the ordered Source ref callback\.)\n/gm;
    assert.equal([...body.matchAll(directive)].length, 1);
    return body.replace(directive, '');
  }
  if (path === radioBindingPath) {
    const property = '    inputRef = $bindable(),';
    assert.equal(body.split(property).length, 2);
    return body.replace(
      property,
      '    // eslint-disable-next-line no-useless-assignment -- Svelte output binding publishes the selected input to its caller.\n' +
        property,
    );
  }
  return body;
}
const hash = (body) => createHash('sha256').update(body).digest('hex');
const git = (...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const graph = JSON.parse(
  readFileSync(resolve(root, 'parity/utils-package/current-source-graph.json'), 'utf8'),
);
function clarifyTriggerOwnership(body) {
  return body
    .replace(
      ' * Returns a stable callback ref that registers/unregisters the trigger element in the store.\n *\n' +
        ' * Stable so a downstream ref merger that retains the callback it was first given still reaches the\n' +
        " * trigger's current store. The registration is tracked as a `(store, id, element)` triple, so\n" +
        ' * unregistering targets the store the element was actually registered in.',
      ' * Registers/unregisters the native trigger host in its current Store.\n *\n' +
        ' * Each publication acquires the actual Store and ID. The captured `(store, id, element)`\n' +
        ' * registration targets its installed owner on removal, even after a Store or ID change.',
    )
    .replace(
      '  // Applies trigger-owned state (active-trigger ownership and payload) when the trigger registers.\n' +
        '  // Stable so payload/`stateUpdates` changes do not change the ref identity (which would needlessly\n' +
        '  // churn registration); it reads the latest closure values when invoked.',
      '  // Applies current trigger-owned state when its native host is published.\n' +
        '  // The imperative boundary reads the latest payload only in its business branches;\n' +
        '  // the independent data-forwarding effect below owns later reactive payload changes.',
    )
    .replace(
      "  // Stable, so the merged ref on the rendered element keeps its identity for the trigger's whole\n" +
        '  // lifetime.',
      "  // Publishes the native host's registration before its current trigger-owned data.",
    )
    .replace(
      '  // A stable ref does not re-fire on a store or id change, so migrate here instead: unregister from\n' +
        '  // the previous store, then register the element the trigger still renders into the current one.',
      '  // Store/ID changes migrate the published host independently of attachment setup:\n' +
        '  // remove its captured previous registration, then publish it in the current owner.',
    );
}
function disposeQueuedFocusOutside(body) {
  return body
    .replace(
      'export function createFloatingFocusManager(getProps: () => FloatingFocusManagerProps) {',
      'export function createFloatingFocusManager(getProps: () => FloatingFocusManagerProps) {\n' +
        '  let disposed = false;\n  onDestroy(() => {\n    disposed = true;\n  });',
    )
    .replace(
      '      queueMicrotask(() => {\n        const nodeId = getNodeId();',
      '      queueMicrotask(() => {\n        if (disposed) return;\n        const nodeId = getNodeId();',
    );
}
function reactiveNativeOwners(path, body) {
  if (path.endsWith('useTriggerFocusGuards.svelte.ts'))
    return body.replace(
      '  const preFocusGuardRef = { current: null as HTMLElement | null };',
      '  const preFocusGuardRef = $state<{ current: HTMLElement | null }>({ current: null });',
    );
  if (path.endsWith('DialogStore.svelte.ts'))
    return body
      .replace(
        '    const state = createInitialState<Payload>(initialState, triggerElements, floatingId, nested);',
        '    const state = createInitialState<Payload>(initialState, triggerElements, floatingId, nested);\n' +
          '    const internalBackdropRef = $state<{ current: HTMLDivElement | null }>({ current: null });',
      )
      .replace(
        '    super(state, createInitialContext(triggerElements), selectors);',
        '    super(state, createInitialContext(triggerElements, internalBackdropRef), selectors);',
      )
      .replace(
        'function createInitialContext(triggerElements: PopupTriggerMap): Context {',
        "function createInitialContext(\n  triggerElements: PopupTriggerMap,\n  internalBackdropRef: Context['internalBackdropRef'] = { current: null },\n): Context {",
      )
      .replace('    internalBackdropRef: { current: null },', '    internalBackdropRef,');
  if (path.endsWith('FloatingPortal.svelte')) {
    for (const name of ['beforeOutsideRef', 'afterOutsideRef'])
      body = body.replace(
        `  const ${name}: { current: HTMLSpanElement | null } = {\n    current: null,\n  };`,
        `  const ${name} = $state<{ current: HTMLSpanElement | null }>({\n    current: null,\n  });`,
      );
    return body;
  }
  return body
    .replace(
      '  store.update({ inactiveTriggerProps });',
      '  untrack(() => store.update({ inactiveTriggerProps }));',
    )
    .replace(
      "  // the synchronization effect below doesn't make every trigger render twice in the first commit.",
      "  // the synchronization effect below doesn't make every trigger render twice in the initial update.",
    );
}
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
  controlledOwners = 0,
  initialFocusAstPreservedBodies = 0,
  popoverSlotAstPreservedBodies = 0;
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
  const bindingPreimage = git('show', `${bindingCommentPredecessor}:${path}`);
  const bindingStage = bindingDirectiveHygiene(path, bindingPreimage);
  const initialPreimage = git('show', `${initialFocusPredecessor}:${path}`);
  assert.equal(bindingStage, initialPreimage, `Exact historical binding comment stage: ${path}`);
  const bindingBefore = syntax(path, bindingPreimage);
  const initialBefore = syntax(path, initialPreimage);
  assert.equal(
    JSON.stringify(shape(bindingBefore, bindingBefore)),
    JSON.stringify(shape(initialBefore, initialBefore)),
    `Historical binding comment successor AST changed: ${path}`,
  );
  const initialStage =
    path === initialFocusRuntime ? disposeQueuedInitialFocus(initialPreimage) : initialPreimage;
  const slotPreimage = git('show', `${popoverSlotPredecessor}:${path}`);
  assert.equal(initialStage, slotPreimage, `Exact historical initial-focus owner stage: ${path}`);
  const slotBefore = syntax(path, slotPreimage);
  const initialEqual =
    JSON.stringify(shape(initialBefore, initialBefore)) ===
    JSON.stringify(shape(slotBefore, slotBefore));
  if (path === initialFocusRuntime) assert(!initialEqual);
  else {
    assert(initialEqual);
    initialFocusAstPreservedBodies++;
  }
  assert.equal(
    after,
    path === popoverSlotRuntime ? reactivePopoverFocusTarget(slotPreimage) : slotPreimage,
    `Only the authorized real Popover trigger focus-target slot delta: ${path}`,
  );
  const slotEqual =
    JSON.stringify(shape(slotBefore, slotBefore)) === JSON.stringify(shape(right, right));
  if (path === popoverSlotRuntime) assert(!slotEqual);
  else {
    assert(slotEqual);
    popoverSlotAstPreservedBodies++;
  }
  const semanticOwnerCorrection = path === 'packages/utils/src/lib/PreviousValue.svelte.ts';
  const labelPublicationCorrection =
    path === 'packages/base/src/lib/utils/useRegisteredLabelId.svelte.ts';
  const installedLabelCorrection = path === 'packages/base/src/lib/menu/GroupLabel.svelte';
  const installedTreeCorrection = [
    'packages/base/src/lib/menu/positioner/createMenuPositioner.svelte.ts',
    'packages/base/src/lib/menu/Popup.svelte',
  ].includes(path);
  const focusMetadataCorrection =
    path === 'packages/base/src/lib/floating-ui/components/createFloatingFocusManager.svelte.ts';
  const triggerPublicationCorrection = [
    'packages/base/src/lib/utils/popups/popupStoreUtils.svelte.ts',
    'packages/base/src/lib/menu/trigger/createMenuTrigger.svelte.ts',
  ].includes(path);
  const popoverSlotCorrection = path === popoverSlotRuntime;
  const nativeOwnerCorrection = [
    'packages/base/src/lib/dialog/store/DialogStore.svelte.ts',
    'packages/base/src/lib/floating-ui/components/FloatingPortal.svelte',
    'packages/base/src/lib/menu/root/createMenuRoot.svelte.ts',
    'packages/base/src/lib/utils/popups/useTriggerFocusGuards.svelte.ts',
  ].includes(path);
  if (nativeOwnerCorrection)
    assert.equal(
      after,
      reactiveNativeOwners(path, git('show', `${nativeOwnerPredecessor}:${path}`)),
      `Only the authorized complete-body native owner delta: ${path}`,
    );
  if (triggerPublicationCorrection) {
    let expected = git('show', `${registrationPredecessor}:${path}`);
    if (path.endsWith('createMenuTrigger.svelte.ts')) {
      expected = expected.replace('    buttonRef(host);', '    untrack(() => buttonRef(host));');
    } else {
      const indent = (body) => body.replace(/^(.+)$/gm, '  $1');
      const registrationStart = expected.indexOf(
        '    const registration = registrationRef.current;',
      );
      const registrationEnd = expected.indexOf('\n  };\n}', registrationStart);
      assert(registrationStart > 0 && registrationEnd > registrationStart);
      const registrationBody = expected.slice(registrationStart, registrationEnd);
      expected =
        expected.slice(0, registrationStart) +
        '    untrack(() => {\n' +
        indent(registrationBody) +
        '\n    });' +
        expected.slice(registrationEnd);
      const dataStart = expected.indexOf("    const open = store.select('open');");
      const dataEnd = expected.indexOf('\n  };', dataStart);
      assert(dataStart > 0 && dataEnd > dataStart);
      const dataBody = expected
        .slice(dataStart, dataEnd)
        .replaceAll('store.select(', 'owner.select(')
        .replaceAll('store.update(', 'owner.update(')
        .replaceAll('=== triggerId', '=== id')
        .replaceAll('activeTriggerId: triggerId ?? null', 'activeTriggerId: id ?? null');
      expected =
        expected.slice(0, dataStart) +
        '    const owner = store;\n    const id = triggerId;\n    untrack(() => {\n' +
        indent(dataBody) +
        '\n    });' +
        expected.slice(dataEnd);
      expected = clarifyTriggerOwnership(expected);
      const commentPreimage = git('show', `${ownershipCommentPredecessor}:${path}`);
      assert.equal(after, clarifyTriggerOwnership(commentPreimage));
      const commentBefore = syntax(path, commentPreimage);
      assert.equal(
        JSON.stringify(shape(commentBefore, commentBefore)),
        JSON.stringify(shape(right, right)),
      );
    }
    assert.equal(after, expected, `Only the authorized complete-body publication delta: ${path}`);
  }
  if (focusMetadataCorrection) {
    let expected = git('show', `${focusPredecessor}:${path}`)
      .replace(
        "import { onDestroy } from 'svelte';",
        "import { onDestroy, untrack } from 'svelte';",
      )
      .replace(
        '    const preferPreviousFocus = openInteractionTypeRef.current == null;',
        "    // Opening metadata chooses this owner's return priority; later changes do not dispose it.\n" +
          '    const preferPreviousFocus = untrack(() => openInteractionTypeRef.current == null);',
      );
    expected = disposeQueuedInitialFocus(disposeQueuedFocusOutside(expected));
    assert.equal(after, expected, `Only the authorized complete-body metadata delta: ${path}`);
    assert.equal(
      after,
      disposeQueuedInitialFocus(
        disposeQueuedFocusOutside(git('show', `${nativeOwnerPredecessor}:${path}`)),
      ),
      'Only the native owner disposal flag, focus-out queued check and initial-focus predicate/comment stages change',
    );
  }
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
    assert.equal(
      after,
      bindingDirectiveHygiene(path, expected),
      `Only the authorized complete-body cleanup delta and binding comment: ${path}`,
    );
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
    disposition: popoverSlotCorrection
      ? 'Root-authorized actual PopoverStore-owned native reactive trigger focus-target node property; plain inert default and shared DOM/focus/open/cleanup business retained. Candidate execution pending.'
      : nativeOwnerCorrection
        ? 'Root-authorized actual native reactive node properties or narrow one-shot Menu seed publication; complete binding/callback/live synchronization business retained. Candidate execution pending.'
        : triggerPublicationCorrection
          ? 'Root-authorized narrow native registration/data/button publication boundaries; actual Store and ID acquired outside untrack, Original registration/count/data bodies and independent effects retained. Candidate runtime execution pending.'
          : focusMetadataCorrection
            ? 'Root-authorized native untrack of captured opening metadata and component-destroy guards for queued focus-out work and the first initial-focus frame predicate before rune-backed reads; actual node/disabled/bus dependencies, uncanceled frame mechanism, live-owner initial focus, latest returnFocus and intentional captured-target teardown retained. Candidate execution pending.'
            : installedLabelCorrection
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
    installedTreeCorrection ||
    focusMetadataCorrection ||
    triggerPublicationCorrection ||
    nativeOwnerCorrection ||
    popoverSlotCorrection
  )
    record.sourceBusinessCorrection = true;
  if (installedLabelCorrection || installedTreeCorrection) {
    record.sourceBusinessPredecessor = cleanupPredecessor;
    record.sourceBusinessPredecessorSha256 = hash(git('show', `${cleanupPredecessor}:${path}`));
    record.exactAuthorizedCompleteBodyDelta = true;
  }
  if (focusMetadataCorrection) {
    record.sourceBusinessPredecessor = focusPredecessor;
    record.sourceBusinessPredecessorSha256 = hash(git('show', `${focusPredecessor}:${path}`));
    record.exactAuthorizedCompleteBodyDelta = true;
    record.sourceInitialFocusDisposalPredecessor = initialFocusPredecessor;
    record.sourceInitialFocusDisposalPredecessorSha256 = hash(initialPreimage);
    record.sourceInitialFocusDisposalOrdinaryDeclarationCredit = 0;
    record.sourceResourceDisposalPredecessor = nativeOwnerPredecessor;
    record.sourceResourceDisposalPredecessorSha256 = hash(
      git('show', `${nativeOwnerPredecessor}:${path}`),
    );
  }
  if (popoverSlotCorrection) {
    record.sourceBusinessPredecessor = popoverSlotPredecessor;
    record.sourceBusinessPredecessorSha256 = hash(slotPreimage);
    record.exactAuthorizedCompleteBodyDelta = true;
    record.ordinaryDeclarationCredit = 0;
  }
  if (nativeOwnerCorrection) {
    record.sourceBusinessPredecessor = nativeOwnerPredecessor;
    record.sourceBusinessPredecessorSha256 = hash(git('show', `${nativeOwnerPredecessor}:${path}`));
    record.exactAuthorizedCompleteBodyDelta = true;
  }
  if (triggerPublicationCorrection) {
    record.sourceBusinessPredecessor = registrationPredecessor;
    record.sourceBusinessPredecessorSha256 = hash(
      git('show', `${registrationPredecessor}:${path}`),
    );
    record.exactAuthorizedCompleteBodyDelta = true;
    if (path.endsWith('popupStoreUtils.svelte.ts')) {
      record.commentOnlyPredecessor = ownershipCommentPredecessor;
      record.commentOnlyPredecessorSha256 = hash(
        git('show', `${ownershipCommentPredecessor}:${path}`),
      );
      record.commentOnlyStructuralAstEqual = true;
    }
  }
  if (labelPublicationCorrection) {
    record.sourceBusinessPredecessor = '6ec6710c1ec6d62a7b9decf3dfdaa335a76d3ce7';
    record.sourceBusinessPredecessorSha256 = hash(
      git('show', `${record.sourceBusinessPredecessor}:${path}`),
    );
    record.exactInheritedNativeParentBody = nativeIntegrationParent;
  }
  if (obsoleteBindingDirectivePaths.has(path) || path === radioBindingPath) {
    record.commentOnlyPredecessor = bindingCommentPredecessor;
    record.commentOnlyPredecessorSha256 = hash(bindingPreimage);
    record.commentOnlyStructuralAstEqual = true;
    record.commentOnlyDisposition =
      path === radioBindingPath
        ? 'Documents the real Svelte output-binding macro; no value/read/API change. Standards rerun pending.'
        : 'Removes exactly one proven unused no-useless-assignment directive; native host binding unchanged. Standards rerun pending.';
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
const focusLifetime = JSON.parse(
  readFileSync(resolve(root, 'parity/native-snippets/focus-return-lifetime.json'), 'utf8'),
);
assert.equal(focusLifetime.predecessor, focusPredecessor);
assert.equal(focusLifetime.pin, graph.immutableOriginalPin);
assert.equal(hash(readFileSync(resolve(root, focusLifetime.runtime))), focusLifetime.runtimeSha256);
for (const original of focusLifetime.original)
  assert.equal(hash(readFileSync(resolve(root, original.archive))), original.sha256);
assert.equal(
  hash(readFileSync(resolve(root, focusLifetime.diagnosis.archive))),
  focusLifetime.diagnosis.sha256,
);
for (const witness of focusLifetime.witnesses) {
  const body = readFileSync(resolve(root, witness.path));
  assert.equal(hash(body), witness.sha256, `Changed focus witness body: ${witness.path}`);
  assert.equal(body.toString(), git('show', `${focusPredecessor}:${witness.path}`));
}
const triggerLifetime = JSON.parse(
  readFileSync(resolve(root, 'parity/native-snippets/trigger-publication-lifetime.json'), 'utf8'),
);
assert.equal(triggerLifetime.predecessor, registrationPredecessor);
assert.equal(triggerLifetime.pin, graph.immutableOriginalPin);
for (const runtime of triggerLifetime.runtime) {
  assert.equal(hash(readFileSync(resolve(root, runtime.path))), runtime.sha256);
  assert.equal(
    hash(git('show', `${registrationPredecessor}:${runtime.path}`)),
    runtime.predecessorSha256,
  );
}
for (const original of triggerLifetime.original)
  assert.equal(hash(readFileSync(resolve(root, original.archive))), original.sha256);
assert.equal(
  hash(readFileSync(resolve(root, triggerLifetime.diagnosis.archive))),
  triggerLifetime.diagnosis.sha256,
);
for (const witness of triggerLifetime.witnesses) {
  const body = readFileSync(resolve(root, witness.path));
  assert.equal(hash(body), witness.sha256, `Changed trigger witness body: ${witness.path}`);
  assert.equal(body.toString(), git('show', `${registrationPredecessor}:${witness.path}`));
}
const nativeLifetime = JSON.parse(
  readFileSync(resolve(root, 'parity/native-snippets/native-owner-lifetime.json'), 'utf8'),
);
assert.equal(nativeLifetime.predecessor, nativeOwnerPredecessor);
assert.equal(nativeLifetime.pin, graph.immutableOriginalPin);
for (const runtime of nativeLifetime.runtime) {
  assert.equal(hash(readFileSync(resolve(root, runtime.path))), runtime.sha256);
  assert.equal(
    hash(git('show', `${nativeOwnerPredecessor}:${runtime.path}`)),
    runtime.predecessorSha256,
  );
}
for (const original of nativeLifetime.original)
  assert.equal(hash(readFileSync(resolve(root, original.archive))), original.sha256);
for (const diagnosis of nativeLifetime.diagnostics)
  assert.equal(hash(readFileSync(resolve(root, diagnosis.archive))), diagnosis.sha256);
for (const witness of nativeLifetime.witnesses) {
  const body = readFileSync(resolve(root, witness.path));
  assert.equal(hash(body), witness.sha256, `Changed native owner witness: ${witness.path}`);
  assert.equal(body.toString(), git('show', `${nativeOwnerPredecessor}:${witness.path}`));
}
for (const receipt of [focusLifetime, nativeLifetime]) {
  assert.equal(receipt.nativeInitialFocusDisposalStage.predecessor, initialFocusPredecessor);
  assert.equal(receipt.nativeInitialFocusDisposalStage.ordinaryDeclarationCredit, 0);
  assert.equal(
    receipt.nativeInitialFocusDisposalStage.predecessorRuntimeSha256,
    hash(git('show', `${initialFocusPredecessor}:${initialFocusRuntime}`)),
  );
}
assert.equal(initialFocusAstPreservedBodies, 495);
assert.equal(popoverSlotAstPreservedBodies, 495);
const slotStage = nativeLifetime.nativePopoverFocusTargetStage;
assert.equal(slotStage.predecessor, popoverSlotPredecessor);
assert.equal(slotStage.ordinaryDeclarationCredit, 0);
assert.equal(slotStage.runtime.path, popoverSlotRuntime);
assert.equal(hash(readFileSync(resolve(root, slotStage.runtime.path))), slotStage.runtime.sha256);
assert.equal(
  hash(git('show', `${popoverSlotPredecessor}:${popoverSlotRuntime}`)),
  slotStage.runtime.predecessorSha256,
);
assert.equal(
  hash(readFileSync(resolve(root, slotStage.original.archive))),
  slotStage.original.sha256,
);
const output = {
  rendererPredecessor: renderer,
  nativeIntegrationParent,
  nativeGetterPredecessor: native,
  focusMetadataPredecessor: focusPredecessor,
  triggerPublicationPredecessor: registrationPredecessor,
  ownershipCommentPredecessor,
  nativeOwnerPredecessor,
  bindingCommentPredecessor,
  bindingCommentAstPreservedBodies: records.length,
  initialFocusPredecessor,
  initialFocusAstPreservedBodies,
  popoverSlotPredecessor,
  popoverSlotAstPreservedBodies,
  immutableOriginalPin: graph.immutableOriginalPin,
  ordinaryDeclarationCredit: 0,
  mode: 'Source/parser/hash/import evidence only; no type program, runtime, SSR/hydration, compiled markup, artifact, installed consumer, browser, CI or merge acceptance credit.',
  method:
    'Complete current native two-package AST closure, immutable f0 full-body preimages and grouping-preserving script ASTs. Deliberate source/native owner corrections remain separate from formatter presentation changes. Getter/label publication retain exact inherited bodies; full-body Menu cleanup deltas bind e5, captured focus metadata binds42, trigger publication bindsf2, and native ownership comments bind336 with its AST unchanged. The five native node/initial-seed/focus-out disposal owner deltas bindc392 while all earlier stages/history remain distinct. The subsequent 32 obsolete binding directives and one RadioGroup output-binding annotation bind 0d with all 496 complete bodies otherwise unchanged and every script AST identical. The next native initial-focus destroyed-owner predicate and adjacent timing comment bind ec36 as one complete Source-body delta; all other 495 current bodies/ASTs stay exact. This native owner adaptation earns zero unchanged Original credit. The subsequent real Popover trigger focus-target node property binds 0ba as one complete Source-body delta with 495 other current bodies/ASTs exact; earlier stages retain their own immutable preservation counts. Parse success supplies no behavior equivalence.',
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
