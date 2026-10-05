# NumberField

`NumberField` provides Root, Input, Group, Increment, Decrement, ScrubArea and ScrubAreaCursor through `@sveltery/base` and `@sveltery/base/number-field`. It uses the original Base UI 1.8.0 numeric state, locale parsing, rounding/snapping, input/commit reasons, press-and-hold and pointer-lock scrubbing bodies. [Source correspondence](../parity/number-field/source-correspondence.md) links the complete pinned runtime/type closure and actual used local code. Availability is bounded; complete unchanged upstream assertion parity remains unclaimed.

```svelte
<script lang="ts">
  import { NumberField, Field, Form } from '@sveltery/base';
</script>

<Form>
  <Field.Root name="amount">
    <Field.Label>Amount</Field.Label>
    <NumberField.Root defaultValue={2} min={0} max={10} locale="en-US">
      <NumberField.Group>
        <NumberField.Decrement>Decrease</NumberField.Decrement>
        <NumberField.Input />
        <NumberField.Increment>Increase</NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
    <Field.Description>Choose an amount</Field.Description>
    <Field.Error />
  </Field.Root>
</Form>
```

Root owns the nullable numeric value and separately editable formatted text. Input renders a native text input and registers with the canonical Field/Form and Labelable engines. A separate native number input carries the successful form value and numeric validity constraints; Field's logical name wins over Root's fallback name. The visible input forwards `bind:ref`; Root's optional `inputRef` addresses the numeric input. Labels, descriptions, custom/external errors, disabled state, touched/dirty/filled state and optional validation come from the same source engine as other controls. NumberField also works without Field/Form through their real source default contexts.

`value` is a controlled nullable number; `defaultValue` is an optional number. Root retains `min`, `max`, `step` including `"any"`, `smallStep`, `largeStep`, `snapOnStep`, `allowOutOfRange`, `required`, `disabled`, `readOnly`, `name`, external `form`, `locale`, `format`, `allowWheelScrub`, and both callbacks. `onValueChange` receives cancellable native-event details and the source reason/direction. `onValueCommitted` receives generic details with no cancellation channel. Direct typing stays visible until blur; step interactions use the authoritative numeric value and preserve precision beyond display rounding. `allowOutOfRange` permits direct-entry underflow/overflow while step interactions still clamp. The pinned cleanup epsilon, rounding options, snapping order and source business quirks remain unchanged.

All parts support native event props, state-dependent `class`/`style`, replacement snippets and native attachments. A replacement Input snippet spreads the received props into an actual native input. Increment/Decrement share the canonical source button helper and one press-and-hold implementation; `nativeButton={false}` supports a replacement non-button host. ScrubArea retains horizontal/vertical direction, pixel sensitivity and optional teleport distance. ScrubAreaCursor renders only during eligible mouse/pen scrubbing and moves its actual host into its owner document body. Pointer lock remains unavailable to the cursor on WebKit, touch input or denial, as in the source.

For a SvelteKit remote form, use the existing typed Form children namespace and an authored numeric control. `as="number"` supplies the canonical native descriptor name through the existing context; the source registration keeps the logical name. Read the original public accessor and update it after the source cancellation check:

```svelte
<Form remote={survey} {...survey.enhance(async ({ submit }) => { await submit(); })}>
  {#snippet children(TypedField)}
    <TypedField.Root name="amount" as="number">
      <TypedField.Label>Amount</TypedField.Label>
      <NumberField.Root value={survey.fields.amount.value() ?? null}
        onValueChange={(value, details) => {
          if (!details.isCanceled && value !== null) survey.fields.amount.set(value);
        }}>
        <NumberField.Input />
      </NumberField.Root>
      <TypedField.Error />
    </TypedField.Root>
  {/snippet}
</Form>
```

The original remote accessor, explicit props, validators, external form association, native FormData and caller enhancement remain available. There is no additional remote validation engine, namespace hook or automatic NumberField routing. Kit 2.70.3 keeps the existing documented explicit application compatibility patch requirement. The isolated installed public consumer checks actual Kit declarations; the dedicated hosted fixture checks actual owner updates, descriptor serialization, cancellation, local/server errors and subsequent valid submits.

Native Svelte defaults, event delegation, refs and SSR/hydration replace React renderer machinery. Preventing the source text handler leaves the native DOM edit visible until a source text update, while React restores its controlled text value. Numeric source state remains unchanged. Paired native observations earn zero unchanged ordinary credit. Locale hydration uses native Svelte behavior: an explicit matching locale avoids differing server/client formatting; React's suppression flag is not emulated. [Compatibility records](upstream-differences.md#nf-01-native-numberfield-family) and the [feature ledger](../parity/number-field/README.md) distinguish these substitutions, local execution, hosted evidence and final review status.

## Current-main integration

The normal successor integrates accepted main `95d3d2ae473dc18a2b9a48112284383a2c392315` while preserving NumberField's reviewed implementation, public optional types and native differences. Both root and subpath retain every accepted export. The [current dependency proof](../parity/number-field/current-main-inheritance.json) separates 130 inherited complete bodies from two accepted canonical animation bodies that are type-only in the NumberField graph. Final successor source review, hosted execution, configured review and PM approval remain separate; the [ledger](../parity/number-field/README.md#current-main-integration-successor) preserves prior results as historical evidence. No new ordinary assertion credit is claimed.

Bounded successor execution passes with one worker and a 768 MiB process heap: all 11 native SSR/provider guards and 36 actual DOM/paired diagnostics/viewport cases, with one retained original browser-only viewport skip. Immutable Source/reference-version and regenerated graph/proof checks also pass. No local full Verification, build or browser rerun is claimed; exact hosted public-package, Verification, Standards and secured browser gates remain required.
