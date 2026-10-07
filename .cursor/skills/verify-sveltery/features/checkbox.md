# Checkbox

A two-state control that can also be mixed. Upstream: `packages/react/src/checkbox/root/CheckboxRoot.tsx` and `packages/react/src/checkbox/indicator/CheckboxIndicator.tsx` at Base UI v1.8.0. Local: `src/lib/checkbox/`.

## Sub-features

- Checked state: one `$bindable` `checked` prop (default false). A click or Space flips it. Enter does not. `bind:checked` shares it with the parent. A one-way `checked={x}` sets it, and clicks override it until `x` changes.
- `indeterminate` keeps `aria-checked="mixed"` and `data-indeterminate`. Checked and unchecked style hooks are omitted. A click still updates `checked`. The hidden input's `indeterminate` property is set again after that click, because the click clears it.
- `onCheckedChange(checked, eventDetails)` runs before the change, with `reason: 'none'`. `eventDetails.cancel()` vetoes the change.
- A consumer `onclick` runs first. `event.preventDefault()` skips the checkbox's handling.
- The root is a `<span role="checkbox">` with `tabindex="0"`. A hidden checkbox is the form control. Clicking the root, a wrapping label, or a label pointing at the input toggles that checkbox once.
- Enter does not toggle. It clicks the form's default submit button unless `preventDefault()` runs on that keydown.
- `disabled`: `aria-disabled`, `data-disabled`, and `tabindex="-1"`. There is no `disabled` attribute on the span. Clicks do not call back. The hidden checkbox is disabled.
- `readOnly`: `aria-readonly` and `data-readonly`. Clicks, including a label click, do not change the state.
- `required`: `aria-required` and `data-required`. The hidden checkbox is `required`.
- `name`, `value`, `form`, and `uncheckedValue` live on the hidden inputs. Ticked submits `value` or `"on"`. Unticked submits `uncheckedValue` when that prop and `name` are set.
- `nativeButton`: render a `<button type="button">`. The `id` moves onto that button. Space uses the button's own activation. Enter still does not toggle.
- `Checkbox.Indicator` renders while ticked or mixed. It sets `data-starting-style` for one frame when it mounts, then `data-ending-style` until the exit animation ends. `keepMounted` leaves it in the DOM when hidden. Several indicators that finish together leave in the same update.
- State attributes: `data-checked` or `data-unchecked`, or `data-indeterminate` when mixed, plus `data-disabled`, `data-readonly`, and `data-required` when those props are set. The indicator repeats them. A `render` snippet receives `(props, state)`.
- A sibling or wrapping `<label>` supplies `aria-labelledby` after mount. Server HTML omits that attribute.
- Consumer `{@attach}` reaches the host through the spread props. Element access inside the component uses `bind:this`.

Differences from React Base UI, all deliberate:

- No `defaultChecked`, and no locked controlled mode. Use `eventDetails.cancel()` to hold the state.
- No `inputRef` and no `ref`. Use `{@attach}` on the part, or `bind:this` on your own element.
- No `className` or style objects. Use `class` and `style` strings.
- No `preventBaseUIHandler()`. `preventDefault()` on the root click is the skip signal.
- No dev warning when `nativeButton` does not match the host tag.
- No Field state and no Form `clearErrors`.
- No `parent` prop and no CheckboxGroup.

Preserved upstream behavior:

- A disabled `mousedown` does not call `preventDefault`. `pointerdown` and `click` do.
- A click that is already canceled does not change the checkbox. Chromium toggles the checkbox before the click listener and reverts it when the click is canceled.
- Clicking a mixed checkbox updates `checked` and leaves `aria-checked` as `mixed`.

## How to get to it (user POV)

A consumer imports `Checkbox` from `@sveltery/base` or `@sveltery/base/checkbox` and renders `<Checkbox.Root bind:checked>Notifications</Checkbox.Root>`. For verification, open `/fixtures/checkbox?case=<case>`, where `<case>` is one of `standalone`, `bound`, `cancel`, `disabled`, `readonly`, `label`, `form`, `native`, `prevented`, `indeterminate`, or `enter` (`src/routes/fixtures/checkbox/cases.ts`). Add `&reference` to get React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh checkbox
```

Handles used by `src/routes/fixtures/checkbox/checkbox.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Checkbox: `getByRole('checkbox', { name: 'Notifications' })`, id `tested-checkbox`
- Owner of the `bound` case: `getByRole('checkbox', { name: 'Owner checked' })`
- Label text of the `label` case: `getByText('Toggle')`
- Submit of the `form` and `enter` cases: `getByRole('button', { name: 'Submit' })`
- Indicator of the `indeterminate` case: `getByTestId('indicator')`
- Callback log: `getByTestId('calls')`, a JSON list of `{ checked, reason, canceled }`
- Submitted values: `getByTestId('values')`, a JSON list of strings or `null`

Proof of working order: in both frameworks, `aria-checked` and `data-checked` change only through real clicks and Space. Enter leaves the checkbox as it is and, in the `enter` case, submits `no`. `cancel`, `disabled`, `readonly`, and `prevented` leave the checkbox off. `form` submits `no`, then `yes`, then `no`. `indeterminate` stays `mixed`. The SSR test checks that the server HTML already contains `role="checkbox"`, `aria-checked="false"`, `data-unchecked`, and `type="checkbox"`.

Each framework writes some cases in its own idiom, and both are held to the same assertions:

- `bound`: Svelte uses `bind:checked`; React uses controlled `checked` plus `onCheckedChange`.
- `prevented`: Svelte calls `preventDefault()`; React calls `preventBaseUIHandler()`.

Component tests (`src/lib/checkbox/Checkbox.svelte.spec.ts`) port the upstream tests that do not need Field or CheckboxGroup.

## Gotchas

- The disabled e2e test clicks with `force: true` because Playwright will not click an `aria-disabled` checkbox.
- Interacting before `data-hydrated="true"` races hydration.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.
- `aria-labelledby` from a native label is applied after mount, so it is absent from the SSR HTML.
