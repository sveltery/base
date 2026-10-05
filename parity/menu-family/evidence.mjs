// Preserve immutable assertion provenance and reconcile actual used Source/native boundaries.
// No declaration or conformance credit is granted by this inventory.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { extractNativeClosure } from './native-closure.mjs';
const require = createRequire(new URL('../../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const repo = new URL('../../', import.meta.url);
const pin = '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c';
const hash = body => createHash('sha256').update(body).digest('hex');
const read = path => readFileSync(new URL(path, repo), 'utf8');
const graph = JSON.parse(read('parity/menu-family/source-graph.json'));
const native = extractNativeClosure();
const localModules = new Map(native.modules.map(module => [module.source, module]));
const root = 'packages/base/src/lib/';
const utilityMoves = new Map(JSON.parse(read('parity/utils-package/extraction.json')).moves.map(move => [move.from, move.to]));
const destination = path => path.startsWith('packages/') ? path : utilityMoves.get(root + path) ?? root + path;
const overrides = new Map();
function map(source, paths, correspondence) {
  overrides.set(source, { paths: paths.map(destination), correspondence });
}
for (const [name, part] of [['MenuArrow', 'Arrow'], ['MenuBackdrop', 'Backdrop'], ['MenuCheckboxItemIndicator', 'CheckboxItemIndicator'], ['MenuCheckboxItem', 'CheckboxItem'], ['MenuGroupLabel', 'GroupLabel'], ['MenuGroup', 'Group'], ['MenuItem', 'Item'], ['MenuLinkItem', 'LinkItem'], ['MenuPopup', 'Popup'], ['MenuPortal', 'Portal'], ['MenuPositioner', 'Positioner'], ['MenuRadioGroup', 'RadioGroup'], ['MenuRadioItemIndicator', 'RadioItemIndicator'], ['MenuRadioItem', 'RadioItem'], ['MenuRoot', 'Root'], ['MenuSubmenuRoot', 'SubmenuRoot'], ['MenuSubmenuTrigger', 'SubmenuTrigger'], ['MenuTrigger', 'Trigger'], ['MenuViewport', 'Viewport']]) {
  const source = graph.modules.find(module => module.source.endsWith(`/${name}.tsx`)).source;
  const paths = [`menu/${part}.svelte`, 'menu/types.ts'];
  const helper = { Root: 'root/createMenuRoot.svelte.ts', Trigger: 'trigger/createMenuTrigger.svelte.ts', SubmenuTrigger: 'submenu-trigger/createMenuSubmenuTrigger.svelte.ts', Positioner: 'positioner/createMenuPositioner.svelte.ts' }[part];
  if (helper) paths.push(`menu/${helper}`);
  map(source, paths, 'Original component business and public types retain their part boundary; native component/snippet/attachment/context/rune ownership replaces React host rendering. Compare the complete component and any used extracted business body together.');
}
map('packages/react/src/context-menu/root/ContextMenuRoot.tsx', ['context-menu/Root.svelte', 'context-menu/types.ts'], 'Original thin context/anchor/ref/MenuRoot composition; native provider and bind:actions forward to the real MenuRoot.');
map('packages/react/src/context-menu/trigger/ContextMenuTrigger.tsx', ['context-menu/Trigger.svelte', 'context-menu/trigger/createContextMenuTrigger.svelte.ts', 'context-menu/types.ts'], 'Original complete pointer/long-press/virtual-rect/document-listener and movement/multiple-touch/abort branches with native host event props.');
map('packages/react/src/context-menu/positioner/ContextMenuPositioner.tsx', ['context-menu/index.parts.ts', 'context-menu/types.ts', 'menu/Positioner.svelte', 'menu/positioner/createMenuPositioner.svelte.ts'], 'Original alias of MenuPositioner; fixed positioning/context offsets remain in the one canonical used MenuPositioner business body.');
map('packages/react/src/menubar/Menubar.tsx', ['menubar/Menubar.svelte', 'menubar/types.ts'], 'Original Menubar/MenubarContent CompositeRoot and real FloatingTree/Node/context/event composition; native setup context, runes and component markup.');
map('packages/react/src/menubar/MenubarDataAttributes.ts', ['menubar/Menubar.svelte'], 'Original has-submenu-open constant is represented directly in the native state mapping, with no independent business helper.');
map('packages/react/src/menu/utils/types.ts', ['menu/types.ts'], 'Original discriminated parent and shared orientation/public namespaces are consolidated with the part public types, with real provided store/context types.');
map('packages/react/src/floating-ui-react/components/FloatingRootStore.ts', ['floating-ui/components/FloatingRootStore.svelte.ts'], 'Original store/context business; one canonical native store, no competing interaction engine.');
map('packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx', ['floating-ui/components/FloatingFocusManager.svelte', 'floating-ui/components/createFloatingFocusManager.svelte.ts'], 'Full Original focus-manager business plus native host/component ownership. Reinspect inherited full body, flags, scheduling, focus restore and teardown.');
map('packages/react/src/floating-ui-react/components/FloatingPortal.tsx', ['floating-ui/components/FloatingPortal.svelte', 'floating-ui/hooks/useFloatingPortalNode.svelte.ts', 'floating-ui/components/FloatingPortalContext.ts', 'floating-ui/components/PortalContent.svelte'], 'Original FloatingPortal/useFloatingPortalNode full-file bodies map to one shared native node/content host adapter, FullPortal focus/context/guard composition and PortalContent snippet host. The actual split helper is consumed by Full/Lite; exact inherited bounded body receipts may apply individually, while full used caller review remains pending.');
map('packages/react/src/internals/composite/list/CompositeList.tsx', ['internals/composite/list/createCompositeList.svelte.ts'], 'Original shared Composite list DOM registration/order/metadata business with native initialization and observer lifetime; real consumers use this one body.');
map('packages/react/src/internals/useAnchorPositioning.ts', ['internals/anchor-positioning/useAnchorPositioning.svelte.ts', 'internals/anchor-positioning/policy.ts', 'internals/anchor-positioning/css-vars.ts', 'internals/anchor-positioning/types.ts'], 'Canonical Original-derived positioning middleware/config/style/ref ownership; one default @floating-ui/dom platform/geometry driver. Shared source/store/tree bridge retains independent DOM and virtual references. Private fixture controller/attachment modules are outside this actual public family closure.');
map('packages/react/src/floating-ui-react/hooks/useFloating.ts', ['floating-ui/hooks/useFloating.svelte.ts', 'internals/anchor-positioning/useFloating.svelte.ts'], 'Original useBaseUIFloating/useFloatingWithStore root/tree/context/ref publication connects to the sole DOM driver, with honest narrow geometry-free versus fully positioned types. Undefined local-floating fallback uses the existing tracked floating selector so native derivation follows Original subscribed renders; explicit null/ref/publication/cleanup precedence is unchanged. This changed canonical body and affected callers are reopened for fresh independent Source/native/maintainability review.');
map('packages/react/src/floating-ui-react/hooks/useClick.ts', ['floating-ui/hooks/useClick.svelte.ts'], 'Accepted canonical PR69 Main callback-construction repair retains Source useMemo selected scalar options and Store/dataRef closure with native derived handler construction. Store.select/dataRef event reads remain live; exact shared helper and affected current family callers require bounded successor Source/native/maintainability review, with no overall feature acceptance by inventory.');
map('packages/react/src/floating-ui-react/middleware/arrow.ts', ['internals/anchor-positioning/arrow.ts'], 'Selected complete Original arrow middleware delegates default DOM geometry; native arrow attachment uses this same canonical business body.');
map('packages/react/src/utils/adaptiveOriginConstants.ts', ['internals/anchor-positioning/adaptive-origin.ts'], 'Original DEFAULT_SIDES retained in canonical adaptive-origin module.');
map('packages/react/src/utils/adaptiveOriginMiddleware.ts', ['internals/anchor-positioning/adaptive-origin.ts'], 'Original adaptive origin positioner-coordinate policy remains canonical; no second geometry path.');
map('packages/react/src/utils/hideMiddleware.ts', ['internals/anchor-positioning/hide.ts'], 'Original hide middleware body and source-defined tolerance; default @floating-ui/dom platform.');
map('packages/react/src/utils/getCssDimensions.ts', ['utils/getCssDimensions.ts'], 'Exact shared public Tabs f5cb066 canonical getCssDimensions helper. The existing canonical getElementTransform helper is not imported by this selected Menu closure and is not counted as a used port.');
map('packages/react/src/internals/direction-context/DirectionContext.tsx', ['direction-provider/context.ts'], 'Original direction default/provider hook uses native initialized context and a live getter.');
map('packages/react/src/direction-provider/DirectionProvider.tsx', ['direction-provider/types.ts'], 'Original Direction public type is selected by native direction context; the public DirectionProvider component body is an unselected type/barrel dependency of this family.');
map('packages/react/src/internals/useRenderElement.tsx', ['internals/useRenderElement.ts', 'internals/RenderElement.svelte'], 'Canonical source business prop/state/disabled/ref composition uses native snippets, attachments, host creation and Svelte class/style defaults.');
map('packages/react/src/merge-props/mergeProps.ts', ['merge-props/index.ts', 'merge-props/mergeProps.ts'], 'One canonical complete Source prop/event merging business with lower-case native event/preventBaseUIHandler framework boundary; index.ts is a reexport of the actual mergeProps body.');
map('packages/react/src/separator/Separator.tsx', ['separator/Separator.svelte', 'separator/types.ts', 'separator/index.ts'], 'Canonical public Separator alias preserves Original role/orientation defaults and native renderer composition.');
map('packages/react/src/tooltip/trigger/TooltipTriggerDataAttributes.ts', ['utils/CommonTriggerDataAttributes.ts', 'menu/utils/stateAttributesMapping.ts'], 'Source popup-open/disabled attribute values use the canonical trigger constants and direct Menu state mapping; no Tooltip business dependency is introduced.');
map('packages/utils/src/store/index.ts', ['packages/utils/src/lib/store/index.ts'], 'Used native store barrel exports only implemented Store/ReadonlyStore/SvelteStore. The Original ReactStore counterpart uses native subscriptions; useStore/selector factories/inspector React APIs remain deliberately omitted and are not promised by this package.');
map('packages/utils/src/store/Store.ts', ['utils/store/Store.svelte.ts'], 'Canonical complete Original Store body remains unchanged; string-key convenience stays separate from Source selector/update/notify business.');
map('packages/utils/src/store/ReactStore.ts', ['utils/store/SvelteStore.svelte.ts'], 'Native rune-backed Store facade and selected Original observe business; React hooks/debug inspector machinery use native state lifecycle instead.');
map('packages/react/src/floating-ui-react/utils/element.ts', ['floating-ui/utils/element.ts', 'floating-ui/utils/matchesFocusVisible.ts'], 'Canonical complete selected element helpers; Source matchesFocusVisible is extracted once for shared native use without a second implementation. Accepted PR69 Main changes only the erased PopupTriggerMap type edge to its exact canonical leaf; runtime body predicates are unchanged and fresh affected type/member review remains pending.');
map('packages/react/src/floating-ui-react/utils/composite.ts', ['floating-ui/utils/composite.ts', 'internals/composite/utils/navigation.ts'], 'Source shared list/grid visibility/navigation bodies have one canonical implementation under native Composite navigation; floating utils/composite only reexports it. Original distinct injected gridNavigation entry points remain distinct callers of that shared body.');
map('packages/react/src/internals/useRenderElement.tsx', ['internals/useRenderElement.ts', 'internals/RenderElement.svelte', 'internals/nativeProps.ts', 'internals/nativeRefAttachment.ts', 'internals/resolveClassValue.ts'], 'Canonical Source prop/state/disabled/ref composition with native ClassValue/CSS/native event/snippet/attachment/host representation helpers. Native host resolution replaces React element internals.');
map('packages/react/src/utils/popups/popupHandle.ts', ['utils/popups/popupHandle.svelte.ts', 'utils/popups/PopupHandleAttachment.svelte'], 'Original BasePopupHandle/store attachment ownership uses one canonical handle and native committed attachment component; no competing detached store.');
map('packages/react/src/toolbar/root/ToolbarRootContext.ts', ['toolbar/root/ToolbarRootContext.ts', 'toolbar/types.ts'], 'Actual public canonical Toolbar context provider, including its native orientation/public type representation. MenuPopup consumes the real provided context; no fake clone.');
const nativeOnly = new Map([
  ['packages/utils/src/fastHooks.ts', 'Native setup/runes/stable callbacks replace React state/effect/ref hook transport; business effects retain actual canonical native helpers.'],
  ['packages/utils/src/getReactElementRef.ts', 'Native Svelte bind:ref/attachments resolve the actual host, without inspecting React element internals.'],
  ['packages/utils/src/safeReact.ts', 'Native Svelte host and lifecycle primitives require no React namespace, owner-stack, insertion-effect or render retry transport.'],
  ['packages/utils/src/reactVersion.ts', 'Native Svelte defaults require no React version feature branches.'],
  ['packages/utils/src/useForcedRerendering.ts', 'Native reactive store/runes publish updates without a React forced-render hook.'],
  ['packages/utils/src/useValueAsRef.ts', 'Stable native getter-backed ref objects read the latest component/store value where consumers require current.'],
  ['packages/utils/src/store/useStore.ts', 'Native rune-backed canonical SvelteStore.useState replaces the React subscription hook.'],
  ['packages/utils/src/store/StoreInspector.tsx', 'Original optional React DEV inspector is not a component business dependency; native runtime omits React-only debug rendering.'],
  ['packages/utils/src/inertValue.ts', 'Native Svelte inert boolean attributes replace the React-version inert shim while preserving the browser inert property.'],
]);
const unselected = new Set(['packages/react/src/floating-ui-react/components/FloatingDelayGroup.tsx', 'packages/react/src/floating-ui-react/hooks/useClientPoint.ts', 'packages/react/src/floating-ui-react/hooks/useFloatingRootContext.ts', 'packages/react/src/floating-ui-react/hooks/useHover.ts', 'packages/react/src/floating-ui-react/index.ts', 'packages/react/src/floating-ui-react/utils.ts', 'packages/react/src/types/index.ts', 'packages/react/src/internals/use-button/index.ts', 'packages/utils/src/store/index.ts', 'packages/utils/src/store/createSelector.ts', 'packages/utils/src/store/createSelectorMemoized.ts', 'packages/react/src/utils/popups/inlineRect.ts', 'packages/react/src/direction-provider/index.ts', 'packages/react/src/direction-provider/index.parts.ts']);
function automaticPaths(source) {
  let path = source.replace(/^packages\/react\/src\//, '').replace(/^packages\/utils\/src\//, 'utils/').replace('floating-ui-react/', 'floating-ui/');
  const candidates = [path, path.replace(/\.tsx?$/, '.svelte.ts'), path.replace(/\.tsx?$/, '.svelte')];
  return candidates.map(destination).filter(path => localModules.has(path));
}
const correspondence = graph.modules.map(module => {
  const body = read(`parity/menu-family/upstream/${module.source}`);
  if (hash(body) !== module.sha256) throw new Error(`Original archive drift: ${module.source}`);
  const override = overrides.get(module.source);
  const paths = override?.paths ?? automaticPaths(module.source);
  if (paths.some(path => !localModules.has(path))) throw new Error(`Mapped local is not actually used: ${module.source}`);
  const replacement = nativeOnly.get(module.source);
  const selection = paths.length ? 'used-business-or-type-port' : replacement ? 'native-framework-replacement' : unselected.has(module.source) ? 'unselected-conservative-barrel-or-type-edge' : 'unresolved-source-correspondence';
  return { source: module.source, sha256: module.sha256, url: module.url, selection, local: paths, localHashes: Object.fromEntries(paths.map(path => [path, localModules.get(path).sha256])), correspondence: override?.correspondence ?? replacement ?? (paths.length ? 'Same canonical component/helper/context/store boundary with native Svelte framework substitution where required; compare entire Original and actual used body, including inherited code.' : selection === 'unselected-conservative-barrel-or-type-edge' ? 'Complete Original graph preserves the edge; actual selected family imports do not consume this exported business body.' : 'No exact used correspondence has yet been reconciled; dependent acceptance remains incomplete.'), reviewStatus: 'Entire used Source/native business, idiomatic Svelte and maintainability independent exact-head review pending; no acceptance by inventory.' };
});
const selected = new Set(correspondence.flatMap(record => record.local));
const representations = native.modules.filter(module => !selected.has(module.source)).map(module => ({ local: module.source, sha256: module.sha256, reachability: module.reachability, status: 'Actual used native representation or split inherited helper; detailed Source function correspondence and full-body review pending.' }));
const tests = JSON.parse(read('parity/menu-family/test-helper-graph.json')).roots;
const declarations = [], conformance = [], sources = [];
for (const source of tests) {
  const body = read(`parity/menu-family/upstream/${source}`);
  const ast = ts.createSourceFile(source, body, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  sources.push({ source, sha256: hash(body), url: `https://github.com/mui/base-ui/blob/${pin}/${source}` });
  const line = node => ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
  function visit(node) {
    if (ts.isCallExpression(node)) {
      let callee = node.expression;
      while (ts.isCallExpression(callee) || ts.isPropertyAccessExpression(callee)) callee = callee.expression;
      const callback = node.arguments.find(argument => ts.isArrowFunction(argument) || ts.isFunctionExpression(argument));
      const title = node.arguments[0];
      if (ts.isIdentifier(callee) && ['it', 'test'].includes(callee.text) && callback && (ts.isStringLiteralLike(title) || ts.isTemplateExpression(title))) {
        const assertions = [];
        function find(child) {
          if (ts.isCallExpression(child) && /^expect\(/.test(child.getText(ast)) && !ts.isPropertyAccessExpression(child.parent)) assertions.push({ line: line(child), text: child.getText(ast), sha256: hash(child.getText(ast)) });
          ts.forEachChild(child, find);
        }
        find(callback.body);
        declarations.push({ id: `${source}:${line(node)}`, source, line: line(node), title: ts.isStringLiteralLike(title) ? title.text : title.getText(ast), expression: node.expression.getText(ast), bodySha256: hash(callback.body.getText(ast)), assertions, status: 'unported', ordinaryDeclarationCredit: 0 });
      }
      if (ts.isIdentifier(callee) && /^describe(Conformance|Composite)$/.test(callee.text)) conformance.push({ id: `${source}:${line(node)}`, expression: node.getText(ast), sha256: hash(node.getText(ast)), status: 'unported', ordinaryDeclarationCredit: 0 });
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}
const records = {
  'native-closure.json': native,
  'source-correspondence.json': { pin, ordinaryDeclarationCredit: 0, status: 'Actual used-path reconciliation; full manual and independent exact-head review remains pending.', records: correspondence, nativeRepresentationModules: representations },
  'original-assertions.json': { pin, ordinaryDeclarationCredit: 0, scope: 'Immutable ordinary/parameterized declaration sites, unchanged expectation text and hashes, and separate conformance/helper calls. Native authored DOM/browser supplements receive zero unchanged Original credit. Public type source retains its own source hash; all Original declarations remain unported.', sources, declarations, conformance },
};
for (const [name, value] of Object.entries(records)) {
  const text = JSON.stringify(value, null, 2) + '\n';
  const url = new URL(`./${name}`, import.meta.url);
  if (process.argv.includes('--check')) { if (readFileSync(url, 'utf8') !== text) throw new Error(`${name} differs from current evidence`); }
  else writeFileSync(url, text);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`Native ${native.modules.length} modules/${native.modules.reduce((sum, module) => sum + module.imports.length, 0)} edges; Original ${correspondence.length} modules; declarations ${declarations.length}, conformance ${conformance.length}, ordinary credit 0.`);
  for (const record of correspondence.filter(record => record.selection === 'unresolved-source-correspondence')) console.log(`Unresolved: ${record.source}`);
  for (const module of representations) console.log(`Native representation pending detailed mapping: ${module.local}`);
}
