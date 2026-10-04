#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
alert_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-alert-consumer.XXXXXX")"
trap 'rm -rf "$alert_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$alert_consumer" > /dev/null
node --input-type=module - "$alert_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
pnpm --dir "$alert_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$alert_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$alert_consumer/node_modules/@sveltery/base/LICENSE"
cmp packages/base/THIRD_PARTY_NOTICES.md "$alert_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cat > "$alert_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { AlertDialog as First } from '@sveltery/base';
  import * as Second from '@sveltery/base/alert-dialog';
  let { handle = First.createHandle<number>() }: { handle?: Second.Handle<number> } = $props();
  function expectType<_Expected, _Actual extends _Expected>(_value: _Actual) {}
  const constructed = new Second.Handle<number>();
  void constructed;
</script>
<First.Root><span id="plain">Plain children</span></First.Root>
<Second.Root {handle} defaultOpen defaultTriggerId="detached">
  {#snippet children({ payload })}
    <span id="payload">{payload ?? 'No payload'}</span>
    <Second.Portal><Second.Popup>AlertDialog</Second.Popup></Second.Portal>
    {let checked = expectType<number | undefined, typeof payload>(payload)}
    {checked ?? ''}
  {/snippet}
</Second.Root>
<First.Trigger {handle} id="detached" payload={7}>Detached</First.Trigger>
SVELTE
cat > "$alert_consumer/types.ts" <<'TS'
import { AlertDialog as First } from '@sveltery/base';
import * as Second from '@sveltery/base/alert-dialog';
import type { ComponentProps, Snippet } from 'svelte';
import type { AlertDialogRoot, AlertDialogTrigger } from '@sveltery/base';
import type { AlertDialogRoot as SubpathRoot, AlertDialogTrigger as SubpathTrigger } from '@sveltery/base/alert-dialog';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const factory: First.Handle<number> = Second.createHandle<number>();
const constructed: Second.Handle<number> = new First.Handle<number>();
// @ts-expect-error The pinned Handle type requires its payload type argument.
const missingPayloadType: First.Handle = constructed;
const rootPayload: Equal<Parameters<NonNullable<ComponentProps<typeof First.Root<number>>['children']>>[0], { payload: number | undefined }> = true;
const triggerPayload: Equal<ComponentProps<typeof Second.Trigger<number>>['payload'], number | undefined> = true;
declare const plain: Snippet;
const plainRoot: ComponentProps<typeof Second.Root<number>> = { children: plain };
const strongTrigger: ComponentProps<typeof First.Trigger<number>> = { handle: factory, payload: 8, class: ['trigger', { active: true }], style: { width: 20 } };
const optionalRoot: First.Root.Props<number> = { handle: undefined, open: undefined, defaultOpen: undefined, triggerId: undefined, defaultTriggerId: undefined, actions: undefined, onOpenChange: undefined, onOpenChangeComplete: undefined, children: undefined };
const optionalParts: [Second.Trigger.Props<number>, Second.Portal.Props, Second.Backdrop.Props, Second.Popup.Props, Second.Viewport.Props, Second.Close.Props] = [
  { handle: undefined, payload: undefined, disabled: undefined, nativeButton: undefined, type: undefined, ref: undefined },
  { container: undefined, keepMounted: undefined, children: undefined, ref: undefined },
  { forceRender: undefined }, { initialFocus: undefined, finalFocus: undefined },
  { class: state => ['viewport', { open: state.open }], style: state => ({ '--nested': Number(state.nestedDialogOpen) }) },
  { disabled: undefined, nativeButton: undefined },
];
const viewportState: Equal<Second.Viewport.State, First.Popup.State> = true;
const namedRoot: Equal<AlertDialogRoot.Props<number>, SubpathRoot.Props<number>> = true;
const namedTrigger: Equal<AlertDialogTrigger.Props<number>, SubpathTrigger.Props<number>> = true;
// @ts-expect-error A number handle rejects a string payload.
factory.openWithPayload('wrong');
// @ts-expect-error Component payload inference follows its handle.
const wrongTrigger: ComponentProps<typeof First.Trigger<number>> = { handle: factory, payload: 'wrong' };
// @ts-expect-error Handles cannot change their payload type through assignment.
const wrongHandle: First.Handle<string> = constructed;
import type { Dialog } from '@sveltery/base';
const subtype: Dialog.Handle<number> = factory;
declare const ordinary: Dialog.Handle<number>;
// @ts-expect-error Ordinary Dialog handles lack the Source nominal AlertDialog brand.
const wrongRootHandle: First.Root.Props<number> = { handle: ordinary };
// @ts-expect-error Ordinary Dialog handles lack the Source nominal AlertDialog brand.
const wrongTriggerHandle: First.Trigger.Props<number> = { handle: ordinary };
// @ts-expect-error AlertDialog always uses modal=true.
const wrongModal: First.Root.Props<number> = { modal: false };
// @ts-expect-error AlertDialog always disables pointer dismissal.
const wrongDismiss: First.Root.Props<number> = { disablePointerDismissal: false };
void [subtype, wrongRootHandle, wrongTriggerHandle, wrongModal, wrongDismiss];
void [missingPayloadType, rootPayload, triggerPayload, plainRoot, strongTrigger, wrongTrigger, wrongHandle, optionalRoot, optionalParts, viewportState, namedRoot, namedTrigger];
TS
cat > "$alert_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { AlertDialog as First } from '@sveltery/base';
import * as Second from '@sveltery/base/alert-dialog';
import Consumer from './Consumer.svelte';
for (const part of ['Root', 'Trigger', 'Portal', 'Backdrop', 'Popup', 'Viewport', 'Title', 'Description', 'Close']) assert.equal(First[part], Second[part]);
assert.equal(First.Handle, Second.Handle); assert.equal(First.createHandle, Second.createHandle);
const { Dialog } = await import('@sveltery/base');
for (const part of ['Trigger', 'Portal', 'Backdrop', 'Popup', 'Viewport', 'Title', 'Description', 'Close']) assert.equal(First[part], Dialog[part]);
assert(new First.Handle() instanceof Dialog.Handle);
const handle = First.createHandle();
for (let request = 0; request < 2; request++) {
  const body = render(Consumer, { props: { handle } }).body;
  assert.match(body, /id="plain">Plain children/); assert.match(body, /id="payload">No payload/);
  assert.match(body, /id="detached"[^>]*aria-expanded="false"/);
  assert.doesNotMatch(body, /data-popup-open|role="alertdialog"/); assert.equal(handle.isOpen, false);
}
assert.equal(new Second.Handle().isOpen, false);
JS
cat > "$alert_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"noUncheckedIndexedAccess":true,"skipLibCheck":false,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$alert_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$alert_consumer" --tsconfig ./tsconfig.json
cat > "$alert_consumer/DOMConsumer.svelte" <<'SVELTE'
<script lang="ts">
  import { AlertDialog as RootEntry } from '@sveltery/base';
  import * as AlertDialog from '@sveltery/base/alert-dialog';
  let { handle, container }: { handle: AlertDialog.Handle<number>; container: HTMLElement } = $props();
  let actions = $state<AlertDialog.Root.Actions | null>(null);
  let portal = $state<HTMLElement | null>(null), viewport = $state<HTMLElement | null>(null);
  const changes: [string, boolean][] = [];
  export function snapshot() { return { actions, portal, viewport, changes }; }
</script>
{#snippet host(props: Record<string | symbol, unknown>)}
  <div id="installed-wrapper"><section {...props} id="installed-portal"></section></div>
{/snippet}
<RootEntry.Trigger {handle} payload={7} id="installed-trigger">Open</RootEntry.Trigger>
<AlertDialog.Root {handle} bind:actions onOpenChange={(open, details) => {
  changes.push(['change', open]);
  if (!open) details.preventUnmountOnClose();
}} onOpenChangeComplete={open => changes.push(['complete', open])}>
  {#snippet children({ payload })}
    <AlertDialog.Portal {container} render={host} bind:ref={portal}>
      <AlertDialog.Viewport bind:ref={viewport} class={state => ['viewport', { active: state.open }]} style={state => ({ '--open': Number(state.open) })}>
        <AlertDialog.Backdrop />
        <AlertDialog.Popup>
          <AlertDialog.Title id="installed-title">Installed alert-dialog</AlertDialog.Title>
          <AlertDialog.Description id="installed-description">Description</AlertDialog.Description>
          <output>{payload}</output><AlertDialog.Close id="installed-close">Close</AlertDialog.Close>
        </AlertDialog.Popup>
      </AlertDialog.Viewport>
    </AlertDialog.Portal>
  {/snippet}
</AlertDialog.Root>
SVELTE
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$alert_consumer" --tsconfig ./tsconfig.json
cat > "$alert_consumer/dom-loader.mjs" <<'JS'
// Compile the actual installed package with its installed Svelte peer.
import { registerHooks, createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('./package.json', import.meta.url));
const { compile, compileModule } = require('svelte/compiler');
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith('.svelte') || url.endsWith('.svelte.js')) {
      const source = readFileSync(fileURLToPath(url), 'utf8');
      const options = { filename: fileURLToPath(url), generate: 'client' };
      const result = url.endsWith('.svelte') ? compile(source, options) : compileModule(source, options);
      return { format: 'module', source: result.js.code, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
JS
cat > "$alert_consumer/dom-check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const tooling = createRequire(process.argv[2]);
const { JSDOM } = tooling('jsdom');
const dom = new JSDOM('<!doctype html><html><body><main></main><aside></aside></body></html>', { url: 'http://localhost', pretendToBeVisual: true });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'HTMLButtonElement', 'Element', 'Node', 'Text', 'Comment', 'Event', 'MouseEvent', 'KeyboardEvent', 'MutationObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame']) {
  const value = typeof dom.window[key] === 'function' && ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(key) ? dom.window[key].bind(dom.window) : dom.window[key];
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
const { mount, tick, unmount } = await import('svelte');
const { AlertDialog } = await import('@sveltery/base');
const { default: Consumer } = await import('./DOMConsumer.svelte');
const handle = AlertDialog.createHandle();
const app = mount(Consumer, { target: document.querySelector('main'), props: { handle, container: document.querySelector('aside') } });
async function settle() { await tick(); await new Promise(resolve => setTimeout(resolve, 60)); await tick(); }
await settle();
assert.equal(handle.isOpen, false); assert.equal(app.snapshot().portal, null);
document.getElementById('installed-trigger').click(); await settle();
const popup = document.querySelector('[role=alertdialog]'), { portal, viewport, actions } = app.snapshot();
assert(popup); assert.equal(handle.isOpen, true); assert.equal(handle.store.state.payload, 7);
assert.equal(popup.querySelector('output').textContent, '7');
assert.equal(portal.id, 'installed-portal'); assert.equal(portal.parentElement.id, 'installed-wrapper');
assert.equal(portal.parentElement.parentElement, document.querySelector('aside'));
assert.equal(viewport.parentElement, portal); assert.equal(viewport.className, 'viewport active');
assert.equal(viewport.style.getPropertyValue('--open'), '1');
assert.equal(popup.getAttribute('aria-labelledby'), 'installed-title'); assert.equal(popup.getAttribute('aria-describedby'), 'installed-description');
assert.equal(document.activeElement.id, 'installed-close');
document.getElementById('installed-close').click(); await settle();
assert.equal(handle.isOpen, false); assert.equal(handle.store.state.mounted, true);
assert.equal(document.activeElement.id, 'installed-close');
assert.deepEqual(app.snapshot().changes, [['change', true], ['complete', true], ['change', false]]);
actions.unmount(); await settle();
assert.equal(document.querySelector('[role=alertdialog]'), null); assert.equal(app.snapshot().portal, null); assert.equal(app.snapshot().viewport, null);
assert.equal(handle.store.state.mounted, false); assert.equal(handle.store.state.open, false);
assert.equal(document.activeElement.id, 'installed-trigger');
assert.deepEqual(app.snapshot().changes, [['change', true], ['complete', true], ['change', false], ['complete', false]]);
// Original trigger-data forwarding applies the sole owning trigger's payload again.
handle.openWithPayload(9); await settle(); assert.equal(handle.store.state.payload, 7); assert(document.querySelector('[role=alertdialog]'));
await unmount(app); await settle();
assert.equal(app.snapshot().actions, null); assert.equal(app.snapshot().portal, null); assert.equal(app.snapshot().viewport, null);
assert.equal(document.querySelector('aside').children.length, 0); assert.equal(handle.store.context.triggerElements.size, 0);
dom.window.close();
console.log('Installed public AlertDialog DOM payload, source focus/portal/Viewport, deferred presence, re-open and cleanup: PASS');
JS
node --conditions=browser --import "$alert_consumer/dom-loader.mjs" "$alert_consumer/dom-check.mjs" "$sveltery_repo_root/packages/base/package.json"
echo 'Isolated tarball AlertDialog public root/subpath nine parts, generic handle SSR, DOM and strict native types: PASS'
