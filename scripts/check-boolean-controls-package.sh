#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
boolean_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-boolean-consumer.XXXXXX")"
trap 'rm -rf "$boolean_consumer"' EXIT
sveltery_pack_package @sveltery/base "$boolean_consumer" > /dev/null
node --input-type=module - "$boolean_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
sveltery_prepare_consumer "$boolean_consumer"
pnpm --dir "$boolean_consumer" install --ignore-scripts > /dev/null
pnpm --dir "$boolean_consumer" install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$boolean_consumer/node_modules/@sveltery/base/LICENSE"
test -f "$boolean_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cat > "$boolean_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { Form, Field, Switch, Checkbox, CheckboxGroup } from '@sveltery/base';
  import { Switch as SubpathSwitch } from '@sveltery/base/switch';
  import { Checkbox as SubpathCheckbox } from '@sveltery/base/checkbox';
  import { CheckboxGroup as SubpathGroup } from '@sveltery/base/checkbox-group';
  import type { SwitchRootProps, CheckboxRootProps, CheckboxGroupProps } from '@sveltery/base';
  const switchProps: SwitchRootProps = { defaultChecked: true, required: true, onCheckedChange(checked, details) { const value: boolean = checked; const event: Event = details.event; void [value, event]; } };
  const checkboxProps: CheckboxRootProps = { indeterminate: true, defaultChecked: false };
  let switchInput = $state<HTMLInputElement | null>();
  let checkboxInput = $state<HTMLInputElement | null>();
  const groupProps: CheckboxGroupProps = { defaultValue: ['a'], allValues: ['a', 'b'] };
</script>
<Form>
  <Field.Root name="enabled"><Field.Label>Enabled</Field.Label><Switch.Root {...switchProps} bind:inputRef={switchInput}><Switch.Thumb /></Switch.Root><Field.Description>Boolean setting</Field.Description><Field.Error /></Field.Root>
  <Field.Root name="mixed"><SubpathCheckbox.Root {...checkboxProps} bind:inputRef={checkboxInput}><SubpathCheckbox.Indicator /></SubpathCheckbox.Root></Field.Root>
  <Field.Root name="choices"><CheckboxGroup {...groupProps}><Checkbox.Root parent /><Field.Item><Checkbox.Root value="a" /><Field.Label>A</Field.Label></Field.Item><Field.Item><Checkbox.Root value="b" /><Field.Label>B</Field.Label></Field.Item></CheckboxGroup></Field.Root>
  <SubpathSwitch.Root name="outside" value="yes" uncheckedValue="no" />
  <SubpathGroup />
</Form>
SVELTE
cat > "$boolean_consumer/Types.ts" <<'TS'
import type { ComponentProps } from 'svelte';
import * as Root from '@sveltery/base';
import * as SwitchModule from '@sveltery/base/switch';
import * as CheckboxModule from '@sveltery/base/checkbox';
import * as GroupModule from '@sveltery/base/checkbox-group';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const switchEqual: Equal<[Root.SwitchRootProps, Root.SwitchRootState, Root.SwitchThumbProps, Root.SwitchThumbState, Root.SwitchRootChangeEventDetails, Root.SwitchRootChangeEventReason], [SwitchModule.SwitchRootProps, SwitchModule.SwitchRootState, SwitchModule.SwitchThumbProps, SwitchModule.SwitchThumbState, SwitchModule.SwitchRootChangeEventDetails, SwitchModule.SwitchRootChangeEventReason]> = true;
const checkboxEqual: Equal<[Root.CheckboxRootProps, Root.CheckboxRootState, Root.CheckboxIndicatorProps, Root.CheckboxIndicatorState, Root.CheckboxRootChangeEventDetails, Root.CheckboxRootChangeEventReason], [CheckboxModule.CheckboxRootProps, CheckboxModule.CheckboxRootState, CheckboxModule.CheckboxIndicatorProps, CheckboxModule.CheckboxIndicatorState, CheckboxModule.CheckboxRootChangeEventDetails, CheckboxModule.CheckboxRootChangeEventReason]> = true;
const groupEqual: Equal<[Root.CheckboxGroupProps, Root.CheckboxGroupState, Root.CheckboxGroupChangeEventDetails, Root.CheckboxGroupChangeEventReason], [GroupModule.CheckboxGroupProps, GroupModule.CheckboxGroupState, GroupModule.CheckboxGroupChangeEventDetails, GroupModule.CheckboxGroupChangeEventReason]> = true;
const propsEqual: Equal<ComponentProps<typeof Root.Switch.Root>, Root.SwitchRootProps> = true;
// The pinned source permits explicit undefined with exact optional property checking.
const undefinedSwitch: Root.SwitchRootProps = {
  class: undefined, style: undefined, render: undefined,
  children: undefined, ref: undefined, id: undefined, checked: undefined,
  defaultChecked: undefined, disabled: undefined, inputRef: undefined,
  name: undefined, form: undefined, nativeButton: undefined,
  onCheckedChange: undefined, readOnly: undefined, required: undefined,
  uncheckedValue: undefined, value: undefined,
};
const undefinedCheckbox: Root.CheckboxRootProps = {
  ...undefinedSwitch, indeterminate: undefined, parent: undefined,
};
const undefinedGroup: Root.CheckboxGroupProps = {
  class: undefined, style: undefined, render: undefined,
  children: undefined, ref: undefined, value: undefined, defaultValue: undefined,
  onValueChange: undefined, allValues: undefined, disabled: undefined,
};
const undefinedThumb: Root.SwitchThumbProps = {
  class: undefined, style: undefined, render: undefined, children: undefined, ref: undefined,
};
const undefinedIndicator: Root.CheckboxIndicatorProps = {
  class: undefined, style: undefined, render: undefined,
  children: undefined, ref: undefined, keepMounted: undefined,
};
const nullableSwitchRefs: Root.SwitchRootProps = { inputRef: null, ref: null };
const nullableCheckboxRefs: Root.CheckboxRootProps = { inputRef: null, ref: null };
// @ts-expect-error Native inputRef bindings reject callback refs.
const callbackSwitchRef: Root.SwitchRootProps = { inputRef: (_input: HTMLInputElement | null) => {} };
// @ts-expect-error Native inputRef bindings reject object refs.
const objectCheckboxRef: Root.CheckboxRootProps = { inputRef: { current: null } };
const nativeSwitchInput: Root.SwitchRootProps = { inputRef: null as HTMLInputElement | null };
const nativeCheckboxInput: Root.CheckboxRootProps = { inputRef: null as HTMLInputElement | null };
// @ts-expect-error A checked form control takes a boolean, not a text value.
const invalidChecked: Root.SwitchRootProps = { checked: 'true' };
// @ts-expect-error CheckboxGroup uses string arrays.
const invalidArray: Root.CheckboxGroupProps = { value: [1] };
// @ts-expect-error Switch has no indeterminate prop.
const invalidIndeterminate: Root.SwitchRootProps = { indeterminate: true };
void [switchEqual, checkboxEqual, groupEqual, propsEqual, undefinedSwitch,
  undefinedCheckbox, undefinedGroup, undefinedThumb, undefinedIndicator,
  nullableSwitchRefs, nullableCheckboxRefs, callbackSwitchRef, objectCheckboxRef, nativeSwitchInput, nativeCheckboxInput,
  invalidChecked, invalidArray, invalidIndeterminate];
TS
cat > "$boolean_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import Consumer from './Consumer.svelte';
import { Checkbox, Switch, CheckboxGroup } from '@sveltery/base';
import { Checkbox as SubpathCheckbox } from '@sveltery/base/checkbox';
import { Switch as SubpathSwitch } from '@sveltery/base/switch';
import { CheckboxGroup as SubpathGroup } from '@sveltery/base/checkbox-group';
assert.equal(typeof window, 'undefined'); assert.equal(typeof document, 'undefined');
assert.equal(Checkbox, SubpathCheckbox); assert.equal(Switch, SubpathSwitch); assert.equal(CheckboxGroup, SubpathGroup);
assert.deepEqual(Object.keys(Checkbox).sort(), ['Indicator', 'Root']); assert.deepEqual(Object.keys(Switch).sort(), ['Root', 'Thumb']);
const body = render(Consumer).body;
assert.equal((body.match(/type="checkbox"/g) ?? []).length, 6);
assert.match(body, /role="switch"[^>]*aria-checked="true"/); assert.match(body, /aria-checked="mixed"/);
assert.match(body, /name="enabled"/); assert.match(body, /name="choices"/); assert.match(body, /value="a"/);
assert.match(body, /type="hidden"[^>]*name="outside"[^>]*value="no"/);
assert.match(body, /Enabled/); assert.match(body, /Boolean setting/); assert.match(body, /data-indeterminate/);
JS
cat > "$boolean_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"skipLibCheck":false,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$boolean_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$boolean_consumer" --tsconfig ./tsconfig.json
echo 'Isolated public Checkbox Switch CheckboxGroup root/subpath, SSR and sixteen type exports: PASS'
