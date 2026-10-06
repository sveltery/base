#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
button_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-button-consumer.XXXXXX")"
trap 'rm -rf "$button_consumer"' EXIT
sveltery_pack_package @sveltery/base "$button_consumer" > /dev/null
node --input-type=module - "$button_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2];
const tarball = readdirSync(directory).find(name => name.endsWith('.tgz'));
writeFileSync(join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(directory, tarball)}`, svelte: '5.57.1' } }));
JS
sveltery_prepare_consumer "$button_consumer"
pnpm --dir "$button_consumer" install --ignore-scripts > /dev/null
pnpm --dir "$button_consumer" install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$button_consumer/node_modules/@sveltery/base/LICENSE"
cmp packages/base/THIRD_PARTY_NOTICES.md "$button_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cat > "$button_consumer/PublicTypes.ts" <<'TS'
import type { ComponentProps } from 'svelte';
import { Button, type ButtonProps, type ButtonState } from '@sveltery/base';
import { Button as Subpath, type ButtonProps as SubpathProps, type ButtonState as SubpathState } from '@sveltery/base/button';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
export type Agreement = [Assert<Equal<typeof Button, typeof Subpath>>, Assert<Equal<ButtonProps, SubpathProps>>, Assert<Equal<ButtonState, SubpathState>>, Assert<Equal<ComponentProps<typeof Button>, ButtonProps>>];
const explicitUndefined: ButtonProps = { disabled: undefined, nativeButton: undefined, focusableWhenDisabled: undefined, class: undefined, style: undefined, render: undefined, children: undefined, ref: undefined, type: undefined };
const native: SubpathProps = { disabled: true, focusableWhenDisabled: true, nativeButton: true, type: 'submit', name: 'action', value: 'save', form: 'checkout', formaction: '/save', formmethod: 'post', formnovalidate: true, class: ['native', { active: true }], style: state => state.disabled ? { opacity: 0.5 } : undefined, onclick(event) { event.preventBaseUIHandler(); event.preventDefault(); const host: HTMLButtonElement = event.currentTarget; void host; }, onpointerdown(event) { const pointer: PointerEvent = event; event.preventBaseUIHandler(); void pointer; } };
// @ts-expect-error Native type is constrained to button/submit/reset.
const badType: ButtonProps = { type: 'link' };
// @ts-expect-error Disabled remains boolean.
const badDisabled: ButtonProps = { disabled: 1 };
// @ts-expect-error nativeButton remains boolean.
const badNative: ButtonProps = { nativeButton: 'false' };
// @ts-expect-error focusability remains boolean.
const badFocus: ButtonProps = { focusableWhenDisabled: 'true' };
// @ts-expect-error bind:ref publishes an actual HTMLElement; React callback refs are not this native API.
const badRef: ButtonProps = { ref: () => {} };
// @ts-expect-error State callbacks must receive the actual ButtonState.
const badState: ButtonProps = { style: (state: { active: boolean }) => ({ opacity: state.active ? 1 : 0 }) };
// @ts-expect-error Native event inference must remain intact.
const badPointer: ButtonProps = { onpointerdown(event: KeyboardEvent) { void event; } };
void [explicitUndefined, native, badType, badDisabled, badNative, badFocus, badRef, badState, badPointer];
TS
cat > "$button_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { Button, type HTMLProps } from '@sveltery/base';
  import { Button as Subpath } from '@sveltery/base/button';
  import { mergeProps } from '@sveltery/base/merge-props';
  import { untrack, type Snippet } from 'svelte';
  let ref = $state<HTMLElement | null>();
  let innerRef = $state<HTMLElement | null>();
  let disabled = $state(false);
  let visible = $state(true);
  let calls = $state<string[]>([]);
  function record(value: string) { calls = [...calls, value]; }
  function attached(host: HTMLSpanElement) { untrack(() => record(`attach:${host.id}`)); return () => untrack(() => record(`detach:${host.id}`)); }
  export function disable() { disabled = true; }
  export function remove() { visible = false; }
  export function snapshot() { return { ref, innerRef, calls: [...calls] }; }
</script>
{#snippet span(props: HTMLProps, _state: { disabled: boolean }, children: Snippet | undefined)}
  <span {...mergeProps(props, { onclick: () => record('render') })}>{@render children?.()}</span>
{/snippet}
{#snippet nested(props: HTMLProps, _state: { disabled: boolean }, children: Snippet | undefined)}
  <Subpath {...props} nativeButton={false} {disabled} focusableWhenDisabled bind:ref={innerRef} render={span}>{@render children?.()}</Subpath>
{/snippet}
<Button id="packed-default">Default</Button><Subpath id="packed-undefined" type={undefined}>Undefined</Subpath>
{#if visible}<Button id="packed-live" nativeButton={false} {disabled} focusableWhenDisabled render={nested} bind:ref {@attach attached} class={state => ['public', { disabled: state.disabled }]} style={state => ({ opacity: state.disabled ? 0.5 : 1 })} onclick={() => record('click')}>Packed action</Button>{/if}
SVELTE
cat > "$button_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"noUncheckedIndexedAccess":true,"skipLibCheck":false,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$button_consumer" --tsconfig ./tsconfig.json
cat > "$button_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { Button } from '@sveltery/base';
import { Button as Subpath } from '@sveltery/base/button';
import Consumer from './Consumer.svelte';
assert.equal(Button, Subpath);
const html = render(Consumer).body;
assert.match(html, /id="packed-default"[^>]*type="button"|type="button"[^>]*id="packed-default"/);
assert(!/<button[^>]*id="packed-undefined"[^>]*type=/.test(html));
assert.match(html, /<span[^>]*id="packed-live"/);
assert.match(html, /role="button"/);
assert.match(html, /class="public"/);
assert.match(html, /opacity:1/);
console.log('Isolated public packed Button root/subpath identity, SSR and strict exact-optional native types: PASS');
JS
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$button_consumer/check.mjs"
cat > "$button_consumer/dom-loader.mjs" <<'JS'
import { registerHooks, createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('./package.json', import.meta.url));
const { compile, compileModule } = require('svelte/compiler');
registerHooks({ load(url, context, nextLoad) {
  if (url.endsWith('.svelte') || url.endsWith('.svelte.js')) {
    const source = readFileSync(fileURLToPath(url), 'utf8');
    const options = { filename: fileURLToPath(url), generate: 'client' };
    const result = url.endsWith('.svelte') ? compile(source, options) : compileModule(source, options);
    return { format: 'module', source: result.js.code, shortCircuit: true };
  }
  return nextLoad(url, context);
} });
JS
cat > "$button_consumer/dom-check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const tooling = createRequire(process.argv[2]);
const { JSDOM } = tooling('jsdom');
const dom = new JSDOM('<!doctype html><html><body><main></main></body></html>', { url: 'http://localhost' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'Element', 'SVGElement', 'Node', 'Text', 'Comment', 'Event', 'MouseEvent', 'KeyboardEvent', 'MutationObserver', 'getComputedStyle']) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
const { mount, flushSync, unmount } = await import('svelte');
const { default: Consumer } = await import('./Consumer.svelte');
const app = mount(Consumer, { target: document.querySelector('main') }); flushSync();
const host = document.querySelector('#packed-live');
assert.equal(app.snapshot().ref, host); assert.equal(app.snapshot().innerRef, host);
assert.equal(host.tagName, 'SPAN'); assert.equal(host.getAttribute('role'), 'button');
host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); flushSync();
assert.deepEqual(app.snapshot().calls, ['attach:packed-live', 'render', 'click']);
app.disable(); flushSync(); assert.equal(document.querySelector('#packed-live'), host);
assert.equal(host.getAttribute('aria-disabled'), 'true'); assert(host.hasAttribute('data-disabled')); assert.equal(host.style.opacity, '0.5');
host.click(); flushSync(); assert.equal(app.snapshot().calls.filter(call => call === 'click').length, 1);
app.remove(); flushSync(); assert.equal(document.querySelector('#packed-live'), null); assert.equal(app.snapshot().ref, null); assert.equal(app.snapshot().innerRef, null);
assert.equal(app.snapshot().calls.filter(call => call === 'detach:packed-live').length, 1);
await unmount(app); dom.window.close();
console.log('Isolated public packed Button nested native hosts, keyboard, disabled updates, attachments and bind-ref cleanup: PASS');
JS
node --conditions=browser --import "$button_consumer/dom-loader.mjs" "$button_consumer/dom-check.mjs" "$sveltery_repo_root/packages/base/package.json"
