# Tabs

A tablist and its panels. Upstream: `packages/react/src/tabs/` at Base UI v1.8.0. Local: `src/lib/tabs/`.

## Sub-features

- `Tabs.Root` renders a `<div>`. `data-orientation` is `horizontal` by default. `data-activation-direction` is `none` until a selection moves.
- `Tabs.List` renders `<div role="tablist">`. `aria-orientation` is set only when `orientation` is `vertical`.
- `Tabs.Tab` renders `<button type="button" role="tab">`. `aria-selected` follows the root value. `aria-controls` points at the mounted panel with the same value. A disabled tab stays focusable (`aria-disabled`, no native `disabled`).
- `Tabs.Panel` renders `<div role="tabpanel">`. It is mounted while open, then unmounts after the exit animation unless `keepMounted` is set. Hidden panels use the `hidden` attribute, `inert`, and `tabindex="-1"`. `data-index` is document order. `data-starting-style` and `data-ending-style` mark the motion phases.
- `Tabs.Indicator` renders `<span role="presentation">` and sets `--active-tab-left`, `--active-tab-right`, `--active-tab-top`, `--active-tab-bottom`, `--active-tab-width`, and `--active-tab-height` from the active tab. It stays `hidden` until that tab has a size. It is omitted when the value is `null`.
- `value` is one `$bindable`. Omit it and the root starts at `defaultValue` (`0`), then moves to the first enabled tab when that selection is disabled or missing. Those moves call `onValueChange` with `initial`, `disabled`, or `missing`. `cancel()` does not stop them. Pass `value` or `bind:value` to hold the selection: the root does not move it when a tab is disabled or removed. A click or key can still change it until the parent passes a new value. Clearing a controlled value (`undefined`) returns to `defaultValue`. `null` selects nothing.
- `activateOnFocus` selects the tab arrow keys move to. Otherwise Enter or Space selects the focused tab. A secondary pointer press does not select.
- Roving tabindex uses the shared composite root, with Tabs' own skip rules: `aria-disabled` tabs stay in the arrow order and can hold the tab stop. A natively disabled or hidden host is skipped. Arrow keys follow `orientation` and swap in RTL. Home and End jump. `loopFocus` defaults to true. Arrowing onto an `aria-disabled` tab leaves that tab as the stop, so the next Tab leaves the list. With no selection, the first tab is the stop even when every tab is disabled. A disabled selection does not take the tab stop away from the previous enabled tab when focus is outside the list. The server tab stop is the selected tab. Remounting every tab leaves one stop.
- A `render` snippet receives `(props, state, children)`. Consumer `{@attach}` reaches the host.

Differences from React Base UI, all deliberate:

- No locked controlled mode. Hold a passed value with `eventDetails.cancel()`, or pass the value again. `defaultValue` is the uncontrolled start and the fallback when a controlled value is cleared.
- No pre-hydration indicator script.
- No scroll-into-view. Indicator offsets walk `parentElement`, not shadow roots.
- No `className` or `style` state callbacks. No React `ref`. Use `{@attach}`.

## How to get to it (user POV)

A consumer imports `Tabs` and renders `<Tabs.Root bind:value><Tabs.List><Tabs.Tab value="one">One</Tabs.Tab></Tabs.List><Tabs.Panel value="one">...</Tabs.Panel></Tabs.Root>`. For verification, open `/fixtures/tabs?case=<case>`, where `<case>` is one of `select`, `keyboard`, `follow`, `vertical`, `rtl`, `disabled`, `cancel`, `bound`, `fallback`, or `loop` (`src/routes/fixtures/tabs/cases.ts`). Add `&reference` for React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh tabs
```

Handles used by `src/routes/fixtures/tabs/tabs.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- List: `getByRole('tablist', { name: 'Sections' })`
- Tabs: `getByRole('tab', { name: 'One' | 'Two' | 'Three' })`
- Panel: `getByRole('tabpanel')`
- Owner of the `bound` case: `getByRole('checkbox', { name: 'Owner two' })`
- Indicator: `getByTestId('indicator')`
- Callback log: `getByTestId('calls')`, a JSON list of `{ value, reason, canceled }`

Proof of working order: in both frameworks, a click leaves the second tab selected, arrows move focus without selecting until Enter, `follow` selects on the arrow, vertical and RTL arrows move on the forward key only, a disabled tab can take focus and does not select, cancel leaves the first tab selected, the owner and a click share one value, and an omitted value skips a disabled first tab. The SSR test checks that the server HTML already contains `role="tablist"`, `role="tab"`, `aria-selected`, `tabindex="0"`, `tabindex="-1"`, and `data-activation-direction="none"`.

`bound` is written in each idiom. Svelte uses `bind:value`. React uses `value` plus `onValueChange`. RTL uses `dir="rtl"` in Svelte and `DirectionProvider` in React. The assertions are the same.

## Gotchas

- The closing panel stays mounted with `data-ending-style` until its animation finishes, so `getByRole('tabpanel')` can match two panels. The e2e targets the selected panel by its tab name.
- The disabled e2e click uses `force: true` because Playwright will not click an `aria-disabled` tab.
- Interacting before `data-hydrated="true"` races hydration.
- An omitted `value` logs an `initial` change once the tabs register. A passed `value` does not.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.

## Not ported

`renderBeforeHydration`, scroll-into-view, shadow-boundary indicator offsets, Suspense, and `className` / `style` state callbacks.
