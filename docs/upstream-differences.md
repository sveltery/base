# Upstream differences

Intentional differences from Base UI v1.8.0 (`47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`). Each component section is owned by the pull request that ports that component.

## Merge props

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/merge-props/mergeProps.ts`. `@base-ui/react` and `@base-ui/react/merge-props` export `mergeProps`, `mergePropsN`, `makeEventPreventable`, and `mergeClassNames`. The rightmost bag wins plain props. Its event handler runs first. `event.preventBaseUIHandler()` skips the handlers to its left. `preventDefault()` does not. `className` is concatenated with the rightmost class first. `style` is a React style object, and the rightmost property wins. A function argument receives the props merged so far and replaces them. Handlers that function returns are not wrapped. `ref` is not merged.

Local: `src/lib/internal/mergeProps.ts`. `@sveltery/base` and `@sveltery/base/merge-props` export `mergeProps`, `mergePropsN`, and the `PropsGetter` type of a function bag. `makeEventPreventable` is not needed, because `preventDefault()` is the skip signal. `mergeClassNames` is not exported, because `class` values merge as arrays. The same order. `event.preventDefault()` is the skip signal: when a handler leaves `defaultPrevented` set, the handlers to its left do not run. There is no `preventBaseUIHandler`. Parts that call the consumer handler themselves use the same signal, so every part skips on `preventDefault()`. The check reads the event's shape (`type` and `preventDefault`), so an event from an iframe skips too. The prop is `class`, a Svelte class value (string, object, or array), merged as an array with the rightmost bag first. `style` is a CSS string, and the rightmost declaration wins for the same property. A style object is ignored. Handler names are Svelte's lowercase names, such as `onclick`. `onClick` is a plain prop. Attachment symbols are all kept, in bag order. There is no ref. `chain` and `mergeClass` are the same helper. Call sites pass the consumer bag last.

Test: `src/lib/internal/mergeProps.spec.ts`. `src/lib/merge-props/merge-props.spec.ts`. `src/lib/popover/Popover.svelte.spec.ts` (`skips the toggle when an iframe event calls preventDefault`).

## Public helpers and types

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/use-render/useRender.ts`, `packages/react/src/unstable-use-media-query/index.ts`, `packages/react/src/types/index.ts`, `packages/react/src/utils/resolveClassName.ts`, and `packages/react/src/utils/resolveStyle.ts`. `useRender` builds a custom part from a `render` prop, state attributes, and merged refs. `unstable_useMediaQuery` subscribes to `matchMedia`. The `types` entry exports `BaseUIChangeEventDetails`, `BaseUIGenericEventDetails`, `BaseUIEvent`, `HTMLProps`, and `ComponentRenderFn`. Every part accepts `className` and `style` as a function of its state.

Local:

- `useRender` has no counterpart. A custom part is a Svelte component that spreads `mergeProps(...)` onto its element and takes a `render` snippet.
- `unstable_useMediaQuery` has no counterpart. Use `MediaQuery` from `svelte/reactivity`: `new MediaQuery('(min-width: 600px)').current` is reactive and returns the fallback on the server.
- `@sveltery/base` and `@sveltery/base/types` export the types `BaseUIChangeEventDetails` and `BaseUIGenericEventDetails`. `BaseUIEvent` is not exported, because there is no `preventBaseUIHandler`. `HTMLProps` and `ComponentRenderFn` are React types. Svelte parts use `HTMLAttributes` from `svelte/elements` and `Snippet`.
- `class` and `style` do not accept a function of state. `class` takes a Svelte class value and `style` takes a CSS string. Style state through the part's `data-*` attributes, such as `[data-disabled]`, or read the state that a `render` snippet receives as its second argument.

Test: `src/lib/merge-props/merge-props.spec.ts`.

## Props

Upstream pairs each stateful prop with a `default*` prop and switches between controlled and uncontrolled mode at mount.

Local: each stateful prop is one `$bindable` prop. `bind:x` shares it, a one-way value sets it until the parent changes it, and `bind:x={get, set}` lets the parent reject a change. Change callbacks run in the event handler, before the value is written, and `eventDetails.cancel()` stops the write. A parent write calls a change callback only when Tabs has to move off a disabled or removed tab.

- `defaultValue` and `defaultChecked` exist only on the 8 form controls (Field.Control and Input, Checkbox, CheckboxGroup, Switch, RadioGroup, Slider, NumberField and OTPField). They are the value an empty binding starts from, as on an HTML input.
- Toggle, ToggleGroup, Tabs, Accordion, Collapsible, Dialog and Popover have no `default*` prop. A `pressed`, `value` or `open` passed without `bind:` holds until the parent changes it. Dialog and Popover take an initial `triggerId` the same way.
- Tabs moves the selection to the first enabled tab when the selected tab is disabled or removed, whether or not the parent passed `value`. Upstream keeps a controlled value. A value passed at mount does not get the `initial` notice, and a tab it names stays selected while that tab is disabled or not yet rendered, until it has named an enabled tab once. Upstream holds only a disabled `defaultValue` tab.
- A canceled `Field.Control` change puts the input back to the held value. Upstream keeps the typed text in an uncontrolled input.
- `readonly`, `autocomplete` and `inputmode` use the HTML spelling. State keys such as `readOnly` keep upstream's camelCase.

Test: `src/tests/controllable-root-cases.ts`, `src/lib/tabs/Tabs.svelte.spec.ts` (`moves a passed value to the first enabled tab when its tab becomes disabled`).

## Button behavior

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/internals/use-button/useButton.ts` and `packages/react/src/utils/useFocusableWhenDisabled.ts`. `useButton` infers composite mode from a `CompositeRootContext`. In development it logs an error once after mount, and again when `nativeButton` changes, if the host tag does not match `nativeButton`. The message ends with React's owner stack. A disabled composite button that renders another button clears that inner button's `disabled` property.

Local: `ButtonBehavior` in `src/lib/internal/button.svelte.ts` serves Button, Toolbar.Button, the Collapsible and Accordion triggers, Tabs.Tab, the NumberField steppers, Checkbox, Switch, Radio, and the Dialog and Popover triggers and close buttons. Each part passes `composite` itself, and only Toolbar.Button sets it. Tabs.Tab clicks on Space keyup, where upstream infers composite mode inside Tabs.List and clicks on keydown. A disabled Tabs.Tab blocks only Enter and Space, so the arrow keys still reach the roving handler. The host check runs in an attachment, so it runs when the host attaches and when `nativeButton` changes. It uses the same messages with "the `render` snippet" in place of "the `render` prop", and no owner stack. The inner `disabled` clearing is not ported. No port renders a button inside a composite button yet.

Test: `src/lib/internal/button.spec.ts`. `src/lib/button/Button.svelte.spec.ts` (`nativeButton mismatch`).

## Portal

### The portal marker stays on the host

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/floating-ui-react/components/FloatingPortal.tsx`. `useRenderElement` merges `[{ id, 'data-base-ui-portal': '' }, elementProps]`. Later props overwrite, so a consumer `data-base-ui-portal` replaces the marker. `mergeProps` assigns a later `data-base-ui-portal={undefined}` over that `''`, and React omits the attribute, so the marker is removed. `className` and `style` are merged after that list. `createPortal` inserts the div into its container before refs run. The ref list is the consumer ref, then the internal node ref, so the consumer ref sees the node already in that container.

Local: `Dialog.Portal` and `Popover.Portal` spread consumer host attributes onto the portal `div`, then set `data-base-ui-portal=""`. A consumer value does not replace the marker. Upstream lets a consumer `data-base-ui-portal={undefined}` remove the marker. The port always keeps it. `class`, other attributes, and a consumer `{@attach}` still reach that div. The mount attachment runs before that `{@attach}`, so the consumer sees the node in its container. There is no ref object. A `store` key in the consumer props does not replace the dialog or popover store.

Rationale: outside press and the internal backdrop treat that attribute as the portal host.

Test: `src/lib/dialog/Dialog.svelte.spec.ts` and `src/lib/popover/Popover.svelte.spec.ts` (`forwards host attributes and attachments onto the portal element`, `ignores a stray store prop on the portal`).

### Render snippet, exported props, and a null container

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/floating-ui-react/components/FloatingPortal.tsx`. `useRenderElement` applies `render` and `className` to the portal div. `useFloatingPortalNode` returns without a node when `container` is explicitly `null`. `undefined` resolves to the parent portal or `document.body`. The published prop types are `DialogPortal.Props` and `PopoverPortal.Props`.

Local: `Dialog.Portal` and `Popover.Portal` take a `render` snippet `(props, state, children)`. Spread `props` so `class`, the move attachment, and `data-base-ui-portal` land on the replacement element. There is no ref object. `DialogPortalProps` and `PopoverPortalProps` are the exported props types. `PopoverPortalState` is the empty state object, the same shape as `DialogPortalState`, and the snippet props include the attachment symbol. `PortalProps` stays internal. `container={null}` does not mount until an element or shadow root is set. `undefined` still uses the parent portal or `document.body`. Clearing that container back to `null` while the popup is open removes the popup and returns focus to the trigger.

Test: `src/lib/dialog/Dialog.svelte.spec.ts` and `src/lib/popover/Popover.svelte.spec.ts` (`applies a render snippet to the portal element`, `does not mount while container is null`, `returns focus to the trigger when an open container returns to null`). `src/lib/popover/portal-props.spec.ts`.

### Server trigger labels

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/popover/trigger/PopoverTrigger.tsx` (lines 62 and 144) and `packages/react/src/dialog/trigger/DialogTrigger.tsx`. `renderToStaticMarkup` of a `defaultOpen` dialog or popover prints the trigger with `aria-expanded="false"` and no `aria-controls`. The portal host is absent. On the client, both triggers keep `aria-controls`. `triggerPopupId` is `popupElement?.id ?? floatingId`, so after the popup element is gone they still point at the floating id.

Local: `aria-controls` is omitted until the popup element is set, on the server and after a null container. It is present once that element exists, including when a container that was not in the document is attached afterward. An open popover trigger stays `aria-expanded="false"` in server HTML until that trigger element is registered. Dialog's server trigger was already `false`. `data-popup-open` can still be present on that popover trigger.

Test: `src/lib/internal/portal-popup-aria.spec.ts`. `src/lib/dialog/Dialog.svelte.spec.ts` and `src/lib/popover/Popover.svelte.spec.ts` (`sets aria-controls when a detached container is attached`). `src/routes/fixtures/popover/popover.e2e.ts` (`svelte SSR omits an open popover before hydration`).

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

Local: `PopupViewport` (`src/lib/internal/usePopupViewport.svelte.ts`) removes `name` from every copied control before the previous pane is inserted. The clone is not in the radio group, so it does not clear the live control. The current pane is a new element. It starts from that trigger's own state. Values typed or checked on trigger A are not written into trigger B. State the content keeps for a trigger is still there when that trigger is shown again.

Rationale: the previous pane is a visual cross-fade, not a second form control. Upstream remounts the current pane, so the next trigger starts fresh.

Test: `src/lib/popover/Popover.svelte.spec.ts` (`starts the next viewport pane from that trigger’s own state`).

### Copied controls submit with the form

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/utils/usePopupViewport.tsx`. The previous pane is `cloneNode(true)` and the shell is `inert`.

Upstream: `inert` does not remove controls from form submission. A copied input with `form="outer-form"` is submitted together with the live input (`["AAA","BBB"]`). A pane portaled into a form does the same, because the copy is still a successful control inside that form.

Local: every copied `input`, `textarea`, `select`, and `button` loses its `name` and is given `form=""` before the previous pane is inserted. An empty `form` attribute associates the control with no form, so a required copy cannot block the ancestor form. Removing `form` leaves that copy inside the form the popup is portaled into. The copy is not a successful control, and it does not match `:disabled`. The shell stays `inert` and `aria-hidden` so it is not interactive and is hidden from assistive tech. `inert` does not by itself keep the control out of `FormData`. Disabling the copy would, and it would also apply `:disabled` styles during the cross-fade.

Rationale: the previous pane is a visual cross-fade, not a second form control.

Test: `src/lib/popover/Popover.svelte.spec.ts` (`keeps copied viewport controls out of form submission`, `does not mark copied controls disabled during the cross-fade`, `lets the form submit while an empty required copy is cross-fading`).

### Tabbing out of a non-modal popup

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx` and `packages/react/src/popover/popup/PopoverPopup.tsx`. A non-modal popup inside a portal renders a leading guard and a trailing guard. `previousFocusableElement` is the trigger. `nextFocusableElement` is the trigger's trailing guard. The focus manager's leading guard is not merged with the trigger's `beforeContentFocusGuardRef`.

Shift+Tab from the popup's first control focuses the trigger and leaves the popup open, for the default `document.body` container and an inline container, including when `open` is set from another button. Tab from that open trigger focuses the first control again. That matches upstream.

Local: Tab from the open trigger focuses the first control inside the popup and leaves it open. A popup with no tabbable control closes onto the next control instead. A hover open leaves that Tab on the trigger's trailing guard. Tab forward from inside the popup still closes onto the control after the trigger. Shift+Tab from the trigger that opened the popup still closes onto the control before the trigger. Shift+Tab from the trigger of a popup opened through `open` focuses the previous control and leaves the popup open. Main does the same. React closes a popover there because `useImplicitActiveTrigger` makes the popup's only trigger its active trigger, even when something else opened it, and leaves a dialog open. The port takes only the trigger state from that rule: the only trigger of a popup opened through `open` reports `aria-expanded="true"` and `data-popup-open`, but it does not become the focus reference. A focus-out close does not return focus, including when `finalFocus` is `null`, an element, or a function. The function is not called. React calls that function and ignores the result. React fires the focus-out callback twice on Shift+Tab from the trigger; the port fires it once.

## Dialog

Source: `packages/react/src/dialog`. Upstream shares `PopupHandle` and `COMPOSITE_KEYS`; they live in `src/lib/internal/popups/popupHandle.svelte.ts` and `src/lib/internal/composite-keys.ts`. Portal, focus, dismiss, scroll lock, `mergeProps`, and the popup store are the landed overlay foundation. How the dialog opened is `PopupStore.openMethod`. Final focus uses the shared `returnFocus` callback: it receives how the popup closed. `finalFocus={null}` does not return focus. A function that returns `null` focuses the trigger. `openWithPayload` stays on `Dialog.Handle`. Popover does not have it.

### Payload is stored only for a registered trigger

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/dialog/store/DialogHandle.ts` and `packages/react/src/utils/popups/popupStoreUtils.ts`.

Upstream: a trigger's `payload` prop is forwarded when that trigger registers. `Dialog.Handle` has `openWithPayload` and no payload map, `setPayload`, or `forgetPayload`. `open(id)` with an unknown id warns and still opens. It does not throw.

Local: `Dialog.Handle.setPayload` writes into a private map, and only when that id is already registered. An unknown id is rejected and nothing is stored. The payload is not a field on the trigger registration. `open(id)` still warns (the warning names `Dialog.Handle`) and does not replace the displayed payload. `openWithPayload` is unchanged.

Test: `src/lib/dialog/Dialog.svelte.spec.ts` (`does not store a payload for a trigger that is not registered`, `keeps the current payload when opened with an unknown trigger id`).

| Upstream                                                             | Local                                                                                               |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `open` / `defaultOpen`, `triggerId` / `defaultTriggerId`             | `$bindable` `open` / `triggerId`. A one-way value sets the initial state                            |
| `actionsRef`                                                         | `bind:this` on `Dialog.Root` (`close` and `unmount`)                                                |
| `initialFocus` / `finalFocus` ref objects                            | element or function, called when focus moves                                                        |
| `children` render function `{ payload }`                             | snippet argument `{ payload }`                                                                      |
| React `useButton`                                                    | existing `Button`                                                                                   |
| `useDismiss` outside press, including separate mouse and touch modes | the same modes on `DismissInteraction`. A press is inside the floating element, not the portal host |

Not ported: Drawer and ref objects. Mouse and touch use separate outside-press modes on `DismissInteraction`. A backdrop is `intentional` for both. Without one, touch is `sloppy` and mouse is `sloppy` only for `trap-focus`. A tap closes on the browser's mousedown. A short move closes on touchend. A scroll-away closes during the move. After 1s with the finger still down, touchend and that mousedown do not close. An intentional touch waits for the click. One lifted touch is required. A press is inside when the target is in the floating element or an open floating-tree child. The portal host is not inside. An initial `triggerId` selects the trigger for `aria-expanded`.

## Alert Dialog

Source: Base UI v1.9.0 (`ad7ecda5296b0295b41a51ecb01fce6204acd099`), `packages/react/src/alert-dialog`. Upstream `AlertDialog.Root` calls the Dialog root setup in `alert-dialog` mode: `modal` is always `true`, pointer dismissal is disabled, and the popup role is `alertdialog`. Every other part is the Dialog part. `AlertDialog.Handle` extends `Dialog.Handle` with a type-only brand.

Local: `AlertDialog.Root` calls the same `createDialogRoot` setup as `Dialog.Root` (`src/lib/dialog/root.svelte.ts`) with those three values. It takes `bind:open`, `bind:triggerId`, `onOpenChange`, `onOpenChangeComplete`, `handle`, and the `children` snippet, and has no `modal` or `disablePointerDismissal` prop. `bind:this` gives `close()` and `unmount()` in place of `actionsRef`. The other parts are the Dialog components, and their prop types are exported under `AlertDialog*` names. `AlertDialog.Trigger` is `Dialog.Trigger` typed to take an `AlertDialogHandle`, so a `Dialog.Handle` does not type-check on an alert dialog. Handle warnings name `Dialog.Handle`, as upstream's reused `DialogHandle` does. Upstream v1.9.0 exports `AlertDialogBackdropDataAttributes`, `AlertDialogPopupCssVariables` and the other attribute namespaces. Dialog exports no such namespaces in this port, so Alert Dialog does not either.

Gap: a trigger switched to while the popup is open, or named by a bound `triggerId`, does not replace the payload. The shared Dialog store sets the payload only when a trigger opens a closed popup. Upstream reads it from the active trigger. Dialog has the same gap.

Test: `src/lib/alert-dialog/AlertDialog.svelte.spec.ts`, `src/lib/alert-dialog/ssr.spec.ts`, `src/routes/fixtures/alert-dialog/alert-dialog.e2e.ts`.

### Timers clear when the owner is destroyed

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/utils/src/useTimeout.ts` and `packages/utils/src/useAnimationFrame.ts`. `useTimeout` / `useAnimationFrame` dispose on unmount.

Local: `ScopedTimeout`, `ScopedInterval` and `ScopedAnimationFrame` in `packages/utils/src/timeout.svelte.ts`. Each subclasses the plain timer and registers `$effect(() => () => clear())` in its constructor, so it is constructed during component init. There is no ref. A timer that no component owns, such as the shared scroll-lock locker, is a plain `Timeout` or `AnimationFrame` that its owner clears.

Test: `src/lib/internal/overlay-foundation.svelte.spec.ts` (`does not open when the trigger unmounts during touchOpenDelay`).

## Internal backdrop

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/utils/InternalBackdrop.tsx`. Upstream reads `cutout.getBoundingClientRect()` while rendering, so any render after the cutout moves refreshes the clip.

Local: `src/lib/internal/InternalBackdrop.svelte` writes that rect into `$state` from a `ResizeObserver` on the cutout and a capture-phase `scroll` listener on the owner window. The scroll listener reads the rect synchronously. A position-only move, with no resize and no scroll, is still not tracked.

Test: `src/lib/internal/InternalBackdrop.svelte.spec.ts` (`updates the cutout when the element resizes`, `updates the cutout when an ancestor scrolls after the first observer callback`, `disconnects the cutout observer and scroll listener when the backdrop unmounts`).

## Forms

### Choice controls in a Field

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/checkbox/root/CheckboxRoot.tsx`, `switch/root/SwitchRoot.tsx`, `radio/root/RadioRoot.tsx`, `radio-group/RadioGroup.tsx`, `checkbox-group/CheckboxGroup.tsx` and `internals/labelable-provider/useLabelableId.ts`. Checkbox, Switch, RadioGroup and CheckboxGroup register with Field and Form, take `Field.Root name` and `disabled`, carry `aria-invalid`, `aria-describedby` and the Field `data-*` state, and are named by `Field.Label`. CheckboxGroup claims the label with `id: null`, so the label omits `for`, and a checkbox in the group's scope does not claim the Field's control id. Each radio calls `useLabelableId({ id })` in the scope it is rendered in, so radios outside a `Field.Item` all render the Field's control id and `Field.Label for` points at the first one.

Local: the same registration, through `attachFieldControl`, `Field`'s `registerInput` and the `LabelableId` and `AriaLabelledBy` classes in `src/lib/field/labelable.svelte.ts`. RadioGroup claims the label with `id: null` the way CheckboxGroup does, and a radio leaves the control id to its group unless a `Field.Item` gives it its own scope. Radios therefore keep distinct ids, the group is named by `aria-labelledby`, and a `Field.Item` label still points `for` at its radio. CheckboxGroup reports its whole `value` to `onFormSubmit` and `validate`. Upstream drops values whose checkbox is disabled or belongs to another form.

Test: `src/lib/field/choice-controls.svelte.spec.ts`.

### Form reset

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/form/Form.tsx`, `field/root/FieldRoot.tsx` and the form controls. Nothing listens for `reset`. A reset puts the native inputs back to their HTML defaults, while each control keeps its React state, so the control, its hidden input and `FormData` can disagree. Field dirty, touched and validity, and Form `errors`, stay as they were.

Local: the controls follow `bind:value` and `bind:checked`. Each named input carries `defaultValue` or `defaultChecked`. A task after an uncanceled `reset`, Checkbox, Switch, RadioGroup, CheckboxGroup, Slider, NumberField and OTPField write their `defaultChecked` or `defaultValue` back through the binding, and Field.Control and Input read the input's value back as `bind:value` does. No `onValueChange` or `onCheckedChange` is called, because a native reset fires no `input` or `change` event. Then each Field clears dirty, touched, validity and its custom validity message, and takes the restored value as its initial value. Form clears `errors` and its submit count. A control listens to the form its named input belongs to, so a control outside the `<form>` that joins it through `form` restores too. A Slider with no `defaultValue` returns each thumb to `min`, as its range inputs do. Checkbox and Switch submit `uncheckedValue` from a hidden checkbox that the browser resets together with the visible one, so `FormData` never holds both values. The visible state of a custom control (`aria-checked`, `data-checked`, the thumb position) catches up one task after a native reset, because the browser resets the inputs only after the `reset` listeners have run. The helper is `src/lib/internal/form-reset.svelte.ts`.

Test: `src/lib/form/form-reset.svelte.spec.ts`.

### Submit gate and named-input events

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/form/Form.tsx`, `slider/root/SliderRoot.tsx`, `number-field/root/NumberFieldRoot.tsx` and `otp-field/root/OTPFieldRoot.tsx`. Form validates in its React `onSubmit` and blocks an invalid submit with `preventDefault()` only, so a later `submit` listener on the form still runs. It renders `noValidate` on the server and validates even when the submitter has `formnovalidate`. Slider, NumberField and OTPField update their named inputs through React state and fire no `input` or `change` event on them.

Local: Form validates in a capture-phase `submit` listener. An invalid submit gets `preventDefault()` and `stopImmediatePropagation()`, so SvelteKit's `enhance` and other later listeners do not run. A submitter with `formnovalidate` skips that validation, as it skips native validation. `novalidate` is set by an attachment after hydration, so the server renders none and a page without JavaScript keeps the browser's validation. A user change fires a bubbling `input` event from the Slider thumb's range input and from the hidden NumberField and OTPField inputs, once the new value is in the DOM. `change` follows when the change is committed: a Slider key press or pointer release, a NumberField commit, or focus leaving the OTPField. As with a native input, `change` fires only when the value differs from the one at the previous `change`, so a NumberField whose owner keeps its value fires neither event. Checkbox, Switch and Radio already fire both through the click on their native input. A parent checkbox fires both on each child input it toggles. The controls ignore the events they fire themselves.

Test: `src/lib/form/form-events.svelte.spec.ts`, `src/lib/form/form-ssr.spec.ts` and `src/routes/fixtures/form/form.e2e.ts` (`svelte SSR leaves novalidate to hydration`).

## Not ported yet

Behavior each ported component does not cover yet. Overlay foundation is internal and has no public component.

| Component          | Not ported yet                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Accordion          | React.Activity animation resume, refs, roving focus (`orientation`, `loopFocus`)                       |
| Button             | Composite and Toolbar integration                                                                      |
| Checkbox           | `inputRef`                                                                                             |
| CheckboxGroup      | Disabled or other-form values filtered out of the Field value                                          |
| Collapsible        | React.Activity animation resume, refs                                                                  |
| Fieldset           | Checkbox, CheckboxGroup, RadioGroup and Slider disabled integration                                    |
| Field              | Select integration; refs                                                                               |
| Input              | refs                                                                                                   |
| Toggle             | Toolbar integration, `nativeButton={false}`                                                            |
| ToggleGroup        | Toolbar integration, grid composite, scroll-into-view                                                  |
| Avatar             | Enter/exit transitions and animation completion                                                        |
| Separator          | React render-element cloning, `ref`, Menu/Select/Toolbar separators                                    |
| Meter              | React `ref`, numeric production error codes                                                            |
| Progress           | refs                                                                                                   |
| Form               | Fieldset Form-spec cases; `actionsRef`                                                                 |
| Switch             | `inputRef`                                                                                             |
| Radio              | `inputRef`                                                                                             |
| RadioGroup         | `inputRef`, scroll-into-view, text-field arrow exceptions                                              |
| Tabs               | `renderBeforeHydration` script (accepted, ignored), scroll-into-view, shadow-boundary offsets, refs    |
| Toolbar            | Input, Separator, text-field arrow exceptions, scroll-into-view, ToggleGroup nesting, overlay triggers |
| NumberField        | refs, `inputRef`                                                                                       |
| ScrollArea         | refs                                                                                                   |
| Slider             | refs, `inputRef`, keeping the prehydration script body out of client bundles                           |
| DirectionProvider  | CSS `direction` on an element, without `DirectionProvider`                                             |
| OTPField           | refs, `inputRef`, React controlled lock                                                                |
| CSPProvider        | Select renders no inline style. Tabs.Indicator renders no prehydration script                          |
| Overlay foundation | Internal only. No public component                                                                     |
| Popover            | `actionsRef`, Menu and Combobox nesting, shadow-root outside press, refs                               |
| Dialog             | Drawer, ref objects                                                                                    |
| AlertDialog        | ref objects, the `*DataAttributes` and `*CssVariables` namespaces, payload from the active trigger     |
