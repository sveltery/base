# Popover

An anchored dialog opened from a trigger. Upstream: `packages/react/src/popover` at Base UI v1.8.0. Local: `src/lib/popover/`.

## Sub-features

- `Popover.Root` renders no element. `open` is one `$bindable` prop. `defaultOpen` is the initial value when `open` is left unset. `bind:open` shares it with the parent. A one-way `open={x}` sets it, and trigger clicks override it until `x` changes. `triggerId` is a second `$bindable` value written when a trigger owns the popup. `defaultTriggerId` is its initial value when `triggerId` is left unset. `bind:this` on the root exposes `close()` and `unmount()`.
- `onOpenChange(open, eventDetails)` runs before the change. Click uses `trigger-press`. Escape uses `escape-key`. An outside click uses `outside-press`. Hover uses `trigger-hover`. Close uses `close-press`. `eventDetails.cancel()` vetoes the change. `eventDetails.preventUnmountOnClose()` keeps the popup mounted after a close until the next open or `root.unmount()`.
- `onOpenChangeComplete(open)` runs when the open or close transition finishes. The callback is untracked, so it can write `$state`.
- `Popover.Trigger` is a `<button>` with `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls` while that trigger owns the open popup and the popup element is set, including after a container that was not in the document is attached. Server HTML leaves `aria-expanded` false until the trigger element is registered, and omits `aria-controls`. Click toggles. `data-popup-open` while open. `data-pressed` when the open reason is `trigger-press`. A consumer `onclick` runs first. `event.preventBaseUIHandler()` skips the toggle. `event.preventDefault()` does not.
- Disabled native triggers have the `disabled` attribute and `data-disabled`, and are not in the tab order. `nativeButton={false}` uses `role="button"`, `aria-disabled`, and `tabindex="-1"`. A disabled non-native trigger calls `preventDefault()` on click and pointerdown, so a link does not navigate. That click does not call the consumer `onclick`, and it does not cancel `mousedown` or `keydown`. A disabled non-native close click leaves the popup open and does not call `onOpenChange`.
- `openOnHover` opens after `delay` (default 300ms) and closes after `closeDelay`. A click within 500ms of a hover open does not close it. Hover stays on the trigger that a touch press opened.
- `Popover.Portal` mounts the popup on `document.body` unless `container` is set. `container` is an element or a shadow root. `undefined` uses the parent portal or `document.body`. `null` does not mount until a container is set. Switching that container from an element back to `null` while open removes the popup and returns focus to the trigger. `class`, `data-*` attributes, and a consumer `{@attach}` land on the portal div. The attachment runs after the node is in its container. `data-base-ui-portal` stays, including when the consumer passes another value or `undefined`. A `render` snippet receives `(props, state, children)` and replaces the div; spread `props` so the move attachment and `class` land on that element. A `store` prop does not replace the popover store. `PopoverPortalProps` and `PopoverPortalState` are the exported props types. The snippet props include the move attachment. Server HTML omits the portal host and its popup. The host appears after the client commits. `keepMounted` leaves the portal mounted while closed, with the `hidden` attribute on the positioner.
- `Popover.Positioner` places the popup with the shared anchor positioning. `data-side` and `data-align` follow the rendered placement. `modal={true}` adds the internal backdrop and locks scroll for pointer opens. A touch open locks only when the popup is nearly as wide as the viewport. Hover opens do not lock.
- `Popover.Popup` is `role="dialog"`. Focus moves inside on click open. The shared focus manager returns focus through `returnFocus` after the popup closes. `finalFocus` is forwarded: its function receives the close interaction, and `null` falls back to the trigger. Hover open does not move focus. `initialFocus` accepts a boolean, an element, or a function of the open method (`PopupStore.openMethod`). The function runs once per open, when focus moves. Touch focuses the popup itself. Tabbing forward from inside a non-modal popup focuses the next control after the trigger and closes with `focus-out`. The focus manager's trailing guard receives that Tab and focuses the trigger's trailing guard. That guard is registered with `{@attach}`. Shift+Tab from the popup's first control focuses the trigger and leaves the popup open, for the default `document.body` container and an inline container. Tab from the open trigger focuses the first control inside the popup and leaves it open. Shift+Tab from the trigger that opened the popup focuses the control before the trigger and closes with `focus-out`. Shift+Tab from the trigger of a popup opened through `open` focuses that control and leaves the popup open. Main does the same. React closes it because `useImplicitActiveTrigger` makes that popup's only trigger its active trigger, even when something else opened it. A focus-out close does not return focus, including when `finalFocus` is `null`, an element, or a function. The function is not called. React calls that function and ignores the result. When the trailing guard is reached from outside the positioner, focus moves to the previous control inside the popup. A non-modal popover closes when focus leaves its popup or the trigger that opened it for a node outside its floating tree. Focus inside a parent or child popup does not close it.
- `Popover.Close` closes with `close-press` and is what turns `modal` into a focus trap.
- `Popover.Title` and `Popover.Description` share one label part. They set `aria-labelledby` and `aria-describedby` from the prop id when the element mounts.
- `Popover.Arrow` tracks the anchor. `Popover.Viewport` copies the current pane in `$effect.pre` when the trigger switches, before the new trigger's content renders. That copy is `inert` and `aria-hidden`, with ids removed. Copied controls lose `name` and get `form=""`, so the clone does not clear the live radio, the copy is left out of `FormData`, and an empty required copy does not block the ancestor form. They do not match `:disabled`. The current pane is keyed on the active trigger id, so `data-starting-style` lands on a new element and the cross-fade runs. A new payload on the same trigger keeps that element. The new pane starts from the trigger's own state. When a trigger switch removes the focused control, focus moves to the popup. The previous pane is rendered only while the cross-fade runs, before the live pane. Width and height CSS variables travel on the style attribute. They are measured again when the payload changes and return to `auto` after the size animation.
- A detached trigger clears its armed handlers with `onArmed(null)` when its root unmounts. Hover and click stay on the spread. Svelte removes a spread handler when its key disappears, so a later hover or click does not read the unmounted store.
- `Popover.Handle` is the class. `Popover.createHandle()` returns one. Its attached store is `$state.raw`. Calling it at module scope creates no effects. A trigger outside the root stays mounted and reads that store when the root attaches. `handle.open(id)` throws when that trigger is not registered. `handle.close()` and `handle.unmount()` are the imperative API. Payload is the active trigger's payload. `openWithPayload` and `setPayload` belong to `Dialog.Handle`. `setPayload` records a payload only for a registered trigger.

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

- An open popover's server HTML keeps `aria-expanded="false"` until the trigger element is registered, omits `aria-controls` until the popup element is set, and omits the portal host and popup. `data-popup-open` can still be present. Upstream's server trigger is also `aria-expanded="false"` with no `aria-controls`, and its portal is absent. See `docs/upstream-differences.md`.
- `defaultOpen` is the uncontrolled initial value. Hold a change with `eventDetails.cancel()`.
- `Popover.Root` and `Popover.Trigger` are not generic components. Payload on the root children snippet is `unknown`. The `PopoverHandle<Payload>` type still carries it.
- No `ref` and no `actionsRef`. Use `{@attach}`, `bind:this`, or `Popover.createHandle()`.
- `class` on a merged host may be a Svelte class array (strings, objects, and arrays). `style` is a CSS string. The rightmost bag wins.
- Generated ids use `$props.id()` with a `base-ui-` prefix.
- Arrow keys inside a toolbar stay in the popup when the trigger or popup has `role="toolbar"`. The key set is the shared `COMPOSITE_KEYS`. Popover does not import Toolbar context.
- A cloned radio in the previous viewport pane does not keep its `name`. Upstream's clone unchecks the live radio. The next pane is a new element and starts from that trigger's own state. Copied controls also get `form=""`, so they are not submitted and do not block the ancestor form, and they are not disabled. See `docs/upstream-differences.md`.

## How to get to it (user POV)

A consumer imports `Popover` from `@sveltery/base` or `@sveltery/base/popover` and renders `Popover.Root`, `Popover.Trigger`, `Popover.Portal`, `Popover.Positioner`, and `Popover.Popup`. For verification, open `/fixtures/popover?case=<case>`, where `<case>` is one of `standalone`, `bound`, `cancel`, `disabled`, `prevented`, `hover`, `modal`, `close`, `open`, `detached`, `tab`, `tab-empty`, `tab-inline`, `tab-ext`, or `tab-between-ext` (`src/routes/fixtures/popover/cases.ts`). Add `&reference` to get React Base UI.

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
- `prevented`: both call `preventBaseUIHandler()`. `preventDefault()` does not skip the toggle.
- `open`: Svelte starts from `bind:open` with an initial `true`; React uses `defaultOpen`.
