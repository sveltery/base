#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
snippet_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-native-snippets-consumer.XXXXXX")"
trap 'rm -rf "$snippet_consumer"' EXIT
sveltery_pack_package @sveltery/base "$snippet_consumer" > /dev/null
node --input-type=module - "$snippet_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2];
const tarball = readdirSync(directory).find(name => name.endsWith('.tgz'));
writeFileSync(join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(directory, tarball)}`, svelte: '5.57.1' } }));
JS
sveltery_prepare_consumer "$snippet_consumer"
pnpm --dir "$snippet_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$snippet_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$snippet_consumer/node_modules/@sveltery/base/LICENSE"
cmp packages/base/THIRD_PARTY_NOTICES.md "$snippet_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cat > "$snippet_consumer/PublicTypes.ts" <<'TS'
import type * as Root from '@sveltery/base';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
type NativeContracts = [
  Assert<Equal<Root.ComponentRenderFn<Root.HTMLProps, Root.ToggleState>, Snippet<[Root.HTMLProps, Root.ToggleState, Snippet | undefined]>>>,
  Assert<Equal<Root.HTMLProps[string], unknown>>,
  Assert<Equal<Root.HTMLProps[symbol], HTMLAttributes<any>[symbol]>>,
  Assert<Equal<Root.CheckboxRootProps['inputRef'], HTMLInputElement | null | undefined>>,
  Assert<Equal<Root.SwitchRootProps['inputRef'], HTMLInputElement | null | undefined>>,
  Assert<Equal<Root.RadioRootProps['inputRef'], HTMLInputElement | null | undefined>>,
  Assert<Equal<Root.RadioGroupProps['inputRef'], HTMLInputElement | null | undefined>>,
];
// @ts-expect-error The explicitly retired renderer is absent from the public root.
import type { UseRender } from '@sveltery/base';
// @ts-expect-error The explicitly retired renderer aliases are absent from the public root.
import type { UseRenderProps } from '@sveltery/base';
// @ts-expect-error The retired renderer subpath is absent.
import type * as Retired from '@sveltery/base/use-render';
// @ts-expect-error Pure internal prop composition is not an invented public renderer API.
import type { mergeComponentProps } from '@sveltery/base';
// @ts-expect-error A symbol prop is an actual native attachment slot.
const invalidAttachment: Root.HTMLProps = { [Symbol()]: 123 };
// @ts-expect-error Host refs use native element bindings, not callback transports.
const callbackRef: Root.ButtonProps = { ref: () => {} };
// @ts-expect-error Hidden input refs use native element bindings, not object transports.
const objectInput: Root.CheckboxRootProps = { inputRef: { current: null } };
void [invalidAttachment, callbackRef, objectInput];
export type { NativeContracts };
TS
cat > "$snippet_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { Button, Toggle, Separator, Avatar, Field, Form, Input, Toast, mergeProps, type HTMLProps, type ToggleState } from '@sveltery/base';
  import { Button as SubpathButton } from '@sveltery/base/button';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes, SVGAttributes } from 'svelte/elements';
</script>
<Button id="packed-native-button">Packed children</Button><SubpathButton type="submit">Submit</SubpathButton>
<Toggle id="packed-toggle" defaultPressed nativeButton={false} class="base">
  {#snippet render(props: HTMLProps, state: ToggleState, children: Snippet | undefined)}
    <span {...mergeProps(props, { class: 'owned' }) as HTMLAttributes<HTMLSpanElement>} data-state={String(state.pressed)}>{@render children?.()}</span>
  {/snippet}
  Replacement children
</Toggle>
<Separator orientation="vertical">{#snippet render(props, _state, children)}<svg {...props as SVGAttributes<SVGSVGElement>} id="packed-svg"><title>Native SVG children</title>{@render children?.()}</svg>{/snippet}</Separator>
<Avatar.Root><Avatar.Image keepMounted src="/packed.png" /></Avatar.Root>
<Form><Field.Root name="email"><Field.Label>Email</Field.Label><Input defaultValue="seed"/><Field.Description>Description</Field.Description></Field.Root></Form>
<Toast.Provider><Toast.Viewport><Toast.Root toast={{ id: 'packed', title: 'Packed title', description: 'Packed description', actionProps: { children: 'Packed action' } }} swipeDirection={[]}>
  <Toast.Title>{#snippet render(props, state, children)}<h4 {...props} data-type={state.type}>{@render children?.()}</h4>{/snippet}</Toast.Title>
  <Toast.Description /><Toast.Action children="Ignored action">{#snippet render(props, _state, children)}<button {...props}>{@render children?.()}</button>{/snippet}</Toast.Action>
</Toast.Root></Toast.Viewport></Toast.Provider>
SVELTE
cat > "$snippet_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import * as root from '@sveltery/base';
import { Button } from '@sveltery/base/button';
import Consumer from './Consumer.svelte';
assert.equal(root.Button, Button); assert.equal(Object.hasOwn(root, 'UseRender'), false);
await assert.rejects(import('@sveltery/base/use-render'), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
assert.equal(typeof window, 'undefined'); assert.equal(typeof document, 'undefined');
const body = render(Consumer).body;
assert.match(body, /type="button"/); assert.match(body, /type="submit"/); assert.match(body, /Packed children/);
assert.match(body, /class="owned base"/); assert.match(body, /data-state="true"/); assert.match(body, /Replacement children/);
assert.match(body, /<svg/); assert.match(body, /data-orientation="vertical"/); assert.match(body, /Native SVG children/);
assert.match(body, /alt=""/); assert.match(body, /value="seed"/); assert.match(body, /name="email"/);
assert.match(body, /Packed title/); assert.match(body, /Packed description/); assert.match(body, /Packed action/); assert.doesNotMatch(body, /Ignored action/);
console.log('Installed native snippet SSR, real state/children/IDs, root/subpath identity and retired API exclusion: PASS');
JS
cat > "$snippet_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"noUncheckedIndexedAccess":true,"skipLibCheck":false,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$snippet_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$snippet_consumer" --tsconfig ./tsconfig.json
cat > "$snippet_consumer/DOMConsumer.svelte" <<'SVELTE'
<script lang="ts">
  import { Toggle, Checkbox, Switch, Radio, RadioGroup, type HTMLProps, type ToggleState } from '@sveltery/base';
  import { createAttachmentKey } from 'svelte/attachments';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  let stage = $state(0);
  let element = $state<HTMLElement | null>();
  let checkboxInput = $state<HTMLInputElement | null>();
  let switchInput = $state<HTMLInputElement | null>();
  let radioInput = $state<HTMLInputElement | null>();
  let groupInput = $state<HTMLInputElement | null>();
  const calls: unknown[][] = [];
  const key = createAttachmentKey();
  function observer(label: string) {
    return (host: HTMLElement) => {
      calls.push(['attach', label, host.tagName, host.isConnected, host.getAttribute('class')]);
      return () => calls.push(['cleanup', label, host.tagName, host.isConnected, host.getAttribute('class')]);
    };
  }
  const first = observer('first'), next = observer('next');
  export function advance() { stage += 1; }
  export function snapshot() { return { element, checkboxInput, switchInput, radioInput, groupInput, calls }; }
</script>
{#snippet replacement(props: HTMLProps, state: ToggleState, children: Snippet | undefined)}
  <span {...props as HTMLAttributes<HTMLSpanElement>} data-state={String(state.pressed)}>{@render children?.()}</span>
{/snippet}
{#if stage < 4}
  <Toggle id="packed-live" class={stage === 0 ? 'before' : stage < 3 ? 'changed' : 'reactive'} pressed={stage > 0} nativeButton={stage < 2} bind:ref={element}
    render={stage >= 2 ? replacement : undefined} {...{ [key]: stage === 0 ? first : next }}>Packed live children</Toggle>
  <Checkbox.Root bind:inputRef={checkboxInput} /><Switch.Root bind:inputRef={switchInput} />
  <RadioGroup defaultValue="selected" bind:inputRef={groupInput}><Radio.Root value="selected" bind:inputRef={radioInput} /></RadioGroup>
{/if}
SVELTE
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$snippet_consumer" --tsconfig ./tsconfig.json
cat > "$snippet_consumer/dom-loader.mjs" <<'JS'
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
cat > "$snippet_consumer/dom-check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const tooling = createRequire(process.argv[2]); const { JSDOM } = tooling('jsdom');
const dom = new JSDOM('<!doctype html><html><body><main></main></body></html>', { url: 'http://localhost' });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'HTMLFormElement', 'HTMLButtonElement', 'Element', 'SVGElement', 'Node', 'Text', 'Comment', 'Event', 'MouseEvent', 'MutationObserver', 'getComputedStyle']) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
const { mount, flushSync, unmount } = await import('svelte');
const { default: Consumer } = await import('./DOMConsumer.svelte');
const app = mount(Consumer, { target: document.querySelector('main') }); flushSync();
const host = () => document.querySelector('#packed-live'); let current = host();
assert.equal(current.tagName, 'BUTTON'); assert.equal(current.getAttribute('type'), 'button');
assert.equal(current.textContent, 'Packed live children'); assert.equal(app.snapshot().element, current);
assert(app.snapshot().checkboxInput instanceof HTMLInputElement); assert(app.snapshot().switchInput instanceof HTMLInputElement);
assert.equal(app.snapshot().radioInput, app.snapshot().groupInput); assert.equal(app.snapshot().groupInput.checked, true);
assert.deepEqual(app.snapshot().calls, [['attach', 'first', 'BUTTON', true, 'before']]);
app.advance(); flushSync(); assert.equal(host(), current); assert.equal(host().getAttribute('data-pressed'), '');
assert.deepEqual(app.snapshot().calls, [['attach', 'first', 'BUTTON', true, 'before'], ['cleanup', 'first', 'BUTTON', true, 'changed'], ['attach', 'next', 'BUTTON', true, 'changed']]);
app.advance(); flushSync(); assert.notEqual(host(), current); current = host(); assert.equal(current.tagName, 'SPAN');
assert.equal(app.snapshot().element, current); assert.equal(current.getAttribute('data-state'), 'true');
assert.deepEqual(app.snapshot().calls.slice(3), [['cleanup', 'next', 'BUTTON', false, 'changed'], ['attach', 'next', 'SPAN', true, 'changed']]);
app.advance(); flushSync(); assert.equal(host(), current); assert.equal(host().getAttribute('class'), 'reactive'); assert.equal(app.snapshot().calls.length, 5);
app.advance(); flushSync(); assert.equal(host(), null);
for (const key of ['element', 'checkboxInput', 'switchInput', 'radioInput', 'groupInput']) assert.equal(app.snapshot()[key], null);
assert.deepEqual(app.snapshot().calls.slice(5), [['cleanup', 'next', 'SPAN', false, 'reactive']]);
await unmount(app); assert.equal(document.querySelector('main').children.length, 0); dom.window.close();
console.log('Installed native public snippets, actual host/input bindings, native update/removal and independent cleanup: PASS');
JS
node --conditions=browser --import "$snippet_consumer/dom-loader.mjs" "$snippet_consumer/dom-check.mjs" "$sveltery_repo_root/packages/base/package.json"
echo 'Installed native snippets: strict types, real SSR/DOM consumers, both packed workspace artifacts and MIT notices: PASS'
