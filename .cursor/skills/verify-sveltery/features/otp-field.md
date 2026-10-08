# OTP Field

One-time-code slots that share a single string value. Upstream: `packages/react/src/otp-field` at Base UI v1.8.0 (`47b40521`). Local: `src/lib/otp-field/`.

`OTPField.Input` is its own text input. It registers the first slot with the real `Field` when one is present. It does not render `Input` or `Field.Control`. Upstream does the same. `OTPField.Separator` is the existing `Separator`.

Slot indexes come from a local list: render order before mount, then document order. That is the flat registration CompositeList does for this component. Arrow keys are handled on the slot, not by a generic composite. Text direction is `useDirection().direction`.

## Sub-features

- `OTPField.Root` renders `<div role="group">` and, when `length` is a positive integer, a visually hidden `input[type=text]` sibling. Omit `value` to leave it uncontrolled, starting from `defaultValue` (`''` when that is omitted). `bind:value` shares the string with the parent. `onValueChange` runs first; `eventDetails.cancel()` vetoes the change. `onValueComplete` runs after a stored value becomes complete, or immediately when a complete paste matches the current value. `onValueInvalid` reports characters removed while typing or pasting.
- `OTPField.Input` renders one slot. The first slot carries `autocomplete` (default `one-time-code`), `maxlength` equal to `length`, and the field id. Later slots use `{id}-2`, `{id}-3`, and `autocomplete="off"`. Only the active slot has `tabindex="0"`.
- Typing, paste, and the hidden input filter through `validationType` (`numeric`, `alpha`, `alphanumeric`, or `none`) and an optional `normalizeValue`, then clamp to `length`. Paste and multi-character entry replace from the focused slot. Backspace and Delete remove a character. Arrow keys, Home, and End move focus. Horizontal arrows swap in RTL. Ctrl or Meta plus a horizontal arrow jumps to the first slot or the end of the filled value. Ctrl or Meta plus Backspace clears the value.
- `mask` uses `type="password"` on each slot. A slot's own `type` overrides that. `autoSubmit` calls `requestSubmit` on the owning form, or on the form whose id is the `form` prop, after completion.
- Inside `Field.Root`, the first slot is the registered control, so `Field.Label` points at it. Each visible slot's server HTML includes `aria-labelledby` for that label. The hidden input keeps `name`, `minlength`, `maxlength`, `pattern`, and `required` for native submit and `checkValidity()`.

Differences from React Base UI, all deliberate:

- No `ref` or `inputRef`. Use `{@attach}` on the part, or `bind:this` on your own element.
- No `className` or style objects. Use `class` and `style` strings.
- `value` is one `$bindable`. There is no separate controlled lock. A one-way `value` can change from typing until the parent passes a new value.
- A consumer handler skips the part with `event.preventDefault()`.
- Text direction is `useDirection().direction`. Outside a provider it is `ltr`.
- Slot indexes come from the local list. There is no generic composite or floating-ui runtime.

## How to get to it (user POV)

A consumer imports `OTPField` from `@sveltery/base` or `@sveltery/base/otp-field` and renders `OTPField.Root` with one `OTPField.Input` per slot. For verification, open `/fixtures/otp-field?case=<case>`, where `<case>` is one of `plain`, `labelled`, `bound`, `grouped`, `disabled`, or `required` (`src/routes/fixtures/otp-field/cases.ts`). Add `&reference` for React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh otp-field
```

Handles used by `src/routes/fixtures/otp-field/otp-field.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Slots: `getByRole('textbox')`. The labelled textbox name is `Code`.
- Bound value: `getByTestId('value')`.
- Grouped separator: `getByText('-')`.
- Disabled root: `getByTestId('root')`.
- Required submit: `getByRole('button', { name: 'Submit' })`, `getByText('Required')`, `getByTestId('submitted')`.

Proof of working order: in both frameworks, typing `1` fills the first slot and focuses the second, the label `for` equals the first input `id`, a bound edit updates the output, a grouped default value reads `123456` around the separator, a disabled field stays empty, and an empty required field blocks submit and shows `Required`. The SSR test checks that the server HTML already contains the same `base-ui-` id on the label's `for` and the first input's `id`.

`bound` is `bind:value` in Svelte and controlled `value` plus `onValueChange` in React.

Component tests (`src/lib/otp-field/OTPField.svelte.spec.ts`) cover filtering, paste, keyboard, cancellation, completion, Field labelling, hidden autofill, and form submit. Unit tests (`src/lib/otp-field/otp.spec.ts`) cover normalization.

## Gotchas

- `OTPField.Input` throws `OTPFieldRootContext is missing` outside `OTPField.Root`.
- The visible slots are the text the user edits. The submitted string lives on the hidden input.
- `length` has to match the number of `OTPField.Input` parts. A mismatch warns in development.
- The first slot ignores `aria-label`. Label the field with `<label>` or `Field.Label`.

## Not ported

- React `ref`, `inputRef`, and `className` / `style` state callbacks.
- A CSS `direction` on the input does not change arrow keys. `DirectionProvider` does.
- React's controlled lock, where a parent can ignore `onValueChange` until it later sets `value`. A Svelte one-way `value` updates from typing until the parent passes a new value.
