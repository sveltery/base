# Dialog

A modal or non-modal dialog. Upstream: `packages/react/src/dialog` at Base UI v1.8.0. Local: `src/lib/dialog/`.

## Sub-features

- `Dialog.Root` renders no element. `open` and `triggerId` use the shared controllable-value helper. Omit `open` and pass `defaultOpen` to let the dialog own it. Pass `open` to hold it. `defaultTriggerId` selects the trigger for `defaultOpen`. `bind:triggerId` follows the trigger that opened the dialog.
- `onOpenChange(open, eventDetails)` runs before the change. Reasons: `trigger-press`, `outside-press`, `escape-key`, `close-press`, `focus-out`, `imperative-action`, `none`. `eventDetails.cancel()` vetoes it. `eventDetails.preventUnmountOnClose()` keeps the popup mounted after a close; `actions.unmount()` removes it.
- `bind:actions` exposes `close()` and `unmount()`. `Dialog.createHandle()` returns a handle for detached triggers, `open(triggerId)`, `openWithPayload(payload)`, `close()`, and `isOpen`.
- `modal` defaults to `true`: focus is trapped, page scroll locks, and an internal backdrop covers the page. `false` does none of those. `'trap-focus'` traps focus without the scroll lock or the internal backdrop.
- `disablePointerDismissal` ignores outside presses. Non-modal dialogs also stay open when focus leaves.
- Trigger: `<button type="button">`, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` while that trigger owns the open dialog, `data-popup-open`, `data-base-ui-click-trigger`. Disabled native triggers use the `disabled` attribute and `data-disabled`. `nativeButton={false}` uses `role="button"` and `aria-disabled`. A consumer `onclick` runs first; `preventDefault()` skips the open.
- Portal mounts on `document.body` through the shared portal. `keepMounted` leaves it mounted while closed. Modal dialogs render the shared internal backdrop.
- Popup: `role="dialog"`, `tabindex="-1"`, `data-base-ui-focusable`, `aria-labelledby` / `aria-describedby` from title and description, `data-open` / `data-closed`, `data-starting-style` / `data-ending-style`, `data-nested`, `data-nested-dialog-open`, and `--nested-dialogs`. Escape closes the topmost dialog. Arrow keys do not leave the dialog.
- Backdrop: `role="presentation"`. Nested dialogs skip it unless `forceRender`. A click on the backdrop or the viewport (not the popup) closes a modal. Pointer-down does not.
- Close button uses `reason: 'close-press'`. `preventDefault()` skips it. Title is an `<h2>`. Description is a `<p>`. Generated ids use `$props.id()` with a `base-ui-` prefix.
- Initial focus moves to the first tabbable control, or to the popup when opened by touch. Final focus returns to the trigger. Pass an element or a function. `false` skips the move.
- Parts throw the upstream missing-context strings.

## Source correspondence

| Upstream                                | Local                                                                             | Review                                                                                             |
| --------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `DialogRoot` `open` / `defaultOpen`     | `DialogRoot` `$bindable` `open`                                                   | Same trigger, cancel, dismissal, and modal behavior. No locked controlled mode                     |
| `actionsRef`                            | `bind:actions`                                                                    | `close` and `unmount` only. No ref object                                                          |
| `DialogHandle` / `createDialogHandle`   | `handle.svelte.ts`                                                                | Detached triggers, payload, and imperative open/close. Element access is `bind:this` / `{@attach}` |
| `useDialogRoot` dismiss and scroll lock | `useDismiss` for Escape and `useScrollLock`; outside press is one dialog listener | The shared dismiss hook treats the portal host as inside, so it does not decide backdrop presses   |
| `DialogTrigger` + `useButton`           | `DialogTrigger` + `Button`                                                        | Same disabled and non-native button behavior                                                       |
| `DialogPopup` + `FloatingFocusManager`  | `DialogPopup` + shared `FloatingFocusManager`                                     | Touch focuses the popup. Custom final focus is applied by the dialog                               |
| `useOpenChangeComplete`                 | shared `useOpenChangeComplete`                                                    | Open completion calls `onOpenChangeComplete(true)`. Close completion stays on the popup store      |
| `DialogPortal` + `InternalBackdrop`     | shared `FloatingPortal` and `InternalBackdrop`                                    | `container` is an element, not a ref                                                               |
| `useRenderElement`                      | `{#if render}` snippet `(props, state, children)`                                 | No refs or style/class callbacks                                                                   |
| `children({ payload })`                 | children snippet argument `{ payload }`                                           | Same payload from the active trigger or `openWithPayload`                                          |

Differences from React Base UI, all deliberate:

- No locked controlled mode. Hold the state with `eventDetails.cancel()`. `defaultOpen` and `defaultTriggerId` are the uncontrolled start.
- No `ref` and no `actionsRef`. Use `{@attach}` and `bind:actions`.
- `initialFocus` / `finalFocus` accept an element or a function, not a ref object.
- `class` and `style` are strings.
- Alert Dialog and Drawer are not ported. `role` stays `dialog`.
- Outside press is one dialog listener. Mouse and touch use separate modes. A backdrop is `intentional` for both. Without one, touch is `sloppy` and mouse is `sloppy` only for `trap-focus`. The shared dismiss hook still treats the portal host as inside, so it does not decide these presses.
- Generated ids use `$props.id()` with a `base-ui-` prefix.
- The dev and production missing-context errors are the descriptive strings.

## How to get to it (user POV)

A consumer imports `Dialog` from `@sveltery/base` or `@sveltery/base/dialog` and renders `Dialog.Root`, `Dialog.Trigger`, `Dialog.Portal`, and `Dialog.Popup`. For verification, open `/fixtures/dialog?case=<case>`, where `<case>` is one of `standalone`, `outside`, `cancel`, `disabled`, `nested`, or `focus` (`src/routes/fixtures/dialog/cases.ts`). Add `&reference` to get React Base UI with the same cases.
