# Slider

Slider ports all seven Base UI 1.8.0 parts from immutable `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`: Root, Label, Value, Control, Track, Thumb and Indicator. The full original dependency graph and public declarations were recorded before implementation. [Source correspondence](../parity/slider/source-correspondence.md) maps the real Field/Form/Composite/render/ref dependencies and every Slider business helper. The implementation and executed acceptance gates are separate from final source review and PM acceptance; [PR57](https://github.com/sveltery/base/pull/57) records the decision.

```svelte
<script lang="ts">
  import { Slider, Field, Form } from '@sveltery/base';
  // The same namespace and named types are available from '@sveltery/base/slider'.
  let range = $state<readonly number[]>([20, 80]);
</script>

<Form>
  <Field.Root name="volume">
    <Field.Label>Volume</Field.Label>
    <Slider.Root
      value={range}
      onValueChange={(next) => {
        range = next;
      }}
    >
      <Slider.Control style="position:relative;width:300px;height:20px">
        <Slider.Track style="height:100%;background:lightgray">
          <Slider.Indicator style="background:blue" />
        </Slider.Track>
        <Slider.Thumb index={0} style="width:20px;height:20px;background:blue" />
        <Slider.Thumb index={1} style="width:20px;height:20px;background:blue" />
      </Slider.Control>
      <Slider.Value />
    </Slider.Root>
    <Field.Error />
  </Field.Root>
</Form>
```

Root accepts numeric `value`/`defaultValue`, or readonly arrays for ranges. It clamps and sorts values without mutating the supplied array. Explicit Thumb `index` is required to associate each range value during SSR. Defaults are min 0, max 100, step 1, largeStep 10, horizontal orientation, center alignment, and push collision behavior. `minStepsBetweenValues` is multiplied by step. Pointer push does not restore moved neighbors when the active thumb moves back; swap follows the original continuity algorithm, and none bounds the thumb at its neighbors. Keyboard changes use the source neighbor/minimum-distance guards rather than pointer collision behavior.

`onValueChange(value, details)` runs before cancellation and uncontrolled state changes. Details expose `activeThumbIndex`, `reason`, the cloned native event, and `cancel()`. The cloned event target exposes `{ value, name }` for external form libraries. Reasons are `keyboard`, `input-change`, `track-press`, `drag` and `none`. `onValueCommitted` fires only for an applied input/keyboard change or the last applied pointer interaction when released; its generic details cannot cancel the change. A controlled owner decides whether to update its value. Source pointer/input event and native serialization witnesses remain part of acceptance.

Root has the actual Source custom-control registration. Field names/disabled state, touched/dirty/focused state, errors, optional validators, onBlur containment and Form submission use the existing shared business implementations. Each Thumb renders one native range input. `form` associates those inputs with an external native form. For an authored remote Form Slider, keep the accepted typed Field namespace and choose its `name`/`as="range"`; explicitly control the Slider from the remote field accessor and update that accessor in the accepted `onValueChange` branch. The accepted optional native-name context affects only each successful input's DOM name. Logical Field registration and cloned callback target names retain Source semantics. Typed Control does not automatically route to Slider.

Native `class`, CSS-string `style`, three-argument `render(props, state, children)` snippets and `bind:ref` use each part’s own intrinsic branch and attachments. `bind:inputRef` publishes the actual nested range input and clears the binding on removal. Native attachment lifetimes replace callback/object ref fanout. Native lowercase `onfocus`, `onblur`, `onkeydown` and `tabindex` are forwarded to that input. Value's optional children snippet receives formatted and raw readonly value arrays. Locale and format use the canonical Source number formatter.

`thumbAlignment="edge"` emits the exact immutable positioning script in the last Thumb so SSR HTML can position all preceding thumbs before application hydration. It reads the actual control/thumb dimensions, updates the same CSS variables and retains the CSPProvider nonce. The native whole-tag raw-HTML boundary keeps hydration markers outside the script and includes the same trusted script payload in server and client bundles. Fresh native HTML insertion is inert; native mounting removes the script. React uses a browser stub and suppressHydrationWarning instead. `edge-client-only` omits the parser script and measures after mounting. This approved native representation/lifetime difference earns zero ordinary assertion credit; secured parser/CSR/hydration/nonce/geometry evidence is recorded separately from ordinary source assertion ports.

The inset observer uses native attached-ref lifetimes. In the pinned Source, the child layout effect runs before the parent Control ref is assigned; its stable ref-object dependencies do not rerun that effect. The queued measurement still runs, but no observer is installed. Native live-ref tracking installs the same Source observer, geometry formula and cleanup after attachment. The secured diagnostic measured control resize from 300px to 500px: Source retained 40.666666666666664%, native measured 40.400000000000006%; after keyboard value 41 both measured 41.36%. Root accepted this precise ref/lifecycle substitution under the native Svelte directive. [SL-02](upstream-differences.md#sl-02-native-slider-parent-ref-and-observer-lifetime) records the original observer/ref trace and independent review; it earns zero unchanged Source assertion credit.

Source pointer cache keeps an applied projection immediately. Native `tick()` then restores the actual accepted values after flushing; Source restores them on each React layout commit. For a rejecting controlled owner, a plain callback with no parent commit retains a projected neighbor in Source, while native flushes uniformly to the owner. Reactive callbacks and swap focus commits rebaseline in Source. [SL-03](upstream-differences.md#sl-03-native-slider-pointer-cache-flush-snapshot) records these measured vectors and the authorized native primitive candidate; the differing plain callback path earns zero unchanged Source credit. Same-task moves retain the Source immediate cache, and disposal guards pending work.

The frozen runtime checkpoint 8f8ba533 passes full local Verification and Standards, strict installed public consumers, and all 127 secured Source/native browser cases. [The receipt](../parity/slider/fifth-hosted.json) and [actual cache vectors](../parity/slider/cache-diagnostic.json) preserve exact hashes and separate native differences from Source assertions. Historical secured matrices retain their failures and distinguish corrected authored expectations from runtime repairs. The original 273 declaration/conformance/type sites are inventoried individually; full ordinary component assertion parity is not claimed.

Accepted PR55 actual main `74f667da95ebc5670b0cc5bee38f2225e65fd0c0` is now a normal-merge ancestor. Its canonical Composite navigation, event and platform bodies were already byte-identical at the reviewed Slider checkpoint; the merge brings the actual broad CI budget from 35 to 60 minutes. The actual type closure also reuses the canonical complete button diagnostic paragraphs and invocation-owned animation batch helper/caller; these helpers are not called by Slider runtime. The [current correspondence](../parity/slider/source-correspondence.md) records those bounded shared seams. Current required hosted checks, the 127-case secured matrix, entire-closure source/native/maintainability review and exact-head PM approval remain pending; earlier passed or canceled runs keep their historical outcomes.

## Current native-main integration

Native style transport prerequisite: all seven Slider parts runtime-reach `mergeComponentProps.ts` → `nativeProps.ts` → `toNativeStyle`. Lead/independent measurement found the inherited helper drops public `style: ''`, while bare Svelte spread retains the empty attribute. PR73 is the sole canonical string transport repair owner, including predecessor/witness and projection evidence. Final Slider acceptance awaits its accepted-main integration; Slider adds no per-part workaround or React empty-style emulation.

The current installed Slider consumer explicitly checks library declarations with `skipLibCheck: false`, strict and exact optional types, both real Utils/Base tarballs, 14 negative TypeScript assertions and three negative native markup cases. It also exercises actual installed SSR-to-client hydration, retained server input identity, callback ownership, accepted serialization and input binding cleanup. These native supplements add zero upstream assertion credit; current execution remains pending until recorded against the candidate.

Canonical owner coordination: `useFieldValidation.svelte.ts` is type-reached through SliderRoot → FieldRootContext → validation return types, and runtime-reached by the real FieldRootInner in the composed Field/Slider consumer. The separate canonical validation owner owns its class representation and caller migration. `useButton.svelte.ts` and `useTransitionStatus.svelte.ts` are conservatively type-reached in the standalone Slider graph; Slider does not directly invoke them. Final composed-Field acceptance depends on the lead-supplied validation successor. No shared body is duplicated here.

The Slider successor normally integrates actual main `aa4daff54ec82b96e34e1601648d1b3926ef08cf`, retaining all owner commits. The seven parts now render their own three-argument snippets/intrinsic hosts and share only `mergeComponentProps` business. Root uses the canonical `Controlled` class and `ValueChanged` owner; direct native effects replace dependency tuple/layout wrappers. Thumb uses separate native host, Composite registration and hidden-input attachments. Its public `inputRef` is an actual bindable input, matching current native APIs. This API replacement follows the user’s native directive and adds zero unchanged upstream assertion credit.

`@sveltery/utils` supplies the one actual clamp/formatter/locale/owner/shadow/animation/diagnostic closure; Slider’s obsolete private numeric/diagnostic files are removed. `SL-01`, `SL-02` and `SL-03` remain measured historical boundaries: the exact trusted parser script, attached-node observer geometry, immediate pointer projection then native accepted-value flush, and local range binding serialization are retained. No React renderer, ref fanout, state snapshot or lifecycle engine is introduced. Original helper assertions and all red receipts remain unchanged. Current source review and required execution results will be recorded against the stable candidate; historical green runs do not cover this successor.

Shared dependency coordination (2026-10-06): the actual closure reaches `internals/composite/composite.ts` and `internals/composite/utils/navigation.ts`. SliderThumb imports keyboard constants from the former and uses the canonical list/item registration; broader CompositeRoot business is reached by conservative type/barrel traversal. The PR42 owner owns the sole bounded exact-pin `getComputedStyle`/owner-window fallback fidelity repair. Current-main Composite bodies are not source-accepted by this Slider review; final acceptance remains pending the lead-supplied corrected shared body and normally integrated prerequisite. Slider does not add a duplicate fix. The actual graph contains no separate `usePressAndHold` module; Slider pressing is its real Control start/move/end/cache/listener business plus the shared AnimationFrame owner.
