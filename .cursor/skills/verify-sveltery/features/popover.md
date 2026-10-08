# Popover

An anchored dialog opened from a trigger. Upstream: `packages/react/src/popover` at Base UI v1.8.0. Local: `src/lib/popover/`.

## Sub-features

- `Popover.Root` renders no element. `open` is one `$bindable` prop. `defaultOpen` is the initial value when `open` is left unset. `bind:open` shares it with the parent. A one-way `open={x}` sets it, and trigger clicks override it until `x` changes. `triggerId` is a second `$bindable` value written when a trigger owns the popup. `defaultTriggerId` is its initial value when `triggerId` is left unset. `bind:this` on the root exposes `close()` and `unmount()`.
- `onOpenChange(open, eventDetails)` runs before the change. Click uses `trigger-press`. Escape uses `escape-key`. An outside click uses `outside-press`. Hover uses `trigger-hover`. Close uses `close-press`. `eventDetails.cancel()` vetoes the change. `eventDetails.preventUnmountOnClose()` keeps the popup mounted after a close until the next open or `root.unmount()`.
- `onOpenChangeComplete(open)` runs when the open or close transition finishes.
- `Popover.Trigger` is a `<button>` with `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls` while that trigger owns the open popup. Click toggles. `data-popup-open` while open. `data-pressed` when the open reason is `trigger-press`. A consumer `onclick` runs first. `event.preventDefault()` skips the toggle.
- Disabled native triggers have the `disabled` attribute and `data-disabled`, and are not in the tab order. `nativeButton={false}` uses `role="button"`, `aria-disabled`, and `tabindex="-1"`.
- `openOnHover` opens after `delay` (default 300ms) and closes after `closeDelay`. A click within 500ms of a hover open does not close it. Hover stays on the trigger that a touch press opened.
- `Popover.Portal` mounts the popup on `document.body` unless `container` is set. `keepMounted` leaves it mounted while closed, with the `hidden` attribute on the positioner.
- `Popover.Positioner` places the popup with the shared anchor positioning. `data-side` and `data-align` follow the rendered placement. `modal={true}` adds the internal backdrop and locks scroll for pointer opens. A touch open locks only when the popup is nearly as wide as the viewport. Hover opens do not lock.
- `Popover.Popup` is `role="dialog"`. Focus moves inside on click open. The shared focus manager returns focus through `returnFocus` after the popup closes. `finalFocus` is forwarded: its function receives the close interaction, and `null` falls back to the trigger. Hover open does not move focus. `initialFocus` accepts a boolean, an element, or a function of the open method (`PopupStore.openMethod`). The function runs once per open, when focus moves. Touch focuses the popup itself.
- `Popover.Close` closes with `close-press` and is what turns `modal` into a focus trap.
- `Popover.Title` and `Popover.Description` share one label part. They set `aria-labelledby` and `aria-describedby` from the prop id when the element mounts.
- `Popover.Arrow` tracks the anchor. `Popover.Viewport` copies the current pane in `$effect.pre` when the trigger switches, before the new trigger's content renders. That copy is `inert` and `aria-hidden`, with ids and radio `name`s removed, and it is rendered only while the cross-fade runs, before the live pane. Width and height CSS variables travel on the style attribute. They are measured again when the payload changes and return to `auto` after the size animation.
- `Popover.createHandle()` is a plain class. Its attached store is `$state.raw`. Calling it at module scope creates no effects. A trigger outside the root stays mounted and reads that store when the root attaches. `handle.open(id)`, `handle.close()`, and `handle.unmount()` are the imperative API.

## Source correspondence

| Upstream                          | Local                                                                           | Review                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `open` / `defaultOpen`            | `$bindable` `open` and `defaultOpen`                                            | Open state uses the shared controllable-value helper. `defaultOpen` applies when `open` is unset |
| `PopoverStore.setOpen`            | `PopoverStore` over the shared `PopupStore`                                     | Deferred `preventUnmountOnClose`, hover stick, and `data-instant`                                |
| `useClick` / `useDismiss` / hover | Shared floating-ui hooks                                                        | Mouse is `intentional` except `trap-focus` (`sloppy`). Touch is `sloppy`                         |
| `FloatingFocusManager`            | Shared focus manager                                                            | The popup is the floating element so the trap wraps the dialog                                   |
| `useAnchorPositioning`            | Shared positioning                                                              | `disableAnchorTracking` still leaves `ancestorResize` on                                         |
| `actionsRef`                      | `bind:this` on `Popover.Root` (`close`, `unmount`) and `Popover.createHandle()` | No `{ current }` ref bag                                                                         |
| `useRenderElement`                | `render` snippet `(props, state, children)`                                     | No refs or style/class callbacks                                                                 |

Differences from React Base UI, all deliberate:

- `defaultOpen` is the uncontrolled initial value. Hold a change with `eventDetails.cancel()`.
- `Popover.Root` and `Popover.Trigger` are not generic components. Payload on the root children snippet is `unknown`. The `PopoverHandle<Payload>` type still carries it.
- No `ref` and no `actionsRef`. Use `{@attach}`, `bind:this`, or `Popover.createHandle()`.
- `class` and `style` are strings.
- Generated ids use `$props.id()` with a `base-ui-` prefix.
- Arrow keys inside a toolbar stay in the popup when the trigger or popup has `role="toolbar"`. The key set is the shared `COMPOSITE_KEYS`. Popover does not import Toolbar context.
- A cloned radio in the previous viewport pane does not keep its `name`. Upstream's clone unchecks the live radio. See `docs/upstream-differences.md`.

## How to get to it (user POV)

A consumer imports `Popover` from `@sveltery/base` or `@sveltery/base/popover` and renders `Popover.Root`, `Popover.Trigger`, `Popover.Portal`, `Popover.Positioner`, and `Popover.Popup`. For verification, open `/fixtures/popover?case=<case>`, where `<case>` is one of `standalone`, `bound`, `cancel`, `disabled`, `prevented`, `hover`, `modal`, `close`, `open`, or `detached` (`src/routes/fixtures/popover/cases.ts`). Add `&reference` to get React Base UI.

## Driving it with Playwright

```sh
bash scripts/verify-component.sh popover
```

Handles used by `src/routes/fixtures/popover/popover.e2e.ts`:

- Readiness: `main[data-hydrated="true"]`. `data-framework` is `svelte` or `react`.
- Trigger: `getByRole('button', { name: 'Open' })`
- Popup: `getByRole('dialog')`
- Outside: `getByRole('button', { name: 'Outside' })`
- Callback log: `getByTestId('calls')`, a JSON list of `{ open, reason, canceled }`

Each framework writes some cases in its own idiom:

- `bound`: Svelte uses `bind:open`; React uses controlled `open` plus `onOpenChange`.
- `prevented`: Svelte calls `preventDefault()`; React calls `preventBaseUIHandler()`.
- `open`: Svelte starts from `bind:open` with an initial `true`; React uses `defaultOpen`.
