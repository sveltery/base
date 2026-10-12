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

Local: `PopoverViewport` removes `name` from every copied control before the previous pane is inserted. The clone is not in the radio group, so it does not clear the live control. The current pane is a new element. It starts from that trigger's own state. Values typed or checked on trigger A are not written into trigger B. State the content keeps for a trigger is still there when that trigger is shown again.

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

Local: Tab from the open trigger focuses the first control inside the popup and leaves it open. A popup with no tabbable control closes onto the next control instead. A hover open leaves that Tab on the trigger's trailing guard. Tab forward from inside the popup still closes onto the control after the trigger. Shift+Tab from the trigger that opened the popup still closes onto the control before the trigger. Shift+Tab from the trigger of a popup opened through `open` focuses the previous control and leaves the popup open. Main does the same. React closes a popover there because `useImplicitActiveTrigger` makes the popup's only trigger its active trigger, even when something else opened it, and leaves a dialog open. A focus-out close does not return focus, including when `finalFocus` is `null`, an element, or a function. The function is not called. React calls that function and ignores the result. React fires the focus-out callback twice on Shift+Tab from the trigger; the port fires it once.

## Dialog

Source: `packages/react/src/dialog`. Upstream shares `PopupHandle` and `COMPOSITE_KEYS`; they live in `src/lib/internal/popups/popupHandle.svelte.ts` and `src/lib/internal/composite-keys.ts`. Portal, focus, dismiss, scroll lock, `mergeProps`, and the popup store are the landed overlay foundation. How the dialog opened is `PopupStore.openMethod`. Final focus uses the shared `returnFocus` callback: it receives how the popup closed. `finalFocus={null}` does not return focus. A function that returns `null` focuses the trigger. `openWithPayload` stays on `Dialog.Handle`. Popover does not have it.

### Payload is stored only for a registered trigger

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/dialog/store/DialogHandle.ts` and `packages/react/src/utils/popups/popupStoreUtils.ts`.

Upstream: a trigger's `payload` prop is forwarded when that trigger registers. `Dialog.Handle` has `openWithPayload` and no payload map, `setPayload`, or `forgetPayload`. `open(id)` with an unknown id warns and still opens. It does not throw.

Local: `Dialog.Handle.setPayload` writes into a private map, and only when that id is already registered. An unknown id is rejected and nothing is stored. The payload is not a field on the trigger registration. `open(id)` still warns (the warning names `Dialog.Handle`) and does not replace the displayed payload. `openWithPayload` is unchanged.

Test: `src/lib/dialog/Dialog.svelte.spec.ts` (`does not store a payload for a trigger that is not registered`, `keeps the current payload when opened with an unknown trigger id`).

| Upstream                                                             | Local                                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `open` / `defaultOpen`, `triggerId` / `defaultTriggerId`             | `$bindable` `open` / `triggerId`. A one-way value sets the initial state                    |
| `actionsRef`                                                         | `bind:this` on `Dialog.Root` (`close` and `unmount`)                                        |
| `initialFocus` / `finalFocus` ref objects                            | element or function, called when focus moves                                                |
| `children` render function `{ payload }`                             | snippet argument `{ payload }`                                                              |
| React `useButton`                                                    | existing `Button`                                                                           |
| `useDismiss` outside press, including separate mouse and touch modes | the same modes on `useDismiss`. A press is inside the floating element, not the portal host |

Not ported: Alert Dialog, Drawer, and ref objects. Mouse and touch use separate outside-press modes on `useDismiss`. A backdrop is `intentional` for both. Without one, touch is `sloppy` and mouse is `sloppy` only for `trap-focus`. A tap closes on the browser's mousedown. A short move closes on touchend. A scroll-away closes during the move. After 1s with the finger still down, touchend and that mousedown do not close. An intentional touch waits for the click. One lifted touch is required. A press is inside when the target is in the floating element or an open floating-tree child. The portal host is not inside. An initial `triggerId` selects the trigger for `aria-expanded`.

### Timers clear when the owner is destroyed

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/utils/src/useTimeout.ts` and `packages/utils/src/useAnimationFrame.ts`. `useTimeout` / `useAnimationFrame` dispose on unmount.

Local: `useTimeout()` and `useAnimationFrame()` in `src/lib/internal/timeout.svelte.ts`. Each call creates one `Timeout` or `AnimationFrame` and registers `$effect(() => () => clear())` during component init. There is no ref. A timer created outside init, such as the shared scroll-lock locker, is not tied to a component; its owner still clears it. `new Timeout()`, `Timeout.create()`, `new AnimationFrame()`, and `AnimationFrame.create()` stay in `timeout.ts`.

Test: `src/lib/internal/overlay-foundation.svelte.spec.ts` (`does not open when the trigger unmounts during touchOpenDelay`).

## Internal backdrop

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/utils/InternalBackdrop.tsx`. Upstream reads `cutout.getBoundingClientRect()` while rendering, so any render after the cutout moves refreshes the clip.

Local: `src/lib/internal/InternalBackdrop.svelte` writes that rect into `$state` from a `ResizeObserver` on the cutout and a capture-phase `scroll` listener on the owner window. The scroll listener reads the rect synchronously. A position-only move, with no resize and no scroll, is still not tracked.

Test: `src/lib/internal/InternalBackdrop.svelte.spec.ts` (`updates the cutout when the element resizes`, `updates the cutout when an ancestor scrolls after the first observer callback`, `disconnects the cutout observer and scroll listener when the backdrop unmounts`).

## Not ported yet

Behavior each ported component does not cover yet. Overlay foundation is internal and has no public component.

| Component          | Not ported yet                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Accordion          | React.Activity animation resume, refs, roving focus (`orientation`, `loopFocus`)                       |
| Button             | Composite and Toolbar integration                                                                      |
| Checkbox           | Field, `inputRef`                                                                                      |
| CheckboxGroup      | Field validation, filled/dirty/touched hooks, labelable descriptions, fieldset disabled                |
| Collapsible        | React.Activity animation resume, refs                                                                  |
| Fieldset           | Checkbox, CheckboxGroup, RadioGroup and Slider disabled integration                                    |
| Field              | Checkbox, Radio, and Select integration; refs                                                          |
| Input              | refs                                                                                                   |
| Toggle             | Toolbar integration, `nativeButton={false}`                                                            |
| ToggleGroup        | Toolbar integration, grid composite, scroll-into-view                                                  |
| Avatar             | Enter/exit transitions and animation completion                                                        |
| Separator          | React render-element cloning, `ref`, Menu/Select/Toolbar separators                                    |
| Meter              | React `ref`, numeric production error codes                                                            |
| Progress           | refs                                                                                                   |
| Form               | Checkbox, Switch, and Fieldset Form-spec cases; `actionsRef`                                           |
| Switch             | Field and Form integration, `inputRef`                                                                 |
| Radio              | Field, `inputRef`                                                                                      |
| RadioGroup         | `data-touched`, `inputRef`, scroll-into-view, text-field arrow exceptions                              |
| Tabs               | Pre-hydration indicator script, scroll-into-view, shadow-boundary offsets, refs                        |
| Toolbar            | Input, Separator, text-field arrow exceptions, scroll-into-view, ToggleGroup nesting, overlay triggers |
| NumberField        | refs, `inputRef`                                                                                       |
| ScrollArea         | refs                                                                                                   |
| Slider             | refs, `inputRef`                                                                                       |
| DirectionProvider  | CSS `direction` on an element, without `DirectionProvider`                                             |
| OTPField           | refs, `inputRef`, React controlled lock                                                                |
| CSPProvider        | Select and Tabs render no inline style or prehydration script. Slider script has no CSP nonce          |
| Overlay foundation | Internal only. No public component                                                                     |
| Popover            | `actionsRef`, Menu and Combobox nesting, shadow-root outside press, refs                               |
| Dialog             | Alert Dialog, Drawer, ref objects                                                                      |
