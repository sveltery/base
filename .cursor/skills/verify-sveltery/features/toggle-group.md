# ToggleGroup

Shared pressed state for a series of toggles, with a roving tab stop. Upstream: `packages/react/src/toggle-group/ToggleGroup.tsx` at Base UI v1.8.0, plus the linear composite keyboard path. Local: `src/lib/toggle-group/`.

## Sub-features

- Renders a `<div role="group">`. `data-orientation` is `horizontal` by default. `vertical` changes it. `aria-orientation` is not set.
- `multiple` sets `data-multiple` only when true. When false, pressing one toggle releases the others. When true, each toggle changes on its own.
- `value` is one `$bindable` array of pressed toggle values (default empty when omitted). `bind:value` shares it with the parent. A one-way `value` sets it, and clicks override it until the parent changes it. `onValueChange(value, eventDetails)` runs before the commit. `eventDetails.cancel()` vetoes it.
- `disabled` disables every toggle: native `disabled`, `aria-disabled="true"`, and `data-disabled`. An individual toggle can be disabled on its own. Enabled items inside a group expose `aria-disabled="false"`.
- Each `Toggle` `value` is its id in the group. An omitted or empty value gets a generated `base-ui-` id. If the group `value` was passed and a toggle omits `value`, a dev warning is logged once.
- A grouped toggle's `onPressedChange` runs first and shares the event details, so canceling there also skips the group update. `event.preventDefault()` on `onclick` skips both.
- Roving tabindex uses the shared composite root. One item has `tabindex="0"`, the others `-1`. A disabled first toggle is not the server tab stop. Arrow keys follow DOM order after a keyed reorder. They follow `orientation`. Horizontal arrows swap in RTL (`DirectionProvider`). Home and End move to the first and last focusable item. `loopFocus` defaults to true. Disabled items are skipped, and a tab stop that becomes disabled moves to the next focusable item.
- The root exposes `tabindex`, focus handlers, and a registration attachment, spread into Toggle's host props. A `render` snippet receives those props.
- Native rendering: a `render` snippet on the group receives `(props, state)`. Consumer `{@attach}` reaches the host.

Differences from React Base UI, all deliberate:

- No `defaultValue`, and no locked controlled mode. Hold the value with `eventDetails.cancel()`.
- No Toolbar context. The group always owns roving focus.
- No grid navigation and no scroll-into-view math.
- No `className` or `style` state callbacks. No React `ref`. Use `{@attach}`.

## How to get to it (user POV)

A consumer imports `ToggleGroup` and `Toggle` and renders `<ToggleGroup bind:value><Toggle value="bold">Bold</Toggle></ToggleGroup>`. For verification, open `/fixtures/toggle-group?case=<case>`, where `<case>` is one of `exclusive`, `multiple`, `vertical`, `rtl`, `keyboard`, `disabled`, `cancel` or `bound` (`src/routes/fixtures/toggle-group/cases.ts`). Add `&reference` for React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh toggle-group
```

Handles used by `src/routes/fixtures/toggle-group/toggle-group.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Group: `getByRole('group', { name: 'Formatting' })`
- Toggles: `getByRole('button', { name: 'One' | 'Two' | 'Three' })`
- Owner of the `bound` case: `getByRole('checkbox', { name: 'Owner two' })`
- Callback log: `getByTestId('calls')`, a JSON list of `{ value, reason, canceled }`

Proof of working order: in both frameworks, exclusive clicks leave one toggle pressed, `multiple` leaves both pressed, vertical and RTL arrows move focus on the forward key only, Home and End jump, Space presses the focused toggle, a disabled group never calls back, and cancel leaves `aria-pressed` false. The SSR test checks that the server HTML already contains `role="group"`, `data-orientation="horizontal"`, `tabindex="0"`, `tabindex="-1"` and `aria-pressed="false"`.

`bound` is written in each idiom. Svelte uses `bind:value`. React uses `value` plus `onValueChange`. RTL uses `dir="rtl"` in Svelte and `DirectionProvider` in React. The assertions are the same.

Component tests (`src/lib/toggle-group/ToggleGroup.svelte.spec.ts`) port the upstream group, value, disabled, multiple, keyboard, and callback cases, except Toolbar nesting and `describeConformance`. Native-only checks cover one-way `value`, `loopFocus={false}`, a disabled tab stop, the render snippet, and the registration attachment.

## Gotchas

- The disabled e2e click uses `force: true` because Playwright will not click a disabled button.
- Interacting before `data-hydrated="true"` races hydration.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.

## Not ported

Toolbar and Toolbar.Group disabled inheritance, and rendering the group as a plain element when a toolbar already owns composite focus. Grid composite layout, scroll-into-view, and `className` / `style` state callbacks.
