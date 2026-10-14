# Upstream differences

Intentional differences from Base UI v1.9.0 (`ad7ecda5296b0295b41a51ecb01fce6204acd099`). Each component section is owned by the pull request that ports that component. Each entry's Pin line names the upstream commit it was last checked against.

## Merge props

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/merge-props/mergeProps.ts`. `@base-ui/react` and `@base-ui/react/merge-props` export `mergeProps`, `mergePropsN`, `makeEventPreventable`, and `mergeClassNames`. The rightmost bag wins plain props. Its event handler runs first. `event.preventBaseUIHandler()` skips the handlers to its left. `preventDefault()` does not. `className` is concatenated with the rightmost class first. `style` is a React style object, and the rightmost property wins. A function argument receives the props merged so far and replaces them. Handlers that function returns are not wrapped. `ref` is not merged.

Local: `src/lib/internal/mergeProps.ts`. `@sveltery/base` and `@sveltery/base/merge-props` export `mergeProps`, `mergePropsN`, and the `PropsGetter` type of a function bag. `makeEventPreventable` is not needed, because `preventDefault()` is the skip signal. `mergeClassNames` is not exported, because `class` values merge as arrays. The same order. `event.preventDefault()` is the skip signal: when a handler leaves `defaultPrevented` set, the handlers to its left do not run. There is no `preventBaseUIHandler`. Parts that call the consumer handler themselves use the same signal, so every part skips on `preventDefault()`. The check reads the event's shape (`type` and `preventDefault`), so an event from an iframe skips too. The prop is `class`, a Svelte class value (string, object, or array), merged as an array with the rightmost bag first. `style` is a CSS string, and the rightmost declaration wins for the same property. A style object is ignored. Handler names are Svelte's lowercase names, such as `onclick`. `onClick` is a plain prop. Attachment symbols are all kept, in bag order. There is no ref. `chain` and `mergeClass` are the same helper. Call sites pass the consumer bag last.

Test: `src/lib/internal/mergeProps.spec.ts`. `src/lib/merge-props/merge-props.spec.ts`. `src/lib/popover/Popover.svelte.spec.ts` (`skips the toggle when an iframe event calls preventDefault`).

Internal: React shares one synthetic event across the propagation path, so `preventBaseUIHandler()` in a descendant's handler also skips the merged handlers of its ancestors. A native event is shared the same way, but `preventDefault()` cannot carry that meaning, because component handlers call it for their own keys. `src/lib/internal/mergeProps.ts` keeps upstream's flag in a module `WeakSet`. A part calls `preventBaseUIHandler(event)`, and every merged handler the event reaches next skips the handlers to its left, as upstream. `forwardConsumerPrevention(handler)` wraps a consumer handler so its `preventDefault()` sets the flag, for a part whose ancestor handles the same event. Consumers still call `preventDefault()`. Neither helper is public.

Test: `src/lib/internal/mergeProps.svelte.spec.ts`.

## Public helpers and types

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/use-render/useRender.ts`, `packages/react/src/unstable-use-media-query/index.ts`, `packages/react/src/types/index.ts`, `packages/react/src/utils/resolveClassName.ts`, and `packages/react/src/utils/resolveStyle.ts`. `useRender` builds a custom part from a `render` prop, state attributes, and merged refs. `unstable_useMediaQuery` subscribes to `matchMedia`. The `types` entry exports `BaseUIChangeEventDetails`, `BaseUIGenericEventDetails`, `BaseUIEvent`, `HTMLProps`, and `ComponentRenderFn`. Every part accepts `className` and `style` as a function of its state.

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

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/internals/use-button/useButton.ts` and `packages/react/src/utils/useFocusableWhenDisabled.ts`. `useButton` infers composite mode from a `CompositeRootContext`. In development it logs an error once after mount, and again when `nativeButton` changes, if the host tag does not match `nativeButton`. The message ends with React's owner stack. A disabled composite button that renders another button clears that inner button's `disabled` property.

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

### Closed shadow roots

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/floating-ui-react/hooks/useDismiss.ts`. React events bubble through the component tree, so the floating element's capture handlers mark every press inside it (`insideReactTree`). In a closed shadow root that marker is the only inside-press signal, because a document listener sees only the shadow host.

Local: the floating element's own capture listeners set the same marker. The host of each portal rendered in the popup's content sets it too, wherever that portal mounts. Svelte delegates `onclick` and similar handlers to the app root and the document, and neither sees into a closed shadow root that the app root is outside of. A portal host moved into a closed shadow root therefore mounts as its own delegation root. It does so for a shadow root nested inside a closed one too, open or closed, since neither listener sees into it. The capture listeners also mark `touchstart`, which upstream does not mark. A touch press reaches `pointerdown` first, which both mark, so the extra marker changes nothing visible.

Test: `src/lib/dialog/DialogShadowRoot.svelte.spec.ts`.

### Server trigger labels

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/popover/trigger/PopoverTrigger.tsx` (lines 62 and 144) and `packages/react/src/dialog/trigger/DialogTrigger.tsx`. `renderToStaticMarkup` of a `defaultOpen` dialog or popover prints the trigger with `aria-expanded="false"` and no `aria-controls`. The portal host is absent. On the client, both triggers keep `aria-controls`. `triggerPopupId` is `popupElement?.id ?? floatingId`, so after the popup element is gone they still point at the floating id.

Local: `aria-controls` is omitted until the popup element is set, on the server and after a null container. It is present once that element exists, including when a container that was not in the document is attached afterward. An open popover trigger stays `aria-expanded="false"` in server HTML until that trigger element is registered. Dialog's server trigger was already `false`. `data-popup-open` can still be present on that popover trigger.

Test: `src/lib/internal/portal-popup-aria.spec.ts`. `src/lib/dialog/Dialog.svelte.spec.ts` and `src/lib/popover/Popover.svelte.spec.ts` (`sets aria-controls when a detached container is attached`). `src/routes/fixtures/popover/popover.e2e.ts` (`svelte SSR omits an open popover before hydration`).

## Render snippets

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/internals/useRenderElement.tsx`.

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

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx`, `packages/react/src/popover/popup/PopoverPopup.tsx`, `packages/react/src/popover/trigger/PopoverTrigger.tsx` and `packages/react/src/utils/popups/useTriggerFocusGuards.ts`. A non-modal popup inside a portal renders a leading guard and a trailing guard. `previousFocusableElement` is the trigger. `nextFocusableElement` is the trigger's trailing guard. The focus manager's leading guard is merged with the trigger's `beforeContentFocusGuardRef`. `getInsideElements` counts the trigger's leading guard as inside, so Shift+Tab from the trigger does not close the popup before that guard's own handler runs.

Shift+Tab from the popup's first control focuses the trigger and leaves the popup open, for the default `document.body` container and an inline container, including when `open` is set from another button. Tab from that open trigger focuses the first control again. That matches upstream.

Local: Tab from the open trigger focuses the first control inside the popup and leaves it open. A popup with no tabbable control closes onto the next control instead. A hover open leaves that Tab on the trigger's trailing guard. Tab forward from inside the popup still closes onto the control after the trigger. Shift+Tab from the trigger that opened the popup still closes onto the control before the trigger. A popup opened through `open` claims its only trigger, as upstream `useImplicitActiveTrigger` does, so Shift+Tab from that trigger closes a popover and leaves a dialog open, as React does. A focus-out close does not return focus, including when `finalFocus` is `null`, an element, or a function. The function is not called. React calls that function and ignores the result. React fires the focus-out callback twice on Shift+Tab from the trigger; the port fires it once. The port's focus manager does not merge its leading guard with `beforeContentFocusGuardRef`, and it counts every Base UI focus guard as inside, because PopoverPopup does not pass `getInsideElements`.

Test: `src/lib/popover/PopoverFocusGuards.svelte.spec.ts`.

### Disabled trigger in a hover switch

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/popover/trigger/PopoverTrigger.tsx` and `packages/react/src/floating-ui-react/utils/element.ts`.

Upstream: a disabled Popover trigger renders only `data-disabled`. `isTargetInsideEnabledTrigger` looks for `data-trigger-disabled`, so a pointer that leaves the open trigger for a disabled one does not close the popover.

Local: a disabled `Popover.Trigger` also renders `data-trigger-disabled`, so that move closes the popover, as it closes a Tooltip.

Test: `src/lib/popover/PopoverTriggers.svelte.spec.ts` (`closes when hovering a disabled trigger while another trigger is open`).

### Trigger id after the popover unmounts

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/utils/popups/popupStoreUtils.ts` (`useOpenStateTransitions` and `useImplicitActiveTrigger`). Once the popup unmounts, the store resets its own `activeTriggerId` to `null`. The next open that names no trigger, such as a controlled `open`, claims the only registered trigger, and with two or more triggers anchors to none. The `triggerId` prop is never written by the store.

Local: `triggerId` is one `$bindable` prop for both values. The store writes the active trigger's id into it. Once the popover unmounts, the store resets an id that it wrote to `null`, if the parent has not changed it since. An id that the parent set stays until a trigger press replaces it. A `bind:triggerId` therefore reads `null` once a popover that a trigger opened unmounts, unless the parent set that id.

Test: `src/lib/popover/PopoverPositioner.svelte.spec.ts` (`anchors to the only trigger when bind:open opens it after the trigger that last opened it remounted`) and `src/lib/popover/PopoverTriggers.svelte.spec.ts` (`claims the only trigger on a bind:open after the parent cleared triggerId` and `leaves both triggers unassociated on a bind:open after the popover that one opened unmounted`).

## Dialog

Source: `packages/react/src/dialog`. Upstream shares `PopupHandle` and `COMPOSITE_KEYS`; they live in `src/lib/internal/popups/popupHandle.svelte.ts` and `src/lib/internal/composite-keys.ts`. Portal, focus, dismiss, scroll lock, `mergeProps`, and the popup store are the landed overlay foundation. How the dialog opened is `PopupStore.openMethod`. Final focus uses the shared `returnFocus` callback: it receives how the popup closed. `finalFocus={null}` does not return focus. A function that returns `null` focuses the trigger. `openWithPayload` stays on `Dialog.Handle`. Popover does not have it.

### Nested dialog count follows v1.9.0

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/dialog/root/useDialogRoot.ts`. Every nested root reports to its parent, and a closed one reports 0. A closed nested root that mounts next to an open one resets the parent's `--nested-dialogs` to 0 and removes `data-nested-dialog-open`.

Local: Base UI v1.9.0 (`ad7ecda5296b0295b41a51ecb01fce6204acd099`) fixes this, and the port follows it. Only an open nested root reports, and it reports 0 when it closes or unmounts. A parent that is closed and unmounted ignores reports and drops its count, so a nested root that opened in the meantime is not counted when the parent opens again.

Test: `src/lib/dialog/Dialog.svelte.spec.ts` (`nested dialog count (Base UI v1.9.0)`).

| Upstream                                                             | Local                                                                                               |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `open` / `defaultOpen`, `triggerId` / `defaultTriggerId`             | `$bindable` `open` / `triggerId`. A one-way value sets the initial state                            |
| `actionsRef`                                                         | `bind:this` on `Dialog.Root` (`close` and `unmount`)                                                |
| `initialFocus` / `finalFocus` ref objects                            | element or function, called when focus moves                                                        |
| `children` render function `{ payload }`                             | snippet argument `{ payload }`                                                                      |
| React `useButton`                                                    | existing `Button`                                                                                   |
| `useDismiss` outside press, including separate mouse and touch modes | the same modes on `DismissInteraction`. A press is inside the floating element, not the portal host |

Not ported: ref objects. Mouse and touch use separate outside-press modes on `DismissInteraction`. A backdrop is `intentional` for both. Without one, touch is `sloppy` and mouse is `sloppy` only for `trap-focus`. A tap closes on the browser's mousedown. A short move closes on touchend. A scroll-away closes during the move. After 1s, touchend does not close, and a mousedown while the finger is still down does not close. An intentional touch waits for the click. One lifted touch is required. A press is inside when the target is in the floating element or an open floating-tree child. The portal host is not inside. An initial `triggerId` selects the trigger for `aria-expanded`. [Shared floating internals](#shared-floating-internals) covers a press inside a tree child's portal.

### Trigger id after the dialog unmounts

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/utils/popups/popupStoreUtils.ts` (`useOpenStateTransitions`). Once the popup unmounts, the store resets its own `activeTriggerId` to `null`. The `triggerId` prop is never written by the store. A controlled `open` with two or more triggers then associates none of them. With one trigger, the dialog claims it.

Local: `triggerId` is one `$bindable` prop for both values, as for Popover under [Trigger id after the popover unmounts](#trigger-id-after-the-popover-unmounts). `BoundTriggerId` in `src/lib/internal/popups/boundTriggerId.svelte.ts` resets an id the store wrote to `null` once the popup unmounts, if the parent has not changed it since. An id that the parent set stays until a trigger press replaces it.

Test: `src/lib/dialog/Dialog.svelte.spec.ts` (`leaves both triggers unassociated on a bind:open after the dialog that one opened unmounted` and `claims the only trigger on a bind:open after that trigger opened the dialog`).

## Alert Dialog

Source: Base UI v1.9.0 (`ad7ecda5296b0295b41a51ecb01fce6204acd099`), `packages/react/src/alert-dialog`. Upstream `AlertDialog.Root` calls the Dialog root setup in `alert-dialog` mode: `modal` is always `true`, pointer dismissal is disabled, and the popup role is `alertdialog`. Every other part is the Dialog part. `AlertDialog.Handle` extends `Dialog.Handle` with a type-only brand.

Local: `AlertDialog.Root` calls the same `createDialogRoot` setup as `Dialog.Root` (`src/lib/dialog/root.svelte.ts`) with those three values. It takes `bind:open`, `bind:triggerId`, `onOpenChange`, `onOpenChangeComplete`, `handle`, and the `children` snippet, and has no `modal` or `disablePointerDismissal` prop. `bind:this` gives `close()` and `unmount()` in place of `actionsRef`. The other parts are the Dialog components, and their prop types are exported under `AlertDialog*` names. `AlertDialog.Trigger` renders `Dialog.Trigger` and takes an `AlertDialogHandle`, so a `Dialog.Handle` does not type-check on an alert dialog. Handle warnings name `Dialog.Handle`, as upstream's reused `DialogHandle` does. Upstream v1.9.0 exports `AlertDialogBackdropDataAttributes`, `AlertDialogPopupCssVariables` and the other attribute namespaces. Dialog exports no such namespaces in this port, so Alert Dialog does not either.

Test: `src/lib/alert-dialog/AlertDialog.svelte.spec.ts`, `src/lib/alert-dialog/ssr.spec.ts`, `src/routes/fixtures/alert-dialog/alert-dialog.e2e.ts`.

### Timers clear when the owner is destroyed

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/utils/src/useTimeout.ts` and `packages/utils/src/useAnimationFrame.ts`. `useTimeout` / `useAnimationFrame` dispose on unmount.

Local: `ScopedTimeout`, `ScopedInterval` and `ScopedAnimationFrame` in `packages/utils/src/timeout.svelte.ts`. Each subclasses the plain timer and registers `$effect(() => () => clear())` in its constructor, so it is constructed during component init. There is no ref. A timer that no component owns, such as the shared scroll-lock locker, is a plain `Timeout` or `AnimationFrame` that its owner clears.

Test: `src/lib/internal/overlay-foundation.svelte.spec.ts` (`does not open when the trigger unmounts during touchOpenDelay`).

## Drawer

Source: Base UI v1.9.0 (`ad7ecda5296b0295b41a51ecb01fce6204acd099`), `packages/react/src/drawer`. Upstream `Drawer.Root` runs the Dialog root setup and adds swipe, snap point, and nested-drawer state. Portal, Title, Description, and Close are the Dialog parts. The swipe gesture is `packages/react/src/utils/useSwipeDismiss.ts`.

Local: `Drawer.Root` calls the same `createDialogRoot` setup as `Dialog.Root` with `drawer: true`, so an open drawer counts toward its parent's `nestedOpenDrawerCount` as well as the nested dialog count. `DrawerRootState` (`src/lib/drawer/root.svelte.ts`) holds the swipe and snap point state. The gesture is `src/lib/internal/useSwipeDismiss.svelte.ts`. Toast's swipe handling is a separate port and may later share it. `open`, `triggerId`, and `snapPoint` are `$bindable`. `bind:this` gives `close()` and `unmount()` in place of `actionsRef`.

- `snapPoint` cannot be told apart as controlled or uncontrolled. A value outside `snapPoints` resolves to the closest snap point, or to closed when it does not parse, which is upstream's controlled behavior. `defaultSnapPoint` stays as a prop, because a drawer returns to it when it closes.
- `DrawerChangeEventDetails` and `DrawerSnapPointChangeEventDetails` do not narrow `event` by `reason`, the same as Dialog.
- The `DrawerPopupCssVars`, `DrawerBackdropCssVars`, `DrawerViewportCssVars`, and `*DataAttributes` namespaces are not exported, the same as Dialog and Alert Dialog. The variable and attribute names are the same.
- Portaled content bubbles through the DOM. A React portal bubbles synthetic events to its React ancestors, so a node portaled out of a drawer still reaches the drawer's touch handlers upstream. Here it does not, and only the document capture listener sees it.
- Svelte delegates touch and pointer events and walks `composedPath()`. A touch event whose composed path starts at `window` never reaches the viewport, where upstream falls back to the viewport as the target.

Test: `src/lib/drawer/*.svelte.spec.ts`, `src/lib/drawer/snap-points.spec.ts`, `src/lib/drawer/ssr.spec.ts`, `src/routes/fixtures/drawer/drawer.e2e.ts`.

## Internal backdrop

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/utils/InternalBackdrop.tsx`. Upstream reads `cutout.getBoundingClientRect()` while rendering, so any render after the cutout moves refreshes the clip.

Local: `src/lib/internal/InternalBackdrop.svelte` writes that rect into `$state` from a `ResizeObserver` on the cutout and a capture-phase `scroll` listener on the owner window. The scroll listener reads the rect synchronously. A position-only move, with no resize and no scroll, is still not tracked.

Test: `src/lib/internal/InternalBackdrop.svelte.spec.ts` (`updates the cutout when the element resizes`, `updates the cutout when an ancestor scrolls after the first observer callback`, `disconnects the cutout observer and scroll listener when the backdrop unmounts`).

## Forms

### Choice controls in a Field

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/checkbox/root/CheckboxRoot.tsx`, `switch/root/SwitchRoot.tsx`, `radio/root/RadioRoot.tsx`, `radio-group/RadioGroup.tsx`, `checkbox-group/CheckboxGroup.tsx` and `internals/labelable-provider/useLabelableId.ts`. Checkbox, Switch, RadioGroup and CheckboxGroup register with Field and Form, take `Field.Root name` and `disabled`, carry `aria-invalid`, `aria-describedby` and the Field `data-*` state, and are named by `Field.Label`. CheckboxGroup claims the label with `id: null`, so the label omits `for`, and a checkbox in the group's scope does not claim the Field's control id. Each radio calls `useLabelableId({ id })` in the scope it is rendered in, so radios outside a `Field.Item` all render the Field's control id and `Field.Label for` points at the first one.

Local: the same registration, through `attachFieldControl`, `Field`'s `registerInput` and the `LabelableId` and `AriaLabelledBy` classes in `src/lib/internal/labelable-provider.svelte.ts`. RadioGroup claims the label with `id: null` the way CheckboxGroup does, and a radio leaves the control id to its group unless a `Field.Item` gives it its own scope. Radios therefore keep distinct ids, the group is named by `aria-labelledby`, and a `Field.Item` label still points `for` at its radio. CheckboxGroup reports its whole `value` to `onFormSubmit` and `validate`. Upstream drops values whose checkbox is disabled or belongs to another form.

Test: `src/lib/field/choice-controls.svelte.spec.ts`.

### Slider fills its Field

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/slider/root/SliderRoot.tsx`. Slider never calls the Field's `setFilled`, so a Field around a Slider has no `data-filled`.

Local: Slider marks its Field filled, because a range input always has a value. `Field.Root` and the Slider parts carry `data-filled`.

Test: `src/lib/slider/Slider.svelte.spec.ts` (`marks the Field filled, as a range input always has a value`).

### Form reset

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/form/Form.tsx`, `field/root/FieldRoot.tsx` and the form controls. Nothing listens for `reset`. A reset puts the native inputs back to their HTML defaults, while each control keeps its React state, so the control, its hidden input and `FormData` can disagree. Field dirty, touched and validity, and Form `errors`, stay as they were.

Local: the controls follow `bind:value` and `bind:checked`. Each named input carries `defaultValue` or `defaultChecked`. A task after an uncanceled `reset`, Checkbox, Switch, RadioGroup, CheckboxGroup, Slider, NumberField and OTPField write their `defaultChecked` or `defaultValue` back through the binding, and Field.Control and Input read the input's value back as `bind:value` does. No `onValueChange` or `onCheckedChange` is called, because a native reset fires no `input` or `change` event. Then each Field clears dirty, touched, validity and its custom validity message, and takes the restored value as its initial value. Form clears `errors` and its submit count. A control listens to the form its named input belongs to, so a control outside the `<form>` that joins it through `form` restores too. A Slider with no `defaultValue` returns each thumb to `min`, as its range inputs do. Checkbox and Switch submit `uncheckedValue` from a hidden checkbox that the browser resets together with the visible one, so `FormData` never holds both values. The visible state of a custom control (`aria-checked`, `data-checked`, the thumb position) catches up one task after a native reset, because the browser resets the inputs only after the `reset` listeners have run. The helper is `src/lib/internal/form-reset.svelte.ts`.

Test: `src/lib/form/form-reset.svelte.spec.ts`.

### Submit gate and named-input events

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/form/Form.tsx`, `slider/root/SliderRoot.tsx`, `number-field/root/NumberFieldRoot.tsx` and `otp-field/root/OTPFieldRoot.tsx`. Form validates in its React `onSubmit` and blocks an invalid submit with `preventDefault()` only, so a later `submit` listener on the form still runs. It renders `noValidate` on the server and validates even when the submitter has `formnovalidate`. Slider, NumberField and OTPField update their named inputs through React state and fire no `input` or `change` event on them.

Local: Form validates in a capture-phase `submit` listener. An invalid submit gets `preventDefault()` and `stopImmediatePropagation()`, so SvelteKit's `enhance` and other later listeners do not run. A submitter with `formnovalidate` skips that validation, as it skips native validation. `novalidate` is set by an attachment after hydration, so the server renders none and a page without JavaScript keeps the browser's validation. A user change fires a bubbling `input` event from the Slider thumb's range input and from the hidden NumberField and OTPField inputs, once the new value is in the DOM. `change` follows when the change is committed: a Slider key press or pointer release, a NumberField commit, or focus leaving the OTPField. As with a native input, `change` fires only when the value differs from the one at the previous `change`, so a NumberField whose owner keeps its value fires neither event. Checkbox, Switch and Radio already fire both through the click on their native input. A parent checkbox fires both on each child input it toggles. The controls ignore the events they fire themselves.

Test: `src/lib/form/form-events.svelte.spec.ts`, `src/lib/form/form-ssr.spec.ts` and `src/routes/fixtures/form/form.e2e.ts` (`svelte SSR leaves novalidate to hydration`).

### Composite controls bound to a form source

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/field/root/FieldRoot.tsx` and the form controls. A Field has no form source. A form library wires each control by hand through `name`, `value` and `onValueChange`. Checkbox and Switch submit `value` or `uncheckedValue`, and a cleared NumberField reports `null`.

Local: inside a Field bound to a form source, Checkbox, Switch, RadioGroup, CheckboxGroup, NumberField, Slider and OTPField read the source themselves, as described in [Composite form controls](porting.md#composite-form-controls). Their native input takes its `name`, its option `value` and any attachment from the field's `as()`, so a remote form decodes typed values (`n:` numbers, `b:` booleans, `[]` arrays). A bound Checkbox or Switch submits `on` or nothing, and its `value` and `uncheckedValue` are ignored, because a SvelteKit boolean field is `on` when checked and absent when not. A control starts from the source's value when the source has one and from `defaultValue` otherwise. A later source change, such as `fields.seats.set(3)`, updates the control without `onValueChange` or `onCheckedChange`. A source value of `undefined` empties a bound NumberField and returns a bound Slider to `defaultValue ?? min`. A bound Slider takes one value, and an array value logs a dev error. A control whose kind differs from the Field.Root `type` logs a dev error.

Test: `src/lib/field/bound-control.svelte.spec.ts`.

## Tooltip

Source: `packages/react/src/tooltip` at Base UI v1.9.0, commit `ad7ecda5296b0295b41a51ecb01fce6204acd099`. The other components follow v1.8.0. The paired React fixture runs `@base-ui/react` 1.8.0, whose Tooltip behaves the same for the covered cases. `TooltipStore` extends the shared `TriggerOwnedPopupStore` in `src/lib/internal/popups/triggerOwnedStore.svelte.ts`, which also backs PreviewCard. Hover, focus, cursor tracking and the Provider's delay group come from `packages/floating-ui-svelte`.

| Upstream                                                 | Local                                                                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `open` / `defaultOpen`, `triggerId` / `defaultTriggerId` | `$bindable` `open` / `triggerId`. A one-way value sets the initial state                                 |
| `actionsRef`                                             | `bind:this` on `Tooltip.Root` (`close` and `unmount`)                                                    |
| `Tooltip.createHandle()`                                 | `Tooltip.createHandle()`, and `createTooltipHandle` as a named export                                    |
| `children` render function `{ payload }`                 | snippet argument `{ payload }`                                                                           |
| `useDismiss` `referencePress`                            | the trigger-press close lives in `TooltipRootInteractions.svelte`, because `DismissInteraction` has none |
| `*DataAttributes` and `*CssVars` enums                   | not exported, as for Popover                                                                             |

The popup has no `role` and the trigger has no `aria-describedby` or `type`, as upstream renders them.

`payload`, `closeDelay` and `closeOnClick` are read live from the active trigger, and an active trigger that unmounts closes the tooltip, as described for PreviewCard under [Payload and close delay are read from the active trigger](#payload-and-close-delay-are-read-from-the-active-trigger) and [Active trigger tracking](#active-trigger-tracking).

### Trigger id after the tooltip unmounts

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/utils/popups/popupStoreUtils.ts` (`useOpenStateTransitions`). Once the popup unmounts, the store resets its own `activeTriggerId` to `null`. The `triggerId` prop is never written by the store. The next open that names no trigger, such as a controlled `open`, claims the only registered trigger.

Local: `triggerId` is one `$bindable` prop for both values, as for Popover under [Trigger id after the popover unmounts](#trigger-id-after-the-popover-unmounts). `BoundTriggerId` in `src/lib/internal/popups/boundTriggerId.svelte.ts` resets an id the store wrote to `null` once the popup unmounts, if the parent has not changed it since. An id that the parent set stays until a trigger press replaces it.

Test: `src/lib/tooltip/TooltipOwnership.svelte.spec.ts` (`lets a remounted lone trigger claim a bind:open after the previous trigger claimed one`).

## PreviewCard

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099` (Base UI v1.9.0), `packages/react/src/preview-card/**` and `packages/react/src/utils/popups/inlineRect.ts`. The rest of this file pins v1.8.0. The paired React fixture runs `@base-ui/react` 1.8.0, whose PreviewCard behaves the same for the covered cases.

### Public surface

Upstream: `defaultOpen`, `defaultTriggerId`, `actionsRef`, and the `PreviewCardPopupDataAttributes`, `PreviewCardPositionerCssVars` and similar namespaces. `PreviewCard.createHandle` is the only handle factory.

Local: `open` and `triggerId` are `$bindable`, so the first value is the default. `close()` and `unmount()` are exports of the root, read through `bind:this`. The data-attribute and CSS-variable namespaces are not exported. The attribute names come from the shared state mappings. `createHandle` exists as `PreviewCard.createHandle` and `createPreviewCardHandle`. There is no top-level `createHandle`, because Popover already exports that name from the library barrel.

### Payload and close delay are read from the active trigger

Upstream: the store copies the active trigger's `payload` and `closeDelay` into state when the card opens or switches trigger.

Local: each trigger registers a reader for `{ payload, closeDelay }` with the store. The store reads the active trigger's reader where the value is used, so a payload change on the active trigger shows at once and there is no copy to keep in step. When the active trigger unmounts while the card is mounted, for example before a canceled close or during the exit animation, the store keeps the values the trigger had at unmount until the card finishes closing.

Test: `src/lib/preview-card/PreviewCardDetached.svelte.spec.ts` (`stays open when the close caused by the active trigger unmounting is canceled`).

### Active trigger tracking

Upstream: `useImplicitActiveTrigger(store, { closeOnActiveTriggerUnmount: true })`.

Local: `TriggerOwnedPopupStore` in `src/lib/internal/popups/triggerOwnedStore.svelte.ts` does the same in one effect, for PreviewCard and Tooltip. A bound `triggerId` whose element registers late moves the anchor. A card opened through `bind:open` claims its only trigger. A card opened through `handle.open(null)` claims none, as upstream's `openedWithoutTrigger`, also when the trigger registers later. An active trigger that unregisters after it resolved closes the card with reason `none`, in a microtask, so a replacement registered in the same tick keeps the card open. A canceled close leaves the old element as the anchor.

Test: `src/lib/preview-card/PreviewCardDetached.svelte.spec.ts` (`closes when the active trigger unmounts`), `src/lib/preview-card/PreviewCardOwnership.svelte.spec.ts` and `src/lib/tooltip/TooltipOwnership.svelte.spec.ts`.

### Inline rect positioning

Upstream: the positioner calls `updatePosition()` from an effect when the card opens, so the inline middleware measures the line the pointer entered.

Local: no `update()` is exposed. The positioner replaces the inline middleware object when the card opens and is mounted, and `FloatingPosition` measures again when its options change. Hover coordinates live in a plain holder on the store, not in state, as upstream keeps them in a ref.

Test: `src/lib/preview-card/PreviewCardPositioner.svelte.spec.ts` (`multiline inline trigger`).

### Not covered

The "does not re-render inactive triggers" cases count React renders. "Cleans up the transition when a lagging payload remounts the current container" depends on a payload that arrives a render after the trigger id. Both have no Svelte counterpart.

### Trigger id after the card unmounts

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/utils/popups/popupStoreUtils.ts` (`useOpenStateTransitions`). Once the popup unmounts, the store resets its own `activeTriggerId` to `null`. The `triggerId` prop is never written by the store. The next open that names no trigger, such as a controlled `open`, claims the only registered trigger.

Local: `triggerId` is one `$bindable` prop for both values, as for Popover under [Trigger id after the popover unmounts](#trigger-id-after-the-popover-unmounts). `BoundTriggerId` in `src/lib/internal/popups/boundTriggerId.svelte.ts` resets an id the store wrote to `null` once the popup unmounts, if the parent has not changed it since. An id that the parent set stays until a trigger press replaces it.

Test: `src/lib/preview-card/PreviewCardOwnership.svelte.spec.ts` (`lets a remounted lone trigger claim a bind:open after the previous trigger claimed one`).

## NavigationMenu

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099` (Base UI v1.9.0), `packages/react/src/navigation-menu/**`. The paired React fixture runs `@base-ui/react` 1.9.0.

### Public surface

Upstream: `value` and `defaultValue`, `actionsRef`, the `NavigationMenu*DataAttributes` and `NavigationMenu*CssVars` namespaces.

Local: `value` is `$bindable`, so the first value is the default. `close()` and `unmount()` are exports of the root, read through `bind:this`. The namespaces are not exported.

### Content moves into the viewport by an attachment

Upstream: `NavigationMenu.Content` renders through a React portal into the viewport, and React events bubble along the component tree.

Local: the content element stays in its item's component tree and an attachment moves it into the viewport while the item is active. DOM events from the content bubble through the viewport and the popup, which is where the DOM places it.

### Size variables live in state

Upstream: `--popup-width`, `--popup-height`, `--positioner-width` and `--positioner-height` are written with `style.setProperty`, and React patches other style properties around them.

Local: Svelte replaces the whole `style` attribute when a part's style changes, which dropped those variables. `StyleVars` in `src/lib/navigation-menu/style-vars.svelte.ts` writes each variable to the element at once and to state, and the popup and positioner render that state in their style. A value written to `style` directly by other code is still replaced by the next style change. `does not collapse auto-sized popup to zero on close if measurement temporarily returns 0` primes its size by mocking the popup's measured size before opening instead of calling `setProperty`.

Test: `src/lib/navigation-menu/NavigationMenuRoot.svelte.spec.ts` (`preserves popup size when controlled value closes externally`) and `NavigationMenuNested.svelte.spec.ts`.

### Focus guards listen for focusin

Upstream: the guards use React `onFocus`, which React attaches as `focusin`.

Local: the guards listen for `focusin`, so the positioner's capture listener re-enables the tabbables in the popup before a guard moves focus into it.

Test: `src/lib/navigation-menu/NavigationMenuTrigger.svelte.spec.ts` (`handles focus and positioner height`).

### Shared floating-ui internals

Upstream: the navigation menu imports `safePolygon` pointer-events helpers, `getNodeChildren`, `enableFocusInside`, `disableFocusInside`, `getNextTabbable` and `getPreviousTabbable` from `floating-ui-react` internals.

Local: `packages/floating-ui-svelte/src/sharedInternals.ts` re-exports the existing helpers, and the package entry `packages/floating-ui-svelte/src/index.ts` gains one named export of them. The pointer-events lock keeps one owner per scope element in a module map, so a copy outside the package would not see the lock that hover interactions applied.

### Object item values compare by identity

Upstream: `value === itemValue` compares the object the consumer passed.

Local: the same comparison runs, but a `$state` object is a deep proxy, so an item value read from `$state` is not the object stored in a bound `$state` value. Use primitives, or keep object values in `$state.raw`.

### Not covered

The positioner case that spies on the arguments of the anchor positioning hook asserts an implementation detail. The conformance cases for `ref`, the `className` function and the React render prop have no Svelte counterpart. `NavigationMenuParts.svelte.spec.ts` checks each part's host element, `class`, attributes, attachments and `render` snippet instead.

## Menu

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099` (Base UI v1.9.0), `packages/react/src/menu/**` with the filter parts and the `packages/react/src/filter-dropdown/**` code they use. The paired React fixture runs `@base-ui/react` 1.9.0. `MenuStore` extends `PopupStore<MenuChangeReason>`. List navigation and typeahead come from `packages/floating-ui-svelte`.

### Public surface

Upstream: `defaultOpen`, `defaultTriggerId`, `defaultChecked` on `Menu.CheckboxItem`, `defaultValue` on `Menu.RadioGroup` and `Menu.FilterProvider`, `actionsRef`, and the `*DataAttributes` and `*CssVars` namespaces.

Local: `open` and `triggerId` on `Menu.Root`, `open` on `Menu.SubmenuRoot`, `checked` on `Menu.CheckboxItem`, `value` on `Menu.RadioGroup` and `value` on `Menu.FilterProvider` are `$bindable`, so the first value is the default. `close()` and `unmount()` are exports of both roots, read through `bind:this`. The namespaces are not exported. `Menu.createHandle` and `createMenuHandle` create handles. The `Menu.Root` children snippet receives `{ payload }`. A menu that is open when its only trigger mounts, with no `triggerId`, makes that trigger active and writes its id to `bind:triggerId`, as Popover does.

### Labels are trimmed

Upstream: typeahead and `onItemHighlighted` read an item's `textContent` as it is.

Local: the label is trimmed, because Svelte templates keep the whitespace around a text child.

### Filter item text

Upstream: a filtered-out item has no DOM, so the filter reads the text of its React children, and an item whose children change while it is hidden matches the new text.

Local: Svelte children are a snippet with no readable text. An item's text is its rendered `textContent`, trimmed, and a `MutationObserver` catches changes while it is visible. A filtered-out item without `label` keeps the text it last rendered. Set `label` on an item whose text changes while it can be hidden.

### Portaled filter events

Upstream: keys and focus in a portaled submenu bubble through React's tree to the parent popup's handlers.

Local: nothing re-runs the parent popup's handlers. A key that a submenu does not handle goes straight to the menubar's `relayKeyboardEvent`, so ArrowRight on a plain item moves to the next menubar menu. A plain submenu that closes on its parent's main-axis key moves the parent's highlight on from its trigger. The parent's other main-axis key, such as ArrowRight on a plain item of a vertical submenu in a horizontal menu, does nothing. Upstream moves the parent's highlight to the next item. A filterable popup learns that focus moved into one of its submenus from a `focusin` listener on the document, matched by the menu's root id.

### Opting out of the menu's key handling

Upstream: a consumer handler calls `event.preventBaseUIHandler()`, and the flag reaches every Base UI handler on the propagation path through React's shared synthetic event.

Local: a consumer handler calls `event.preventDefault()`, as with every part (see `mergeProps`). `Menu.Input` passes its consumer handler through `forwardConsumerPrevention`, so the popup skips its own handlers for that key. No other menu part forwards the opt-out to an ancestor.

### Internal filter roots

Upstream: `MenuFilterRoot` and `MenuFilterSubmenuRoot` are internal components that `Menu.FilterProvider` renders around a root or a submenu root.

Local: they are the classes in `filter-root.svelte.ts` and `filter-submenu-root.svelte.ts`, which `Menu.Root` and `Menu.SubmenuRoot` create when a provider surrounds them. Neither is public, as upstream.

### Return focus after a hover close

Upstream: a hover menu that closes because the pointer left (`trigger-hover` from `mouseleave`) returns focus nowhere.

Local: the shared `FloatingFocusManager` skips return focus only for a `focus-out` close that moves focus on itself, as upstream's `preventReturnFocusRef` does. `MenuPopup` passes a `returnFocus` that skips it after a `trigger-hover` close from `mouseleave`, so focus is on the body once the popup unmounts.

Test: `src/lib/menu/MenuRoot.svelte.spec.ts` (`does not return focus to the element focused before a hover open when the pointer leaves`).

### Touch close guard

Upstream: the touch `click` that follows a focus open is ignored after it reaches `onOpenChange`.

Local: the store ignores it before `onOpenChange`, so the callback does not see the ignored close.

### Submenu hover scope

Upstream: the submenu's safe polygon reaches the parent popup through the floating tree.

Local: the polygon scopes to the parent popup through `getScope`.

### Behavior that waits on shared internals

- The `data-base-ui-click-trigger` marker is not rendered. Upstream sets it only on Dialog and Popover triggers.

### Not covered

React-only cases: refs and ref callbacks, the non-memoized anchor function, render counts, StrictMode subscriptions, and production and owner-stack warnings. `Menu.Group` rendered as a `Menu.RadioGroup` relies on React element cloning. The context-menu positioner cases are in `src/lib/context-menu/ContextMenu.svelte.spec.ts`. The menubar positioner cases are in `src/lib/menubar/Menubar.svelte.spec.ts`. The filter cases that need exit animations add a CSS animation or transition in the spec. The WebKit `aria-selected` cases mock the platform and are not ported. A filtered-out item whose children change while hidden matches the old text here, so those `useMenuFilterItem` cases are not ported. The SSR, React 17 id fallback, server-created render element and hydration cases depend on React rendering. `FilterDropdownRoot` cases belong to a component this port does not include. The shadow-root focus-guard case depends on React portal ownership.

### Submenu trigger press type

Upstream: a filterable submenu trigger types its click with `useEnhancedClickHandler`.

Local: it uses the shared `useOpenInteractionType` and skips a `pointerdown` that was already prevented, as upstream does. The shared helper differs in two ways. A click whose own `pointerType` is empty takes the type of the `pointerdown` before it, where upstream keeps the empty type. On iOS an empty type counts as a touch. A touch and an empty type both leave focus where it is, so only the first can change the result.

Test: `src/lib/menu/MenuFilterSubmenuRoot.pointerFocus.svelte.spec.ts` (`submenu press type in a plain parent`).

### Initial live-region text

Upstream: `useInitialLiveRegionTextMutation` is a hook that returns a ref, tested in `internals/useInitialLiveRegionTextMutation.test.tsx`.

Local: `Menu.Empty` marks its text in an attachment. The cases run against `Menu.Empty` in `src/lib/menu/MenuEmpty.liveRegion.svelte.spec.ts`. `does nothing when its ref is not attached` is not ported: an attachment runs only on the element it is attached to, so there is no unattached state to test.

### Trigger id after the menu unmounts

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/utils/popups/popupStoreUtils.ts` (`useOpenStateTransitions` and `useImplicitActiveTrigger`). Once the menu unmounts, the store resets its own `activeTriggerId` to `null`. The next open that names no trigger, such as a controlled `open`, claims the only registered trigger.

Local: `triggerId` is one `$bindable` prop for both values, as for Popover under [Trigger id after the popover unmounts](#trigger-id-after-the-popover-unmounts). The Menu store uses the shared `BoundTriggerId`, so a menubar menu behaves the same. A ContextMenu has no trigger id to bind.

Test: `src/lib/menu/MenuRoot.triggerId.svelte.spec.ts`, run for a standalone menu and a menubar menu.

## Menubar

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099` (Base UI v1.9.0), `packages/react/src/menubar/**`. The paired React fixture runs `@base-ui/react` 1.9.0. `Menubar` provides the `MenubarParentContext` that `src/lib/menu/parent.svelte.ts` defines. Roving focus comes from the shared `CompositeRoot` in `src/lib/internal/composite-root.svelte.ts`.

### Public surface

Upstream: `Menubar` and the `MenubarDataAttributes` namespace.

Local: `Menubar` takes the same props. The namespace is not exported. The attribute names are the same.

### Detached menus take the menubar's tree for events only

Upstream: a trigger lends its floating tree, node id and parent node id to the detached menu it opens. The menu's nodes then live in the menubar's tree.

Local: a menubar trigger that owns a detached menu sets the menu's parent to the menubar, and `MenuStore.tree` and `MenuStore.parentNodeId` follow that parent. The menu emits and hears `menuopenchange`, `itemhover` and `close` on the menubar's tree, so separate detached menus close each other with `sibling-open` and the menubar keeps `data-has-submenu-open`. Svelte context does not change after init, so the menu's floating nodes stay in the tree its root was created in. The focus manager, dismiss and hover hooks read that tree.

### Menu open events are emitted before the DOM update

Upstream: `MenuPositioner` emits `menuopenchange` from a layout effect. The focus manager returns focus a microtask after the popup unmounts, so focus stays in a popup that animates out until then.

Local: `MenuPositioner` emits from `$effect.pre`. The shared `FloatingFocusManager` returns focus a microtask after the popup unmounts, as upstream does. An outside press that closes a menu clears `data-has-submenu-open` before the returned focus reaches the trigger, also when the close and the unmount share a flush, so that focus does not reopen the menu.

A press that moves from one open menu to the next, such as a touch press on the Edit trigger while File is open, keeps Edit open and File closed. File unmounts about a frame after that press, before Edit's initial focus lands. Upstream returns focus to the File trigger then. When that focus matches `:focus-visible`, as it does after synthetic events, the trigger's focus handler reopens File and closes Edit. The local focus manager skips that return, as described in [Return focus skips an opening sibling](#return-focus-skips-an-opening-sibling).

Test: `src/lib/menubar/Menubar.svelte.spec.ts` (`updates scroll lock when handing off between top-level touch-opened menus`).

### Arrow keys focus synchronously

Upstream: `useCompositeRoot` moves focus to the next trigger in a microtask, after the focus manager's return.

Local: the shared `CompositeRoot` focuses the next trigger synchronously. The ported keyboard cases pass with it.

### Behavior that waits on shared internals

- The shared `CompositeRoot` does not select the text of a native input on focus and has no text-field arrow exceptions. A menubar holds only triggers, so no ported case reaches them.
- `packages/floating-ui-svelte/src/hooks/useDismiss.svelte.ts` keeps a press that started inside a popup until its `pointerup`, for sloppy presses too. Upstream checks that flag only for intentional presses. A touch press inside a submenu followed by a touch press outside, with no `pointerup` between them, closes the submenu but not its parent menu. Real taps always send `pointerup`. The ported touch case taps the submenu trigger with a full sequence.

### Not covered

React-only cases: `describeConformance` (refs, `className` and style functions).

## ContextMenu

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099` (Base UI v1.9.0), `packages/react/src/context-menu/**`. The paired React fixture runs `@base-ui/react` 1.9.0. `ContextMenu.Root` provides the `ContextMenuParentContext` that `src/lib/menu/parent.svelte.ts` defines, and renders a `Menu.Root` under it. Every part but `Root` and `Trigger` is the Menu part of the same name. `ContextMenu.Positioner` is `Menu.Positioner` typed as `ContextMenuPositionerProps`, which has no `positionMethod`.

### Public surface

Upstream: `ContextMenu.Root` accepts the deprecated `closeParentOnEsc`, and `ContextMenu.Positioner` the deprecated `positionMethod`. Neither has an effect. The entry also exports the `ContextMenu*DataAttributes` and `ContextMenuPositionerCssVariables` namespaces.

Local: the deprecated props are not in the types. The namespaces are not exported. The attribute and variable names are those of Menu.

### The right-click mouseup listener is on the window

Upstream: the trigger adds a one-time `mouseup` listener to the document. React's root and portal listeners sit below the document, so an item's `onMouseUp` runs first and reads the gesture's mouse-up gate before the listener clears it.

Local: Svelte delegates the item handlers to the document and can add that listener only when the first item mounts, after the trigger's listener. The trigger listens on the window, so the item still runs first.

### Not covered

React-only cases: `describeConformance` (refs, `className` and style functions). Upstream's positioner cases spy on `useAnchorPositioning` arguments. The local spec asserts the placement instead: the pointer anchor, explicit placement and offsets, fixed positioning, the alignment flip at the viewport edge, and a submenu against its trigger. The `uses the layout viewport for a root context menu` case is covered by a stand-in `window.visualViewport` half the page wide, since the test browser cannot pinch zoom. The `uses the visual viewport for a context menu submenu` case has no observable result in the test viewport. `-webkit-touch-callout: none` is set on the trigger, but Chromium drops it, so no spec reads it.

## Toast

Source: `packages/react/src/toast` at Base UI v1.9.0 (`ad7ecda5296b0295b41a51ecb01fce6204acd099`). The React fixture runs `@base-ui/react@1.9.0`. Portal, positioning, button behavior, `mergeProps`, and the state attribute helpers are the landed shared code. The store's auto-dismiss timers are plain `Timeout`s that `Toast.Provider` clears when it is destroyed. A toast added during a server render schedules no timer, since the provider's cleanup never runs there.

### Toast object, manager, and provider

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/toast/useToastManager.ts`, `createToastManager.ts`, `store.ts`, and `provider/ToastProvider.tsx`.

| Upstream                                                                                                                        | Local                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useToastManager()` returns `{ toasts, add, close, update, promise }`                                                           | `getToastManager()` (also `Toast.getToastManager`) returns the same methods and a `toasts` getter. Call it during component init. Read `manager.toasts`. Destructuring `toasts` stops it updating. The return type is `GetToastManagerReturnValue` |
| `title`, `description`, and `actionProps.children` are `React.ReactNode`                                                        | `string \| Snippet`. A snippet renders with `{@render}`. `''` and `undefined` render nothing                                                                                                                                                       |
| `ref` on the toast object                                                                                                       | `element`, the root element. `Toast.Root` writes it. Focus management reads it                                                                                                                                                                     |
| `actionProps` is `React.ComponentPropsWithoutRef<'button'>`                                                                     | `HTMLButtonAttributes` with `children: string \| Snippet`                                                                                                                                                                                          |
| `positionerProps` is `ToastPositioner.Props` without `anchor` and `toast`. Only the positioning options take effect             | `ToastManagerPositionerProps` holds only those options and `anchor`                                                                                                                                                                                |
| `createToastManager()` exposes the provider subscription as the string key `' subscribe'`                                       | A module symbol that only `Toast.Provider` imports. `ToastManagerEvent` is a union discriminated by `action`                                                                                                                                       |
| The store keeps `timeout` and `limit` in state, and a layout effect syncs them from the provider props and recomputes `limited` | The store reads `timeout` and `limit` from the provider props through a getter, and `toasts` derives each toast's `limited` flag from the current limit. A changed prop is current before any descendant effect runs                               |
| The promise handoff probes the options for `setPromise`                                                                         | The store returns the handled promise. The provider passes it to the manager's `setPromise`                                                                                                                                                        |
| The provider handles a manager `update` with an empty id as an `add`, so it adds a toast built from that event's options        | The store ignores an update for an id it does not hold, so an empty id changes nothing                                                                                                                                                             |
| The `*DataAttributes` and `*CssVars` exports are module namespaces                                                              | Constant objects with the same names and keys, such as `ToastRootDataAttributes.swipeDirection`                                                                                                                                                    |

### Parts

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/toast/**`.

- `Toast.Viewport` listens for `focusin` and `focusout`, which bubble only through the DOM. React's `onFocus` and `onBlur` also bubble through portals. When focus moves into content portaled out of a toast, the viewport sees only the `focusout`, so the timers resume. Upstream's `onFocus` then pauses them again when the focus is visible.
- `Toast.Title` and `Toast.Description` inside a `render` snippet register their id with the root, for `aria-labelledby` and `aria-describedby`, only when the snippet spreads the host props onto an element. The registration is an attachment in those props. Upstream registers the id whenever the part renders.
- `Toast.Title`, `Toast.Description`, and `Toast.Action` render nothing unless they have children or the toast field has content. Upstream also inspects a `render` element's own children. A `render` snippet cannot be inspected, so its own text does not count. Pass that text as children instead.
- `Toast.Portal` is the shared `FloatingPortal`, which renders focus guards only for a focus manager, so it behaves like upstream's `FloatingPortalLite`. It has no `keepMounted`, as upstream.
- `class` and `style` take no function of state, as in every other component.

Test: `src/lib/toast/store.svelte.spec.ts`, `src/lib/toast/toast-ssr.spec.ts`, `src/lib/toast/manager.svelte.spec.ts`, `src/lib/toast/manager-types.spec.ts`, `src/lib/toast/Toast.svelte.spec.ts`, `src/lib/toast/ToastRoot.svelte.spec.ts`, and `src/lib/toast/parts.svelte.spec.ts`. `src/lib/toast/Toast.svelte.spec.ts` (`keeps timers paused on mouseleave while the window is blurred`, `collapses a deferred mouseleave after a closing toast is removed while blurred`, `syncs a changed limit before descendant effects`). `src/lib/toast/manager.svelte.spec.ts` (`recomputes limited toasts when the limit prop changes`). `src/lib/toast/parts.svelte.spec.ts` (`renders content passed through the render snippet`, `does not render a childless render snippet when there is no content`).

## Select

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099` (Base UI v1.9.0), `packages/react/src/select/**`, with the shared helpers in `packages/react/src/internals/itemEquality.ts`, `resolveValueLabel.tsx`, `packages/react/src/utils/ItemIndicator.tsx` and `listbox-separator/`. The paired fixture runs `@base-ui/react` 1.9.0.

### Public surface

Upstream: `value`/`defaultValue`/`onValueChange`, `open`/`defaultOpen`/`onOpenChange`, `actionsRef`, `inputRef`, `readOnly`, and `ReactNode` labels in `items` and on `Select.Value`'s `placeholder`.

Local: `value` and `open` are `$bindable`. `defaultValue` stays, because Select is a form control: it is the value an empty binding starts from and the value a native reset restores. There is no `defaultOpen`: `open` without `bind:` is the initial state. `actionsRef` is the root's exported `close()` and `unmount()`, read through `bind:this`, and `unmount()` does nothing while the popup is open. `inputRef` is not ported. The root takes `readonly`, the HTML spelling. Labels, `placeholder`, and what `itemToStringLabel` returns are strings, because a part renders them as text. A `Select.Value` `children` snippet receives the value in place of the children function.

### Multiple values submit through one hidden select

Upstream: a `multiple` select renders one hidden `<input>` per value.

Local: one hidden `<select multiple>` holds an `<option>` per current value and per `defaultValue` entry. The current values are the options' selectedness, set after Svelte renders them. The `selected` attribute marks the defaults, so a native reset restores them. `FormData` holds the same entries as upstream. The select stays in the form when nothing is selected, so a form source still hears the edit that cleared it. A user edit fires `input` and `change` from it once the options are written. The helper is `src/lib/internal/listbox/native-select.ts`.

Test: `src/lib/select/SelectRoot.multiple.svelte.spec.ts`, the `bound Select` cases of `src/lib/field/bound-control.svelte.spec.ts`.

### Native reset and form sources

Upstream: nothing listens for `reset`, as described under [Form reset](#form-reset).

Local: Select joins the other form controls. A native reset restores `defaultValue` through the binding and calls no `onValueChange`. Inside a `Field.Root` bound to a form source, Select is kind `select`, or `select multiple` with `multiple`, per [Composite controls bound to a form source](#composite-controls-bound-to-a-form-source). A source value names an item by its serialized value, so an object or number item stays selected after the source echoes a string.

Test: `src/lib/select/SelectRoot.field.svelte.spec.ts`, `src/routes/fixtures/select/select.e2e.ts` (`restores the default value on a native form reset`).

### Event handling

Upstream: a consumer handler calls `event.preventBaseUIHandler()` to skip a part's own handling, and the popup's typeahead runs through the merged props.

Local: `event.preventDefault()` is the skip signal, as everywhere in this port. An item prevents a Space typed inside a typeahead match so that it does not select, and the merged popup handlers would skip a prevented event, so the popup chains the typeahead handler after the merged handlers instead of merging it.

### Focus and nesting

Upstream: closing returns focus to the element focused before the popup opened. Presses inside a select nested in another popup bubble through the React tree to the parent.

Local: the select joins the parent popup's floating tree, so a parent popover treats the select's popup as its child.

Upstream: on open, list navigation queues the highlighted item's focus for the next frame, then the focus manager queues its own focus, which replaces the first request. The focus manager's request does nothing once the popup has closed, so a Tab or Escape before that frame leaves focus where the close put it.

Local: list navigation queues its request after the focus manager's. The request checks that the popup is still open, so a close in that frame leaves focus where the close put it, as upstream does.

Test: `src/lib/select/SelectRoot.popups.svelte.spec.ts` (`keeps focus outside when the popup closes before its open focus lands`). Upstream's `validates when the popup is blurred` fires a synthetic blur after a trigger blur whose queued focus-out check clears `insideReactTree`, so its popup closes. A real focus move without a press keeps a portaled popup open in upstream, so `src/lib/select/SelectRoot.field.svelte.spec.ts` blurs the popup with Tab.

### Open method and alignment

Upstream: the positioner keeps `alignItemWithTrigger` in state and resets it to the prop only while unmounted.

Local: the interaction that opened the popup is kept until the popup unmounts, so a touch-opened popup keeps regular anchoring while it animates out. A fallback to regular anchoring lasts until the popup mounts or unmounts again, and a change of the `alignItemWithTrigger` prop applies at once.

### Not covered

`describeConformance` and the popup conformance suites (ref forwarding, render-prop cloning), `store.test.tsx` (React store transactions), the Strict Mode, `React.startTransition`, `ReactDOM.createPortal` and render-count cases, and the requestAnimationFrame-mocked touch reopen case have no Svelte counterpart. The positioner conformance cases that assert `transform` are not ported, because the positioner uses `top` and `left`. Upstream's jsdom-only keyboard, quick-selection and style-hook item cases run in Chromium with real timers.

## Combobox

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099` (Base UI v1.9.0), `packages/react/src/combobox/**`, with `AriaCombobox.tsx`, `packages/react/src/floating-ui-react/hooks/gridNavigation.ts` and the listbox helpers Select shares. The paired fixture runs `@base-ui/react` 1.9.0.

### Public surface

Upstream: `value`/`defaultValue`/`onValueChange`, `inputValue`/`defaultInputValue`/`onInputValueChange`, `open`/`defaultOpen`/`onOpenChange`, `actionsRef`, `inputRef`, `virtualized`, the `Combobox.Item` `index` prop, `readOnly`, `autoComplete`, a `Combobox.List` children function, and `ReactNode` labels and placeholder.

Local: `value`, `inputValue` and `open` are `$bindable`. `defaultValue` and `defaultInputValue` stay, because the combobox is a form control. There is no `defaultOpen`: `open` without `bind:` is the initial state. `actionsRef` is the root's exported `close()` and `unmount()`, read through `bind:this`. `inputRef`, `virtualized` and the item `index` prop are not ported. The root takes `readonly` and `autocomplete`, the HTML spellings. `Combobox.List` takes static children, and `Combobox.Collection` renders the filtered items through its `children` snippet. Labels, `placeholder`, and what `itemToStringLabel` returns are strings. A `Combobox.Value` `children` snippet receives the value in place of the children function. `useFilter` is a plain function, called in a `$derived` when its options change. `useFilteredItems` returns `{ current }`. `createItems` derives each item's value and label on first use.

### One core for Combobox and Autocomplete

Upstream: `AriaCombobox` holds the behavior, and `selectionMode` (`single`, `multiple` or `none`) picks what a press commits.

Local: `src/lib/combobox/AriaCombobox.svelte` holds the same behavior behind the same `selectionMode` prop. `Combobox.Root` passes `single` or `multiple`, and an Autocomplete root passes `none`, where the input text is the value and the bound control kind is `text`. `ComboboxStore` extends `PopupStore`, keeps the input text, indices and part elements in `$state`, and derives the filtered and flattened items from them.

### Multiple values submit through one hidden select

Upstream: a `multiple` combobox renders one hidden `<input>` per value.

Local: one hidden `<select multiple>` holds the values, as Select does. `FormData` holds the same entries. The helper now lives in `src/lib/internal/listbox/native-select.ts`, shared with Select.

Test: `src/lib/combobox/ComboboxRoot.form.svelte.spec.ts`, the `bound Combobox` cases of `src/lib/field/bound-control.svelte.spec.ts`.

### Native reset and form sources

Upstream: nothing listens for `reset`, as described under [Form reset](#form-reset).

Local: a native reset restores `defaultValue` and the input text that matches it, and calls no `onValueChange`. Inside a `Field.Root` bound to a form source, the combobox is kind `select`, or `select multiple` with `multiple`, per [Composite controls bound to a form source](#composite-controls-bound-to-a-form-source).

Test: `src/routes/fixtures/combobox/combobox.e2e.ts` (`restores the default value on a native form reset`).

### Event handling

Upstream: a consumer handler calls `event.preventBaseUIHandler()` to skip a part's own handling, and the flag travels with the synthetic event as it bubbles, so a chip's handler can also skip the chips area's press handling.

Local: `event.preventDefault()` is the skip signal. The chips area and the input group skip their press handling for a `mousedown` a nested part already prevented.

Test: `src/lib/combobox/ComboboxChips.svelte.spec.ts` (`lets a nested chip onmousedown prevent the built-in focus and open behavior`).

### Focus, fields and positioning

Upstream: with the input outside the popup, the popup's focus manager is modal and counts the internal dismiss buttons as inside through `getInsideElements`. A field-aware element rendered for an input inside the popup reads the field context of the surrounding `Field.Root`.

Local: with the input inside the popup, the trigger is the field's control, so the input gives its subtree the default field context and a field-aware `render` element there does not take the field's name or validity. The positioner does not require `Combobox.Portal`, and a portal's `keepMounted` does not reach the positioner's anchoring.

Test: `src/lib/combobox/ComboboxRoot.form.svelte.spec.ts`, `src/lib/combobox/ComboboxPositioner.svelte.spec.ts`.

### Not covered

`describeConformance` (ref forwarding, render-prop cloning), `store.test.tsx` (React store transactions, ref callbacks during commit and hydration, all through Autocomplete), the Strict Mode, `React.memo` and render-count cases, the `virtualized` and item `index` cases, the Label `captureOwnerStack` cases have no Svelte counterpart here. The Autocomplete cases in the Combobox suites run in `src/lib/autocomplete/AutocompleteRoot.svelte.spec.ts`. The positioner conformance cases that assert `transform` are not ported, because the positioner uses `top` and `left`. Live-region reset delays run on real timers instead of fake ones.

## Autocomplete

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099` (Base UI v1.9.0), `packages/react/src/autocomplete/**`, over the same `AriaCombobox` core as Combobox. The paired fixture runs `@base-ui/react` 1.9.0.

### Public surface

Upstream: `value`/`defaultValue`/`onValueChange` hold the input text, with `open`/`defaultOpen`/`onOpenChange`, `actionsRef`, `inputRef`, `readOnly`, the `Autocomplete.Item` `index` prop, a `ReactNode` or function `Autocomplete.Value` child, the item type taken from the `ItemValue` type argument, and the `*DataAttributes` namespaces of each part.

Local: `value` and `open` are `$bindable`, and `defaultValue` stays because the autocomplete is a form control. There is no `defaultOpen`: `open` without `bind:` is the initial state. `actionsRef` is the root's exported `close()` and `unmount()`, read through `bind:this`. The root takes `readonly`, the HTML spelling. An `Autocomplete.Value` `children` snippet receives the input text in place of the children function. The root infers the item type from `items`, flat or grouped, so `itemToStringValue` and `onItemHighlighted` take the item without a type argument. `inputRef`, the item `index` prop and the data-attribute namespaces are not ported, as in Combobox. The parts Autocomplete shares with Combobox are the Combobox components, so their props are documented with Combobox types.

Test: `src/lib/autocomplete/types.test-d.ts`, `src/lib/autocomplete/AutocompleteValue.svelte.spec.ts`.

### Native reset and form sources

Upstream: a native reset keeps the typed text, because React state does not follow the browser's reset of the input. See [Form reset](#form-reset).

Local: a native reset restores `defaultValue` and calls no `onValueChange`. The input carries the name and the default as its `value` attribute, so a form source that reads the form after a reset sees the default. Inside a `Field.Root` bound to a form source, the autocomplete is kind `text`, per [Composite controls bound to a form source](#composite-controls-bound-to-a-form-source).

Test: `src/routes/fixtures/autocomplete/autocomplete.e2e.ts` (`restores the default text on a native form reset`), the `bound Autocomplete` cases of `src/lib/field/bound-control.svelte.spec.ts`.

### Server rendering names one input

Upstream: the root starts with the input owning the form value, and a popup input takes the name once it mounts.

Local: the server renders no popup input, so until the client hydrates, the rendered input owns the value and the server HTML names one control at most. After hydration a popup input hands the name to the hidden input until it mounts.

Test: `src/lib/autocomplete/ssr.spec.ts`, `src/routes/fixtures/autocomplete/autocomplete.e2e.ts` (`svelte SSR renders the input with the name and default text`).

### Fixes in the shared core

The Autocomplete port corrected four behaviors of `AriaCombobox` that Combobox shares. With no selection the input text always counts as provided, as upstream Autocomplete always passes `inputValue`, so a popup input does not clear it on mount. The popup listens for `focusin`, because React's `onFocus` bubbles, so focus moving into the list returns to the input. `submitOnItemClick` submits only when the form has `requestSubmit`. An input that owns the form value carries its default for a native reset.

Test: `src/lib/autocomplete/AutocompleteRoot.svelte.spec.ts`, `src/lib/autocomplete/AutocompleteRoot.form.svelte.spec.ts`.

### Event types

Upstream: a `keyboard` highlight reason carries a `KeyboardEvent`.

Local: it carries an `Event`, as the shared `BaseUIHighlightEventDetails` types it.

Test: `src/lib/autocomplete/types.test-d.ts`.

### Not covered

`describeConformance` (ref forwarding, render-prop cloning), the `React.startTransition` unmount case, and the `store.test.tsx` cases that observe React store transactions, `useStore` re-reads and ref callbacks during commit have no Svelte counterpart here. Upstream's click-open highlight case fires a click that neither focuses nor opens, so the local case asserts the highlight after a real click. The validation-ref case runs without its Switch, because each control registers its own input. The `onChange` and `onBlur` validation cases that upstream skips in a browser run here.

## Not ported yet

Behavior each ported component does not cover yet. Overlay foundation is internal and has no public component.

Checkbox, Switch, Radio, RadioGroup, NumberField, Slider and OTPField take no `inputRef`. Given a `name`, each renders its native `<input>` elements in the DOM under that name (Radio items take the RadioGroup's), so reach them through the form with `form.elements.namedItem(name)`. That returns a `RadioNodeList` when several inputs share the name, as with radios, range thumbs or an `uncheckedValue`.

| Component          | Not ported yet                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Accordion          | React.Activity animation resume, refs, roving focus (`orientation`, `loopFocus`)                       |
| Button             | Composite and Toolbar integration                                                                      |
| CheckboxGroup      | Disabled or other-form values filtered out of the Field value                                          |
| Collapsible        | React.Activity animation resume, refs                                                                  |
| Fieldset           | Checkbox, CheckboxGroup, RadioGroup and Slider disabled integration                                    |
| Field              | refs                                                                                                   |
| Input              | refs                                                                                                   |
| Toggle             | Toolbar integration, `nativeButton={false}`                                                            |
| ToggleGroup        | Toolbar integration, grid composite, scroll-into-view                                                  |
| Separator          | React render-element cloning, `ref`, Menu/Select/Toolbar separators                                    |
| Meter              | React `ref`, numeric production error codes                                                            |
| Progress           | refs                                                                                                   |
| Form               | Fieldset Form-spec cases; `actionsRef`                                                                 |
| RadioGroup         | scroll-into-view, text-field arrow exceptions                                                          |
| Tabs               | `renderBeforeHydration` script (accepted, ignored), scroll-into-view, shadow-boundary offsets, refs    |
| Toolbar            | Input, Separator, text-field arrow exceptions, scroll-into-view, ToggleGroup nesting, overlay triggers |
| NumberField        | refs                                                                                                   |
| ScrollArea         | refs                                                                                                   |
| Slider             | refs, keeping the prehydration script body out of client bundles                                       |
| DirectionProvider  | CSS `direction` on an element, without `DirectionProvider`                                             |
| OTPField           | refs, React controlled lock                                                                            |
| CSPProvider        | Select renders no inline style. Tabs.Indicator renders no prehydration script                          |
| Overlay foundation | Internal only. No public component                                                                     |
| Popover            | `actionsRef`, Menu and Combobox nesting, shadow-root outside press, refs                               |
| Dialog             | ref objects                                                                                            |
| AlertDialog        | ref objects, the `*DataAttributes` and `*CssVariables` namespaces                                      |
| Tooltip            | refs                                                                                                   |
| PreviewCard        | `defaultOpen`, `defaultTriggerId`, `actionsRef`, data-attribute and CSS-variable namespaces, refs      |
| NavigationMenu     | `defaultValue`, `actionsRef`, data-attribute and CSS-variable namespaces, refs                         |
| Drawer             | ref objects, the `*CssVars` and `*DataAttributes` namespaces                                           |
| Menu               | `actionsRef`, refs                                                                                     |
| Menubar            | the `MenubarDataAttributes` namespace, refs                                                            |
| ContextMenu        | `actionsRef`, the `*DataAttributes` and `*CssVariables` namespaces, refs                               |
| Toast              | refs, `className` and `style` callbacks                                                                |
| Select             | `inputRef`, `ReactNode` labels and placeholder                                                         |
| Combobox           | `inputRef`, `virtualized`, Item `index`, `ReactNode` labels and placeholder                            |
| Autocomplete       | `inputRef`, Item `index`, `ReactNode` value children, data-attribute namespaces                        |

## Shared floating internals

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx` and `hooks/useDismiss.ts`. Each popup root creates its own `FloatingTree`. A press or a focus change inside a portaled descendant counts as inside a popup through `insideReactTree`, which React sets because portal events bubble through the React tree.

Local: nested popups share one floating tree, and the DOM has no React tree. `DismissInteraction` counts a press inside a tree child's portal, which holds that child's internal backdrop, as inside the parent. `FloatingFocusManager` treats focus that leaves a portaled popup without an outside press as staying inside, as upstream's `markInsideReactTree` does.

Every `ContextMenu.Root` starts a fresh tree, as upstream does, so the tree no longer links a context menu to the popup it is rendered in. Component nesting links them instead. `setFloatingPopupScope(store)` runs in the component that renders a popup's content: `FloatingFocusManager`, `PreviewCard.Popup`, `Tooltip.Popup` and `NavigationMenu.Content`. Each `FloatingPortal` inside that content adds its host to `store.nestedPortals` and to those of the enclosing popups, whatever its `container`. `DismissInteraction` marks a press inside one of those hosts as inside, and `FloatingFocusManager` keeps the popup open when focus moves into one. A portal rendered beside the popup, such as a tooltip next to `Popover.Positioner` in `Popover.Portal`, is outside it, as upstream. Because a context menu now has its own tree, a hover-opened Popover, PreviewCard or NavigationMenu treats the pointer leaving into a context menu rendered in its content as leaving, as upstream does. On a shared tree it counted as moving into a child.

Test: `packages/floating-ui-svelte/src/hooks/useDismiss.svelte.spec.ts`, `packages/floating-ui-svelte/src/components/FloatingFocusManager.svelte.spec.ts`, `src/lib/internal/overlay-audit.svelte.spec.ts` (`closes only the inner modal popover on an outside touch tap`), `src/lib/context-menu/ContextMenu.svelte.spec.ts` (`keeps both context menus open on a press inside the portaled inner popup` and the `inside an open` cases), `src/lib/popover/Popover.svelte.spec.ts` (`keeps the popover open on a press in a tooltip rendered in its popup`), `src/lib/tooltip/TooltipRoot.svelte.spec.ts` (`keeps the tooltip open on a press inside the popover`), `src/lib/context-menu/ContextMenu.svelte.spec.ts` (`closes a context menu opened from an item without closing the outer one`) and the `nested` case in `src/routes/fixtures/context-menu/context-menu.e2e.ts`.

`setFloatingTree({ fresh: true })` starts a new tree instead of joining the enclosing one, as upstream `<FloatingTree>` does. The nested root still records the enclosing node as its parent, as upstream's node context does.

Test: `packages/floating-ui-svelte/src/components/FloatingTree.svelte.spec.ts` (`starts a fresh tree instead of joining the enclosing one`).

`FloatingFocusManager` waits one task before a focus-out close when focus moves from a nested popup's trigger into an open ancestor popup without a keyboard press or an outside press. It then closes with `focus-out` if the popup is still open. A Menu pointer highlight moves focus from a submenu trigger to a sibling item on pointer enter, and the same move's mousemove closes the submenu with `sibling-open`. Upstream renders that highlight after the input events, so the `sibling-open` close lands first there.

Test: `src/lib/menu/MenuRoot.triggerless.svelte.spec.ts` (`closes a sibling submenu without closing the root on click`) and `src/lib/popover/Popover.svelte.spec.ts` (`closes the inner popover when focus moves from its trigger to another control of the outer popup`).

### Return focus skips an opening sibling

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx`. The cleanup that runs when the popup unmounts returns focus in a microtask. With a boolean `returnFocus`, it returns only when focus is in the popup, its inside elements or a child popup, on the body, or already on the return target. An explicit element or function always returns.

Local: `FloatingFocusManager` skips that return while another popup with the same parent node in the floating tree is open and a focus into the sibling popup is still queued (its initial focus or the item its list navigation focuses), such as the next menubar menu after a press switches menus. That focus lands a frame after the popup opens, and a return to the closed popup's trigger would take focus from it first. A menubar trigger that takes that focus reopens its menu. Once the queued focus has run, or a focus request outside the sibling popup has replaced it, the return goes ahead as upstream's does. Closing a nested dialog that another open nested dialog opened returns focus to the control that opened it.

Test: `src/lib/menubar/Menubar.svelte.spec.ts` (`updates scroll lock when handing off between top-level touch-opened menus`, `keeps the next menu open when a virtual pointer press hands off between top-level menus` and `keeps the next menu open when a touch press hands off from a keyboard-opened menu`) and `src/lib/dialog/Dialog.svelte.spec.ts` (`returns focus into an open sibling nested dialog when the dialog it opened closes`).

### Queued list focus after close

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/floating-ui-react/hooks/useListNavigation.ts`. `focusItem` calls `enqueueFocus(item, { sync, preventScroll: true })` with no `shouldFocus`. A deferred item focus runs on the next frame even when the popup has closed in between.

Local: the queued focus passes `shouldFocus: () => store.isOpen()`. A Tab or Escape that closes the popup before the frame drops the focus, so it does not land on an item of a closed popup that stays mounted.

Test: `src/tests/list-navigation/useListNavigation.svelte.spec.ts` (`drops a queued item focus when the list closes before it lands`).

### Elements inside the focus manager

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx`. `getInsideElements` lists elements outside the popup that count as inside it. A typeable `role="combobox"` reference with `initialFocus={false}` leaves focus untrapped: a modal popup renders no focus guards, does not stop Tab, closes on focus out, and keeps the reference exposed while it hides outside content. Each popup takes its tabbables from the floating focus element, so the guards of a manager inside a positioner are not among them. An untrapped combobox reference of an ancestor popup also stays exposed.

Local: `FloatingFocusManager` takes `getInsideElements` for focus out, return focus and `aria-hidden`, and has the untrapped combobox mode and the tabbables of upstream. A press on an inside element is still tracked as an outside press, because focus out already counts that element as inside. The reference of an ancestor combobox popup is not kept exposed, so a modal popup nested in an untrapped combobox popup hides that combobox's input. `PopoverPopup` does not pass `getInsideElements` and still counts every Base UI focus guard as inside, as described under Popover.

Test: `packages/floating-ui-svelte/src/components/FloatingFocusManager.focusModes.svelte.spec.ts`.
