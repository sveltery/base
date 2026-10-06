# Input

`Input` is exported from `@sveltery/base` and `@sveltery/base/input`. It forwards to the real Field.Control implementation and shares its state/event types. It accepts native input props, `value`, `defaultValue`, `onValueChange`, explicit or SSR-stable IDs, state-dependent class/style, replacement snippets, attachments and `bind:ref`.

```svelte
<script lang="ts">
  import { Input } from '@sveltery/base';
  let value = $state('');
</script>

<Input {value} onValueChange={(next) => (value = next)} name="title" required />
```

The Field.Control body follows the pinned source's ordering: resolve Field/Form/Labelable contexts, derive controlled state and serialized value, register the control, synchronize filled/changed Field state, and render the native host with ordered validation props. Each native input edit calls `onValueChange(value, details)` with reason `none`. A controlled Field reads accepted state from the owner prop; an uncontrolled Field marks dirty/filled before the cancellation check and changes validation only when the native event and details are uncanceled. Consumer handler prevention remains independent from native `preventDefault()`.

The host keeps native Svelte input, change, cancellation and reset behavior. There is no Input-specific DOM restoration timer, property tracker, click replay or reset observer. An unchanged controlled prop does not manufacture a new DOM update after the consumer rejects an edit; later distinct owner prop updates use ordinary Svelte rendering. Native checked/radio grouping and canceled activation remain browser/Svelte behavior. Replacement snippets own their native host through ordinary supplied props and attachments.

Outside Field, the original source default context keeps `{ disabled, touched: false, dirty: false, filled: false, focused: false, valid: null }` and validation setters are no-ops. Inside a real Field, the same Control uses reactive Field state, registration, validation, label and description relationships. Public Field/Form integration is implemented and verified in the bounded source core of [PR41](https://github.com/sveltery/base/pull/41); the approved source core is normally merged at `ae07f45ed3e90418baf281f825480c0439a5308b`.

`value` and `defaultValue` keep distinct native meanings. A controlled `value="owner"` alone has an empty reset default; an authored `defaultValue="seed"` resets to seed. Reset leaves owner state unchanged and emits no `onValueChange` request. The latest user direction on 2026-10-03 UTC explicitly keeps Svelte defaults at native framework boundaries. The older I-02/I-03/I-04 decisions remain historical evidence in [the compatibility register](upstream-differences.md); the removed restoration kernel and its old reset-observation limit are not current implementation claims. Differing native/source assertions earn zero parity credit.

SvelteKit fields spread directly, for example `<Input {...form.fields.name.as('text')} />`. Runtime imports have no SvelteKit dependency or descriptor wrapper. Kit retains its own native listener/reset behavior. Unpatched Kit2.70.3 ignores prior submit cancellation. The explicit version-specific compatibility opt-in linked below repairs that SDK boundary; the source Input/Field implementation contains no SDK guard or reset engine.

Source: [Input.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/input/Input.tsx) → [FieldControl.tsx](https://github.com/mui/base-ui/blob/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/field/control/FieldControl.tsx), Base UI v1.8.0, MIT. [Source correspondence](../parity/field-form/source-correspondence.md) identifies the complete used component/helper closure. Input.test.tsx has zero ordinary declarations; helper, source/reference and native supplements remain separate. At source/type checkpoint `8619e34` and its runtime-identical budget leaf `8438374`, compilation, runtime, SSR/hydration and installed packed-consumer checks pass. Secured source acceptance is 442/442 in [run 37099273060](https://github.com/sveltery/base/actions/runs/37099273060); all eight CI jobs pass in [run 37099273059](https://github.com/sveltery/base/actions/runs/37099273059), including 2,020 combined browser cases. Independent review of the full source closure, native boundaries and maintainability is clean. These checks establish the bounded source core, not complete remote-function acceptance: the [typed remote API](field-form.md#using-a-remote-form) has its own runtime facade and exact-head evidence in [PR52](https://github.com/sveltery/base/pull/52). SDK zero-POST/reset compatibility is normally delivered in PR49 through explicit application opt-in, with no B2 completion credit here.
