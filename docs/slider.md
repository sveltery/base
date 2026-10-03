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
    <Slider.Root value={range} onValueChange={(next) => { range = next; }}>
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

Native `class`, `style`, `render` snippets and `bind:ref` reuse the shared renderer. Thumb `inputRef` accepts a callback with optional cleanup, an object ref, null or undefined; it resolves the nested input. Native lowercase `onfocus`, `onblur`, `onkeydown` and `tabindex` are forwarded to that input. Value's optional children snippet receives formatted and raw readonly value arrays. Locale and format use the canonical Source number formatter.

`thumbAlignment="edge"` emits the exact immutable positioning script in the last Thumb so SSR HTML can position all preceding thumbs before application hydration. It reads the actual control/thumb dimensions, updates the same CSS variables and retains the CSPProvider nonce. The native whole-tag raw-HTML boundary keeps hydration markers outside the script and includes the same trusted script payload in server and client bundles. Fresh native HTML insertion is inert; native mounting removes the script. React uses a browser stub and suppressHydrationWarning instead. `edge-client-only` omits the parser script and measures after mounting. This approved native representation/lifetime difference earns zero ordinary assertion credit; secured parser/CSR/hydration/nonce/geometry evidence is recorded separately from ordinary source assertion ports.

The inset observer uses native attached-ref lifetimes. In the pinned Source, the child layout effect runs before the parent Control ref is assigned; its stable ref-object dependencies do not rerun that effect. The queued measurement still runs, but no observer is installed. Native live-ref tracking installs the same Source observer, geometry formula and cleanup after attachment. The secured diagnostic measured control resize from 300px to 500px: Source retained 40.666666666666664%, native measured 40.400000000000006%; after keyboard value 41 both measured 41.36%. Root accepted this precise ref/lifecycle substitution under the native Svelte directive. [SL-02](upstream-differences.md#sl-02-native-slider-parent-ref-and-observer-lifetime) records the original observer/ref trace and independent review; it earns zero unchanged Source assertion credit.

Source pointer cache keeps an applied projection immediately. Native `tick()` then restores the actual accepted values after flushing; Source restores them on each React layout commit. For a rejecting controlled owner, a plain callback with no parent commit retains a projected neighbor in Source, while native flushes uniformly to the owner. Reactive callbacks and swap focus commits rebaseline in Source. [SL-03](upstream-differences.md#sl-03-native-slider-pointer-cache-flush-snapshot) records these measured vectors and the authorized native primitive candidate; the differing plain callback path earns zero unchanged Source credit. Same-task moves retain the Source immediate cache, and disposal guards pending work.

The frozen runtime checkpoint 8f8ba533 passes full local Verification and Standards, strict installed public consumers, and all 127 secured Source/native browser cases. [The receipt](../parity/slider/fifth-hosted.json) and [actual cache vectors](../parity/slider/cache-diagnostic.json) preserve exact hashes and separate native differences from Source assertions. Historical secured matrices retain their failures and distinguish corrected authored expectations from runtime repairs. Final actual-main dependency integration, current required hosted checks, whole-closure source/native/maintainability review and exact-head PM approval remain pending. The original 273 declaration/conformance/type sites are inventoried individually; full ordinary component assertion parity is not claimed.
