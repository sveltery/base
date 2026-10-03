# Input

`Input` is exported from `@sveltery/base` and `@sveltery/base/input`. It forwards to the real Field.Control implementation and shares its state/event types. It accepts native input props, `value`, `defaultValue`, `onValueChange`, explicit or SSR-stable IDs, state-dependent class/style, replacement snippets, attachments and `bind:ref`.

```svelte
<script lang="ts">
  import { Input } from '@sveltery/base';
  let value = $state('');
</script>

<Input {value} onValueChange={next => value = next} name="title" required />
```

The Field.Control body follows the pinned source's ordering: resolve Field/Form/Labelable contexts, derive controlled state and serialized value, register the control, synchronize filled/changed Field state, and render the native host with ordered validation props. Each native input edit calls `onValueChange(value, details)` with reason `none`. A controlled Field reads accepted state from the owner prop; an uncontrolled Field marks dirty/filled before the cancellation check and changes validation only when the native event and details are uncanceled. Consumer handler prevention remains independent from native `preventDefault()`.

The host keeps native Svelte input, change, cancellation and reset behavior. There is no Input-specific DOM restoration timer, property tracker, click replay or reset observer. An unchanged controlled prop does not manufacture a new DOM update after the consumer rejects an edit; later distinct owner prop updates use ordinary Svelte rendering. Native checked/radio grouping and canceled activation remain browser/Svelte behavior. Replacement snippets own their native host through ordinary supplied props and attachments.

Outside Field, the original source default context keeps `{ disabled, touched: false, dirty: false, filled: false, focused: false, valid: null }` and validation setters are no-ops. Inside a real Field, the same Control uses reactive Field state, registration, validation, label and description relationships. The Field/Form source ports are still draft dependencies under verification; public Field/Form integration remains pending.

`value` and `defaultValue` keep distinct native meanings. A controlled `value="owner"` alone has an empty reset default; an authored `defaultValue="seed"` resets to seed. Reset leaves owner state unchanged and emits no `onValueChange` request. The latest user direction on 2026-10-03 UTC explicitly keeps Svelte defaults at native framework boundaries. The older I-02/I-03/I-04 decisions remain historical evidence in [the compatibility register](upstream-differences.md); the removed restoration kernel and its old reset-observation limit are not current implementation claims. Differing native/source assertions earn zero parity credit.

SvelteKit fields spread directly, for example `<Input {...form.fields.name.as('text')} />`. Runtime imports have no SvelteKit dependency or descriptor wrapper. Kit retains its own native listener/reset behavior. Invalid enhanced Form submission remains an unresolved integration requirement where Kit ignores cancellation; this Input/Field source checkpoint does not claim a no-side-effect repair.

Source: [Input.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/input/Input.tsx) → [FieldControl.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/field/control/FieldControl.tsx), Base UI v1.8.0, MIT. [Source correspondence](../parity/field-form/source-correspondence.md) identifies used component/helper bodies and incomplete dependencies. Input.test.tsx has zero ordinary declarations; helper, source/reference and native supplements remain separate. Final compile, runtime, SSR/hydration, packed-consumer, CI, secured browser and exact-head independent source/maintainability review are pending for the new source-derived implementation.
