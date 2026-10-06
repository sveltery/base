#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
number_field_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-number-field-consumer.XXXXXX")"
trap 'rm -rf "$number_field_consumer"' EXIT
sveltery_pack_package @sveltery/base "$number_field_consumer" > /dev/null
node --input-type=module - "$number_field_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2], tarball = readdirSync(directory).find(name => name.endsWith('.tgz'));
writeFileSync(join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(directory, tarball)}`, svelte: '5.57.1', '@sveltejs/kit': '2.70.3' }, devDependencies: { vite: '8.3.1', '@types/node': '26.6.3' } }));
JS
sveltery_prepare_consumer "$number_field_consumer"
pnpm --dir "$number_field_consumer" install --ignore-scripts > /dev/null
pnpm --dir "$number_field_consumer" install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$number_field_consumer/node_modules/@sveltery/base/LICENSE"
cat > "$number_field_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { NumberField, Field, Form } from '@sveltery/base';
  import { NumberField as SubNumberField } from '@sveltery/base/number-field';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { RemoteForm } from '@sveltejs/kit';
  let { remote }: { remote?: RemoteForm<{ amount: number }, { amount: number }> } = $props();
  const descriptor = $derived(remote?.fields.amount.as('number'));
</script>
<Form><Field.Root name="amount"><Field.Label>Amount</Field.Label><NumberField.Root defaultValue={2} locale="en-US" min={0} max={10} step="any" inputRef={null} onValueChange={(value, details) => { const number: number | null = value; details.cancel(); void number; }}>
  <NumberField.Group><NumberField.Decrement nativeButton={true}>Less</NumberField.Decrement><SubNumberField.Input /><NumberField.Increment>More</NumberField.Increment></NumberField.Group>
  <NumberField.ScrubArea direction="vertical" pixelSensitivity={4} teleportDistance={100}><NumberField.ScrubAreaCursor>Cursor</NumberField.ScrubAreaCursor>Drag</NumberField.ScrubArea>
</NumberField.Root><Field.Error /></Field.Root></Form>
{#if remote}
  <Form {remote} {...remote.enhance(async ({ submit }) => { await submit(); })}>
    {#snippet children(TypedField)}
      <TypedField.Root name="amount" as="number"><TypedField.Label>Remote amount</TypedField.Label>
        <NumberField.Root name={descriptor?.name} value={remote.fields.amount.value() ?? null} onValueChange={(value, details) => { if (!details.isCanceled && value !== null) remote?.fields.amount.set(value); }}>
          <NumberField.Input>{#snippet render(props)}<input {...props as HTMLInputAttributes} />{/snippet}</NumberField.Input>
        </NumberField.Root><TypedField.Error />
      </TypedField.Root>
    {/snippet}
  </Form>
{/if}
SVELTE
node --input-type=module - "$number_field_consumer" <<'JS'
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
const directory = process.argv[2];
const types = ['NumberFieldRootState','NumberFieldRootProps','NumberFieldRootChangeEventReason','NumberFieldRootChangeEventDetails','NumberFieldRootCommitEventReason','NumberFieldRootCommitEventDetails','NumberFieldInputState','NumberFieldInputProps','NumberFieldGroupState','NumberFieldGroupProps','NumberFieldIncrementState','NumberFieldIncrementProps','NumberFieldDecrementState','NumberFieldDecrementProps','NumberFieldScrubAreaState','NumberFieldScrubAreaProps','NumberFieldScrubAreaCursorState','NumberFieldScrubAreaCursorProps'];
let source = `import type { ComponentProps } from 'svelte';\nimport { NumberField } from '@sveltery/base';\nimport type * as Root from '@sveltery/base';\nimport type * as Sub from '@sveltery/base/number-field';\ntype Same<A,B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? A : never;\nfunction exact<A,B>(_value: Same<A,B>) {}\n`;
for (const name of types) source += `declare const ${name}Value: Sub.${name}; exact<Root.${name}, Sub.${name}>(${name}Value);\n`;
source += `const root: ComponentProps<typeof NumberField.Root> = { value: null, defaultValue: 2, min: undefined, max: undefined, smallStep: undefined, largeStep: undefined, step: undefined, required: undefined, disabled: undefined, readOnly: undefined, name: undefined, form: undefined, allowWheelScrub: undefined, snapOnStep: undefined, allowOutOfRange: undefined, format: undefined, locale: undefined, onValueChange: undefined, onValueCommitted: undefined, inputRef: undefined, class: undefined, style: undefined, render: undefined, ref: undefined, children: undefined };\nconst increment: Sub.NumberFieldIncrementProps = { disabled: undefined, nativeButton: undefined, class: () => undefined, style: () => undefined };\nconst decrement: Sub.NumberFieldDecrementProps = increment;\nconst scrub: Sub.NumberFieldScrubAreaProps = { direction: undefined, pixelSensitivity: undefined, teleportDistance: undefined };\nconst numeric: Sub.NumberFieldRootProps = { value: 2, onValueChange(value, details) { const number: number | null = value; details.cancel(); void number; }, onValueCommitted(value, details) { const number: number | null = value; const event: Event = details.event; void [number,event]; } };\n`;
source += `// @ts-expect-error Source values are nullable numbers.\nconst invalidValue: Sub.NumberFieldRootProps = { value: '2' };\n// @ts-expect-error Source defaultValue excludes null.\nconst invalidDefault: Sub.NumberFieldRootProps = { defaultValue: null };\n// @ts-expect-error Boolean flags exclude null under exact optional checking.\nconst invalidRequired: Sub.NumberFieldRootProps = { required: null };\n// @ts-expect-error Source step accepts number or any, not arbitrary strings.\nconst invalidStep: Sub.NumberFieldRootProps = { step: 'large' };\n// @ts-expect-error Numeric callbacks cannot receive strings.\nconst invalidCallback: Sub.NumberFieldRootProps = { onValueChange(value: string) { void value; } };\n// @ts-expect-error Commit details are generic and have no cancellation channel.\nconst invalidCommit: Sub.NumberFieldRootProps = { onValueCommitted(_value, details) { details.cancel(); } };\n// @ts-expect-error Scrub direction is horizontal or vertical.\nconst invalidDirection: Sub.NumberFieldScrubAreaProps = { direction: 'diagonal' };\n// @ts-expect-error Native stepper flags retain boolean semantics.\nconst invalidButton: Sub.NumberFieldIncrementProps = { disabled: null };\nvoid [root, increment, decrement, scrub, numeric, invalidValue, invalidDefault, invalidRequired, invalidStep, invalidCallback, invalidCommit, invalidDirection, invalidButton];\n`;
writeFileSync(join(directory, 'PublicTypes.ts'), source);
JS
cat > "$number_field_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { render } from 'svelte/server';
import { NumberField } from '@sveltery/base';
import { NumberField as SubNumberField } from '@sveltery/base/number-field';
import Consumer from './Consumer.svelte';
assert.equal(NumberField, SubNumberField);
assert.deepEqual(Object.keys(NumberField).sort(), ['Decrement','Group','Increment','Input','Root','ScrubArea','ScrubAreaCursor']);
const body = render(Consumer).body;
assert.match(body, /name="amount"/); assert.match(body, /type="text"/); assert.match(body, /type="number"/); assert.match(body, /value="2"/); assert.match(body, /role="group"/); assert.doesNotMatch(body, /Cursor/);
assert.throws(() => render(NumberField.Input).body, /NumberFieldRootContext is missing/);
const directory = join(import.meta.dirname,'node_modules/@sveltery/base');
assert.match(readFileSync(join(directory,'THIRD_PARTY_NOTICES.md'),'utf8'), /NumberField Root\/Input\/Group\/Increment\/Decrement\/ScrubArea\/ScrubAreaCursor/);
function scan(path) { for(const entry of readdirSync(path,{withFileTypes:true})) { const file=join(path,entry.name); if(entry.isDirectory())scan(file);else if(/\.(js|svelte)$/.test(file)) assert.doesNotMatch(readFileSync(file,'utf8'), /from\s*['"](?:react(?:\/|['"])|@sveltejs\/kit|\$app\/)/); } }
scan(join(directory,'dist'));
console.log('Isolated installed NumberField root/subpath, seven parts, 18 exact type exports, native SSR/MIT/runtime boundary: PASS');
JS
cat > "$number_field_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"noUncheckedIndexedAccess":true,"skipLibCheck":false,"verbatimModuleSyntax":true,"lib":["ES2022","ESNext.Disposable","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$number_field_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$number_field_consumer" --tsconfig ./tsconfig.json
