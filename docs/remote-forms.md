# Typed remote forms

Pass the original SvelteKit remote form to `Form.remote` and spread its original descriptor or enhancement. The children snippet receives a Field namespace whose Root names and `as` arguments are derived from the actual remote accessor types. Runtime Base code has no SvelteKit dependency.

```svelte
<script lang="ts">
  import { Form, Switch } from '@sveltery/base';
  import { survey, getSurveys } from './survey.remote.js';
</script>

<Form
  remote={survey}
  {...survey.enhance(async (form) => {
    await form.submit().updates(getSurveys());
    form.element.reset();
    customJS();
  })}
>
  {#snippet children(Field)}
    <Field.Root name="storageType" as="text">
      <Field.Label>Storage type</Field.Label>
      <Field.Control required />
      <Field.Error />
    </Field.Root>
    <Field.Root name="size" as="number">
      <Field.Label>Size</Field.Label>
      <Field.Control min={0} />
    </Field.Root>
    <Field.Root name="enabled" as="checkbox">
      <Field.Label>Enabled</Field.Label>
      <Field.Control>
        {#snippet render(props)}
          <Switch.Root {...props}><Switch.Thumb /></Switch.Root>
        {/snippet}
      </Field.Control>
    </Field.Root>
    <button type="submit">Save</button>
  {/snippet}
</Form>
```

Use an optional boolean in the Kit input schema: unchecked HTML checkboxes omit their value. Let the schema supply any false default. Remote fields own live values, including `fields.set(...)`; the real rendered controls own their source callbacks, validation registration, focus and metadata. A styled scalar checkbox or Switch has one real semantic root and one native form input.

Original accessor spreads also work on Control (`{...survey.fields.enabled.as('checkbox')}`). When a remote checkbox descriptor's own `checked` accessor initially returns `undefined`, Control supplies a stable false checked value so subsequent remote updates remain controlled. The same initial undefined value supplied explicitly is indistinguishable from that descriptor; defined authored overrides retain their source precedence. This normalization belongs to the remote Control boundary.

`as="text" value="seed"` is shorthand for `as={['text', 'seed']}`. Root accepts the tuples supported by the chosen schema accessor, including the required option value for radio and array checkbox fields. File descriptors accept `as="file"` or `as="file multiple"` without a value. Root without `as` supplies the logical Field context without selecting a native descriptor, which is useful around an authored group.

Text, number and range controls use the source Field.Control through the thin Input composition. Native radio, array checkbox, select, multiple select and file hosts use the narrow native host adapter and the same source registration/validation helpers. Authored select options remain native Svelte children:

```svelte
<Field.Root name="colors" as="select multiple" value={['red']}>
  <Field.Label>Colors</Field.Label>
  <Field.Control>
    <option value="red">Red</option>
    <option value="blue">Blue</option>
  </Field.Control>
</Field.Root>
```

A native replacement host can spread the render props directly, including Svelte attachment symbols, without casting or rebuilding event handlers:

```svelte
<Field.Root name="color" as="select">
  <Field.Control>
    {#snippet render(props)}
      <select {...props}><option value="red">Red</option></select>
    {/snippet}
  </Field.Control>
</Field.Root>
```

Styled option controls require their real source group. An array checkbox group explicitly binds its whole array to the remote field; individual Roots select the option descriptors. Preserve the group callback's event details and cancellation when adding application behavior:

```svelte
<script lang="ts">
  import { Checkbox, CheckboxGroup } from '@sveltery/base';
</script>

<Field.Root name="colors">
  <Field.Label>Colors</Field.Label>
  <CheckboxGroup
    value={(survey.fields.colors.value() ?? []).filter(
      (value): value is string => value !== undefined,
    )}
    onValueChange={(value, details) => {
      if (!details.isCanceled) survey.fields.colors.set(value);
    }}
  >
    <Field.Root name="colors" as="checkbox" value="red">
      <Field.Control>
        {#snippet render(props)}
          <Checkbox.Root {...props} aria-label="Red">
            <Checkbox.Indicator />
          </Checkbox.Root>
        {/snippet}
      </Field.Control>
    </Field.Root>
  </CheckboxGroup>
  <Field.Error />
</Field.Root>
```

Use the corresponding `RadioGroup` around real `Radio.Root` render snippets, bind its selected value to `remote.fields.choice.value() ?? null` and ignore null in the remote setter callback. Source controlled mode is chosen at mount, so a defined empty selection keeps later `fields.set(...)` updates controlled. Put each option in `Field.Item` with its own `Field.Label`, and keep its explicit `value`. RadioGroup owns selection and registration; each option owns its native input, and only the checked option is successful. Numeric-only Kit 2.70.3 fields do not expose a radio descriptor. For an authored numeric RadioGroup, use `as="number"` on the enclosing Field Root and render real `Radio.Root` options directly inside the group, binding its value and callback to the numeric remote accessor. That selects the supported numeric descriptor and gives the group's native inputs Kit's numeric name encoding. Native option inputs use Kit's descriptor directly and require no styled group.

For an actual Kit input union such as `string | number`, its conditional accessor type also permits numeric radio option arguments. Original manual radio spreads on a name-only Root preserve those option values for the source RadioGroup. Kit's radio descriptor itself emits an unprefixed name; an authored `name={remote.fields.choice.as('number').name}` override on Control selects numeric native serialization while source registration remains logical. The contract fixture verifies this supported union separately from the numeric-only group.

Names passed to Root stay logical (`profile.email`, `items[0].label`) for source registration and error lookup. Only the native form input gets Kit's encoding, such as `colors[]`, `b:enabled` and `n:choice`. Kit accepts digit-only index spellings such as `items[00].label`; the runtime canonicalizes that logical index to `items[0].label`. Authored Control IDs and native names retain the source prop precedence. Supplying `errors={}` to Form is authoritative and suppresses automatic remote issues; omitting `errors` maps remote issues to logical fields. Use `remote.for(id)` to create independent form instances before passing each instance to Form.

The pinned source labelable provider keeps its generated control ID until registration runs, which preserves label associations in server-rendered markup. Authored Control IDs take over during client registration; the fixture checks both the SSR association and the registered authored ID.

The caller's original `.enhance(...)` remains responsible for query updates, custom JavaScript and its reset decision. Kit 2.70.3 requires the server form to honor client-requested query refreshes, for example `await requested(getSurveys, 1).refreshAll()` after saving, with `requested` imported from `$app/server`. File forms need the native `enctype="multipart/form-data"` attribute on Form. The original Kit object owns pending, result, preflight and submitter data. A normal submit button or `requestSubmit()` runs source Form validation; direct `remote.submit()` is Kit's imperative API and does not dispatch that native submit event. Source asynchronous validators can report later but cannot synchronously cancel an event that has already proceeded.

For Kit **2.70.3**, install the explicit [native form compatibility patch](sveltekit-submit-compat.md) when relying on synchronous Field rejection, authored submit cancellation or settled field values after a native reset. The patch honors prior submit cancellation and reads reset values after the browser finishes its default action. Copy the shipped patch into the consumer application's `patches` directory, add it to pnpm `patchedDependencies`, and commit the updated lockfile. Installing Base alone does not alter the consumer's Kit dependency. Unpatched 2.70.3 does not meet these native form contracts.

The [public contract fixture](../apps/fixtures/src/routes/remote-api-contracts/+page.svelte) and [supplemental browser suite](../tests/browser/remote-form-api-contracts.spec.ts) cover native/styled option families, numeric radios, selects, files, nested/server/preflight errors, manual attributes, authoritative errors, instance isolation and original enhancement. Their assertions earn supplemental integration evidence only. The [isolated package check](../scripts/check-remote-form-contracts-package.sh) compiles that entire route against the actual tarball with strict and exact optional types, installs the shipped Kit patch explicitly and builds a production Kit application. The dedicated hosted workflow executes the contracts first, then all current remote tests, runtime API tests and literal native event oracles, using official Chromium with its sandbox enabled and zero retries. The [native event evidence](../parity/field-form/native-submit-flow/README.md) records the four current listener-count expectation changes and preserves the byte-exact historical suite and red observations. Those native characterizations earn separate provenance; compilation alone does not establish completed remote acceptance or unchanged upstream parity.
