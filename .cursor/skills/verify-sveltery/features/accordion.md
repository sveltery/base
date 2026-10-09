# Accordion

A list of disclosures that share one open value. Upstream: `packages/react/src/accordion` at Base UI v1.8.0. Local: `src/lib/accordion/`. Each item uses the Collapsible root and panel motion already in `src/lib/collapsible`. There is no second disclosure engine.

## Sub-features

- `Accordion.Root` renders a `<div>`. `value` is one `$bindable` array of open item values. Omit it to start from `defaultValue` (empty). `bind:value` shares it with the parent. A one-way `value` sets it, and trigger clicks override it until the parent passes a new array. A parent write does not call `onValueChange`.
- `multiple` false opens one item and closes the others. The next list is `[item]` or `[]` based on whether that item is `value[0]`, including when the open request says it should stay open. `multiple` true pushes on open and filters that item out on close.
- `onValueChange(value, eventDetails)` runs before the commit. `reason` is `trigger-press` from a trigger and `none` from `beforematch`. `eventDetails.cancel()` vetoes the change. An item `onOpenChange` runs first and shares those details, so canceling there skips the root callback.
- A consumer `onclick` on the trigger runs first. `event.preventDefault()` skips the toggle. A disabled trigger does not call `onclick`, `onOpenChange`, or `onValueChange`.
- Disabled: the root `disabled` flag disables every item. An item `disabled` flag disables that item only. `disabled={false}` on a trigger does not re-enable it. Disabled triggers stay in the tab order with `aria-disabled` and no `disabled` attribute. `data-disabled` is set on the item, header, trigger, and open panel.
- `data-orientation` is `vertical` by default. `orientation` and `loopFocus` do not move focus.
- Trigger: `aria-expanded`. `aria-controls` is the panel id while open, and absent while closed. `data-panel-open` while open. `type="button"`. A `render` snippet receives `(props, state, children)`. `nativeButton={false}` with a `render` snippet that supplies a non-button host sets `role="button"`, `tabindex="0"`, and Enter/Space activation on that host. The default host stays `<button>`. Space opens on keyup for both hosts.
- Header renders an `<h3>`. Panel renders a `<div role="region">` with `aria-labelledby` set to the trigger id. Generated ids use `$props.id()` with a `base-ui-` prefix. An author `id` replaces the generated one. Unmounting the trigger clears `aria-labelledby`. Unmounting the panel clears `aria-controls`.
- Item `value` identifies the row. An omitted value gets a generated id. `data-index` follows DOM order after the item host mounts, and is `-1` before that.
- Panel motion matches Collapsible: `data-open` / `data-closed`, `data-starting-style`, `data-ending-style`, `--accordion-panel-height`, and `--accordion-panel-width`. An initially open panel sets `animation-name: none` until the first close. `keepMounted` and `hiddenUntilFound` on the root apply to every panel unless the panel sets its own. An explicit `keepMounted={false}` with hidden-until-found warns once and is ignored. `beforematch` opens the item.
- Item throws `AccordionRootContext is missing` outside Root, and Header throws `AccordionItemContext is missing` outside Item. Panel checks the root context, then the item context. Trigger checks `CollapsibleRootContext` first, so outside an item it throws `CollapsibleRootContext is missing`.

## Source correspondence

| Upstream                                     | Local                                                  | Review                                                                                            |
| -------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `value` + `defaultValue`                     | `AccordionRoot` `$bindable` `value` and `defaultValue` | Same single-vs-multiple updates and cancel behavior. `defaultValue` applies when `value` is unset |
| `useCollapsibleRoot` inside `Accordion.Item` | `new CollapsibleRoot` per item                         | Same open, disabled, transition, and panel id registration                                        |
| `useCollapsiblePanel`                        | `CollapsiblePanelMotion`                               | Same measurement and completion unmount. CSS variables are `--accordion-panel-*`                  |
| `Accordion.Trigger` + `useButton`            | `AccordionTrigger.svelte`                              | Focusable-when-disabled and non-native keyboard activation. No host-tag warning                   |
| `useRenderElement`                           | `{#if render}` snippet `(props, state, children)`      | No `UseRender`, refs, or style/class callbacks                                                    |
| Composite list index                         | Host `{@attach}` registration                          | Index follows DOM order. No roving tabindex                                                       |

Differences from React Base UI, all deliberate:

- `defaultValue` is the uncontrolled start and the fallback when a controlled `value` is cleared. No locked controlled mode. Hold the value with `eventDetails.cancel()`.
- No `ref`. Use `{@attach}` or `bind:this`.
- `class` and `style` are strings. Panel CSS variables are written first, a consumer `style` follows, and `animation-name: none` is last so it wins.
- No React.Activity resume suppression.
- `orientation` and `loopFocus` are accepted and ignored. Arrow keys do not rove.

## How to get to it (user POV)

A consumer imports `Accordion` from `@sveltery/base` or `@sveltery/base/accordion` and renders `Accordion.Root`, `Accordion.Item`, `Accordion.Header`, `Accordion.Trigger`, and `Accordion.Panel`. For verification, open `/fixtures/accordion?case=<case>`, where `<case>` is one of `exclusive`, `multiple`, `disabled`, `cancel`, `bound`, `prevented`, `mounted`, `open`, or `search` (`src/routes/fixtures/accordion/cases.ts`). Add `&reference` to get React Base UI with the same cases.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh accordion
```

Handles used by `src/routes/fixtures/accordion/accordion.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Root: `getByTestId('root')`
- Triggers: `getByRole('button', { name: 'One' | 'Two' })`
- Panels: `getByTestId('panel-one')` and `getByTestId('panel-two')`. Closed panels are absent unless the case is `mounted` or `search`.
- Owner of the `bound` case: `getByRole('checkbox', { name: 'Owner one' })`
- Callback log: `getByTestId('calls')`, a JSON list of `{ value, reason, canceled }`

Proof of working order: in both frameworks, exclusive clicks leave one panel open, `multiple` leaves both open, a disabled root never calls back, cancel leaves `aria-expanded` false, and `beforematch` opens a hidden-until-found panel. The SSR tests check a closed trigger with no panel text, and an open panel that already includes `animation-name:none`.

Each framework writes some cases in its own idiom:

- `bound`: Svelte uses `bind:value`. React uses controlled `value` plus `onValueChange`.
- `prevented`: Svelte calls `preventDefault()`. React calls `preventBaseUIHandler()`.
- `open`: Svelte starts from `value={['one']}`. React uses `defaultValue`.

## Gotchas

- Disabled triggers are focusable. Playwright will not click an `aria-disabled` button unless `force: true` is set. The assertion is that nothing opened and no callback ran.
- `data-starting-style` lasts one frame. A test that awaits a click can miss it.
- Interacting before `data-hydrated="true"` races hydration.
- The React reference bundles Base UI with `'use client'` directive warnings during `vite build`. They are expected noise.

## Not ported

React.Activity animation resume, `className` / `style` state callbacks, refs, and roving focus from `orientation` / `loopFocus`.
