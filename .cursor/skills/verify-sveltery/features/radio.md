# Radio

A single radio button. Upstream: `packages/react/src/radio/root/RadioRoot.tsx` and `packages/react/src/radio/indicator/RadioIndicator.tsx` at Base UI v1.8.0. Local: `src/lib/radio/`.

## Sub-features

- `value` identifies the radio. Without a group, the radio is selected only when `value` is `''`. Any other value, including `null`, stays unchecked. Clicks, Space, and Enter do not select it. That is the upstream standalone behavior.
- When a parent sets the radio group context, selection is `checkedValue === value` using object identity. A click, a label activation, or a focus while the group is touched calls `setCheckedValue(value, eventDetails)` with `reason: 'none'`. `eventDetails.cancel()` keeps the previous value and restores the hidden input. The activation event passed to the group is the click that checked the input, so modifier keys are visible. RadioGroup owns that context.
- A consumer `onclick` runs first. `event.preventDefault()` skips the radio's handling. `stopPropagation()` still selects a grouped radio, and ancestors hear that one click.
- The root is a `<span role="radio">` with `tabindex="0"`. A hidden radio is the form control. `value` is serialized onto that input (`null` becomes `""`, objects become JSON) and is not copied onto the root. Enter never activates the radio and does not submit the form.
- `disabled`: `aria-disabled`, `data-disabled`, and `tabindex="-1"`. There is no `disabled` attribute on the span. Clicks do not select. The hidden radio is disabled.
- `readOnly`: `data-readonly` on the root. There is no `aria-readonly`. The hidden radio is `readonly`. Clicks do not select.
- `required`: `data-required` on the root. There is no `aria-required`. The hidden radio is `required`. A named group blocks submit until one radio is selected. A radio with no name does not, because the browser only validates a radio button group.
- `nativeButton`: render a `<button type="button">`. The `id` moves onto that button. Space uses the button's own activation. Enter still does not select.
- `Radio.Indicator` renders while selected. It sets `data-starting-style` for one frame when it mounts, then `data-ending-style` until the exit animation ends. `keepMounted` leaves it in the DOM when hidden. Several indicators that finish together leave in the same update.
- State attributes: `data-checked` or `data-unchecked`, plus `data-disabled`, `data-readonly`, and `data-required` when those props are set. A selected radio also sets `data-composite-item-active`. The indicator repeats the checked and field-style hooks it has. A `render` snippet receives `(props, state)`.
- A sibling or wrapping `<label>` supplies `aria-labelledby` after mount. Server HTML omits that attribute.
- Consumer `{@attach}` reaches the host through the spread props. Element access inside the component uses `bind:this`.

Differences from React Base UI, all deliberate:

- No `inputRef` and no `ref`. Use `{@attach}` on the part, or `bind:this` on your own element.
- No `className` or style objects. Use `class` and `style` strings.
- No `preventBaseUIHandler()`. `preventDefault()` on the root click is the skip signal.
- No dev warning when `nativeButton` does not match the host tag.
- No Field state and no Form `clearErrors`.
- Arrow keys and the roving tabindex live on RadioGroup. A standalone radio does not move focus with arrows. When the group context includes roving focus, this root registers its host and takes the group's tabindex. A harness can set the context without roving, and then every radio keeps `tabindex="0"`.

Preserved upstream behavior:

- A disabled `mousedown` does not call `preventDefault`. `pointerdown` and `click` do.
- A click that is already canceled does not select the radio.
- Outside a group, `value === ''` is the only selected state.

## How to get to it (user POV)

A consumer imports `Radio` from `@sveltery/base` or `@sveltery/base/radio` and renders `<Radio.Root value="blue">Blue</Radio.Root>`. For verification, open `/fixtures/radio?case=<case>`, where `<case>` is one of `checked`, `unchecked`, `disabled`, `readonly`, `label`, `native`, `required`, `enter`, `null`, `bubble`, or `stop` (`src/routes/fixtures/radio/cases.ts`). Add `&reference` to get React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh radio
```

Handles used by `src/routes/fixtures/radio/radio.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Checked radio: `getByRole('radio', { name: 'Checked' })`, id `tested-radio`
- Other cases: `getByRole('radio', { name: 'Blue' })` or `None`
- Indicator of the `checked` case: `getByTestId('indicator')`
- Label text of the `label` case: `getByText('Label')`
- Submit of the `required` and `enter` cases: `getByRole('button', { name: 'Submit' })`
- Ancestor clicks: `getByTestId('parent-clicks')`
- Submit count: `getByTestId('submitted')`

Proof of working order: in both frameworks, only `value=""` is `aria-checked="true"` with `data-checked` and the indicator. Clicks and Space leave every other value unchecked. Enter does not select and does not submit. `disabled` and `readonly` stay off. `required` sets `data-required` without `aria-required`, and a nameless radio still submits. The SSR test checks that the server HTML already contains `role="radio"`, `aria-checked`, `data-checked` or `data-unchecked`, and `type="radio"`.

Component tests (`src/lib/radio/Radio.svelte.spec.ts`) port the upstream tests that do not need Field. Tests that need a shared value use a harness context instead of `RadioGroup`. Arrow-key selection is covered by RadioGroup.

## Gotchas

- The disabled e2e test clicks with `force: true` because Playwright will not click an `aria-disabled` radio.
- Interacting before `data-hydrated="true"` races hydration.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.
- `aria-labelledby` from a native label is applied after mount, so it is absent from the SSR HTML.
- Standalone fixtures cannot show mutual exclusion. That is the RadioGroup fixture.
- Object values use `===`. A group must store the selected value with `$state.raw`. Proxied `$state` gives the object a different identity than the radio's `value`.
