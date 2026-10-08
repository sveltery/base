# Upstream differences

Intentional differences from Base UI v1.8.0 (`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`). Each component section is owned by the pull request that ports that component.

## Portal

### The portal marker stays on the host

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/floating-ui-react/components/FloatingPortal.tsx`. `useRenderElement` merges `[{ id, 'data-base-ui-portal': '' }, elementProps]`. Later props overwrite, so a consumer `data-base-ui-portal` replaces the marker. `mergeProps` assigns a later `data-base-ui-portal={undefined}` over that `''`, and React omits the attribute, so the marker is removed. `className` and `style` are merged after that list. `createPortal` inserts the div into its container before refs run. The ref list is the consumer ref, then the internal node ref, so the consumer ref sees the node already in that container.

Local: `Dialog.Portal` and `Popover.Portal` spread consumer host attributes onto the portal `div`, then set `data-base-ui-portal=""`. A consumer value does not replace the marker. Upstream lets a consumer `data-base-ui-portal={undefined}` remove the marker. The port always keeps it. `class`, other attributes, and a consumer `{@attach}` still reach that div. The mount attachment runs before that `{@attach}`, so the consumer sees the node in its container. There is no ref object. A `store` key in the consumer props does not replace the dialog or popover store.

Rationale: outside press and the internal backdrop treat that attribute as the portal host.

Test: `src/lib/dialog/Dialog.svelte.spec.ts` and `src/lib/popover/Popover.svelte.spec.ts` (`forwards host attributes and attachments onto the portal element`, `ignores a stray store prop on the portal`).

## Popover

### Cloned radio keeps its name

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/utils/usePopupViewport.tsx`. The previous pane is `cloneNode(true)` of the current content. Control state is not rewritten.

Upstream: a checked radio in that clone keeps its `name`. Inserting the clone into the document unchecks the live radio, because one name can have only one checked radio.

Local: `PopoverViewport` removes `name` from every copied control before the previous pane is inserted. The clone is not in the radio group, so it does not clear the live control. The current pane is a new element. It starts from that trigger's own state. Values typed or checked on trigger A are not written into trigger B. State the content keeps for a trigger is still there when that trigger is shown again.

Rationale: the previous pane is a visual cross-fade, not a second form control. Upstream remounts the current pane, so the next trigger starts fresh.

Test: `src/lib/popover/Popover.svelte.spec.ts` (`starts the next viewport pane from that trigger’s own state`).

### Copied controls submit with the form

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/utils/usePopupViewport.tsx`. The previous pane is `cloneNode(true)` and the shell is `inert`.

Upstream: `inert` does not remove controls from form submission. A copied input with `form="outer-form"` is submitted together with the live input (`["AAA","BBB"]`). A pane portaled into a form does the same, because the copy is still a successful control inside that form.

Local: every copied `input`, `textarea`, `select`, and `button` loses its `name` and is given `form=""` before the previous pane is inserted. An empty `form` attribute associates the control with no form, so a required copy cannot block the ancestor form. Removing `form` leaves that copy inside the form the popup is portaled into. The copy is not a successful control, and it does not match `:disabled`. The shell stays `inert` and `aria-hidden` so it is not interactive and is hidden from assistive tech. `inert` does not by itself keep the control out of `FormData`. Disabling the copy would, and it would also apply `:disabled` styles during the cross-fade.

Rationale: the previous pane is a visual cross-fade, not a second form control.

Test: `src/lib/popover/Popover.svelte.spec.ts` (`keeps copied viewport controls out of form submission`, `does not mark copied controls disabled during the cross-fade`, `lets the form submit while an empty required copy is cross-fading`).

## Dialog

Source: `packages/react/src/dialog`. Upstream shares `PopupHandle` and `COMPOSITE_KEYS`; they live in `src/lib/internal/popups/popupHandle.svelte.ts` and `src/lib/internal/composite-keys.ts`. Portal, focus, dismiss, scroll lock, `mergeProps`, and the popup store are the landed overlay foundation. How the dialog opened is `PopupStore.openMethod`. Final focus uses the shared `returnFocus` callback: it receives how the popup closed, and `null` focuses the trigger. `openWithPayload` stays on `Dialog.Handle`. Popover does not have it.

### Payload is stored only for a registered trigger

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/dialog/store/DialogHandle.ts` and `packages/react/src/utils/popups/popupStoreUtils.ts`.

Upstream: a trigger's `payload` prop is forwarded when that trigger registers. `Dialog.Handle` has `openWithPayload` and no payload map, `setPayload`, or `forgetPayload`. `open(id)` with an unknown id warns and still opens. It does not throw.

Local: `Dialog.Handle.setPayload` writes into a private map, and only when that id is already registered. An unknown id is rejected and nothing is stored. The payload is not a field on the trigger registration. `open(id)` still warns (the warning names `Dialog.Handle`) and does not replace the displayed payload. `openWithPayload` is unchanged.

Test: `src/lib/dialog/Dialog.svelte.spec.ts` (`does not store a payload for a trigger that is not registered`, `keeps the current payload when opened with an unknown trigger id`).

| Upstream                                                             | Local                                                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `open` / `defaultOpen`, `triggerId` / `defaultTriggerId`             | `createControllableValue` with `$bindable` `open` / `triggerId` and `defaultOpen` / `defaultTriggerId` |
| `actionsRef`                                                         | `bind:this` on `Dialog.Root` (`close` and `unmount`)                                                   |
| `initialFocus` / `finalFocus` ref objects                            | element or function, called when focus moves                                                           |
| `children` render function `{ payload }`                             | snippet argument `{ payload }`                                                                         |
| React `useButton`                                                    | existing `Button`                                                                                      |
| `useDismiss` outside press, including separate mouse and touch modes | one dialog listener, because the shared dismiss hook treats the portal host as inside                  |

Not ported: Alert Dialog, Drawer, and ref objects. Mouse and touch use separate outside-press modes. A backdrop is `intentional` for both. Without one, touch is `sloppy` and mouse is `sloppy` only for `trap-focus`. `useDismiss` already tracks `pressStartedInside`. The dialog listener remains because that hook treats the portal host as inside, so a backdrop or viewport press would not dismiss. `defaultTriggerId` selects the trigger for `aria-expanded` and is not written back into `triggerId`.
