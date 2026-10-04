#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
otp_consumer_dir="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-otp-consumer.XXXXXX")"
trap 'rm -rf "$otp_consumer_dir"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$otp_consumer_dir" >/dev/null
node --input-type=module - "$otp_consumer_dir" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const dir = process.argv[2];
const tarball = readdirSync(dir).find(name => name.endsWith('.tgz'));
writeFileSync(join(dir, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(dir,tarball)}`, svelte:'5.57.1', 'svelte-check':'4.7.6', typescript:'5.9.3', jsdom:'30.1.1' } }));
JS
pnpm --dir "$otp_consumer_dir" --ignore-workspace install --ignore-scripts >/dev/null
pnpm --dir "$otp_consumer_dir" --ignore-workspace install --frozen-lockfile --ignore-scripts >/dev/null
cat > "$otp_consumer_dir/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { OTPField, Field, OTPFieldRoot, OTPFieldInput } from '@sveltery/base';
  import { OTPField as Subpath, type OTPFieldRootProps, type OTPFieldInputProps } from '@sveltery/base/otp-field';
  import type { HTMLInputAttributes, HTMLAttributes } from 'svelte/elements';
  let owner = $state('');
  let rootRef = $state<HTMLElement | null>(null);
  let inputRef = $state<HTMLElement | null>(null);
  let separatorRef = $state<HTMLElement | null>(null);
  const props: OTPFieldRootProps = { length:4, validationType:'alphanumeric', normalizeValue:value=>value.toUpperCase(), onValueChange(value,details) { if(details.reason==='input-paste'){const event:ClipboardEvent=details.event;void event;}if(details.reason==='keyboard'){const event:KeyboardEvent=details.event;void event;}owner=value; } };
  const input: OTPFieldInputProps = { readonly:false, oninput:event=>event.preventBaseUIHandler() };
</script>
<Field.Root name="code"><Field.Label>Code</Field.Label><OTPField.Root {...props} value={owner} name="code" bind:ref={rootRef} class={state => [state.complete && 'complete', { required:state.required }]} style={state => ({ opacity:state.disabled ? 0.5 : 1 })}><OTPField.Input bind:ref={inputRef} name="slot" checked={undefined} class={state => ['slot', { filled:state.filled }]} style={state => ({ opacity:state.filled ? 1 : 0.5 })}/><OTPField.Input/><OTPField.Separator orientation={undefined} bind:ref={separatorRef} class={state => state.orientation} style={state => ({ color:state.orientation === 'horizontal' ? 'blue' : 'red' })}/><OTPField.Input/><OTPField.Input/></OTPField.Root></Field.Root>
<Subpath.Root length={2} defaultValue="12"><Subpath.Input {...input}/><Subpath.Input/></Subpath.Root>
<OTPFieldRoot length={1} defaultValue="a" validationType="alpha">
  {#snippet render(props,_state,children)}<section {...props as HTMLAttributes<HTMLElement>}>{@render children?.()}</section>{/snippet}
  <OTPFieldInput>{#snippet render(props,state)}<input {...props as HTMLInputAttributes} data-index={state.index}/>{/snippet}</OTPFieldInput>
</OTPFieldRoot>
SVELTE
cat > "$otp_consumer_dir/types.ts" <<'TS'
import type { ComponentProps } from 'svelte';
import { OTPField } from '@sveltery/base';
import { OTPField as Subpath, type OTPFieldRootProps, type OTPFieldInputProps } from '@sveltery/base/otp-field';
import type { SeparatorProps } from '@sveltery/base/separator';
declare const rootRender: NonNullable<OTPFieldRootProps['render']>;
declare const inputRender: NonNullable<OTPFieldInputProps['render']>;
declare const separatorRender: NonNullable<SeparatorProps['render']>;
const root: ComponentProps<typeof OTPField.Root> = { length:6, name:'code', value:undefined, form:'form', inputMode:'tel', mask:true, ref:undefined, render:rootRender, class:state=>[state.complete && 'complete'], style:state=>({ opacity:state.required ? 1 : 0.5 }) };
const subpath: ComponentProps<typeof Subpath.Input> = { disabled:true, readonly:true, name:'slot', checked:false, value:undefined, ref:null, render:inputRender, class:state=>({ filled:state.filled }), style:state=>({ opacity:state.index ? 0.5 : 1 }) };
const separator: ComponentProps<typeof Subpath.Separator> = { orientation:undefined, ref:undefined, render:separatorRender, class:state=>state.orientation, style:state=>({ color:state.orientation === 'horizontal' ? 'blue' : 'red' }) };
// @ts-expect-error length is required
const badRoot: OTPFieldRootProps = {};
// @ts-expect-error order is inferred
const badIndex: OTPFieldInputProps = { index:0 };
// @ts-expect-error sanitizeValue was renamed
const badName: OTPFieldRootProps = { length:6, sanitizeValue:(value:string)=>value };
// @ts-expect-error logical names are strings
const numericName: OTPFieldRootProps = { length:6, name:42 };
// @ts-expect-error a group root has no native checked prop
const rootChecked: OTPFieldRootProps = { length:6, checked:true };
// @ts-expect-error native checked is boolean
const inputChecked: OTPFieldInputProps = { checked:'true' };
// @ts-expect-error bindable actual-element ref is not a callback ref
const callbackRef: OTPFieldInputProps = { ref:()=>{} };
// @ts-expect-error plain callbacks are not native Svelte render snippets
const callbackRender: OTPFieldRootProps = { length:6, render:()=>{} };
// @ts-expect-error class callbacks must return a native ClassValue
const invalidClass: OTPFieldInputProps = { class:state=>Symbol(state.index) };
// @ts-expect-error native style callbacks must return a native style value
const invalidStyle: SeparatorProps = { style:()=>true };
// @ts-expect-error orientation is finite
const invalidOrientation: ComponentProps<typeof Subpath.Separator> = { orientation:'diagonal' };
void [root,subpath,separator,badRoot,badIndex,badName,numericName,rootChecked,inputChecked,callbackRef,callbackRender,invalidClass,invalidStyle,invalidOrientation];
TS
cat > "$otp_consumer_dir/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"noUncheckedIndexedAccess":true,"skipLibCheck":false,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.ts","*.svelte"]}
JSON
pnpm --dir "$otp_consumer_dir" exec svelte-check --tsconfig tsconfig.json
cat > "$otp_consumer_dir/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { render } from 'svelte/server';
import { OTPField, OTPFieldRoot, OTPFieldInput } from '@sveltery/base';
import { OTPField as Subpath } from '@sveltery/base/otp-field';
import Consumer from './Consumer.svelte';
assert.equal(OTPField.Root, OTPFieldRoot);
assert.equal(OTPField.Input, OTPFieldInput);
assert.equal(Subpath.Root, OTPField.Root);
assert.equal(Subpath.Separator, OTPField.Separator);
const html=render(Consumer).body;
assert.equal((html.match(/role="group"/g)??[]).length,3);
assert.equal((html.match(/aria-hidden="true"/g)??[]).length,3);
assert.equal((html.match(/<input /g)??[]).length,10);
assert.match(html,/pattern="\[a-zA-Z0-9\]\{4\}"/);
assert.match(html,/<section /);
const metadata=JSON.parse(readFileSync(new URL('./node_modules/@sveltery/base/package.json',import.meta.url)));
assert(metadata.exports['./otp-field']);
assert(!metadata.dependencies.react);
console.log('OTP packed root/subpath strict types and SSR consumer: PASS');
JS
node --import "$PWD/scripts/svelte-ssr-loader.mjs" "$otp_consumer_dir/check.mjs"

# Installed private helper diagnostic: OTP consumes this module; no public export is added.
# Browser-style navigator and real jsdom events must not require a Node process global.
cat > "$otp_consumer_dir/native-event.mjs" <<'JS'
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<div><input></div>');
const nodeProcess = globalThis.process;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
try {
  globalThis.process = undefined;
  const { platform } = await import('./node_modules/@sveltery/base/dist/utils/platform/index.js');
  const { stopEvent, isClickLikeEvent } = await import('./node_modules/@sveltery/base/dist/floating-ui/utils/event.js');
  assert.equal(platform.env.jsdom, true);
  const parent = dom.window.document.querySelector('div');
  const input = parent.querySelector('input');
  const seen = [];
  parent.addEventListener('keydown', () => seen.push('parent'));
  input.addEventListener('keydown', event => { seen.push('input'); stopEvent(event); });
  const event = new dom.window.KeyboardEvent('keydown', { key:'ArrowRight', bubbles:true, cancelable:true });
  assert.equal(input.dispatchEvent(event), false);
  assert.equal(event.defaultPrevented, true);
  assert.equal(isClickLikeEvent(event), true);
  assert.deepEqual(seen, ['input']);
} finally { globalThis.process = nodeProcess; dom.window.close(); }
console.log('OTP installed private native event consumer without Node process: PASS');
JS
node --conditions=development "$otp_consumer_dir/native-event.mjs"
