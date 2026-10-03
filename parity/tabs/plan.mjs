// Pre-code Tabs source selection, public inventory and dependency plan. MIT.
import ts from '../../packages/base/node_modules/typescript/lib/typescript.js';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const graph = JSON.parse(readFileSync(new URL('./source-graph.json', import.meta.url), 'utf8'));
const upstream = resolve(process.argv[2] ?? '/workspace/base-ui-upstream');
const hash = text => createHash('sha256').update(text).digest('hex');
const source = file => execFileSync('git', ['-C', upstream, 'show', `${graph.pin}:${file}`], { encoding: 'utf8' });
const localRoot = 'packages/base/src/lib/';
const selected = new Map();
function select(original, local, decision, check) {
  selected.set(original, { local, decision, check });
}
for (const [folder, name] of [['root', 'Root'], ['list', 'List'], ['tab', 'Tab'], ['panel', 'Panel'], ['indicator', 'Indicator']]) {
  select(`packages/react/src/tabs/${folder}/Tabs${name}.tsx`, `${localRoot}tabs/${folder}/Tabs${name}.svelte`, 'Source component business body; runes, live context, native event props, snippets and attachments replace React representation.', 'Side-by-side complete business body, callback/cancellation/order, state ownership, used composition, SSR/browser/types and maintainability.');
}
for (const [original, local] of [
  ['root/TabsRootContext.ts', 'root/TabsRootContext.ts'], ['list/TabsListContext.ts', 'list/TabsListContext.ts'],
  ['root/stateAttributesMapping.ts', 'root/stateAttributesMapping.ts'], ['root/TabsRootDataAttributes.ts', 'root/TabsRootDataAttributes.ts'],
  ['panel/TabsPanelDataAttributes.ts', 'panel/TabsPanelDataAttributes.ts'], ['indicator/TabsIndicatorCssVars.ts', 'indicator/TabsIndicatorCssVars.ts'],
  ['indicator/prehydrationScript.min.ts', 'indicator/prehydrationScript.min.ts'], ['indicator/prehydrationScript.template.js', 'indicator/prehydrationScript.template.js'],
]) select(`packages/react/src/tabs/${original}`, `${localRoot}tabs/${local}`, 'Preserve Source constants, registration/provider contracts and exact script payload; context representation is native Svelte.', 'Exact constants/payload hashes; real provided context and cleanup; CSP/no-JS/parser-once/hydration/CSR witnesses.');
select('packages/react/src/tabs/index.ts', `${localRoot}tabs/index.ts`, 'Public Tabs namespace, Source component-name and type exports adapted to Svelte component types.', 'Actual strict generated packed root/subpath consumers, optional undefined, ref/class/style/render contracts.');
select('packages/react/src/tabs/index.parts.ts', `${localRoot}tabs/index.parts.ts`, 'All five public aliases: Root, List, Tab, Panel and Indicator.', 'AST public inventory and generated declarations.');
for (const [original, local] of [
  ['internals/composite/root/CompositeRoot.tsx', 'internals/composite/root/CompositeRoot.svelte'],
  ['internals/composite/root/useCompositeRoot.ts', 'internals/composite/root/useCompositeRoot.svelte.ts'],
  ['internals/composite/root/CompositeRootContext.ts', 'internals/composite/root/CompositeRootContext.ts'],
  ['internals/composite/list/CompositeList.tsx', 'internals/composite/list/createCompositeList.svelte.ts'],
  ['internals/composite/list/CompositeListContext.ts', 'internals/composite/list/CompositeListContext.ts'],
  ['internals/composite/list/useCompositeListItem.ts', 'internals/composite/list/useCompositeListItem.svelte.ts'],
  ['internals/composite/item/useCompositeItem.ts', 'internals/composite/item/useCompositeItem.svelte.ts'],
  ['internals/composite/composite.ts', 'internals/composite/composite.ts'], ['internals/composite/constants.ts', 'internals/composite/constants.ts'],
  ['internals/use-button/useButton.ts', 'internals/use-button/useButton.svelte.ts'],
  ['internals/createBaseUIEventDetails.ts', 'internals/createBaseUIEventDetails.ts'], ['internals/reasons.ts', 'internals/reasons.ts'],
  ['internals/reason-parts.ts', 'internals/reasons.ts'], ['internals/getStateAttributesProps.ts', 'internals/getStateAttributesProps.ts'],
  ['internals/stateAttributesMapping.ts', 'internals/stateAttributesMapping.ts'], ['internals/TransitionStatusDataAttributes.ts', 'internals/TransitionStatusDataAttributes.ts'],
  ['internals/useRenderElement.tsx', 'internals/useRenderElement.ts'], ['internals/useTransitionStatus.ts', 'internals/useTransitionStatus.svelte.ts'],
  ['internals/useOpenChangeComplete.tsx', 'internals/useOpenChangeComplete.svelte.ts'], ['internals/useAnimationsFinished.ts', 'internals/useAnimationsFinished.ts'],
  ['merge-props/mergeProps.ts', 'merge-props/mergeProps.ts'], ['utils/resolveClassName.ts', 'utils/resolveClassName.ts'],
  ['utils/resolveStyle.ts', 'utils/resolveStyle.ts'], ['utils/resolveRef.ts', 'utils/resolveRef.ts'],
  ['utils/useFocusableWhenDisabled.ts', 'utils/useFocusableWhenDisabled.ts'], ['utils/dispatchClickWithModifiers.ts', 'utils/dispatchClickWithModifiers.ts'],
]) select(`packages/react/src/${original}`, `${localRoot}${local}`, 'Reuse canonical current-main source port once; no local reinvention or acceptance by main membership.', 'Manual actual Source-body comparison of selected functions and recursive local dependencies, paired used-path browser/ref/cleanup witnesses, exact-head independent full-closure review.');
for (const [name, local] of [['useControlled', 'useControlled.svelte'], ['useIsoLayoutEffect', 'useIsoLayoutEffect.svelte'], ['useStableCallback', 'useStableCallback'], ['useMergedRefs', 'useMergedRefs'], ['useAnimationFrame', 'useAnimationFrame'], ['empty', 'empty'], ['error', 'error'], ['warn', 'warn'], ['createLogOnce', 'createLogOnce'], ['mergeObjects', 'mergeObjects'], ['owner', 'owner'], ['isElementDisabled', 'isElementDisabled'], ['shadowDom', 'shadowDom']]) {
  select(`packages/utils/src/${name}.ts`, `${localRoot}utils/${local}.ts`, 'Reuse single canonical selected helper; native lifecycle replaces only framework mechanism.', 'Actual Source/local body comparison and used-path runtime/type/lifecycle coverage.');
}
select('packages/react/src/floating-ui-react/utils.ts', `${localRoot}utils/shadowDom.ts`, 'Select only activeElement/contains; unrelated barrel exports are unselected.', 'Compare selected functions and shadow-boundary focus containment.');
select('packages/react/src/floating-ui-react/utils/element.ts', `${localRoot}utils/shadowDom.ts`, 'Select activeElement/contains/getTarget via canonical native shadow helpers.', 'Actual selected function bodies and composed focus/caret tests.');
select('packages/react/src/floating-ui-react/utils/composite.ts', `${localRoot}internals/composite/utils/navigation.ts`, 'Reuse selected navigation/disabled/index algorithm bodies once.', 'Compare each selected function; keyboard/Home/End/loop/caret/scroller witnesses.');
select('packages/react/src/floating-ui-react/utils/constants.ts', `${localRoot}internals/composite/utils/navigation.ts`, 'Reuse selected navigation constants; unrelated constants unselected.', 'Exact selected key/constant values.');
select('packages/react/src/internals/direction-context/DirectionContext.tsx', `${localRoot}direction-provider/context.ts`, 'Native Svelte context and its real provided direction replace React context.', 'Source default and nearest-provider contract; RTL paired navigation.');
select('packages/react/src/internals/csp-context/CSPContext.tsx', `${localRoot}csp-provider/context.ts`, 'Native Svelte context; canonical PrehydrationScript consumes real nonce.', 'SSR nonce escaping, actual CSP and nested provider witness.');
select('packages/react/src/internals/PrehydrationScript.tsx', `${localRoot}internals/PrehydrationScript.svelte`, 'Reuse exact public frozen Slider canonical wrapper at 17652eca. Whole trusted script tag raw HTML preserves native Svelte marker/parser behavior; root helper lease pending.', 'Exact wrapper SHA 2b37072e8cb05af6fdb577941c8f79f5be974f34032b588b27b11c6f67eb35e2; exact Tabs payload SSR/client, CSP/parser-once/no-JS/hydration/fresh CSR inert. Zero unchanged framework credit.');
select('packages/react/src/utils/useIsHydrating.ts', `${localRoot}utils/useIsHydrating.svelte.ts`, 'Reuse same frozen canonical native onMount hydration-phase helper with wrapper; lease pending.', 'SSR/client initial markup identity and native mount removal, no hydration engine.');
for (const name of ['getCssDimensions', 'getElementTransform']) select(`packages/react/src/utils/${name}.ts`, `${localRoot}utils/${name}.ts`, 'Missing used business dependency. Port exact immutable Source helper once after explicit root canonical-helper lease.', 'Source verbatim algorithm/import adaptation; transformed/subpixel/scrolled/zero-scale/resize geometry witnesses.');
select('packages/react/src/internals/useBaseUiId.ts', '$props.id() plus authored id ?? generated id', 'Direct native stable SSR/hydration ID primitive replaces React ID machinery.', 'Authored/automatic IDs, tab/panel association and hydration stability.');
select('packages/utils/src/useId.ts', '$props.id()', 'Direct native stable ID primitive; no React version/generator machinery.', 'SSR/hydration same generated association.');
select('packages/utils/src/useForcedRerendering.ts', 'TabsIndicator native revision rune', 'Native revision counter invalidates derived layout on Source resize listener.', 'Observer subscription/resize/detach cleanup; no render engine.');
select('packages/utils/src/inertValue.ts', 'native boolean inert attribute', 'Svelte native boolean inert representation.', 'Inactive retained/transition panel inert presence and focus exclusion.');
select('packages/react/src/internals/types.ts', `${localRoot}internals/types.ts and tabs/types.ts`, 'Reuse native shared prop/snippet/event/style types; port all Tabs public type relationships.', 'Strict generated declarations and actual isolated packed consumers.');
const modules = graph.modules.map(item => ({ ...item, selected: selected.has(item.source), ...(selected.get(item.source) ?? { local: null, decision: 'Recursive type or barrel closure; unrelated exported bodies are not selected by Tabs. No copied runtime module or parity claim. Inspect any future actual selected symbol before adding it.', check: 'Actual local import graph and symbol selections must confirm omission; missing selected business dependencies remain blocked.' }), status: 'pre-implementation plan; no final source review or execution credit' }));
writeFileSync(new URL('./source-correspondence.json', import.meta.url), JSON.stringify({ pin: graph.pin, base: '6f1f98307ed32a60e88cfb93f3d47b325e8dc9d1', status: 'Committed before runtime code; selected missing helper leases pending; exact final-head source/native/maintainability review required.', modules }, null, 2) + '\n');
const publicFiles = execFileSync('git', ['-C', upstream, 'ls-tree', '-r', '--name-only', graph.pin, 'packages/react/src/tabs'], { encoding: 'utf8' }).trim().split('\n').filter(file => !/\.(test|spec)\./.test(file));
const inventory = publicFiles.map(file => {
  const body = source(file), ast = ts.createSourceFile(file, body, ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const exports = [];
  for (const node of ast.statements) {
    if (ts.isExportDeclaration(node)) exports.push({ text: node.getText(ast), typeOnly: node.isTypeOnly, module: node.moduleSpecifier?.getText(ast) });
    else if (node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) exports.push({ text: node.getText(ast), names: ts.isVariableStatement(node) ? node.declarationList.declarations.map(item => item.name.getText(ast)) : node.name ? [node.name.getText(ast)] : [] });
  }
  return { source: file, url: `https://github.com/mui/base-ui/blob/${graph.pin}/${file}`, sha256: hash(body), exports };
});
writeFileSync(new URL('./public-inventory.json', import.meta.url), JSON.stringify({ pin: graph.pin, parts: ['Root', 'List', 'Tab', 'Panel', 'Indicator'], files: inventory, ordinaryDeclarationCredit: 0 }, null, 2) + '\n');
console.log(`${modules.length} source plan rows; ${selected.size} selected source boundaries; ${inventory.length} all-part source/public files`);
