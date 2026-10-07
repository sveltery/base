# Toggle

A two-state button. Upstream: `packages/react/src/toggle/Toggle.tsx` at Base UI v1.8.0. Local: `src/lib/toggle/`.

## Sub-features

- Uncontrolled: `defaultPressed` (default false), and each click flips the state.
- Controlled: `pressed` belongs to the owner. A click calls `onPressedChange(next)` but shows the owner's value.
- `onPressedChange(pressed, eventDetails)` runs before the commit, with `reason: 'none'`. `eventDetails.cancel()` vetoes the change.
- A consumer `onclick` runs first. `event.preventBaseUIHandler()` skips the Toggle's handling.
- Disabled: a natively `disabled` button with `data-disabled`, and no callback.
- State attributes: `aria-pressed`, plus `data-pressed=""` when pressed.
- Native rendering: `<button type="button">`. `form` and `type` are stripped. A `render` snippet receives `(props, state)`, and `bind:ref` resolves to the actual host.

## How to get to it (user POV)

A consumer imports `Toggle` from `@sveltery/base` or `@sveltery/base/toggle` and renders `<Toggle>Bold</Toggle>`. For verification, open the fixture `/fixtures/toggle?case=<case>`, where `<case>` is one of `uncontrolled`, `controlled`, `cancel`, `disabled` or `prevent-base` (`src/routes/fixtures/toggle/cases.ts`). Add `&reference` to get React Base UI with identical markup.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh toggle
```

Handles used by `src/routes/fixtures/toggle/toggle.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Toggle: `getByRole('button', { name: 'Bold' })`, id `tested-toggle`
- Controlled owner: `getByRole('checkbox', { name: 'Owner pressed' })`
- Callback log: `getByTestId('calls')`, a JSON list of `{ pressed, reason, canceled }`

Proof of working order: in both frameworks, `aria-pressed` and `data-pressed` change only through real clicks and key presses, and the `calls` log shows exactly the expected callbacks. Examples: one call with `canceled: true` and an unchanged state for `cancel`; no calls for `disabled` and `prevent-base`. The SSR test checks that the server HTML already contains `type="button"` and `aria-pressed="false"` before hydration.

Component tests (`src/lib/toggle/Toggle.svelte.spec.ts`) port the standalone upstream tests: controlled, uncontrolled, callback, cancel and disabled. They add native checks for type stripping and the render snippet with `bind:ref`.

## Gotchas

- The disabled e2e test clicks with `force: true` because Playwright will not click a disabled button. The assertion is that nothing changed and no callback ran.
- In controlled mode the click still produces a `calls` entry (`pressed: false` after the owner set true). The state does not move. That matches React.
- Interacting before `data-hydrated="true"` races hydration: the SSR button exists but has no handler yet.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.
