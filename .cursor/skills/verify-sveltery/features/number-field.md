# NumberField

A numeric input with steppers, wheel scrubbing, and a pointer-lock scrub area. Upstream: `packages/react/src/number-field` at Base UI v1.8.0 (`47b40521`). Local: `src/lib/number-field/`.

`NumberField.Input` is its own text input. It registers that element with the real `Field` when one is present. It does not render `Input` or `Field.Control`. Upstream does the same.

## Sub-features

- `NumberField.Root` renders a `<div>` and a visually hidden `input[type=number]` sibling. Omit `value` to leave it uncontrolled, starting from `defaultValue` (`null` when that is omitted). `bind:value` shares the number with the parent. `null` is empty. `onValueChange` runs first; `eventDetails.cancel()` vetoes the change.
- `NumberField.Group` renders `<div role="group">`. `NumberField.Input` renders `<input type="text">` with the formatted value, `inputmode`, and `aria-roledescription="Number field"`. `NumberField.Increment` and `NumberField.Decrement` are `<button type="button" tabindex="-1">` labelled Increase and Decrease. They point `aria-controls` at the input id.
- Steppers tick on pointer down, then repeat after 400ms every 60ms. A mouse click whose `detail` is not 0 does not step again. Read-only steppers set `aria-disabled` and do not set `aria-readonly`. A disabled stepper, or one sitting on `min`/`max`, sets the `disabled` attribute.
- Keyboard: ArrowUp/ArrowDown step, Home/End jump to `min`/`max` when that bound exists, and other characters follow the locale's allowed symbols. Paste parses the inserted text. Blur commits the parsed number, or `null` when the field was cleared.
- `allowWheelScrub` changes the focused input from a vertical wheel (Shift can use a horizontal gesture). `ScrubArea` drags to step. `ScrubAreaCursor` is portaled to `document.body` while scrubbing, except on WebKit, touch, or a denied pointer lock.
- Inside `Field.Root`, the visible input is the registered control, so `Field.Label`, `Field.Error`, and `Form` see it. The hidden number input keeps `name`, `min`, `max`, `step`, and `required` for native submit and `checkValidity()`. `step="any"` keeps that attribute and steps by 1.

Differences from React Base UI, all deliberate:

- No `ref` or `inputRef`. Use `{@attach}` on the part, or `bind:this` on your own element.
- No `className` or style objects. Use `class` and `style` strings.
- `value` is one `$bindable`. There is no separate controlled lock.
- A consumer handler skips the part with `event.preventDefault()`.
- The scrub cursor moves to `document.body` with an attachment. `flushSync` publishes the scrubbing state before the cursor is measured.

## How to get to it (user POV)

A consumer imports `NumberField` from `@sveltery/base` or `@sveltery/base/number-field` and renders `NumberField.Root` with `Group`, `Input`, `Increment`, and `Decrement`. For verification, open `/fixtures/number-field?case=<case>`, where `<case>` is one of `plain`, `labelled`, `bound`, `formatted`, `disabled`, or `required` (`src/routes/fixtures/number-field/cases.ts`). Add `&reference` for React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh number-field
```

Handles used by `src/routes/fixtures/number-field/number-field.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Input: `getByTestId('control')`. The labelled textbox name is `Amount`.
- Steppers: `getByRole('button', { name: 'Increase' })` and `Decrease`.
- Bound value: `getByTestId('value')`.
- Formatted hidden input: `input[type="number"][name="price"]`.
- Required submit: `getByRole('button', { name: 'Submit' })`, `getByText('Required')`, `getByTestId('submitted')`.

Proof of working order: in both frameworks, Increase moves 4 to 5, the label `for` equals the input `id`, a bound increment updates the output, the currency text is not the raw `54.5` while the hidden input is, a disabled field does not change, and an empty required field blocks submit and shows `Required`. The SSR test checks that the server HTML already contains the same `base-ui-` id on the label's `for` and the input's `id`.

`bound` is `bind:value` in Svelte and controlled `value` plus `onValueChange` in React.

Component tests (`src/lib/number-field/NumberField.svelte.spec.ts`) cover typing, blur commit, cancellation, keyboard, paste, wheel, boundaries, Field state, scrubbing, and the missing-context errors.

## Gotchas

- `NumberField` parts throw `NumberFieldRootContext is missing` outside `NumberField.Root`. `ScrubAreaCursor` throws `NumberFieldScrubAreaContext is missing` outside `ScrubArea`.
- The visible input is text. The submitted number lives on the hidden `input[type=number]`.
- Step mismatch on the hidden input needs an explicit `min`. That is the upstream behavior.
- iOS `inputmode` and the WebKit pointer-lock skip follow the runtime. Chromium on Linux uses `numeric` and requests pointer lock.

## Not ported

- React `ref`, `inputRef`, and `className` / `style` state callbacks.
- Composite host-tag warnings from `useButton`.
