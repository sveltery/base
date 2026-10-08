# Switch

A two-state control that submits like a checkbox. Upstream: `packages/react/src/switch/root/SwitchRoot.tsx` and `packages/react/src/switch/thumb/SwitchThumb.tsx` at Base UI v1.8.0. Local: `src/lib/switch/`.

## Sub-features

- Checked state: one `$bindable` `checked` prop. Omit it to start from `defaultChecked` (false). A click, Enter, or Space flips it. `bind:checked` shares it with the parent. A one-way `checked={x}` sets it, and clicks override it until `x` changes. A parent write does not call `onCheckedChange`.
- `onCheckedChange(checked, eventDetails)` runs before the change, with `reason: 'none'`. The event is the hidden input's click, so modifier keys are preserved and `detail` is `0`. `eventDetails.cancel()` vetoes the change and the checkbox stays unchanged.
- A consumer `onclick` runs first. `event.preventDefault()` skips the switch's handling. `stopPropagation()` still toggles, and ancestors hear that one click.
- The root is a `<span role="switch">` with `tabindex="0"`. A hidden checkbox is the form control. Clicking the root, a wrapping label, or a label pointing at the input toggles that checkbox once.
- `disabled`: `aria-disabled`, `data-disabled`, and `tabindex="-1"`. There is no `disabled` attribute on the span. Clicks do not call back. The hidden checkbox is disabled, so it is left out of form data.
- `readOnly`: `aria-readonly` and `data-readonly`. Clicks, including a label click, do not change the state.
- `required`: `aria-required` and `data-required`. The hidden checkbox is `required`, so a native form blocks submit until the switch is on.
- `name`, `value`, `form`, and `uncheckedValue` live on the hidden inputs, not the root. Checked submits `value` or `"on"`. Unchecked submits `uncheckedValue` when that prop and `name` are set, and submits nothing otherwise.
- `nativeButton`: render a `<button type="button">`. The `id` moves from the hidden input onto that button. Enter and Space use the button's own activation.
- State attributes: `data-checked` or `data-unchecked`, plus `data-disabled`, `data-readonly`, and `data-required` when those props are set. `Switch.Thumb` repeats them. A `render` snippet receives `(props, state, children)`. `children` is undefined when the consumer passed none.
- A sibling or wrapping `<label>` supplies `aria-labelledby` after mount. The label receives an id when it does not have one. Server HTML omits that attribute.
- Consumer `{@attach}` reaches the host through the spread props.

Differences from React Base UI, all deliberate:

- `defaultChecked` is the uncontrolled start and the fallback when a controlled `checked` is cleared. No locked controlled mode. Use `eventDetails.cancel()` to hold the state.
- No `inputRef`. The hidden checkbox is in the DOM.
- No `ref`. Use `{@attach}`.
- No `className` or style objects. Use `class` and `style` strings.
- No `preventBaseUIHandler()`. `preventDefault()` on the root click is the skip signal.
- No dev warning when `nativeButton` does not match the host tag.
- No Field state (`data-touched`, `data-dirty`, `data-filled`, `data-focused`, `data-valid`, `data-invalid`) and no Form `clearErrors`. Those wait for Field.

Preserved upstream behavior:

- [Issue #66](https://github.com/sveltery/base/issues/66), via the same button path: a disabled `mousedown` does not call `preventDefault`. `pointerdown` and `click` do.
- A click that is already canceled does not change the switch. Chromium toggles the checkbox before the click listener and reverts it when the click is canceled.

## How to get to it (user POV)

A consumer imports `Switch` from `@sveltery/base` or `@sveltery/base/switch` and renders `<Switch.Root bind:checked>Notifications</Switch.Root>`. For verification, open `/fixtures/switch?case=<case>`, where `<case>` is one of `standalone`, `bound`, `cancel`, `disabled`, `readonly`, `label`, `form`, `native` or `prevented` (`src/routes/fixtures/switch/cases.ts`). Add `&reference` to get React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh switch
```

Handles used by `src/routes/fixtures/switch/switch.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Switch: `getByRole('switch', { name: 'Notifications' })`, id `tested-switch`
- Owner of the `bound` case: `getByRole('checkbox', { name: 'Owner checked' })`
- Label text of the `label` case: `getByText('Toggle')`
- Submit of the `form` case: `getByRole('button', { name: 'Submit' })`
- Callback log: `getByTestId('calls')`, a JSON list of `{ checked, reason, canceled }`
- Submitted values: `getByTestId('values')`, a JSON list of strings or `null`

Proof of working order: in both frameworks, `aria-checked` and `data-checked` change only through real clicks and key presses, and the `calls` log shows exactly the expected callbacks. `cancel`, `disabled`, `readonly`, and `prevented` leave the switch off. `form` submits `no`, then `yes`, then `no`. The SSR test checks that the server HTML already contains `role="switch"`, `aria-checked="false"`, `data-unchecked`, and `type="checkbox"`.

Each framework writes some cases in its own idiom, and both are held to the same assertions:

- `bound`: Svelte uses `bind:checked`; React uses controlled `checked` plus `onCheckedChange`.
- `prevented`: Svelte calls `preventDefault()`; React calls `preventBaseUIHandler()`.

Component tests (`src/lib/switch/Switch.svelte.spec.ts`) port the upstream tests that do not need Field: clicks, the hidden input, keyboard, labels, cancel, disabled, read-only, required, form values, and the thumb. Native-only checks cover the one-way prop, `preventDefault`, and consumer attachments.

## Gotchas

- The disabled e2e test clicks with `force: true` because Playwright will not click an `aria-disabled` switch.
- Interacting before `data-hydrated="true"` races hydration.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.
- `aria-labelledby` from a native label is applied after mount, so it is absent from the SSR HTML.
