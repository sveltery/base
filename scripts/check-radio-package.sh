#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
radio_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-radio-consumer.XXXXXX")"
trap 'rm -rf "$radio_consumer"' EXIT
sveltery_pack_package @sveltery/base "$radio_consumer" > /dev/null
node --input-type=module - "$radio_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2];
const tarball = readdirSync(directory).find(name => name.endsWith('.tgz'));
writeFileSync(join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(directory, tarball)}`, svelte: '5.57.1' } }));
JS
sveltery_prepare_consumer "$radio_consumer"
pnpm --dir "$radio_consumer" install --ignore-scripts > /dev/null
pnpm --dir "$radio_consumer" install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$radio_consumer/node_modules/@sveltery/base/LICENSE"
node --input-type=module - "$radio_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
assert.ok(readFileSync(process.argv[2], 'utf8').includes('Radio Root/Indicator and RadioGroup'));
JS
cat > "$radio_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { Radio, RadioGroup, Field, Form } from '@sveltery/base';
  import { Radio as SubRadio } from '@sveltery/base/radio';
  import { RadioGroup as SubGroup } from '@sveltery/base/radio-group';
  import type { HTMLAttributes } from 'svelte/elements';
  const NumberGroup = RadioGroup<number>;
  const NumberRoot = Radio.Root<number>;
  let groupInput = $state<HTMLInputElement | null>();
  let rootInput = $state<HTMLInputElement | null>();
</script>
<Form><Field.Root name="storageType"><Field.Label>Storage</Field.Label><RadioGroup bind:inputRef={groupInput} defaultValue="disk" onfocusin={(event) => { const native: FocusEvent = event; event.preventBaseUIHandler(); void native; }} onfocusout={(event) => event.preventBaseUIHandler()}>
  <Radio.Root value="disk" bind:inputRef={rootInput}><Radio.Indicator />Disk</Radio.Root><SubRadio.Root value="cloud">Cloud</SubRadio.Root>
</RadioGroup></Field.Root></Form>
<SubGroup defaultValue={null} inputRef={null}><SubRadio.Root value={null} id="null-option">None</SubRadio.Root></SubGroup>
<NumberGroup name="size" value={42} onValueChange={(value, details) => { const n: number = value; const event: Event = details.event; void [n, event]; }}>
  <NumberRoot value={42} nativeButton>
    {#snippet render(props, _state, children)}<button {...props as HTMLAttributes<HTMLButtonElement>}>{@render children?.()}</button>{/snippet}
  </NumberRoot>
</NumberGroup>
SVELTE
cat > "$radio_consumer/PublicTypes.ts" <<'TS'
import type { ComponentProps } from 'svelte';
import { Radio, RadioGroup } from '@sveltery/base';
import type * as Root from '@sveltery/base';
import type * as RadioTypes from '@sveltery/base/radio';
import type * as GroupTypes from '@sveltery/base/radio-group';
type IfEquals<A, B, Y = A, N = never> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? Y : N;
function exact<Expected, Actual>(_value: IfEquals<Actual, Expected>) {}
declare const rootState: RadioTypes.RadioRootState; exact<Root.RadioRootState, typeof rootState>(rootState);
declare const rootProps: RadioTypes.RadioRootProps; exact<Root.RadioRootProps, typeof rootProps>(rootProps);
declare const indicatorState: RadioTypes.RadioIndicatorState; exact<Root.RadioIndicatorState, typeof indicatorState>(indicatorState);
declare const indicatorProps: RadioTypes.RadioIndicatorProps; exact<Root.RadioIndicatorProps, typeof indicatorProps>(indicatorProps);
declare const groupState: GroupTypes.RadioGroupState; exact<Root.RadioGroupState, typeof groupState>(groupState);
declare const groupProps: GroupTypes.RadioGroupProps; exact<Root.RadioGroupProps, typeof groupProps>(groupProps);
declare const reason: GroupTypes.RadioGroupChangeEventReason; exact<Root.RadioGroupChangeEventReason, typeof reason>(reason);
declare const details: GroupTypes.RadioGroupChangeEventDetails; exact<Root.RadioGroupChangeEventDetails, typeof details>(details);
// Source defaults must accept strict string callbacks without explicit generic arguments.
const stringCallback = (value: string) => value.toUpperCase();
const defaultGroupProps: GroupTypes.RadioGroupProps = { value: 'disk', onValueChange: stringCallback };
const nativeFocusGroup: GroupTypes.RadioGroupProps<string> = { onfocusin: (event) => { const native: FocusEvent = event; const host: HTMLDivElement = event.currentTarget; event.preventBaseUIHandler(); void [native, host]; }, onfocusout: (event) => event.preventBaseUIHandler() };
const nativeFocusRoot: RadioTypes.RadioRootProps<string> = { value: 'disk', onfocusin: (event) => { const native: FocusEvent = event; event.preventBaseUIHandler(); void native; } };
void [nativeFocusGroup, nativeFocusRoot];
const defaultRootProps: RadioTypes.RadioRootProps = { value: { storage: 'cloud' }, inputRef: null };
type IsAny<T> = 0 extends (1 & T) ? true : false;
declare const rootValueDefault: IsAny<RadioTypes.RadioRootProps['value']>;
declare const groupValueDefault: IsAny<GroupTypes.RadioGroupProps['value']>;
exact<true, typeof rootValueDefault>(rootValueDefault);
exact<true, typeof groupValueDefault>(groupValueDefault);
const nullableGroupRef: GroupTypes.RadioGroupProps<string> = { value: 'disk', inputRef: null };
// @ts-expect-error Native inputRef bindings reject callback refs.
const callbackGroupRef: GroupTypes.RadioGroupProps<string> = { inputRef: (_input: HTMLInputElement | null) => {} };
// @ts-expect-error Native inputRef bindings reject object refs.
const objectRootRef: RadioTypes.RadioRootProps<number> = { value: 42, inputRef: { current: null } };
const nativeGroupInput: GroupTypes.RadioGroupProps<string> = { inputRef: null as HTMLInputElement | null };
const nativeRootInput: RadioTypes.RadioRootProps<number> = { value: 42, inputRef: null as HTMLInputElement | null };
void [callbackGroupRef, objectRootRef, nativeGroupInput, nativeRootInput];
const nullableRootRef: RadioTypes.RadioRootProps<number> = { value: 42, inputRef: null };
// The pin permits explicitly undefined optional props even with exact optional checking.
const undefinedRoot: RadioTypes.RadioRootProps<number> = { value: 42, disabled: undefined, required: undefined, readOnly: undefined, nativeButton: undefined, inputRef: undefined, ref: undefined, children: undefined, class: undefined, style: undefined, render: undefined };
const undefinedGroup: GroupTypes.RadioGroupProps<number> = { value: undefined, defaultValue: undefined, disabled: undefined, readOnly: undefined, required: undefined, name: undefined, form: undefined, onValueChange: undefined, inputRef: undefined, ref: undefined, children: undefined, class: undefined, style: undefined, render: undefined };
const undefinedIndicator: RadioTypes.RadioIndicatorProps = { keepMounted: undefined, ref: undefined, children: undefined, class: undefined, style: undefined, render: undefined };
const emptyStateRoot: RadioTypes.RadioRootProps<number> = { value: 42, class: () => undefined, style: () => undefined };
const emptyStateGroup: GroupTypes.RadioGroupProps<number> = { class: () => undefined, style: () => undefined };
const emptyStateIndicator: RadioTypes.RadioIndicatorProps = { class: () => undefined, style: () => undefined };
void [emptyStateRoot, emptyStateGroup, emptyStateIndicator];
// @ts-expect-error Explicit undefined optional flags do not permit null flags.
const invalidNullFlag: RadioTypes.RadioRootProps<number> = { value: 42, required: null };
void [defaultGroupProps, defaultRootProps, nullableGroupRef, nullableRootRef, undefinedRoot, undefinedGroup, undefinedIndicator, invalidNullFlag];
const typed: ComponentProps<typeof RadioGroup<number>> = { value: 4, onValueChange(value, details) { exact<number, typeof value>(value); exact<Event, typeof details.event>(details.event); } };
// @ts-expect-error A number-valued group cannot be controlled by a string.
const invalid: ComponentProps<typeof RadioGroup<number>> = { value: 'wrong' };
// @ts-expect-error A numeric radio option requires a numeric value.
const option: ComponentProps<typeof Radio.Root<number>> = { value: false };
void [typed, invalid, option];
TS
cat > "$radio_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { Radio, RadioGroup, RadioRoot, RadioIndicator } from '@sveltery/base';
import { Radio as SubRadio } from '@sveltery/base/radio';
import { RadioGroup as SubGroup } from '@sveltery/base/radio-group';
import Consumer from './Consumer.svelte';
assert.equal(Radio, SubRadio); assert.equal(RadioGroup, SubGroup);
assert.equal(Radio.Root, RadioRoot); assert.equal(Radio.Indicator, RadioIndicator);
assert.deepEqual(Object.keys(Radio).sort(), ['Indicator', 'Root']);
const body = render(Consumer).body;
assert.equal((body.match(/type="radio"/g) ?? []).length, 4);
assert.equal((body.match(/role="radiogroup"/g) ?? []).length, 3);
assert.match(body, /name="storageType"/); assert.match(body, /value="disk"[^>]*checked/);
assert.match(body, /name="size"/); assert.match(body, /value="42"/);
assert.match(body, /role="radio"/); assert.match(body, /aria-checked="true"/);
assert.match(body, /data-checked/); assert.match(body, /data-unchecked/);
assert.equal(render(RadioRoot, { props: { value: '' } }).body.includes('checked'), true);
assert.throws(() => render(RadioIndicator).body, /RadioRootContext is missing/);
console.log('Isolated public Radio/RadioGroup namespaces, generic options, eight type exports, SSR, MIT and runtime boundary: PASS');
JS
cat > "$radio_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$radio_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$radio_consumer" --tsconfig ./tsconfig.json

# Diagnostic import of the actual installed public shared utility.
# Test the native environment boundary with browser-style globals and no Node process.
(
cd "$radio_consumer"
node --conditions=development --input-type=module - "$radio_consumer/node_modules/@sveltery/base" <<'JS'
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const installed = pathToFileURL(`${process.argv[2]}/dist/`);
const nodeProcess = globalThis.process;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
  userAgent: 'Legacy ignored', platform: 'Legacy ignored', maxTouchPoints: 2,
  userAgentData: { brands: [{ brand: 'Chromium', version: '153' }], platform: 'MacIntel' },
} });
try {
  globalThis.process = undefined;
  const { platform } = await import('@sveltery/utils/platform');
  const { stopEvent, isClickLikeEvent } = await import(new URL('floating-ui/utils/event.js', installed));
  assert.equal(platform.os.ios, true); assert.equal(platform.os.mac, false); assert.equal(platform.engine.blink, true);
  const event = new Event('keydown', { cancelable: true }); stopEvent(event);
  assert.equal(event.defaultPrevented, true); assert.equal(event.cancelBubble, true); assert.equal(isClickLikeEvent(event), true);
} finally { globalThis.process = nodeProcess; }
console.log('Installed public native interaction platform imports without Node process and retains UA-CH/event branches: PASS');
JS
)
