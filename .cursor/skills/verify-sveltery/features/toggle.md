# Toggle

A two-state button. Upstream: `packages/react/src/toggle/Toggle.tsx` at Base UI v1.8.0. Local: `src/lib/toggle/`.

## Sub-features

- Pressed state: one `$bindable` `pressed` prop (default false). Each click flips it. `bind:pressed` shares it with the parent. A one-way `pressed={x}` sets it, and clicks override it until `x` changes.
- `onPressedChange(pressed, eventDetails)` runs before the change, with `reason: 'none'`. `eventDetails.cancel()` vetoes the change.
- A consumer `onclick` runs first. `event.preventDefault()` skips the Toggle's handling.
- Disabled: a natively `disabled` button with `data-disabled`, and no callback.
- State attributes: `aria-pressed`, plus `data-pressed=""` when pressed.
- `value` identifies the toggle inside a ToggleGroup. Standalone, it does not affect `pressed`. An empty string is treated as omitted.
- Native rendering: `<button type="button">`. `form` and `type` are stripped. A `render` snippet receives `(props, state)`. Consumer `{@attach}` reaches the host in both cases. Inside a ToggleGroup, the host also receives a roving `tabindex`, focus handlers, `aria-disabled`, and a registration attachment.

Differences from React Base UI, all deliberate:

- No `defaultPressed`, and no locked controlled mode. In React, `pressed` without an `onPressedChange` that updates it never moves. Here, use `eventDetails.cancel()` to hold the state.
- No `preventBaseUIHandler()`. Base UI ignores `preventDefault()` on click; here it is the skip signal.
- No `ref`. Use `{@attach}`.

## How to get to it (user POV)

A consumer imports `Toggle` from `@sveltery/base` or `@sveltery/base/toggle` and renders `<Toggle bind:pressed>Bold</Toggle>`. For verification, open the fixture `/fixtures/toggle?case=<case>`, where `<case>` is one of `standalone`, `bound`, `cancel`, `disabled` or `prevented` (`src/routes/fixtures/toggle/cases.ts`). Add `&reference` to get React Base UI with identical markup.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh toggle
```

Handles used by `src/routes/fixtures/toggle/toggle.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Toggle: `getByRole('button', { name: 'Bold' })`, id `tested-toggle`
- Owner of the `bound` case: `getByRole('checkbox', { name: 'Owner pressed' })`
- Callback log: `getByTestId('calls')`, a JSON list of `{ pressed, reason, canceled }`

Proof of working order: in both frameworks, `aria-pressed` and `data-pressed` change only through real clicks and key presses, and the `calls` log shows exactly the expected callbacks. Examples: one call with `canceled: true` and an unchanged state for `cancel`; no calls for `disabled` and `prevented`. The SSR test checks that the server HTML already contains `type="button"` and `aria-pressed="false"` before hydration.

Each framework writes some cases in its own idiom, and both are held to the same assertions:

- `bound`: Svelte uses `bind:pressed`; React uses controlled `pressed` plus `onPressedChange`.
- `prevented`: Svelte calls `preventDefault()`; React calls `preventBaseUIHandler()`.

Component tests (`src/lib/toggle/Toggle.svelte.spec.ts`) port the standalone upstream tests: owner-held state (as `bind:pressed`), standalone, callback, cancel and disabled. Native-only checks cover the one-way prop, `preventDefault`, type stripping and consumer attachments with and without `render`.

## Gotchas

- The disabled e2e test clicks with `force: true` because Playwright will not click a disabled button. The assertion is that nothing changed and no callback ran.
- Interacting before `data-hydrated="true"` races hydration: the SSR button exists but has no handler yet.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.
