# Field, Form and Fieldset

Field supplies shared validation, labels, descriptions, error messages and interaction state around controls. Input is the thin original composition of Field.Control. Form provides the source registry, optional validation modes, custom validators, external errors and submit callbacks. Fieldset supplies inherited disabled state and legend association.

```svelte
<script>
  import { Field, Form, Input, Fieldset } from '@sveltery/base';
</script>

<Form onFormSubmit={(values) => console.log(values)}>
  <Fieldset.Root>
    <Fieldset.Legend>Account</Fieldset.Legend>
    <Field.Root name="email" validationMode="onBlur">
      <Field.Label>Email</Field.Label>
      <Input type="email" required />
      <Field.Description>Use an address you check regularly.</Field.Description>
      <Field.Error />
    </Field.Root>
  </Fieldset.Root>
  <button type="submit">Save</button>
</Form>
```

Use native props, class/style state callbacks, bindable refs and the source render snippet API. Native Svelte owns input value/checked/default/reset/hydration behavior. Field.Control has a string change callback; it is not a generic state engine for every control family. Label/Description/Error associations use the actual shared LabelableProvider and registration helpers. Validation reads native constraints and preserves the pinned dirty/touched/filled/focused, custom validity, asynchronous result and disabled rules.

Form validation is optional. `validationMode` controls source onSubmit/onBlur/onChange behavior; `validate` on Field.Root supplies custom validation, and `errors` on Form supplies authoritative external messages. The source synchronous submit flow validates registered fields, focuses the first invalid control, prevents default and returns. Asynchronous validators update reporting later and do not synchronously stop the original submit event. Native `onsubmit`, consolidated `onFormSubmit`, imperative actions and replacement render snippets remain available.

The runtime remote namespace in [PR52](https://github.com/sveltery/base/pull/52) composes these source controls and the normally merged checked families. Native remote descriptors/attachments and the caller enhancement are forwarded. Installing Base does not patch Kit; unpatched SvelteKit 2.70.3 ignores a prior canceled submit event. The normally merged version-specific [explicit compatibility opt-in in PR49](https://github.com/sveltery/base/pull/49), with [application setup](sveltekit-submit-compat.md), is required for that synchronous cancellation contract; its later-listener and asynchronous-validation limits remain separate from the source core. That same opt-in is also required for correct Kit field ownership after a trusted native reset; reset synchronization completes asynchronously after the browser default action, not after Svelte tick alone. Invalid/canceled zero POST followed by a valid positive POST remains the contract. [Completed SDK evidence](sveltekit-submit-compat.md#source-and-verification) records the 8c 28/21 and runtime-identical 849 SDK/Standards/Verification results and normal delivery. This core includes no Kit reset engine, URL guard, propagation suppression or activation replay, and claims no remote/B2 completion.

[Source correspondence](../parity/field-form/source-correspondence.md), [immutable ordinary inventory](../parity/field-form/README.md) and native Input reference suites separate source bodies, framework differences, supplements and execution evidence. The source/type repair `8619e34` received a clean independent full-closure source/native/maintainability review. Local/public build, type, runtime, SSR/hydration and packed-consumer gates pass; the runtime-identical `8438374` checkpoint passed [442 source browser cases](https://github.com/sveltery/base/actions/runs/37099273060) and [all eight CI jobs including 2,020 combined cases](https://github.com/sveltery/base/actions/runs/37099273059). The final source-core documentation/status-metadata head `27e4707` preserves those runtime/type/assertion bytes and original provenance hashes. PR41 received explicit approval `5399418213` and normally merged at `ae07f45ed3e90418baf281f825480c0439a5308b`; full remote API acceptance remains separate. Current ordinary declaration credit remains zero. React17/Activity/lifecycle and downstream control assertions remain explicitly classified, and complete module/library parity is not claimed.

The focused [canonical Field/Labelable owner prerequisite](../parity/field-validation-owner/README.md) replaces the retained validation factory with one `FieldValidationOwner` class instantiated by actual FieldRootInner. Bound services, shared registration, commit supersession, custom-validity ownership and real Timeout cancellation retain the pinned business bodies. The initial stage changes representation under the native-class directive and established no new business defect. The subsequently measured async baseline fidelity repair is recorded below; both stages add zero unchanged upstream assertion credit. Final-head review and execution remain separate from historical Field core acceptance; downstream OTP integration belongs to #54.

Historical classification correction (2026-10-06): Complete pinned/native body review supersedes the earlier gap classification: useAnimationsFinished delegates persistent cancellation to the existing AnimationFrame class; observer, retry and AbortSignal closures are per invocation, and pendingCallbacks preserves shared Source microtask batching. No redundant executor class is required. CheckboxGroupParent is reached only through import type in the five-owner forward class closure; expanded CheckboxGroup component/fixture audits can reach its runtime body and establish no class fulfillment here. Earlier precode captures remain unchanged as provenance. The assigned five-owner scope remains unchanged.

The expanded prerequisite also converts the shared retained Labelable provider to `LabelableProviderOwner`, publishing its actual class instance, and fallback association to `AriaLabelledByOwner` in real Checkbox/Radio/Switch roots. Control selection, null semantics, label/message registration updates, parent description deduplication, lookup order and captured observer disconnect remain unchanged. Stateless label/selectors and effect-only registration composition stays functional. The precode graph and correspondence record distinguish Source every-commit association from existing native DOM observation; this representation change grants zero unchanged Source assertion credit.

The expanded real Radio and Boolean installed consumers also require `skipLibCheck:false` under strict/exact-optional checking; this strengthens executed declaration evidence without increasing unchanged Source credit.

The sole owner scope also includes `LabelableIdOwner`, preserving controlSource identity, hasRegistered/hadExplicitId branches, captured-context unregister and live ID selection in six real callers, and `EnterSubmitOwner`, preserving the native event WeakSet/window listener/cleanup and bound Checkbox handler. The complete [runtime role audit](../parity/field-validation-owner/owner-classification.md) distinguishes the five-owner runtime closure from expanded caller/fixture/type audit scope and records the corrected completion-executor classification. The existing native Enter default/bubble/cancellation difference remains; no React synthetic replay, business repair or Source hook parity is claimed.

## Using a remote form

Final acceptance of the validation-owner prerequisite also depends on normal integration of #73's accepted canonical nativeProps empty-style transport repair: FieldRootInner's shared prop composition and validation mergeProps reach that helper. #73 owns the helper/witness/register repair; this prerequisite introduces no competing edit or workaround and requires fresh final-head checks after integration.

Pass the original remote object to `remote` and spread its original enhancement. The children snippet receives a Field namespace whose Root names and `as` arguments derive from that object's actual accessors. For a survey with `storageType: string` and `enabled?: boolean`:

```svelte
<script lang="ts">
  import { Form, Switch } from '@sveltery/base';
  import { survey } from './survey.remote.js';
</script>

<Form
  remote={survey}
  {...survey.enhance(async ({ submit }) => {
    await submit();
  })}
>
  {#snippet children(Field)}
    <Field.Root name="storageType" as="text">
      <Field.Label>Storage type</Field.Label>
      <Field.Control />
      <Field.Error />
    </Field.Root>
    <Field.Root name="enabled" as="checkbox">
      <Field.Label>Enabled</Field.Label>
      <Field.Control>
        {#snippet render(props)}
          <Switch.Root {...props}><Switch.Thumb /></Switch.Root>
        {/snippet}
      </Field.Control>
      <Field.Error />
    </Field.Root>
    <button type="submit">Save</button>
  {/snippet}
</Form>
```

A bare Control selects the appropriate source control or native host from Root's descriptor. `render` lets the consumer compose a real checked family, as above, without casting its spread props. Root's optional `value` is the accessor's second argument; readonly `as` tuples forward the complete original arguments. A name-only Root permits manually spread descriptors and explicit Control overrides. Authored Radio/Checkbox groups remain actual consumer-owned groups. Globally imported Field components retain their original schema-free contracts.

Form reads live remote issues unless authored `errors` takes precedence. The caller owns enhancement callbacks and successful reset. The [runtime source/native record](../parity/remote-form-api/README.md) distinguishes the 47-case API matrix, original remote-suite provenance, supplemental ref lifetime checks and separate PR53 DX evidence. Public Kit3 checks establish declarations only; runtime acceptance uses the explicitly patched Kit2.70.3 boundary.

Async-validation fidelity successor: the exact-pin public pending-validator/first-control-registration witness proves inherited live initialValue reads differed from Source. The canonical owner now retains the invocation baseline only; refs/registries/cancellation stay live. Source baseline retirement is preserved, tracked in [issue89](https://github.com/sveltery/base/issues/89). Paired red/preclass/green receipts and bounded invalid/ID/validator evidence are in [the owner record](../parity/field-validation-owner/README.md#measured-pending-validator-baseline-fidelity-repair). No speculative invalid or fallback-ID repair, broad parity credit or gate waiver. Final successor review/checks remain required.

Qualified actual Form evidence: [the preserved handoff](https://github.com/sveltery/base/pull/87#issuecomment-6027314922) and [lossless provenance](../parity/field-validation-owner/main-integration/qualified-form-provenance.json) record two historical exact-pin public cases using actual Form → Field.Root → Label/Control/Validity. Both invalid-flip directions, real control/label ID updates, public submission, keyed Control replacement supersession and removal agree after settlement. First queued private samples differ; their raw “postcommit-before-registration-effects” label is not established by the measured scheduling. The first incorrect-expectation red and all raw labels remain preserved. No normal unique-ID fallback target or public invalid/controlID mismatch was established; duplicate IDs and manual internal mutation remain unproved. This is bounded evidence, not blanket async parity, a fresh integrated-head pass or authorization for speculative invalid/controlID capture. #89 remains preserved.

Historical public-head `6de373e205b907b162e0543b3898550d78e03420` observation: the controlled-invalid gate audit at [PR #87 comment 6028261962](https://github.com/sveltery/base/pull/87#issuecomment-6028261962) reaches both actual validators before a DOM-observed prop commit and only then resolves them. Actual call-through registry publication stacks show the pinned async invocation retaining its external `invalid`, while the current native owner reads the changed value at publication. Both authored publication-equivalence assertions fail; settled public validity/error and Form submission outcomes still agree. This is a measured business state-ownership seam requiring final Source disposition, not a public outcome mismatch or cleared native substitution. The registered control ID remains present in this composition, so the captured-versus-live fallback `controlId` branch is not reached. At that recorded public head, no runtime capture repair or #89 change had been made. Complete setup failures, authored-probe error, actual red, fixture/config and immutable Source/native body hashes are retained in `parity/field-validation-owner/async-capture-causal/`; these authored observations earn no unchanged upstream assertion credit.

After the actual pinned reproduction, the focused local fidelity repair captures only invocation `invalid` and fallback `controlId` alongside the existing bounded `initialValue`; the registered-field ref, registry, native inputs and cancellation remain live. The unchanged paired witness passes both flips, and the expanded paired witness passes actual second-commit and active-unregister cancellation. `repair-manifest.json` retains full green logs and diagnostic bytes without replacing the red archives. The maintained native invocation regression is authored supplemental evidence, with no unchanged upstream assertion credit. Captured fallback ownership follows the immutable Source branch; that fallback is not reached by the registered public Form witness. This repair is local and still requires exact-final-head independent Source review and all mandatory gates; it is not final acceptance or a #89 change.
