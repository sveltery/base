# Collapsible

A disclosure that shows and hides a panel. Upstream: `packages/react/src/collapsible` at Base UI v1.8.0. Local: `src/lib/collapsible/`.

## Sub-features

- `Collapsible.Root` renders a `<div>`. `open` is one `$bindable` prop. Omit it to start from `defaultOpen` (false). `bind:open` shares it with the parent. A one-way `open={x}` sets it, and trigger clicks override it until `x` changes. A parent write does not call `onOpenChange`.
- `onOpenChange(open, eventDetails)` runs before the change. A trigger press uses `reason: 'trigger-press'`. `beforematch` uses `reason: 'none'`. `eventDetails.cancel()` vetoes the change.
- A consumer `onclick` on the trigger runs first. `event.preventDefault()` skips the open change. A disabled trigger does not call `onclick` or `onOpenChange`.
- Disabled: the root and trigger get `data-disabled`. The trigger stays in the tab order with `aria-disabled` and no `disabled` attribute. Enter, Space, and click do not toggle it.
- Trigger: `aria-expanded`. `aria-controls` is the panel id while open, and absent while closed. `data-panel-open` while open. `type="button"`. A `render` snippet receives `(props, state, children)`. `nativeButton={false}` gives a non-button host `role="button"` and Enter/Space activation.
- Panel id: generated ids are `$props.id()` prefixed with `base-ui-`. An author `id` replaces it. Unmounting the panel clears `aria-controls`; remounting restores the generated id.
- Panel: `data-open` / `data-closed`, plus `data-starting-style` and `data-ending-style` for the motion phase. `--collapsible-panel-height` and `--collapsible-panel-width` are `auto` or a measured pixel size. An initially open panel sets `animation-name: none` until the first close so a keyframe does not run on the first paint.
- Closing waits one frame before `data-ending-style`, so the expanded size is measured first. With no animation, the panel unmounts without `data-ending-style`. A CSS transition or keyframe keeps it mounted until the animation finishes. A zero-size panel unmounts without waiting out an unrelated transition.
- `keepMounted` leaves the closed panel in the DOM with the `hidden` attribute. `hiddenUntilFound` keeps it mounted and sets `hidden="until-found"`. `beforematch` opens it and skips the next open animation. An explicit `keepMounted={false}` with `hiddenUntilFound` warns once and is ignored.
- Parts throw if they render outside `Collapsible.Root`.

## Source correspondence

| Upstream                                      | Local                                                  | Review                                                                                      |
| --------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `useCollapsibleRoot` / `open` + `defaultOpen` | `CollapsibleRoot` `$bindable` `open` and `defaultOpen` | Same trigger, cancel, and disabled behavior. `defaultOpen` applies when `open` is unset     |
| `useTransitionStatus(open, true, true)`       | `context.svelte.ts` pre-effect plus animation frames   | Starting style is committed before the idle frame. Ending waits one frame                   |
| `useCollapsiblePanel`                         | `panel-motion.svelte.ts`                               | Same measurement, animation-type detection, dimension CSS variables, and completion unmount |
| `CollapsibleTrigger` + `useButton`            | `CollapsibleTrigger.svelte`                            | Focusable-when-disabled and non-composite keyboard activation. No host-tag warning          |
| `hidden="until-found"` DOM fix                | Attribute string, reapplied after render               | Page search needs the string value, not a boolean `hidden`                                  |
| `useRenderElement`                            | `{#if render}` snippet `(props, state, children)`      | No `UseRender`, refs, or style/class callbacks                                              |

Differences from React Base UI, all deliberate:

- `defaultOpen` is the uncontrolled start and the fallback when a controlled `open` is cleared. No locked controlled mode. Hold the state with `eventDetails.cancel()`.
- No `ref`. Use `{@attach}`.
- `class` and `style` are strings. Panel CSS variables are written first; a consumer `style` follows; `animation-name: none` is last so it wins.
- No React.Activity resume suppression. Svelte does not preserve component state across a hidden activity boundary.
- Generated panel ids use `$props.id()` with a `base-ui-` prefix.
- The dev and production missing-context error is the descriptive string.

## How to get to it (user POV)

A consumer imports `Collapsible` from `@sveltery/base` or `@sveltery/base/collapsible` and renders `Collapsible.Root`, `Collapsible.Trigger`, and `Collapsible.Panel`. For verification, open `/fixtures/collapsible?case=<case>`, where `<case>` is one of `standalone`, `bound`, `cancel`, `disabled`, `prevented`, `mounted`, `open`, or `search` (`src/routes/fixtures/collapsible/cases.ts`). Add `&reference` to get React Base UI with the same cases.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh collapsible
```

Handles used by `src/routes/fixtures/collapsible/collapsible.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Trigger: `getByRole('button', { name: 'Details' })`, id `tested-trigger`
- Panel: `getByTestId('panel')`. Absent from the document when closed, unless the case is `mounted` or `search`.
- Owner of the `bound` case: `getByRole('checkbox', { name: 'Owner open' })`
- Callback log: `getByTestId('calls')`, a JSON list of `{ open, reason, canceled }`

Proof of working order: in both frameworks, `aria-expanded`, `data-open`, and `data-panel-open` change through clicks and key presses, and `calls` shows `trigger-press` or `none`. The SSR tests check a closed trigger with no panel text, and an open panel that already includes `animation-name:none`.

Each framework writes some cases in its own idiom:

- `bound`: Svelte uses `bind:open`; React uses controlled `open` plus `onOpenChange`.
- `prevented`: Svelte calls `preventDefault()`; React calls `preventBaseUIHandler()`.
- `open`: Svelte starts from `bind:open` with an initial `true`; React uses `defaultOpen`.

## Gotchas

- Disabled triggers are focusable. Playwright can click them without `force`. The assertion is that nothing opened and no callback ran.
- `data-starting-style` lasts one frame. A test that awaits a click can miss it; observe the attribute with a mutation observer or read it in the same flush.
- Interacting before `data-hydrated="true"` races hydration.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.
