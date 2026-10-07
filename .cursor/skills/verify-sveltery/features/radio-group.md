# RadioGroup

Shared selection for a series of radios, with a roving tab stop. Upstream: `packages/react/src/radio-group/RadioGroup.tsx` at Base UI v1.8.0, plus the linear composite keyboard path. Local: `src/lib/radio-group/`. The radios are the existing `Radio` parts.

## Sub-features

- Renders a `<div role="radiogroup">`. `aria-disabled`, `aria-readonly`, and `aria-required` are set only when those props are true. `data-disabled`, `data-readonly`, and `data-required` follow the same flags. There is no `data-orientation`.
- `value` is one `$bindable` of any type (default `undefined`, nothing selected). `bind:value` shares it with the parent. A one-way `value` sets it, and clicks override it until the parent changes it. `onValueChange(value, eventDetails)` runs before the commit. `eventDetails.cancel()` vetoes it. Object values use `===` and must be stored with `$state.raw`. `null` is a real value.
- `disabled` disables every radio. `readOnly` blocks selection and still lets arrow keys move focus. `required` marks the group and the hidden inputs. `name` and `form` are copied onto each hidden input.
- A click, a label activation, or Space on keyup selects that radio and releases the others. Enter does not select and does not submit. The callback's event is the click that checked the input, so Shift is visible.
- Roving tabindex: the selected radio is the tab stop. With nothing selected, the first enabled radio is. Arrow keys move on both axes and select the newly focused radio. Horizontal arrows swap in RTL (`DirectionProvider`). The list loops. Shift+Arrow still moves. Home and End do not. Ctrl, Alt, and Meta do not. Disabled radios are skipped. Removing the highlighted radio moves the tab stop to the checked radio when that change was vetoed, otherwise to the next enabled radio.
- A fieldset legend supplies `aria-labelledby` unless the group sets its own. Inside `Form`, a value change clears `errors[name]`.
- Native rendering: a `render` snippet receives `(props, state)`. Consumer `{@attach}` reaches the host.

Differences from React Base UI, all deliberate:

- No `defaultValue`, and no locked controlled mode. Hold the value with `eventDetails.cancel()`.
- No `inputRef`. No Field registration, validity, or `data-touched` / `data-dirty` / `data-filled`.
- No `className` or `style` state callbacks. No React `ref`. Use `{@attach}`.
- No scroll-into-view. Arrow keys inside a nested text field are not given back to the field.

## How to get to it (user POV)

A consumer imports `RadioGroup` and `Radio` and renders `<RadioGroup bind:value name="color"><Radio.Root value="blue">Blue</Radio.Root></RadioGroup>`. For verification, open `/fixtures/radio-group?case=<case>`, where `<case>` is one of `select`, `initial`, `keyboard`, `rtl`, `disabled`, `readonly`, `cancel`, `bound`, `required`, or `legend` (`src/routes/fixtures/radio-group/cases.ts`). Add `&reference` for React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh radio-group
```

Handles used by `src/routes/fixtures/radio-group/radio-group.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Group: `getByRole('radiogroup', { name: 'Colors' })`, or `Legend` for the legend case
- Radios: `getByRole('radio', { name: 'A' | 'B' | 'C' })`
- Owner of the `bound` case: `getByRole('checkbox', { name: 'Owner B' })`
- Submit of the `required` case: `getByRole('button', { name: 'Submit' })`
- Callback log: `getByTestId('calls')`, a JSON list of `{ value, reason, canceled }`
- Submit count: `getByTestId('submitted')`

Proof of working order: in both frameworks, a click leaves one radio checked, arrows select and loop, RTL mirrors horizontal arrows, Home and End stay put, Shift+Arrow moves, a disabled or read-only group never checks a radio, cancel leaves `aria-checked` false, the owner and the group share one value, and required blocks submit until a radio is selected. The SSR test checks that the server HTML already contains `role="radiogroup"`, `aria-checked`, `tabindex="0"`, `tabindex="-1"`, and `type="radio"`.

`bound` is written in each idiom. Svelte uses `bind:value` and starts at `undefined`. React uses `value` plus `onValueChange` and starts at `null`, because a first `value` of `undefined` locks Base UI into uncontrolled mode. RTL uses `dir="rtl"` in Svelte and `DirectionProvider` in React. The assertions are the same.

Component tests (`src/lib/radio-group/RadioGroup.svelte.spec.ts`) port the upstream group, value, disabled, read-only, keyboard, label, fieldset legend, and form cases that do not need Field or `inputRef`.

## Gotchas

- The disabled e2e click uses `force: true` because Playwright will not click an `aria-disabled` radio.
- Interacting before `data-hydrated="true"` races hydration.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.
- Object values use `===`. Store the selected object with `$state.raw`.

## Not ported

Field validation and the `data-touched` / `data-dirty` / `data-filled` hooks Field paints on the group. `inputRef`. `className` / `style` state callbacks. Scroll-into-view while arrowing. Giving arrow keys back to a nested text field.
