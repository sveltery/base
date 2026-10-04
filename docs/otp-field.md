# OTP Field

`OTPField` ports the pinned Base UI 1.8.0 Root/Input business bodies and exports the existing shared Separator. It uses the real Field/Form validation and metadata, the normally landed Composite list registration, and the canonical Svelte renderer/ref transport. The experimental acceptance and native differences are recorded in [OTP evidence](../parity/otp-field/README.md).

```svelte
<script lang="ts">
  import { OTPField, Field } from '@sveltery/base';
  let code = $state('');
</script>

<Field.Root name="code">
  <Field.Label>Verification code</Field.Label>
  <Field.Description>Enter the six digits sent to you.</Field.Description>
  <OTPField.Root length={6} value={code} onValueChange={(value) => code = value} required>
    {#each [0, 1, 2, 3, 4, 5] as slot}
      <OTPField.Input />
      {#if slot === 2}<OTPField.Separator />{/if}
    {/each}
  </OTPField.Root>
  <Field.Error />
</Field.Root>
```

The public subpath is `@sveltery/base/otp-field`; it exports `OTPField`, `OTPFieldRoot`, `OTPFieldInput` and their props/state/event-detail types. Root requires `length`, which must match the rendered Input count. Input indexes come from rendered/DOM order; grouped layouts and keyed reordering use the shared Composite implementation.

Root defaults to numeric validation and `autoComplete="one-time-code"`. `validationType` also accepts `alpha`, `alphanumeric` and `none`. `normalizeValue` runs after whitespace stripping and built-in filtering, then its output is filtered again and clamped. It must be idempotent because the original business bodies normalize during edits, replacement, storage and rendering. `onValueInvalid` receives the original attempted string before the value callback. `mask` makes visible inputs passwords; per-slot native `type` overrides it. Root owns `readOnly`, `inputMode` and `autoComplete`; native Input attributes use Svelte names such as `readonly`, `inputmode` and `autocomplete`.

Typing, selection, arrows/RTL, Home/End, boundary modifiers, deletion, paste, and hidden-input autofill use the original algorithms. The only tab stop is the active slot. The named hidden input serializes the whole code and supplies required/length/pattern validation. Field's name takes precedence over Root's fallback name. Completion follows the applied value change; a repeated complete paste also completes without a repeated value change. `autoSubmit` requests submission of the owning or explicitly associated `form` after completion. Completion and invalid details are generic notifications; change details support `cancel()`.

All parts use `class`, native style objects/strings, Svelte render snippets and bindable actual-element `ref`. A Root render snippet can forward merged props into a native host; Input snippets can forward them into a native input:

```svelte
<script lang="ts">
  import { OTPField } from '@sveltery/base/otp-field';
  import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
</script>

<OTPField.Root length={2}>
  {#snippet render(props, state, children)}
    <section {...props as HTMLAttributes<HTMLElement>} data-complete-code={state.complete}>
      {@render children?.()}
    </section>
  {/snippet}
  <OTPField.Input>
    {#snippet render(props, state)}
      <input {...props as HTMLInputAttributes} data-slot-index={state.index} />
    {/snippet}
  </OTPField.Input>
  <OTPField.Input />
</OTPField.Root>
```

The canonical render props are an open native `HTMLProps` record with attachment symbols; cast them to the chosen native host's Svelte attributes when spreading. React element cloning, React17 ID fallback and synthetic-event/controlled-value restoration are native substitutions. Canceled edits stop the source value/focus/completion change; default native binding settles the slot through Svelte tick. Authored render snippets own native input composition. Native focus/blur events are not cancelable; use `event.preventBaseUIHandler()` to suppress the internal composed handler. Default slots and the Root hidden validation/autofill input reuse a small native host boundary with functional `bind:value` of the canonical merged value. A small native action registers the existing composed source input handler through `svelte/events.on` before binding, so it reads trusted edits before native synchronization; that handler alone owns the whole code. It settles authoritative input values before external native validity/submission, including an unchanged first logical character, hidden normalization to an unchanged code, and canceled hidden edits. A render override owns its native input composition; an input value spread alone follows Svelte spread semantics. These differences earn no unchanged upstream assertion credit.

For an external SvelteKit remote owner, use the manual Root with the complete string and its real setter, for example `value={survey.fields.code.value() ?? ''}` and `onValueChange={(value) => survey.fields.code.set(value)}` inside the caller's logical Field/Form. Compound Root has no native text-input descriptor contract: its visible root is a group and each visible input holds one character. Native SDK descriptors remain appropriate for native input hosts; do not assume spreading a text descriptor onto the group represents the whole code. Automatic typed remote control routing is unchanged. Applications relying on the already documented Kit 2.70.3 synchronous cancellation/native reset compatibility must explicitly apply [that consumer patch](sveltekit-submit-compat.md); Base adds no SDK shim.

The pin clamps by code points but renders/replaces/removes slots using JavaScript string indexing and detects completion using UTF-16 length. That original Unicode bug is preserved and reproduced in both actual runtimes ([issue #56](https://github.com/sveltery/base/issues/56)). The shared Separator now uses the precise canonical source-derived renderer/types from public PR59, preserving its own actual-host ref, state class/style callbacks, native snippet composition and explicit-undefined public contracts. Its selected helper integration requires final whole-used-source review; no Toolbar feature acceptance is inferred. No claim of exhaustive unchanged assertion parity, React17 commit machinery, or full remote/B2 completion is made.
