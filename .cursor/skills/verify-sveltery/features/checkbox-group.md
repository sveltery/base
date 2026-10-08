# CheckboxGroup

Shared checked values for a series of checkboxes, including a parent checkbox. Upstream: `packages/react/src/checkbox-group/CheckboxGroup.tsx` and `useCheckboxGroupParent.ts` at Base UI v1.8.0. Local: `src/lib/checkbox-group/`. The checkboxes are the existing `Checkbox` parts.

## Sub-features

- Renders a `<div role="group">`. `data-disabled` is set when `disabled` is true. There is no `aria-disabled` on the group.
- `value` is one `$bindable` string array. Omit it to start from `defaultValue` (empty). `undefined` is an empty selection. `bind:value` shares the array with the parent. A one-way `value` sets it, and clicks override it until the parent changes it. `onValueChange(value, eventDetails)` runs before the commit, with `reason: 'none'`. `eventDetails.cancel()` vetoes it. A parent write does not call `onValueChange`.
- A checkbox is ticked when the array contains its `value`, or its `name` when `value` is omitted. An empty string is a real value. A checkbox with neither is not part of the array. Ticking appends. Unticking removes that value. The checkbox's own `checked` prop is not the source of truth inside the group.
- `disabled` disables every checkbox, including one that passes `disabled={false}`. Clicks do not call back.
- `allValues` turns on the parent checkbox. `Checkbox.Root parent` sets `data-parent` and `aria-controls` to the rendered child ids, in `allValues` order. Several checkboxes can share a value and each id is listed. A custom `id` on a non-button host stays on the hidden input, so `aria-controls` names the exposed element. Unmounting a child drops its id. A value of `constructor` does not read `Object.prototype`.
- The parent is checked when the value length equals `allValues.length`, and mixed when the value is a non-empty shorter list. A click selects every enabled value, or clears back to the disabled values that are already checked. From a partial selection it cycles all, none, then that partial snapshot. The snapshot updates only after a child change that was not canceled. A canceled parent click retries the same step. A parent or child `onCheckedChange` that cancels runs before the group hears the change.
- A checked hidden input submits its `name` and `value`. The parent submits nothing. `uncheckedValue` is not submitted inside a group.
- Native rendering: a `render` snippet receives `(props, state)`. Consumer `{@attach}` reaches the host.

Differences from React Base UI, all deliberate:

- `defaultValue` is the uncontrolled start and the fallback when a controlled `value` is cleared. No locked controlled mode. Hold the value with `eventDetails.cancel()`.
- No Field registration, validity, `data-filled`, `data-dirty`, `data-touched`, or `data-focused`. No labelable `aria-labelledby` or `aria-describedby` from `Field`.
- No `className` or `style` state callbacks. No React `ref`. Use `{@attach}`.
- A fieldset does not disable the group.

Preserved upstream behavior:

- `disabled={false}` on a checkbox does not override a disabled group.
- Unchecking a value that is not in the array removes the last item.
- The parent snapshot ignores external value changes and canceled child changes.
- `aria-controls` is filled after mount, so server HTML omits it.

## How to get to it (user POV)

A consumer imports `CheckboxGroup` and `Checkbox` and renders `<CheckboxGroup bind:value><Checkbox.Root value="red">Red</Checkbox.Root></CheckboxGroup>`. The group has no `name`; each checkbox does. For verification, open `/fixtures/checkbox-group?case=<case>`, where `<case>` is one of `select`, `initial`, `disabled`, `cancel`, `bound`, `parent`, or `form` (`src/routes/fixtures/checkbox-group/cases.ts`). Add `&reference` for React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh checkbox-group
```

Handles used by `src/routes/fixtures/checkbox-group/checkbox-group.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Group: `getByRole('group', { name: 'Colors' })`
- Checkboxes: `getByRole('checkbox', { name: 'A' | 'B' | 'All' })`
- Owner of the `bound` case: `getByRole('checkbox', { name: 'Owner B' })`
- Submit of the `form` case: `getByRole('button', { name: 'Submit' })`
- Callback log: `getByTestId('calls')`, a JSON list of `{ value, reason, canceled }`
- Submitted values: `getByTestId('submitted')`, a JSON list of strings

Proof of working order: in both frameworks, a click checks one box and leaves the other alone, a second click on the first removes only that value, the initial value is checked, a disabled group never checks, cancel leaves `aria-checked` false, the owner and the group share `b`, the parent goes mixed then all then clear, and submit reports `[]`, then `["a"]`, then `["a","b"]`. The SSR test checks that the server HTML already contains `role="group"`, `aria-checked="true"`, `aria-checked="false"`, `data-checked`, and `type="checkbox"`.

`bound` is written in each idiom. Svelte uses `bind:value`. React uses `value` plus `onValueChange`. The assertions are the same.

Component tests (`src/lib/checkbox-group/CheckboxGroup.svelte.spec.ts`) port the upstream value, disabled, parent, `aria-controls`, label, and form cases that do not need Field. `src/lib/checkbox-group/parent.spec.ts` covers the parent-toggle math without a document.

## Gotchas

- The disabled e2e click uses `force: true` because Playwright will not click an `aria-disabled` checkbox.
- Interacting before `data-hydrated="true"` races hydration.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.
- `aria-controls` appears after the children mount.

## Not ported

Field validation and the `data-touched` / `data-dirty` / `data-filled` / `data-focused` hooks Field paints on the group. Labelable control ids, so `Field.Label` does not label the group instead of one checkbox. `Field.Description` ids. Form error focus inside a group. Fieldset `disabled`. `className` / `style` state callbacks.
