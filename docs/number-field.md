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

Root owns the nullable numeric value and separately editable formatted text. Input renders a native text input and registers with the canonical Field/Form and Labelable engines. A separate native number input carries the successful form value and numeric validity constraints; Field's logical name wins over Root's fallback name. The visible input forwards `bind:ref`; Root's `bind:inputRef` publishes the actual numeric `HTMLInputElement | null`; callback/object refs are replaced by native bindings and attachments. Labels, descriptions, custom/external errors, disabled state, touched/dirty/filled state and optional validation come from the same source engine as other controls. NumberField also works without Field/Form through their real source default contexts.

`value` is a controlled nullable number; `defaultValue` is an optional number. Root retains `min`, `max`, `step` including `"any"`, `smallStep`, `largeStep`, `snapOnStep`, `allowOutOfRange`, `required`, `disabled`, `readOnly`, `name`, external `form`, `locale`, `format`, `allowWheelScrub`, and both callbacks. `onValueChange` receives cancellable native-event details and the source reason/direction. `onValueCommitted` receives generic details with no cancellation channel. Direct typing stays visible until blur; step interactions use the authoritative numeric value and preserve precision beyond display rounding. `allowOutOfRange` permits direct-entry underflow/overflow while step interactions still clamp. The pinned cleanup epsilon, rounding options, snapping order and source business quirks remain unchanged.

All parts support native event props, state-dependent `class`, native string `style` (or a state-to-string function), replacement snippets and native attachments. A replacement Input snippet spreads the received props into an actual native input. Increment/Decrement share the canonical source button helper and one press-and-hold implementation; `nativeButton={false}` supports a replacement non-button host. ScrubArea retains horizontal/vertical direction, pixel sensitivity and optional teleport distance. ScrubAreaCursor renders only during eligible mouse/pen scrubbing and moves its actual host into its owner document body. Pointer lock remains unavailable to the cursor on WebKit, touch input or denial, as in the source.

For a SvelteKit remote form, use the existing typed Form children namespace and an authored numeric control. `as="number"` supplies the canonical native descriptor name through the existing context; the source registration keeps the logical name. Read the original public accessor and update it after the source cancellation check:

```svelte
<Form
  remote={survey}
  {...survey.enhance(async ({ submit }) => {
    await submit();
  })}
>
  {#snippet children(TypedField)}
    <TypedField.Root name="amount" as="number">
      <TypedField.Label>Amount</TypedField.Label>
      <NumberField.Root
        value={survey.fields.amount.value() ?? null}
        onValueChange={(value, details) => {
          if (!details.isCanceled && value !== null) survey.fields.amount.set(value);
        }}
      >
        <NumberField.Input />
      </NumberField.Root>
      <TypedField.Error />
    </TypedField.Root>
  {/snippet}
</Form>
```

The original remote accessor, explicit props, validators, external form association, native FormData and caller enhancement remain available. There is no additional remote validation engine, namespace hook or automatic NumberField routing. Kit 2.70.3 keeps the existing documented explicit application compatibility patch requirement. The isolated installed public consumer checks actual Kit declarations; the dedicated hosted fixture checks actual owner updates, descriptor serialization, cancellation, local/server errors and subsequent valid submits.

Native Svelte defaults, event delegation, refs and SSR/hydration replace React renderer machinery. Preventing the source text handler leaves the native DOM edit visible until a source text update, while React restores its controlled text value. Numeric source state remains unchanged. Paired native observations earn zero unchanged ordinary credit. Locale hydration uses native Svelte behavior: an explicit matching locale avoids differing server/client formatting; React's suppression flag is not emulated. [Compatibility records](upstream-differences.md#nf-01-native-numberfield-family) and the [feature ledger](../parity/number-field/README.md) distinguish these substitutions, local execution, hosted evidence and final review status.

The native numeric input also retains a DOM edit when hidden-input autofill is canceled by `onValueChange`, or when a controlled owner declines the proposed value. In the characterized `2` → `8` edit, the owner and visible text remain `2`; Svelte's numeric DOM value and `FormData` remain `8`, while React restores both to `2`. A plain Svelte numeric input has the same behavior with or without native `preventDefault`, and an actual owner update writes its new value. Applications should validate the submitted form values at the submission boundary; a canceled proposal does not guarantee that native `FormData` equals the retained owner. This follows the existing native-Svelte directive. The six authored DOM characterizations earn zero unchanged Original assertion credit and do not automate actual browser autofill.

An input event that bypasses `keydown` and supplies invalid characters also follows the native renderer. In the characterized visible `2` → `abc` edit, the source rejects the characters without a value-change callback. React restores visible `2`; Svelte retains `abc` through blur, while numeric state and `FormData` remain `2` and both emit the source blur commit `2`. A plain Svelte text input likewise retains the edit until an actual owner update. Applications should distinguish visible DOM text from the accepted numeric value. Three additional authored DOM cases record this boundary with zero unchanged Original assertion credit; actual IME or browser automation is not claimed, and no restoration layer is added.

Native form reset follows Svelte's unbound `value` defaults too. In both CSR and hydration, a field stepped from `2` to `3` retains numeric state `3` after `form.reset()`, while Svelte's visible/numeric DOM and `FormData` reset to empty. React keeps its reset defaults synchronized with `3`, so its DOM/FormData stay `3`. Reset itself emits no source change or commit callback; the next step yields `4` in both. Plain Svelte inputs reproduce the empty reset default. A native reset does not synchronize NumberField's source numeric state: applications that intend to reset that value should explicitly update their controlled owner or remount the uncontrolled field, and validate actual submitted values. The paired CSR/hydration coverage retains this native boundary without a reset tracker or React default-value emulation, with zero unchanged Original assertion credit.

## Current-main integration

The normal successor integrates accepted main `95d3d2ae473dc18a2b9a48112284383a2c392315` while preserving NumberField's reviewed implementation, public optional types and native differences. Both root and subpath retain every accepted export. The [current dependency proof](../parity/number-field/current-main-inheritance.json) separates 130 inherited complete bodies from two accepted canonical animation bodies that are type-only in the NumberField graph. Final successor source review, hosted execution, configured review and PM approval remain separate; the [ledger](../parity/number-field/README.md#current-main-integration-successor) preserves prior results as historical evidence. No new ordinary assertion credit is claimed.

Bounded successor execution passes with one worker and a 768 MiB process heap: all 11 native SSR/provider guards and 36 actual DOM/paired diagnostics/viewport cases, with one retained original browser-only viewport skip. Immutable Source/reference-version and regenerated graph/proof checks also pass. No local full Verification, build or browser rerun is claimed; exact hosted public-package, Verification, Standards and secured browser gates remain required.

The later normal merge `d7170f2efdb4e9a43d8a864c268152dbec555038` integrates accepted main `dc2fb8247750b519efab708fc221c201f8cfd517`. The [delivery proof](../parity/number-field/delivery-inheritance.json) preserves all 132 selected bodies, imports and reachability from f2; incoming private helpers have no intersection with NumberField's graph. The native record successor adds the six literal hidden-input/FormData tests without changing runtime bodies. Prior f2 review and execution remain historical; current-head review, hosted gates, configured finding disposition and Root PM approval remain required.

ScrollArea then lands on accepted main `c1600456d3b4e72910d42823b9df69280c74a262`, normally integrated by `6a126f6db42ad1e30ca81a3238993ec2780c8530`. The [final-main proof](../parity/number-field/final-main-inheritance.json) preserves all selected bodies and prior histories, verifies the accepted public exports plus NumberField, and derives catalog counts of 27 bounded/15 unimplemented. The two shared incoming helpers are identical to NumberField's reviewed bodies. The earlier delivery proof remains its named historical checkpoint; reproduce it from `947c23e`, and use `record-final-main.mjs` for the current seam. Exact current-head gates remain required.

## Native integration successor

Accepted main `aa4daff54ec82b96e34e1601648d1b3926ef08cf` supplies the canonical private `@sveltery/utils` package and native rendering/state owners. NumberField now uses shared `Controlled`, `Timeout`, formatting, owner, platform and event helpers from that package. Each part owns its direct three-argument replacement snippet or actual intrinsic fallback; `bind:ref`, `bind:inputRef` and independent native attachments publish actual hosts. Generic rendering, React ref fanout, controlled diagnostics/functional dispatch and explicit effect dependency snapshots are removed. Native `$effect` owns real wheel/registration/timer cleanup; the reactive input-sync gate preserves separately editable text without a forced-render revision.

The [additive current closure](../parity/number-field/native-integration-closure.json) resolves actual package exports and records the inherited Field/Form/Labelable/button closure, including modules outside this PR diff. Historical graph, assertion provenance, red receipts and previous execution claims stay at their named checkpoints. Shared upstream bugs tracked in [#83](https://github.com/sveltery/base/issues/83), [#84](https://github.com/sveltery/base/issues/84) and [#85](https://github.com/sveltery/base/issues/85) remain preserved; this successor adds no duplicate issue or business fix. Autofill, invalid text and reset records above remain native differences with zero unchanged upstream assertion credit. Current-head execution, fresh independent entire-closure review and hosted CI are separate required gates; no final pass is claimed here.

The current closure also records explicit supplied-provider roots: actual `Form.svelte`, `Field.Root` (`field/Root.svelte`) and `LabelableProvider.svelte`. Their `contextualReachability` is separate from NumberField's own import `reachability`; an imported type is never relabeled runtime because a supplied provider can execute it. The combined inventory has 152 modules: the family retains 151 (66 runtime, 85 type-only), while provider composition reaches 126 (81 runtime, 45 type-only), including one additional provider-only module. Both scopes and their shared bodies belong to final source/native/maintainability review. These are structural counts and earn no assertion or execution credit.

The stepper's canonical `useButton` consumes an ancestor Composite context to infer composite-item behavior. The standalone family/provider import graph reaches `CompositeRootContext` but does not import the Composite navigation algorithms. An ancestor Toolbar/Composite can nevertheless execute navigation through bubbled or custom-composed keyboard events. The lead has identified a shared exact-pin computed-style fallback fidelity finding in `internals/composite/utils/navigation.ts` and `internals/composite/composite.ts`; PR42 owns the sole repair. This worker does not duplicate it or claim current-main Composite source acceptance. Final composed acceptance and accepted-prerequisite integration remain pending the lead's exact successor handoff.

The draft diagnostic predecessor `ce2e79eb93350782d1c54d1bc395d49e3173800c` passed the unchanged secured NumberField workflow (62 actual browser cases, installed strict consumer and SSR/hydration/Kit witnesses). Its full Standards run passed formatting/ESLint but rejected raw evidence log whitespace; the local log bytes are now stored losslessly as gzip with original decoded SHA256 hashes in the receipt. The failed predecessor and local resource/download failures remain historical evidence, without waived gates or extra unchanged assertion credit.

The actual supplied Field/Form provider closure reaches canonical Field validation and Transition at runtime; steppers reach canonical Button. Their assigned owners' accepted class/helper successors remain prerequisites. The lead's stepper attachment concern is open: outgoing cleanup unconditionally clears the internal Button owner, potentially clearing a newer host. Native replacement/disposal ordering and captured-host cleanup must be measured and integrated through the accepted Button class API; no callback-ref fanout or duplicate canonical body is introduced here.

Canonical `nativeProps.ts` is runtime-reached through `mergeComponentProps` (and the supplied Field/Form composition). The lead and PR73 owner measured that `toNativeStyle` drops public `style: ''` while bare Svelte retains the empty style attribute. Under the native-default directive, PR73 solely owns the minimal string transport repair and its predecessor/witness/register/projection review. NumberField has no per-part workaround or copied helper; final acceptance awaits that accepted main successor and inherited-body review.
