#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
field_form_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-field-form-consumer.XXXXXX")"
trap 'rm -rf "$field_form_consumer"' EXIT
sveltery_pack_package @sveltery/base "$field_form_consumer" > /dev/null
node --input-type=module - "$field_form_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
sveltery_prepare_consumer "$field_form_consumer"
pnpm --dir "$field_form_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$field_form_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
test -f "$field_form_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cmp LICENSE "$field_form_consumer/node_modules/@sveltery/base/LICENSE"
node --input-type=module - "$field_form_consumer" "${1:-}" <<'JS'
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2], publicMode = process.argv[3] === '--public';
const types = {
  field: ['FieldRootState', 'FieldValidityData', 'FieldRootActions', 'FieldRootProps', 'FieldControlProps', 'FieldControlState', 'FieldControlChangeEventReason', 'FieldControlChangeEventDetails', 'FieldLabelState', 'FieldLabelProps', 'FieldDescriptionState', 'FieldDescriptionProps', 'FieldItemState', 'FieldItemProps', 'FieldTransitionStatus', 'FieldErrorState', 'FieldErrorProps', 'FieldValidityState', 'FieldValidityProps'],
  form: ['FormValidationMode', 'FormErrors', 'FormActions', 'FormState', 'FormSubmitEventReason', 'FormSubmitEventDetails', 'FormValues', 'FormProps'],
  fieldset: ['FieldsetRootState', 'FieldsetRootProps', 'FieldsetLegendState', 'FieldsetLegendProps'],
};
const internal = module => `./node_modules/@sveltery/base/dist/${module}/index.js`;
const first = module => publicMode ? '@sveltery/base' : internal(module);
const second = module => publicMode ? `@sveltery/base/${module}` : internal(module);
const imports = [['field', 'Field'], ['form', 'Form'], ['fieldset', 'Fieldset'], ['input', 'Input']].map(([module, name]) => `export { ${name} as ${name}A } from '${first(module)}';\nexport { ${name} as ${name}B } from '${second(module)}';`).join('\n');
writeFileSync(join(destination, 'imports.js'), imports);
writeFileSync(join(destination, 'imports.d.ts'), imports + '\n' + Object.entries(types).map(([module, names]) => `export type { ${names.join(', ')} } from '${first(module)}';`).join('\n'));
let publicTypes = `import type { ComponentProps } from 'svelte';\nimport { FieldA, FormA, InputA } from './imports.js';\nimport type { FormProps } from './imports.js';\n`;
publicTypes += `import type { FieldRootProps, FieldControlProps, FieldLabelProps, FieldDescriptionProps, FieldItemProps, FieldErrorProps, FieldsetRootProps, FieldsetLegendProps } from './imports.js';\n`;
publicTypes += `type IfEquals<A, B, Y = A, N = never> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? Y : N;\nfunction exact<Expected, Actual>(_value: IfEquals<Actual, Expected>) {}\n`;
publicTypes += `interface Values { name: string; age: number }\nconst props: ComponentProps<typeof FormA<Values>> = { onFormSubmit(values) { exact<string, typeof values.name>(values.name); exact<number, typeof values.age>(values.age);\n// @ts-expect-error The generic shape excludes email.\nvalues.email.startsWith('a'); } };\ndeclare const native: Parameters<NonNullable<ComponentProps<typeof FormA>['render']>>[0];\nexact<boolean | undefined, typeof native.noValidate>(native.noValidate);\ndeclare const control: ComponentProps<typeof FieldA.Control>;\nexact<ComponentProps<typeof InputA>, typeof control>(control);\nconst typed: FormProps<Values> = props; void typed;\n`;
publicTypes += `const defaultForm: FormProps = { onFormSubmit(values) { values.email.trim(); } };\nconst defaultComponent: ComponentProps<typeof FormA> = { onFormSubmit(values) { values.email.trim(); } };\nconst defaultField: FieldRootProps = { validate(_value, values) { return values.email.trim(); } };\nconst nativeUndefined = { class: undefined, style: undefined, render: undefined, children: undefined, ref: undefined };\nconst optionalRoot: FieldRootProps = { ...nativeUndefined, disabled: undefined, name: undefined, validate: undefined, validationMode: undefined, validationDebounceTime: undefined, invalid: undefined, dirty: undefined, touched: undefined, actionsRef: undefined };\nconst optionalControl: FieldControlProps = { ...nativeUndefined, disabled: undefined, value: undefined, defaultValue: undefined, onValueChange: undefined };\nconst optionalInput: ComponentProps<typeof InputA> = optionalControl;\nconst optionalForm: FormProps = { ...nativeUndefined, noValidate: undefined, validationMode: undefined, errors: undefined, onFormSubmit: undefined, actionsRef: undefined };\nconst optionalLabel: FieldLabelProps = { ...nativeUndefined, nativeLabel: undefined };\nconst optionalDescription: FieldDescriptionProps = nativeUndefined;\nconst optionalItem: FieldItemProps = { ...nativeUndefined, disabled: undefined };\nconst optionalError: FieldErrorProps = { ...nativeUndefined, match: undefined };\nconst optionalFieldset: FieldsetRootProps = { ...nativeUndefined, disabled: undefined };\nconst optionalLegend: FieldsetLegendProps = nativeUndefined;\nconst classCallback: FieldRootProps = { class: () => undefined };\nconst optionalSharedRender: import('./node_modules/@sveltery/base/dist/internals/types.js').BaseUIComponentProps<Record<never, never>> = { class: undefined, style: undefined, render: undefined };\nvoid [defaultForm, defaultComponent, defaultField, optionalRoot, optionalControl, optionalInput, optionalForm, optionalLabel, optionalDescription, optionalItem, optionalError, optionalFieldset, optionalLegend, classCallback, optionalSharedRender];\n`;
if (publicMode) {
  publicTypes += `import type * as Root from '@sveltery/base';\n`;
  for (const [module, names] of Object.entries(types)) {
    const alias = module[0].toUpperCase() + module.slice(1);
    publicTypes += `import type * as ${alias} from '@sveltery/base/${module}';\n`;
    for (const name of names) publicTypes += `declare const ${name}Value: ${alias}.${name}; exact<Root.${name}, ${alias}.${name}>(${name}Value);\n`;
  }
}
writeFileSync(join(destination, 'PublicTypes.ts'), publicTypes);
JS
cat > "$field_form_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { FieldA, FieldB, FormA, FormB, FieldsetA, FieldsetB, InputA, type FormProps, type FieldRootActions, type FormActions } from './imports.js';
  const actionsRef: { current: FormActions | null } = { current: null }, fieldActionsRef: { current: FieldRootActions | null } = { current: null };
  const typed: FormProps<{ email: string }> = { onFormSubmit(values, details) { const email: string = values.email; const event: Event = details.event; const reason: 'none' = details.reason; void [email, event, reason]; } };
  const BoundForm = FormA<{ email: string }>;
</script>
<BoundForm id="packed-form" {...typed} {actionsRef} method="post" errors={{ email: ['duplicate', 'duplicate'] }}>
  <FieldsetA.Root><FieldsetA.Legend>Account</FieldsetA.Legend><FieldA.Root name="email" actionsRef={fieldActionsRef} class={state => ({ invalid: state.valid === false })}>
    <FieldA.Label>Email</FieldA.Label><InputA id="packed-email" value="seed@example.com" required type="email" />
    <FieldA.Description id="packed-description">Description</FieldA.Description><FieldA.Error />
    <FieldA.Validity>{#snippet children(state)}<output>{String(state.validity.valid)}</output>{/snippet}</FieldA.Validity>
    <FieldA.Item><FieldA.Label>Item label</FieldA.Label></FieldA.Item>
  </FieldA.Root></FieldsetA.Root>
</BoundForm>
<FormB id="packed-native-form" noValidate={false}><FieldsetB.Root disabled><FieldsetB.Legend>Disabled</FieldsetB.Legend><FieldB.Root name="other"><FieldB.Control defaultValue="native default" /></FieldB.Root></FieldsetB.Root></FormB>
SVELTE
cat > "$field_form_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import Consumer from './Consumer.svelte';
import { FieldA, FieldB, FormA, FormB, FieldsetA, FieldsetB, InputA, InputB } from './imports.js';
assert.equal(FieldA, FieldB); assert.equal(FormA, FormB); assert.equal(FieldsetA, FieldsetB); assert.equal(InputA, InputB); assert.notEqual(FieldA.Control, InputA);
assert.deepEqual(Object.keys(FieldA).sort(), ['Control', 'Description', 'Error', 'Item', 'Label', 'Root', 'Validity']); assert.deepEqual(Object.keys(FieldsetA).sort(), ['Legend', 'Root']);
const body = render(Consumer).body;
assert.equal((body.match(/<form/g) ?? []).length, 2);
const forms = body.match(/<form[^>]*>/g) ?? [];
assert(forms.find(form => form.includes('id="packed-form"'))?.includes('novalidate')); assert(!forms.find(form => form.includes('id="packed-native-form"'))?.includes('novalidate'));
assert.match(body, /value="seed@example.com"/); assert.match(body, /name="email"/); assert.match(body, /aria-invalid="true"/); assert.match(body, /class="invalid"/);
assert.equal((body.match(/<li>duplicate<\/li>/g) ?? []).length, 2); assert.match(body, /value="native default"/); assert.match(body, /<fieldset[^>]*disabled/);
assert.match(body, /Account/); assert.match(body, /Description/); assert.match(body, /Item label/);
JS
cat > "$field_form_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$field_form_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$field_form_consumer" --tsconfig ./tsconfig.json
if [[ "${1:-}" == '--public' ]]; then
  echo 'Isolated tarball Field Form Fieldset public root/subpath SSR, generic Form and all31 named types: PASS'
else
  echo 'Isolated tarball Field Form Fieldset internal entries SSR and component/generic types: PASS (public entries await serialized integration)'
fi
