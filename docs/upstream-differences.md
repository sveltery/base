# Upstream differences

Intentional differences from Base UI v1.8.0 (`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`). Each component section is owned by the pull request that ports that component.

## Portal

### The portal marker stays on the host

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/floating-ui-react/components/FloatingPortal.tsx`. `useRenderElement` merges `[{ id, 'data-base-ui-portal': '' }, elementProps]`. Later props overwrite, so a consumer `data-base-ui-portal` replaces the marker. `mergeProps` assigns a later `data-base-ui-portal={undefined}` over that `''`, and React omits the attribute, so the marker is removed. `className` and `style` are merged after that list. `createPortal` inserts the div into its container before refs run. The ref list is the consumer ref, then the internal node ref, so the consumer ref sees the node already in that container.

Local: `Dialog.Portal` and `Popover.Portal` spread consumer host attributes onto the portal `div`, then set `data-base-ui-portal=""`. A consumer value does not replace the marker. Upstream lets a consumer `data-base-ui-portal={undefined}` remove the marker. The port always keeps it. `class`, other attributes, and a consumer `{@attach}` still reach that div. The mount attachment runs before that `{@attach}`, so the consumer sees the node in its container. There is no ref object. A `store` key in the consumer props does not replace the dialog or popover store.

Rationale: outside press and the internal backdrop treat that attribute as the portal host.

Test: `src/lib/dialog/Dialog.svelte.spec.ts` and `src/lib/popover/Popover.svelte.spec.ts` (`forwards host attributes and attachments onto the portal element`, `ignores a stray store prop on the portal`).

## Render snippets

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/internals/useRenderElement.tsx`.

Upstream calls `render(props, state)`. Children travel on `props.children`. That value stays undefined when the consumer passed no children and the part adds none of its own, so a render function can show a fallback.

Local: children are not an element prop, so a spread of `props` cannot carry them. Every part `render` snippet is `(props, state, children)`. `children` is `Snippet | undefined` (`src/lib/internal/render-children.ts`). It is undefined in the same cases upstream leaves `props.children` undefined. The host renders it with `{@render children?.()}`.

Parts that inject their own nodes still pass a snippet, matching upstream `props.children`:

- `Meter.Root` and `Progress.Root` include the consumer's children and a visually hidden `x` so NVDA reads the label.
- `Meter.Value` and `Slider.Value` render the formatted value.
- `Progress.Value` renders the formatted value when it is finite, or the consumer's function. It passes undefined when the bar is indeterminate and the consumer passed no children.
- `Slider.Thumb` includes the range input.
- `Popover.Viewport` includes the current pane.
- `Field.Error` uses the consumer's children when they were passed. Otherwise it passes the message. An empty message is still a snippet. Upstream puts that empty string on `props.children`, and an empty string is falsy. A Svelte snippet is truthy, so a fallback that only checks the third argument sees a snippet for `''`.

`Popover.Title`, `Popover.Description`, and `Popover.Close` take `(props, state, children)`. Their state is an empty object, the same as upstream. An earlier local signature passed children as the second argument.

Migration: these parts used to pass a wrapper snippet that only rendered the consumer's children, so the third argument was always a snippet. They now pass that `children` argument. It is `Snippet | undefined`. A render snippet typed `children: Snippet` no longer type-checks, and calling `children()` without `?.` throws when the consumer passed no children. That matches upstream, where `props.children` is undefined in the same case.

`Accordion.Header`, `Accordion.Item`, `Accordion.Trigger`, `Accordion.Root`, `Collapsible.Trigger`, `Collapsible.Panel`, `Collapsible.Root`, `Dialog.Trigger`, `Dialog.Close`, `Dialog.Backdrop`, `Dialog.Title`, `Dialog.Description`, `Dialog.Popup`, `Dialog.Viewport`, `Form`, `Meter.Indicator`, `Meter.Label`, `Meter.Track`, `NumberField.ScrubArea`, `NumberField.ScrubAreaCursor`, `NumberField.Increment`, `NumberField.Decrement`, `NumberField.Group`, `NumberField.Root`, `OTPField.Root`, `Popover.Arrow`, `Popover.Backdrop`, `Popover.Close`, `Popover.Title`, `Popover.Description`, `Popover.Popup`, `Popover.Positioner`, `Popover.Trigger`, `ScrollArea.Content`, `ScrollArea.Corner`, `ScrollArea.Root`, `ScrollArea.Scrollbar`, `ScrollArea.Thumb`, `ScrollArea.Viewport`, `Slider.Control`, `Slider.Indicator`, `Slider.Label`, `Slider.Root`, `Slider.Track`, `Tabs.Root`, and `Tabs.Panel`.

`Tabs.List` and `Tabs.Tab` used to pass an empty snippet when the consumer passed no children. They now pass `children`, so the same call throws.

Parts that add their own nodes pass a snippet when that node is rendered. `Progress.Value` passes undefined when the bar is indeterminate and the consumer passed no children, so `children()` throws in that case. `Field.Error` passes undefined when there is no message and no children.

Test: `src/lib/internal/render-children.svelte.spec.ts`.

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

### Shift+Tab from the first control, and Tab from the open trigger

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx` and `packages/react/src/popover/popup/PopoverPopup.tsx`. A non-modal popup inside a portal renders a leading guard and a trailing guard. `previousFocusableElement` is the trigger. `nextFocusableElement` is the trigger's trailing guard. The leading guard is `beforeContentFocusGuardRef`.

Upstream: Shift+Tab from the popup's first control focuses the trigger and leaves the popup open. Tab from that open trigger focuses the first control again. The trigger's trailing guard, when focused from outside the positioner, moves focus to the leading guard, which then enters the popup.

Local: those two paths are not ported. With an inline container, Shift+Tab from the popup's first control lands on the control after the trigger and closes with `focus-out`. Tab from the open trigger focuses the trigger's trailing guard. That guard sits outside the popup, so the popup closes with `focus-out` and focus ends on `body`. Tab forward from inside the popup still closes onto the control after the trigger. Shift+Tab from the open trigger still closes onto the control before the trigger. React fires the focus-out callback twice on Shift+Tab from the trigger; the port fires it once. The leading guard and `previousFocusableElement` are not part of this port.

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
