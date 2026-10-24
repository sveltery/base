# Upstream differences

Intentional differences from Base UI v1.9.0 (`ad7ecda5296b0295b41a51ecb01fce6204acd099`). Each component section is owned by the pull request that ports that component. Each entry's Pin line names the upstream commit it was last checked against.

The parts that Sveltery UI needs and Base UI does not have follow their own upstream: cmdk, react-day-picker, react-resizable-panels, input-otp or `@shadcn/react`. Hugo Hsi, the owner, signed off on 2026-10-24 on Base holding these parts and on any deviation from Base UI that Sveltery UI needs. Each one's section lists its differences from its own upstream, and its Pin line names that upstream's version and commit. [AGENTS.md](../AGENTS.md#headless-parts-for-sveltery-ui) lists the parts.

## Merge props

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/merge-props/mergeProps.ts`. `@base-ui/react` and `@base-ui/react/merge-props` export `mergeProps`, `mergePropsN`, `makeEventPreventable`, and `mergeClassNames`. The rightmost bag wins plain props. Its event handler runs first. `event.preventBaseUIHandler()` skips the handlers to its left. `preventDefault()` does not. `className` is concatenated with the rightmost class first. `style` is a React style object, and the rightmost property wins. A function argument receives the props merged so far and replaces them. Handlers that function returns are not wrapped. `ref` is not merged.

Local: `src/lib/internal/mergeProps.ts`. `@sveltery/base` and `@sveltery/base/merge-props` export `mergeProps`, `mergePropsN`, and the `PropsGetter` type of a function bag. `makeEventPreventable` is not needed, because `preventDefault()` is the skip signal. `mergeClassNames` is not exported, because `class` values merge as arrays. The same order. `event.preventDefault()` is the skip signal: when a handler calls it, the handlers to its left do not run. This holds for an event that is not cancelable, such as a typed `input`, where `defaultPrevented` stays false. There is no `preventBaseUIHandler`. Parts that call the consumer handler themselves use the same signal, so every part skips on `preventDefault()`. Two parts keep bookkeeping that a skip would break. NumberField.ScrubArea records a native click even when the consumer's `onclickcapture` prevents it, so a `preventDefault()` there does not make the scrub area send a second click. OTPField.Input ends the composition even when the consumer's `oncompositionend` prevents it, and skips only the commit, so the slot does not keep buffering every later input. Upstream skips both on `preventBaseUIHandler()`, which a consumer does not call to cancel a default. The check reads the event's shape (`type` and `preventDefault`), so an event from an iframe skips too. The prop is `class`, a Svelte class value (string, object, or array), merged as an array with the rightmost bag first. `style` is a CSS string, and the rightmost declaration wins for the same property. A style object is ignored. Handler names are Svelte's lowercase names, such as `onclick`. `onClick` is a plain prop. Attachment symbols are all kept, in bag order. There is no ref. `chain` and `mergeClass` are the same helper. Call sites pass the consumer bag last.

Test: `src/lib/internal/mergeProps.spec.ts`. `src/lib/internal/prevented-handlers.svelte.spec.ts`. `scripts/check-handler-prevention.mjs` (run by `pnpm lint`) lists every part handler that calls the consumer handler and fails when one runs its own code without the skip. `src/lib/merge-props/merge-props.spec.ts`. `src/lib/popover/Popover.svelte.spec.ts` (`skips the toggle when an iframe event calls preventDefault`).

## Public helpers and types

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/use-render/useRender.ts`, `packages/react/src/unstable-use-media-query/index.ts`, `packages/react/src/types/index.ts`, `packages/react/src/utils/resolveClassName.ts`, and `packages/react/src/utils/resolveStyle.ts`. `useRender` builds a custom part from a `render` prop, state attributes, and merged refs. `unstable_useMediaQuery` subscribes to `matchMedia`. The `types` entry exports `BaseUIChangeEventDetails`, `BaseUIGenericEventDetails`, `BaseUIEvent`, `HTMLProps`, and `ComponentRenderFn`. Every part accepts `className` and `style` as a function of its state.

Local:

- `useRender` has no counterpart. A custom part is a Svelte component that spreads `mergeProps(...)` onto its element and takes a `render` snippet.
- `unstable_useMediaQuery` has no counterpart. Use `MediaQuery` from `svelte/reactivity`: `new MediaQuery('(min-width: 600px)').current` is reactive and returns the fallback on the server.
- `@sveltery/base` and `@sveltery/base/types` export the types `BaseUIChangeEventDetails`, `BaseUIGenericEventDetails` and `RenderSnippet`. `RenderSnippet<Element, State>` is the type of a part's `render` snippet, which receives the props to spread, the part's state and its children. `BaseUIEvent` is not exported, because there is no `preventBaseUIHandler`. `HTMLProps` and `ComponentRenderFn` are React types. Svelte parts use `HTMLAttributes` from `svelte/elements` and `Snippet`.
- `class` and `style` do not accept a function of state. `class` takes a Svelte class value and `style` takes a CSS string. Style state through the part's `data-*` attributes, such as `[data-disabled]`, or read the state that a `render` snippet receives as its second argument.

Test: `src/lib/merge-props/merge-props.spec.ts`.

## Props

Upstream pairs each stateful prop with a `default*` prop and switches between controlled and uncontrolled mode at mount.

Local: each stateful prop is one `$bindable` prop, and each `default*` prop upstream has is there beside it. `bind:x` shares it, a one-way value sets it until the parent changes it, and `bind:x={get, set}` lets the parent reject a change. Change callbacks run in the event handler, before the value is written, and `eventDetails.cancel()` stops the write. A parent write calls a change callback only when Tabs has to move off a disabled or removed tab.

- A `default*` prop is the value an empty binding starts from, as on an HTML input. It is read once, at mount. A stateful prop that is set, bound or one-way, wins over it, except on the six parts below that keep a fallback.
- On the form controls (Field.Control and Input, Checkbox, CheckboxGroup, Switch, RadioGroup, Slider, NumberField, OTPField, Select, Combobox and Autocomplete), `defaultValue` and `defaultChecked` are also the value a native form reset restores.
- A `pressed`, `value`, `open` or `triggerId` passed without `bind:` also sets the initial state, and holds until the parent changes it.
- `Menu.CheckboxItem` `checked`, `Menu.FilterProvider` `value`, `NavigationMenu.Root` `value`, and `open` on `Select.Root`, `Combobox.Root` and `Autocomplete.Root` keep their Svelte prop fallback (`false`, `''` or `null`). This follows from how Svelte props work, not React's controlled mode. Svelte cannot tell an omitted prop from one passed as its fallback, so the `default*` prop replaces a value equal to the fallback, and `checked={false}` beside `defaultChecked` starts ticked. React treats a passed `false` as controlled and keeps it. Without the fallback, Svelte 5 resets a locally changed prop to `undefined` when the parent spreads its props again, which would drop a typed filter query or a ticked item.
- Tabs moves the selection to the first enabled tab when the selected tab is disabled or removed, whether or not the parent passed `value`. Upstream keeps a controlled value. A value passed at mount does not get the `initial` notice, and a tab it names stays selected while that tab is disabled or not yet rendered, until it has named an enabled tab once. Upstream holds only a disabled `defaultValue` tab.
- A canceled `Field.Control` change puts the input back to the held value. Upstream keeps the typed text in an uncontrolled input.
- `readonly`, `autocomplete` and `inputmode` use the HTML spelling. State keys such as `readOnly` keep upstream's camelCase.

Test: `src/tests/controllable-root-cases.ts`, `src/tests/default-props.svelte.spec.ts`, `src/lib/tabs/Tabs.svelte.spec.ts` (`moves a passed value to the first enabled tab when its tab becomes disabled`).

## Button behavior

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/internals/use-button/useButton.ts` and `packages/react/src/utils/useFocusableWhenDisabled.ts`. `useButton` infers composite mode from a `CompositeRootContext`. In development it logs an error once after mount, and again when `nativeButton` changes, if the host tag does not match `nativeButton`. The message ends with React's owner stack. A disabled composite button that renders another button clears that inner button's `disabled` property.

Local: `ButtonBehavior` in `src/lib/internal/button.svelte.ts` serves Button, Toolbar.Button, Toggle, the Collapsible and Accordion triggers, Tabs.Tab, the NumberField steppers, and the Dialog and Popover triggers and close buttons. Each part passes `composite` itself. A disabled Tabs.Tab blocks only Enter and Space, so the arrow keys still reach the roving handler. The host check runs in an attachment, so it runs when the host attaches and when `nativeButton` changes. It uses the same messages with "the `render` snippet" in place of "the `render` prop", and no owner stack.

Test: `src/lib/internal/button.spec.ts`. `src/lib/button/Button.svelte.spec.ts` (`nativeButton mismatch`).

## Portal

### Host attributes and attachments

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/react/src/floating-ui-react/components/FloatingPortal.tsx`. `useRenderElement` merges `[{ id, 'data-base-ui-portal': '' }, elementProps]`. Later props overwrite, so a consumer `data-base-ui-portal` replaces the marker. `mergeProps` assigns a later `data-base-ui-portal={undefined}` over that `''`, and React omits the attribute, so the marker is removed. `className` and `style` are merged after that list. `createPortal` inserts the div into its container before refs run. The ref list is the consumer ref, then the internal node ref, so the consumer ref sees the node already in that container.

Local: `Dialog.Portal` and `Popover.Portal` set `data-base-ui-portal=""`, then spread consumer host attributes onto the portal `div`, so a consumer value replaces the marker, as upstream. `class`, other attributes, and a consumer `{@attach}` reach that div. The mount attachment runs before that `{@attach}`, so the consumer sees the node in its container. There is no ref object. A `store` key in the consumer props does not replace the dialog or popover store.

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

Local: Tab from the open trigger focuses the first control inside the popup and leaves it open. A popup with no tabbable control closes onto the next control instead. A hover open leaves that Tab on the trigger's trailing guard. Tab forward from inside the popup still closes onto the control after the trigger. Shift+Tab from the trigger that opened the popup still closes onto the control before the trigger. A popup opened through `open` claims its only trigger, as upstream `useImplicitActiveTrigger` does, so Shift+Tab from that trigger closes a popover and leaves a dialog open, as React does. A focus-out close does not return focus, including when `finalFocus` is `null`, an element, or a function. The function is still called, and its result is ignored, as React does. React fires the focus-out callback twice on Shift+Tab from the trigger; the port fires it once. The port's focus manager does not merge its leading guard with `beforeContentFocusGuardRef`. PopoverPopup does not pass `getInsideElements`. The trigger registers its leading guard on the store, and the focus manager counts it as inside with the trigger's trailing guard and the portal's outside guards. A guard of another popup is outside, so tabbing out of a popover closes a combobox open inside it.

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
| `open` / `defaultOpen`, `triggerId` / `defaultTriggerId`             | `$bindable` `open` / `triggerId`, and the same `defaultOpen` / `defaultTriggerId`                   |
| `actionsRef`                                                         | `bind:this` on `Dialog.Root` (`close` and `unmount`)                                                |
| `initialFocus` / `finalFocus` ref objects                            | element or function, called on open and close                                                       |
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

Local: `AlertDialog.Root` calls the same `createDialogRoot` setup as `Dialog.Root` (`src/lib/dialog/root.svelte.ts`) with those three values. It takes `bind:open`, `bind:triggerId`, `onOpenChange`, `onOpenChangeComplete`, `handle`, and the `children` snippet, and has no `modal` or `disablePointerDismissal` prop. `bind:this` gives `close()` and `unmount()` in place of `actionsRef`. The other parts are the Dialog components, and their prop types are exported under `AlertDialog*` names. `AlertDialog.Trigger` renders `Dialog.Trigger` and takes an `AlertDialogHandle`, so a `Dialog.Handle` does not type-check on an alert dialog. Handle warnings name `Dialog.Handle`, as upstream's reused `DialogHandle` does.

Test: `src/lib/alert-dialog/AlertDialog.svelte.spec.ts`, `src/lib/alert-dialog/ssr.spec.ts`, `src/routes/fixtures/alert-dialog/alert-dialog.e2e.ts`.

### Timers clear when the owner is destroyed

Pin: `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/utils/src/useTimeout.ts` and `packages/utils/src/useAnimationFrame.ts`. `useTimeout` / `useAnimationFrame` dispose on unmount.

Local: `ScopedTimeout`, `ScopedInterval` and `ScopedAnimationFrame` in `packages/utils/src/timeout.svelte.ts`. Each subclasses the plain timer and registers `$effect(() => () => clear())` in its constructor, so it is constructed during component init. There is no ref. A timer that no component owns, such as the shared scroll-lock locker, is a plain `Timeout` or `AnimationFrame` that its owner clears.

Test: `src/lib/internal/overlay-foundation.svelte.spec.ts` (`does not open when the trigger unmounts during touchOpenDelay`).

## Drawer

Source: Base UI v1.9.0 (`ad7ecda5296b0295b41a51ecb01fce6204acd099`), `packages/react/src/drawer`. Upstream `Drawer.Root` runs the Dialog root setup and adds swipe, snap point, and nested-drawer state. Portal, Title, Description, and Close are the Dialog parts. The swipe gesture is `packages/react/src/utils/useSwipeDismiss.ts`.

Local: `Drawer.Root` calls the same `createDialogRoot` setup as `Dialog.Root` with `drawer: true`, so an open drawer counts toward its parent's `nestedOpenDrawerCount` as well as the nested dialog count. `DrawerRootState` (`src/lib/drawer/root.svelte.ts`) holds the swipe and snap point state. The gesture is `src/lib/internal/useSwipeDismiss.svelte.ts`. Toast's swipe handling is a separate port and may later share it. `open`, `triggerId`, and `snapPoint` are `$bindable`. `bind:this` gives `close()` and `unmount()` in place of `actionsRef`.

- `snapPoint` cannot be told apart as controlled or uncontrolled. A value outside `snapPoints` resolves to the closest snap point, or to closed when it does not parse, which is upstream's controlled behavior. `defaultSnapPoint` stays as a prop, because a drawer returns to it when it closes.
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

Local: the same registration, through `attachFieldControl`, `Field`'s `registerInput` and the `LabelableId` and `AriaLabelledBy` classes in `src/lib/internal/labelable-provider.svelte.ts`. RadioGroup claims the label with `id: null` the way CheckboxGroup does, and a radio leaves the control id to its group unless a `Field.Item` gives it its own scope. Radios therefore keep distinct ids, the group is named by `aria-labelledby`, and a `Field.Item` label still points `for` at its radio.

Test: `src/lib/field/choice-controls.svelte.spec.ts`.

### Checkbox, Switch, Radio and their groups render real inputs

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/checkbox/root/CheckboxRoot.tsx`, `switch/root/SwitchRoot.tsx`, `checkbox-group/CheckboxGroup.tsx`, `radio/root/RadioRoot.tsx` and `radio-group/RadioGroup.tsx`. Checkbox, Switch and Radio render a `<span role="checkbox">`, `<span role="switch">` or `<span role="radio">` host, or a `<button>` with `nativeButton`, and a visually hidden `<input>` beside it. Rest props and handlers go to the host. `onCheckedChange` and the groups' `onValueChange` are cancelable callbacks. Enter toggles a Switch. CheckboxGroup renders a `<div role="group">` and RadioGroup a `<div role="radiogroup">`. A Radio without a group selects only when its `value` is the empty string.

Local, signed off by the owner (2026-10-21):

- Checkbox and Switch render a `<span>` box with a real `<input type="checkbox">` laid over it at `opacity: 0`. The Switch input carries `role="switch"`. The box carries `position: relative` inline so the input covers it, and the input sits at `z-index: 1`, above the box's own pseudo-elements. A click on the box outside the input, such as on an enlarged `::after` hit area, activates the input unless a `<label>` wraps the box. A caller's `aria-invalid` wins over the Field's. Native attributes, handlers and attachments go to the input. `class` and `style` go to the box, and `host` passes other attributes to it. A `render` snippet draws the box, and its `children` include the input.
- The input is the focus target, so a sibling `<label for>` works, the browser handles Space, and focus styles use `:has(:focus-visible)` on the box. Enter submits the form and does not toggle a Switch, as on a native checkbox.
- `onCheckedChange`, CheckboxGroup's `onValueChange` and `nativeButton` are removed. Use `bind:checked`, `bind:value`, or the native `input` and `change` events. To stop a change, call `preventDefault()` in `onclick`.
- A box with no `value` submits `on`, as a native checkbox does.
- CheckboxGroup renders a `<fieldset>`, so a `Fieldset.Legend` inside names it and `disabled` disables every box natively. `name` names every child checkbox in a plain form.
- A parent checkbox toggles each child input first, so the children's `change` events fire before the parent's.

- Radio renders the same `<span>` box over a real `<input type="radio">`. It takes `checked`, `defaultChecked` and `name`, and `value` is optional. A Radio without a group follows its own `checked` state, as a native radio does. Inside a group, `checked` or `defaultChecked` selects the radio's value when it mounts.
- RadioGroup renders a `<fieldset role="radiogroup">`, so a `Fieldset.Legend` inside names it and `disabled` disables every radio natively. Its `onValueChange` and Radio's `nativeButton` are removed. Use `bind:value` or the native `input` and `change` events, and call `preventDefault()` in a Radio's `onclick` to stop a change.
- The radios of a group share one `name`: the Field's, the group's own `name`, or a generated one when neither is set. A Radio's own `name` wins. In a remote `Form`, a Radio with a `value` takes the name and checked state from `field.as('radio', value)`, and an unnamed group stays unnamed.
- The group keeps its roving focus and arrow-key selection, so arrows follow the text direction and skip disabled radios whether the radios share a name or not. Enter on a radio submits the form, as on a native radio.

Test: `src/lib/checkbox/Checkbox.svelte.spec.ts`, `src/lib/switch/Switch.svelte.spec.ts`, `src/lib/checkbox-group/CheckboxGroup.svelte.spec.ts`, `src/lib/radio/Radio.svelte.spec.ts`, `src/lib/radio-group/RadioGroup.svelte.spec.ts`, `src/lib/radio-group/RadioGroup.form.svelte.spec.ts` and `src/routes/fixtures/checkbox/checkbox.e2e.ts`, `switch/switch.e2e.ts`, `checkbox-group/checkbox-group.e2e.ts`, `radio/radio.e2e.ts` and `radio-group/radio-group.e2e.ts`.

### Slider fills its Field

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/slider/root/SliderRoot.tsx`. Slider never calls the Field's `setFilled`, so a Field around a Slider has no `data-filled`.

Local: Slider marks its Field filled, because a range input always has a value. `Field.Root` and the Slider parts carry `data-filled`.

Test: `src/lib/slider/Slider.svelte.spec.ts` (`marks the Field filled, as a range input always has a value`).

### Select submits through a hidden select

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/select/root/SelectRoot.tsx`. Select renders a hidden `<input>` for one value, or one per value when `multiple`. `name`, `form`, `autocomplete`, `required` and `disabled` are the only native props it takes, and `onValueChange` is a cancelable callback. `Field.Root name` beats the root's own `name`.

Local, signed off by the owner (2026-10-21):

- Select renders one hidden `<select>`, `multiple` when the select is. Every native `<select>` attribute and handler on `Select.Root` goes to it, so `oninput` and `onchange` fire there. It fires `input` and `change` once the new value is selected, so a listener on the form, such as SvelteKit's, reads the new value.
- Its options are the current and default values and the items it knows from `items` or the mounted list, each labelled like the item. The server marks the current options `selected`, so a form submits the value without JavaScript. In the browser the `selected` attribute marks the defaults, which a native reset restores.
- While a single select has no value, its first option is empty, so `required` reports `valueMissing`. The popup needs JavaScript to open, so `required` reaches the hidden select only in the browser.
- Browser autofill selects an option of the hidden select, and Select takes the matching item. It no longer matches typed text against labels: the browser matches the option's value or label.
- `onValueChange` is removed. Use `bind:value` or the native events.
- The root's own `name`, including one from a SvelteKit remote form's `.as('select')` or `.as('select multiple')` spread, beats `Field.Root name`. Inside a remote form, a select with no name binds itself to the field `Field.Root name` resolves. `type?: never` makes a spread of an input kind a type error.

Test: `src/lib/select/select-ssr.spec.ts`, `src/lib/select/SelectRoot.svelte.spec.ts` (`native events`, `browser autofill`) and `src/routes/fixtures/form/remote-controls/remote-controls.e2e.ts`.

### Slider props reach the thumb inputs

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/slider/root/SliderRoot.tsx` and `thumb/SliderThumb.tsx`. Rest props on Slider.Root go to the root element, and on Slider.Thumb to the thumb element. The thumb input takes only `name`, `form`, `min`, `max`, `step`, `disabled` and the value. `onValueChange` is a cancelable callback, and `onValueCommitted` reports the commit. `value` and `defaultValue` are numbers. `Field.Root name` beats the root's own `name`. A range thumb without `index` renders no value on the server.

Local, signed off by the owner (2026-10-21):

- Native input attributes and handlers on Slider.Root go to every thumb's `<input type="range">`, `required` included. Those on Slider.Thumb go to that thumb's input and win over the root's. `class` and `style` go to the element you see, and `host` sends other attributes there. Root `id` and Thumb `id` stay on their elements.
- `onValueChange` and `onValueCommitted` are removed. The thumb input fires `input` while the value moves and `change` when it settles, once the input holds the new value, so a listener on the form, such as SvelteKit's, reads it. Use `bind:value` or those events.
- `value` and `defaultValue` accept a string, as a SvelteKit remote form's `.as('range')` spread carries, and an empty string means no value. So a spread renders on the server.
- A Slider.Thumb takes its own `value`, `defaultValue` and `name`, as a per-index spread such as `.as('range', 0)` on `price[0]` carries. The thumb moves to its `value` whenever it changes, and a form reset returns it to its `defaultValue`.
- Inside a remote form, thumbs with no name bind themselves to the field `Field.Root name` resolves. The root's `value` or `defaultValue` decides the shape: a number binds the field, and an array binds `field[0]`, `field[1]` and so on in render order, with each item's default. A bare slider starts at the value the form holds, so the echo after a failed submit wins over the default.
- The root's own `name`, including one from a spread, beats `Field.Root name`. `type?: 'range'` makes a spread of another input kind a type error.
- A range thumb without `index` takes its render order until it mounts, so the server renders its value.

Test: `src/lib/slider/slider-ssr.spec.ts`, `src/lib/slider/Slider.svelte.spec.ts` (`in a remote form`) and `src/routes/fixtures/form/remote-controls/remote-controls.e2e.ts`.

### NumberField props reach the hidden input

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/number-field/root/NumberFieldRoot.tsx` and `input/NumberFieldInput.tsx`. Rest props on NumberField.Root go to the root element. The hidden input takes only `name`, `form`, `min`, `max`, `step`, `disabled`, `readOnly`, `required` and the value. `onValueChange` is a cancelable callback, and `onValueCommitted` reports the commit. `value` and `defaultValue` are numbers. `Field.Root name` beats the root's own `name`. The visible input carries `readOnly`.

Local, signed off by the owner (2026-10-21):

- Native input attributes and handlers on NumberField.Root go to the hidden `<input type="number">`. `class` and `style` go to the root element, and `host` sends other attributes there.
- `onValueChange` and `onValueCommitted` are removed. The hidden input fires `input` when the value changes and `change` when it is committed, once the input holds the new value, so a listener on the form, such as SvelteKit's, reads it. Use `bind:value` or those events.
- `value` and `defaultValue` accept a string, as a SvelteKit remote form's `.as('number')` spread carries, and an empty string means no value. So a spread renders on the server.
- Inside a remote form, a number field with no name binds itself to the field `Field.Root name` resolves, and starts at the value the form holds.
- The root's own name, including one from a spread, beats `Field.Root name`. `type?: 'number'` makes a spread of another input kind a type error.
- The hidden input gets `required` only in the browser. Without JavaScript nobody can type into the field, so a required empty field would block the submit with no way to fill it.
- The visible input carries `aria-readonly` instead of `readonly`, and reverts typing while read-only, so it stays in constraint validation.

Test: `src/lib/number-field/number-field-ssr.spec.ts`, `src/lib/number-field/NumberField.svelte.spec.ts` (`in a remote form`, `reverts typing in a read-only input`) and `src/routes/fixtures/form/remote-controls/remote-controls.e2e.ts`.

### Form reset

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/form/Form.tsx`, `field/root/FieldRoot.tsx` and the form controls. Nothing listens for `reset`. A reset puts the native inputs back to their HTML defaults, while each control keeps its React state, so the control, its hidden input and `FormData` can disagree. Field dirty, touched and validity, and Form `errors`, stay as they were.

Local: the controls follow `bind:value` and `bind:checked`. Each named input carries `defaultValue` or `defaultChecked`. A task after an uncanceled `reset`, Checkbox, Switch, RadioGroup, CheckboxGroup, Slider, NumberField, OTPField, Select, Combobox and Autocomplete write their `defaultChecked` or `defaultValue` back through the binding, and Field.Control and Input read the input's value back as `bind:value` does. No change callback is called, because a native reset fires no `input` or `change` event. Then each Field clears dirty, touched, validity and its custom validity message, and takes the restored value as its initial value. Form clears `errors` and its submit count. A control listens to the form its named input belongs to, so a control outside the `<form>` that joins it through `form` restores too. A Slider with no `defaultValue` returns each thumb to `min`, as its range inputs do. Checkbox and Switch submit `uncheckedValue` from a hidden checkbox that the browser resets together with the visible one, so `FormData` never holds both values. The visible state of a custom control (`data-checked`, the thumb position) catches up one task after a native reset, because the browser resets the inputs only after the `reset` listeners have run. The helper is `src/lib/internal/form-reset.svelte.ts`.

Test: `src/lib/form/form-reset.svelte.spec.ts`.

### Submit and named-input events

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/form/Form.tsx`, `slider/root/SliderRoot.tsx`, `number-field/root/NumberFieldRoot.tsx` and `otp-field/root/OTPFieldRoot.tsx`. Form validates in its React `onSubmit` and blocks an invalid submit with `preventDefault()` only. It renders `noValidate` on the server. Slider, NumberField and OTPField update their named inputs through React state and fire no `input` or `change` event on them.

Local: the browser's constraint check blocks an invalid submit, as described under [The browser's constraint check is the submit gate](#the-browsers-constraint-check-is-the-submit-gate), so no `submit` event fires for it. A user change fires a bubbling `input` event from the Slider thumb's range input and from the hidden NumberField and OTPField inputs, once the new value is in the DOM. `change` follows when the change is committed: a Slider key press or pointer release, a NumberField commit, or focus leaving the OTPField. As with a native input, `change` fires only when the value differs from the one at the previous `change`, so a NumberField whose owner keeps its value fires neither event. Checkbox, Switch and Radio already fire both through the click on their native input. A parent checkbox fires both on each child input it toggles. The controls ignore the events they fire themselves.

Test: `src/lib/form/form-events.svelte.spec.ts`.

### The browser's constraint check is the submit gate

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/form/Form.tsx` and `field/root/FieldRoot.tsx`. Form renders `noValidate`, validates every field in its React `onSubmit`, and blocks an invalid submit with `preventDefault()`. `onFormSubmit` receives the values as an object. A `submit` listener that does not check `defaultPrevented`, such as SvelteKit's `use:enhance` or a remote form, still sends a blocked submit, and with JavaScript off nothing is checked.

Local, signed off by the owner (2026-10-21): Form leaves constraint validation on, and `novalidate` defaults to `false`. A capture `invalid` listener on the form cancels the browser's bubble for each control a Field owns, then shows each Field's message and focuses the first invalid control in document order. A control outside any Field keeps the bubble, and so does a control whose Field shows nothing for it. Form does this only while the user submits: a submit button's click, Enter in a control, or `requestSubmit()`. A `checkValidity()` or `reportValidity()` call fires `invalid` without changing anything. When the user submits, Form first refreshes every field's `validate` result, so a cross-field check sees the current values. Field keeps a sync `validate` result in the control's custom validity on mount, on every change and after a reset, whatever the `validationMode`, so the browser blocks the submit while it fails. `validationMode` decides only when a message shows. An async `validate` never blocks the submit. `onFormSubmit` and Field.Control's and Input's `onValueChange` are removed: read the values from `FormData` in `onsubmit`, and use `bind:value` or the native `input` event. On submit, Form focuses a field that its `invalid` prop or external errors mark invalid, as Base UI does.

Test: `src/routes/fixtures/form/engines/invalid.engines.e2e.ts` (Chromium, Firefox and WebKit), `src/lib/form/Form.svelte.spec.ts` and `src/lib/form/form-ssr.spec.ts`.

### Remote forms, Form.Error and Field paths

Pin: as above. Base UI has no framework integration, no form-level message part, and keys `errors` by name.

Local, signed off by the owner (2026-10-21):

- Form takes a SvelteKit remote form, a `for(id)` instance or the `enhance()` value in `form`, and then rejects `errors`, `values`, `onsubmit`, `method` and `action` in its types. It reads the form's `method`, `action`, attachment, `fields`, `pending` and `submitted`, and imports nothing from SvelteKit. The types are in `src/lib/form/remote-form.ts`.
- `Field.Root name` is a path such as `members[0].email`. In a remote form, a Field shows the issues at its path and below, minus the paths that a nested Field names. An edit hides them until they change or a later remote submit settles, so a submit that the browser blocks does not bring them back. Field sets `aria-invalid` on the control in place of Kit's. A `Field.Control` without a `name` in a named Field binds itself through the field's `as()`. A control's own `name` wins over the Field's.
- Form takes `values`, which repopulates controls by name after a failed form action.
- `Form.Error` shows `errors['']` or the remote issues with an empty path. While it has messages, `<form>` lists its id in `aria-describedby`.
- `Field.Error` and `Form.Error` children may be a snippet that receives the messages. A `Field.Error` outside any `Field.Root` renders nothing and warns in development, where Base UI throws.
- The control's `aria-describedby` always lists `<id>-description` and `<id>-error`, the ids that `Field.Description` and `Field.Error` take by default, so the server HTML and the hydrated page agree.
- In development, a control warns once when its remote spread names a field outside its `Field.Root name`. The warnings are absent from a production build.
- `Textarea` is a Sveltery addition: `Field.Control` rendering a `<textarea>`, with `type?: never`.

Test: `src/routes/fixtures/form/remote/remote.e2e.ts` (with JavaScript on and off), `src/routes/fixtures/form/production-build/production-build.e2e.ts`, `src/lib/form/form-ssr.spec.ts`, `src/lib/form/remote-form.spec.ts` and `type-probes/form/`.

## Tooltip

Source: `packages/react/src/tooltip` at Base UI v1.9.0, commit `ad7ecda5296b0295b41a51ecb01fce6204acd099`. The other components follow v1.8.0. The paired React fixture runs `@base-ui/react` 1.8.0, whose Tooltip behaves the same for the covered cases. `TooltipStore` extends the shared `TriggerOwnedPopupStore` in `src/lib/internal/popups/triggerOwnedStore.svelte.ts`, which also backs PreviewCard. Hover, focus, cursor tracking and the Provider's delay group come from `packages/floating-ui-svelte`.

| Upstream                                                 | Local                                                                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `open` / `defaultOpen`, `triggerId` / `defaultTriggerId` | `$bindable` `open` / `triggerId`, and the same `defaultOpen` / `defaultTriggerId`                        |
| `actionsRef`                                             | `bind:this` on `Tooltip.Root` (`close` and `unmount`)                                                    |
| `Tooltip.createHandle()`                                 | `Tooltip.createHandle()`, and `createTooltipHandle` as a named export                                    |
| `children` render function `{ payload }`                 | snippet argument `{ payload }`                                                                           |
| `useDismiss` `referencePress`                            | the trigger-press close lives in `TooltipRootInteractions.svelte`, because `DismissInteraction` has none |

The popup has no `role` and the trigger has no `aria-describedby` or `type`, as upstream renders them.

`payload`, `closeDelay` and `closeOnClick` are read live from the active trigger, and an active trigger that unmounts closes the tooltip, as described for PreviewCard under [Payload and close delay are read from the active trigger](#payload-and-close-delay-are-read-from-the-active-trigger) and [Active trigger tracking](#active-trigger-tracking).

### Trigger id after the tooltip unmounts

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/utils/popups/popupStoreUtils.ts` (`useOpenStateTransitions`). Once the popup unmounts, the store resets its own `activeTriggerId` to `null`. The `triggerId` prop is never written by the store. The next open that names no trigger, such as a controlled `open`, claims the only registered trigger.

Local: `triggerId` is one `$bindable` prop for both values, as for Popover under [Trigger id after the popover unmounts](#trigger-id-after-the-popover-unmounts). `BoundTriggerId` in `src/lib/internal/popups/boundTriggerId.svelte.ts` resets an id the store wrote to `null` once the popup unmounts, if the parent has not changed it since. An id that the parent set stays until a trigger press replaces it.

Test: `src/lib/tooltip/TooltipOwnership.svelte.spec.ts` (`lets a remounted lone trigger claim a bind:open after the previous trigger claimed one`).

## PreviewCard

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099` (Base UI v1.9.0), `packages/react/src/preview-card/**` and `packages/react/src/utils/popups/inlineRect.ts`. The rest of this file pins v1.8.0. The paired React fixture runs `@base-ui/react` 1.8.0, whose PreviewCard behaves the same for the covered cases.

### Public surface

Upstream: `defaultOpen`, `defaultTriggerId`, and `actionsRef`. `PreviewCard.createHandle` is the only handle factory.

Local: `open` and `triggerId` are `$bindable`, and `defaultOpen` and `defaultTriggerId` set their initial values. `close()` and `unmount()` are exports of the root, read through `bind:this`. The attribute names come from the shared state mappings. `createHandle` exists as `PreviewCard.createHandle` and `createPreviewCardHandle`. There is no top-level `createHandle`, because Popover already exports that name from the library barrel.

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

Upstream: `value` and `defaultValue`, and `actionsRef`.

Local: `value` is `$bindable`, and `defaultValue` sets its initial value. `close()` and `unmount()` are exports of the root, read through `bind:this`.

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

Upstream: `defaultOpen`, `defaultTriggerId`, `defaultChecked` on `Menu.CheckboxItem`, `defaultValue` on `Menu.RadioGroup` and `Menu.FilterProvider`, and `actionsRef`.

Local: `open` and `triggerId` on `Menu.Root`, `open` on `Menu.SubmenuRoot`, `checked` on `Menu.CheckboxItem`, `value` on `Menu.RadioGroup` and `value` on `Menu.FilterProvider` are `$bindable`, and each takes its upstream `default*` prop for the initial value. `close()` and `unmount()` are exports of both roots, read through `bind:this`. `Menu.createHandle` and `createMenuHandle` create handles. The `Menu.Root` children snippet receives `{ payload }`. A menu that is open when its only trigger mounts, with no `triggerId`, makes that trigger active and writes its id to `bind:triggerId`, as Popover does.

### Labels are trimmed

Upstream: typeahead and `onItemHighlighted` read an item's `textContent` as it is.

Local: the label is trimmed, because Svelte templates keep the whitespace around a text child.

### Filter item text

Upstream: a filtered-out item has no DOM, so the filter reads the text of its React children, and an item whose children change while it is hidden matches the new text.

Local: Svelte children are a snippet with no readable text. An item's text is its rendered `textContent`, trimmed, and a `MutationObserver` catches changes while it is visible. A filtered-out item without `label` keeps the text it last rendered. Set `label` on an item whose text changes while it can be hidden.

### Portaled filter events

Upstream: keys and focus in a portaled submenu bubble through React's tree to the parent popup's handlers.

Local: nothing re-runs the parent popup's handlers. A key that a submenu does not handle goes straight to the menubar's `relayKeyboardEvent`, so ArrowRight on a plain item moves to the next menubar menu. A plain submenu passes a main-axis key it leaves unhandled to its parent's highlight by an explicit call. The parent moves on from its trigger when the key closed the submenu, and otherwise from its current item, as upstream's parent list navigation does. A filterable popup learns that focus moved into one of its submenus from a `focusin` listener on the document, matched by the menu's root id.

### Opting out of the menu's key handling

Upstream: a consumer handler calls `event.preventBaseUIHandler()`, and the flag reaches every Base UI handler on the propagation path through React's shared synthetic event.

Local: a consumer handler calls `event.preventDefault()`, as with every part (see `mergeProps`). When the consumer's `Menu.Input` handler prevents a key, the input records that key in its menu's store and in each ancestor menu's store, and every popup skips its own handling of it. No other menu part forwards the opt-out to an ancestor. While a filterable menu is open, its trigger calls `preventDefault()` on ArrowLeft and ArrowRight to skip its own handlers for them. Upstream skips them with `preventBaseUIHandler()` and leaves the default action alone.

### Internal filter roots

Upstream: `MenuFilterRoot` and `MenuFilterSubmenuRoot` are internal components that `Menu.FilterProvider` renders around a root or a submenu root.

Local: they are the classes in `filter-root.svelte.ts` and `filter-submenu-root.svelte.ts`, which `Menu.Root` and `Menu.SubmenuRoot` create when a provider surrounds them. Neither is public, as upstream.

### Touch close guard

Upstream: the touch `click` that follows a focus open is ignored after it reaches `onOpenChange`.

Local: the store ignores it before `onOpenChange`, so the callback does not see the ignored close.

### Submenu hover scope

Upstream: the submenu's safe polygon reaches the parent popup through the floating tree.

Local: the polygon scopes to the parent popup through `getScope`.

### Behavior that waits on shared internals

- The `data-base-ui-click-trigger` marker is not rendered. Upstream sets it only on Dialog and Popover triggers.

### Not covered

React-only cases: refs and ref callbacks, the non-memoized anchor function, render counts, StrictMode subscriptions, and production and owner-stack warnings. `Menu.Group` rendered as a `Menu.RadioGroup` relies on React element cloning. The context-menu positioner cases are in `src/lib/context-menu/ContextMenu.svelte.spec.ts`. The menubar positioner cases are in `src/lib/menubar/Menubar.svelte.spec.ts`. The filter cases that need exit animations add a CSS animation or transition in the spec. A filtered-out item whose children change while hidden matches the old text here, so those `useMenuFilterItem` cases are not ported. The SSR, React 17 id fallback, server-created render element and hydration cases depend on React rendering. `FilterDropdownRoot` cases belong to a component this port does not include. The shadow-root focus-guard case depends on React portal ownership.

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

Upstream: `Menubar`.

Local: `Menubar` takes the same props.

### Detached menus take their trigger's floating tree

Upstream: a trigger lends its floating tree, node id and parent node id to the detached menu it opens. The menu's nodes then live in the menubar's tree.

Local: the trigger that owns a menu sets the menu's parent (the menubar, or none) and its floating parent node, as upstream's trigger data forwarding (`MenuTrigger.tsx:92-105`). A handle trigger opens its handle's menu even inside another menu's popup (`MenuTrigger.tsx:67-68`). `MenuStore.tree` follows the parent. `MenuStore.parentNodeId` takes the trigger's node, except that the root supplies its own when it is a context menu's root, when a menu encloses it, or while no trigger is active (`MenuRoot.tsx:283-300`). A context menu's root also keeps its own parent. The menu's node is registered by its root but published to descendants by its positioner, as upstream's `<FloatingNode>`, so a trigger inside its own root reports the node above it. A handle trigger inside a menubar menu's popup therefore opens its menu as that menu's child, not as a menubar sibling. A plain `Menu.Root` inside a menubar menu's popup keeps that menu's node, and a `ContextMenu` there is the context menu's own root. The menu emits and hears `menuopenchange`, `itemhover` and `close` on the menubar's event channel, so separate detached menus close each other with `sibling-open` and the menubar keeps `data-has-submenu-open`. The root registers the menu's floating node in `MenuStore.tree`, and moves it when that tree changes. The menu passes the same tree to its dismiss, list navigation and focus manager as `externalTree`, as upstream does for a nested menu (`MenuRoot.tsx:511,542`, `MenuPopup.tsx:208`). A press inside a detached menu opened from a menubar menu's popup therefore counts as inside that menubar menu, which closes with `item-press`.

### Menu open events are emitted before the DOM update

Upstream: `MenuPositioner` emits `menuopenchange` from a layout effect. The focus manager returns focus a microtask after the popup unmounts, so focus stays in a popup that animates out until then.

Local: `MenuPositioner` emits from `$effect.pre`. The shared `FloatingFocusManager` returns focus a microtask after the popup unmounts, as upstream does. An outside press that closes a menu clears `data-has-submenu-open` before the returned focus reaches the trigger, also when the close and the unmount share a flush, so that focus does not reopen the menu.

### Arrow keys focus synchronously

Upstream: `useCompositeRoot` moves focus to the next trigger in a microtask, after the focus manager's return.

Local: the shared `CompositeRoot` focuses the next trigger synchronously. The ported keyboard cases pass with it.

### Behavior that waits on shared internals

- `Menubar.svelte` does not spread `CompositeRoot.rootProps`, an omission in the owner and not a limit of `CompositeRoot`. The menubar therefore does not select the text of a native input on focus and does not scroll a keyboard-highlighted trigger into view. The text-field arrow exceptions apply. A menubar holds only triggers, so no ported case reaches them.
- `packages/floating-ui-svelte/src/hooks/useDismiss.svelte.ts` keeps a press that started inside a popup until its `pointerup`, for sloppy presses too. Upstream checks that flag only for intentional presses. A touch press inside a submenu followed by a touch press outside, with no `pointerup` between them, closes the submenu but not its parent menu. Real taps always send `pointerup`. The ported touch case taps the submenu trigger with a full sequence.

### Not covered

React-only cases: `describeConformance` (refs, `className` and style functions).

## ContextMenu

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099` (Base UI v1.9.0), `packages/react/src/context-menu/**`. The paired React fixture runs `@base-ui/react` 1.9.0. `ContextMenu.Root` provides the `ContextMenuParentContext` that `src/lib/menu/parent.svelte.ts` defines, and renders a `Menu.Root` under it. Every part but `Root` and `Trigger` is the Menu part of the same name. `ContextMenu.Positioner` is `Menu.Positioner` typed as `ContextMenuPositionerProps`, which has no `positionMethod`.

### Public surface

Upstream: `ContextMenu.Root` accepts the deprecated `closeParentOnEsc`, and `ContextMenu.Positioner` the deprecated `positionMethod`. Neither has an effect.

Local: the deprecated props are not in the types.

### The right-click mouseup listener is on the window

Upstream: the trigger adds a one-time `mouseup` listener to the document. React's root and portal listeners sit below the document, so an item's `onMouseUp` runs first and reads the gesture's mouse-up gate before the listener clears it.

Local: Svelte delegates the item handlers to the document and can add that listener only when the first item mounts, after the trigger's listener. The trigger listens on the window, so the item still runs first.

### A nested context menu shares the outer floating tree

Upstream: `ContextMenu.Root` starts a new `FloatingTree`, so a context menu opened from another context menu's item has its own menu events and closes on its own. A press in the inner popup still counts as inside the outer menu: the inner popup is a React child of the outer item, so the press bubbles through the outer floating element's capture handlers, and `useDismiss` reads that as `insideReactTree`.

Local: a portaled popup's events do not bubble through the element that rendered it, so `DismissInteraction` counts a press as inside only when it lands in the menu's own popup or a tree child's popup. Every menu therefore registers its floating node in the enclosing floating tree, so the outer menu counts presses in an inner popup as inside. Menu events (item `close`, `menuopenchange` and `itemhover`) do not travel on the floating tree. Each menu group has its own `EventTarget`, which a root menu, a context menu or a menubar creates and its submenus share, as upstream's `floatingTreeRoot`. An inner item press therefore closes only the inner menu, and opening or closing the inner menu does not reach the outer one. This holds for a context menu inside a menu's popup and for a root menu inside a menu's or a context menu's popup. An enclosing Dialog or Popover also sees the open context menu as a child, so an Escape pressed before the menu takes focus closes only the menu. A hover-opened Popover or PreviewCard likewise treats the pointer moving into its context menu as moving into a child and stays open, then closes with `trigger-hover` once the menu is closed and the pointer leaves. A NavigationMenu shares the same hover hook, but no spec drives it.

Test: `src/lib/context-menu/ContextMenu.svelte.spec.ts` (`closes a context menu opened from an item without closing the outer one`, the `inside an open` cases and the `inside a hover-opened` cases), `src/lib/context-menu/ContextMenu.menuGroup.svelte.spec.ts` and the `nested`case in`src/routes/fixtures/context-menu/context-menu.e2e.ts`.

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

Local: `value` and `open` are `$bindable`. `defaultValue` stays, because Select is a form control: it is the value an empty binding starts from and the value a native reset restores. `defaultOpen` sets the initial open state. `actionsRef` is the root's exported `close()` and `unmount()`, read through `bind:this`, and `unmount()` does nothing while the popup is open. `inputRef` is not ported. The root takes `readonly`, the HTML spelling. Labels, `placeholder`, and what `itemToStringLabel` returns are strings, because a part renders them as text. A `Select.Value` `children` snippet receives the value in place of the children function.

### Multiple values submit through one hidden select

Upstream: a `multiple` select renders one hidden `<input>` per value.

Local: the hidden `<select>` described in [Select submits through a hidden select](#select-submits-through-a-hidden-select) is `multiple`. `FormData` holds the same entries as upstream. The select stays in the form when nothing is selected, so a listener on the form still hears the edit that cleared it. The helper is `src/lib/internal/listbox/native-select.ts`.

Test: `src/lib/select/SelectRoot.multiple.svelte.spec.ts`.

### Native reset

Upstream: nothing listens for `reset`, as described under [Form reset](#form-reset).

Local: Select joins the other form controls. A native reset restores `defaultValue` through the binding and calls no `onValueChange`.

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

### Open method

Upstream: `SelectRoot` falls back to the previous render's open method once the open method resets (`usePreviousValue`).

Local: the interaction that opened the popup is kept until the popup unmounts, so a touch-opened popup keeps regular anchoring while it animates out.

### Not covered

`describeConformance` and the popup conformance suites (ref forwarding, render-prop cloning), `store.test.tsx` (React store transactions), the Strict Mode, `React.startTransition`, `ReactDOM.createPortal` and render-count cases, and the requestAnimationFrame-mocked touch reopen case have no Svelte counterpart. The positioner conformance cases that assert `transform` are not ported, because the positioner uses `top` and `left`. Upstream's jsdom-only keyboard, quick-selection and style-hook item cases run in Chromium with real timers.

## Combobox

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099` (Base UI v1.9.0), `packages/react/src/combobox/**`, with `AriaCombobox.tsx`, `packages/react/src/floating-ui-react/hooks/gridNavigation.ts` and the listbox helpers Select shares. The paired fixture runs `@base-ui/react` 1.9.0.

### Public surface

Upstream: `value`/`defaultValue`/`onValueChange`, `inputValue`/`defaultInputValue`/`onInputValueChange`, `open`/`defaultOpen`/`onOpenChange`, `actionsRef`, `inputRef`, `readOnly`, `autoComplete`, a `Combobox.List` children function, and `ReactNode` labels and placeholder.

Local: `value`, `inputValue` and `open` are `$bindable`. `defaultValue` and `defaultInputValue` stay, because the combobox is a form control. `defaultOpen` sets the initial open state. `actionsRef` is the root's exported `close()` and `unmount()`, read through `bind:this`. `inputRef` is not ported. The root takes `readonly` and `autocomplete`, the HTML spellings. `Combobox.List` takes static children, and `Combobox.Collection` renders the filtered items through its `children` snippet. Labels, `placeholder`, and what `itemToStringLabel` returns are strings. A `Combobox.Value` `children` snippet receives the value in place of the children function. `useFilter` is a plain function, called in a `$derived` when its options change. `useFilteredItems` returns `{ current }`. `createItems` derives each item's value and label on first use.

### One core for Combobox and Autocomplete

Upstream: `AriaCombobox` holds the behavior, and `selectionMode` (`single`, `multiple` or `none`) picks what a press commits.

Local: `src/lib/combobox/AriaCombobox.svelte` holds the same behavior behind the same `selectionMode` prop. `Combobox.Root` passes `single` or `multiple`, and an Autocomplete root passes `none`, where the input text is the value. `ComboboxStore` extends `PopupStore`, keeps the input text, indices and part elements in `$state`, and derives the filtered and flattened items from them.

### Multiple values submit through one hidden select

Upstream: a `multiple` combobox renders one hidden `<input>` per value.

Local: one hidden `<select multiple>` holds the values, as Select does. `FormData` holds the same entries. The helper now lives in `src/lib/internal/listbox/native-select.ts`, shared with Select.

Test: `src/lib/combobox/ComboboxRoot.form.svelte.spec.ts`.

### Native reset

Upstream: nothing listens for `reset`, as described under [Form reset](#form-reset).

Local: a native reset restores `defaultValue` and the input text that matches it, and calls no `onValueChange`.

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

`describeConformance` (ref forwarding, render-prop cloning), `store.test.tsx` (React store transactions, ref callbacks during commit and hydration, all through Autocomplete), the Strict Mode, `React.memo` and render-count cases, the Label `captureOwnerStack` cases have no Svelte counterpart here. The Autocomplete cases in the Combobox suites run in `src/lib/autocomplete/AutocompleteRoot.svelte.spec.ts`. The positioner conformance cases that assert `transform` are not ported, because the positioner uses `top` and `left`. Live-region reset delays run on real timers instead of fake ones.

## Autocomplete

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099` (Base UI v1.9.0), `packages/react/src/autocomplete/**`, over the same `AriaCombobox` core as Combobox. The paired fixture runs `@base-ui/react` 1.9.0.

### Public surface

Upstream: `value`/`defaultValue`/`onValueChange` hold the input text, with `open`/`defaultOpen`/`onOpenChange`, `actionsRef`, `inputRef`, `readOnly`, a `ReactNode` or function `Autocomplete.Value` child, and the item type taken from the `ItemValue` type argument.

Local: `value` and `open` are `$bindable`, and `defaultValue` stays because the autocomplete is a form control. `defaultOpen` sets the initial open state. `actionsRef` is the root's exported `close()` and `unmount()`, read through `bind:this`. The root takes `readonly`, the HTML spelling. An `Autocomplete.Value` `children` snippet receives the input text in place of the children function. The root infers the item type from `items`, flat or grouped, so `itemToStringValue` and `onItemHighlighted` take the item without a type argument. `inputRef` is not ported, as in Combobox. The parts Autocomplete shares with Combobox are the Combobox components, so their props are documented with Combobox types.

Test: `src/lib/autocomplete/types.test-d.ts`, `src/lib/autocomplete/AutocompleteValue.svelte.spec.ts`.

### Native reset

Upstream: a native reset keeps the typed text, because React state does not follow the browser's reset of the input. See [Form reset](#form-reset).

Local: a native reset restores `defaultValue` and calls no `onValueChange`. The input carries the name and the default as its `value` attribute, so code that reads the form after a reset sees the default.

Test: `src/routes/fixtures/autocomplete/autocomplete.e2e.ts` (`restores the default text on a native form reset`).

### Server rendering names one input

Upstream: the root starts with the input owning the form value, and a popup input takes the name once it mounts.

Local: the server renders no popup input, so until the client hydrates, the rendered input owns the value and the server HTML names one control at most. After hydration a popup input hands the name to the hidden input until it mounts.

Test: `src/lib/autocomplete/ssr.spec.ts`, `src/routes/fixtures/autocomplete/autocomplete.e2e.ts` (`svelte SSR renders the input with the name and default text`).

### Fixes in the shared core

The Autocomplete port corrected four behaviors of `AriaCombobox` that Combobox shares. With no selection the input text always counts as provided, as upstream Autocomplete always passes `inputValue`, so a popup input does not clear it on mount. The popup listens for `focusin`, because React's `onFocus` bubbles, so focus moving into the list returns to the input. `submitOnItemClick` submits only when the form has `requestSubmit`. An input that owns the form value carries its default for a native reset.

Test: `src/lib/autocomplete/AutocompleteRoot.svelte.spec.ts`, `src/lib/autocomplete/AutocompleteRoot.form.svelte.spec.ts`.

### Not covered

`describeConformance` (ref forwarding, render-prop cloning), the `React.startTransition` unmount case, and the `store.test.tsx` cases that observe React store transactions, `useStore` re-reads and ref callbacks during commit have no Svelte counterpart here. Upstream's click-open highlight case fires a click that neither focuses nor opens, so the local case asserts the highlight after a real click. The validation-ref case runs without its Switch, because each control registers its own input. The `onChange` and `onBlur` validation cases that upstream skips in a browser run here.

## Questionnaire

Source: `packages/react/src/questionnaire` in `@shadcn/react` v0.3.1 (`30a58d4498f270af1c1e981a7d78a15cf5740841`). The React fixture runs `@shadcn/react@0.3.1`. The port came from `@sveltery/svelte/questionnaire` in Sveltery UI.

### Public surface

Pin: `30a58d4498f270af1c1e981a7d78a15cf5740841`, `packages/react/src/questionnaire/index.ts`, `components.tsx` and `types.ts`.

Local: the same `Questionnaire` namespace and part names. Props use Svelte names: `novalidate`, `onchange`, `oninput`, `onsubmit` and `onreset`. Root's `item`, Choice's `checked` and Input's `value` are `$bindable`, beside `defaultItem`, `defaultChecked` and `defaultValue`. Input reports typing through `oninput`, where upstream uses React's `onChange`. `render` is a snippet that receives the props, the state and the children. ChoiceInput's and Input's snippets receive no children. There is no `ref`. Each part with state attributes exports a `*DataAttributes` object.

### Reset clears a text answer

Pin: `30a58d4498f270af1c1e981a7d78a15cf5740841`, `packages/react/src/questionnaire/use-questionnaire-input.ts`. A form reset deselects the text answer, and React renders `form=""` on the input before the native reset runs. The input leaves the form, so the reset skips it and its text stays, while the input reports `data-empty`.

Local: Svelte applies `form=""` after the native reset, so the reset empties the input. Its text and its `data-empty` agree.

Test: `src/routes/fixtures/questionnaire/questionnaire.e2e.ts` (`reset clears answers and returns to the first item`).

## Scrollbar-hiding style

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/utils/styles.tsx`. ScrollArea.Root and Select.Popup render `<style href precedence="base-ui:low">`. React 19 hoists it into the head of the root's document or shadow root, keyed by `href`, and never removes it. The server prints it once in the head.

Local: on the client the port inserts the same `data-href` and `data-precedence` element into the same place, once, and never removes it. Svelte keeps no per-render state on the server, so each instance server-renders its own copy into the head through `<svelte:head>`. Each instance drops its copy once it mounts and the shared element exists. Until hydration, the copies sit wherever the app prints the server head, which can be after its stylesheets, rather than first in the head.

Test: `src/lib/internal/disable-scrollbar-style.svelte.spec.ts`, `src/lib/internal/disable-scrollbar-style.spec.ts`, and `src/routes/fixtures/scroll-area/scroll-area.e2e.ts` (`the scrollbar-hiding style lives once in the head`).

## Not ported yet

Behavior each ported component does not cover yet. Overlay foundation is internal and has no public component.

Checkbox, Switch, Radio, RadioGroup, NumberField, Slider and OTPField take no `inputRef`. Given a `name`, each renders its native `<input>` elements in the DOM under that name (a Radio takes its own `name` or its RadioGroup's), so reach them through the form with `form.elements.namedItem(name)`. That returns a `RadioNodeList` when several inputs share the name, as with radios, range thumbs or an `uncheckedValue`.

| Component          | Not ported yet                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Accordion          | React.Activity animation resume, refs, roving focus (`orientation`, `loopFocus`)                                     |
| Button             | Composite and Toolbar integration                                                                                    |
| Collapsible        | React.Activity animation resume, refs                                                                                |
| Fieldset           | Checkbox, CheckboxGroup, RadioGroup and Slider disabled integration                                                  |
| Field              | refs                                                                                                                 |
| Input              | refs                                                                                                                 |
| ToggleGroup        | grid composite                                                                                                       |
| Separator          | React render-element cloning, `ref`                                                                                  |
| Meter              | React `ref`, numeric production error codes                                                                          |
| Progress           | refs                                                                                                                 |
| Form               | `actionsRef`                                                                                                         |
| Tabs               | refs, a client-only mount renders an inert prehydration `<script>` until mount, because Svelte has no hydration flag |
| Toolbar            | overlay triggers                                                                                                     |
| NumberField        | refs                                                                                                                 |
| ScrollArea         | refs                                                                                                                 |
| Slider             | refs, a client-only mount renders an inert prehydration `<script>` until mount, because Svelte has no hydration flag |
| DirectionProvider  | CSS `direction` on an element, without `DirectionProvider`                                                           |
| OTPField           | refs, React controlled lock                                                                                          |
| CSPProvider        | Select renders no inline style                                                                                       |
| Overlay foundation | Internal only. No public component                                                                                   |
| Popover            | `actionsRef`, refs                                                                                                   |
| Dialog             | ref objects                                                                                                          |
| AlertDialog        | ref objects                                                                                                          |
| Tooltip            | refs                                                                                                                 |
| PreviewCard        | `actionsRef`, refs                                                                                                   |
| NavigationMenu     | `actionsRef`, refs                                                                                                   |
| Drawer             | ref objects                                                                                                          |
| Menu               | `actionsRef`, refs                                                                                                   |
| Menubar            | refs                                                                                                                 |
| ContextMenu        | `actionsRef`, refs                                                                                                   |
| Toast              | refs, `className` and `style` callbacks                                                                              |
| Select             | `inputRef`, `ReactNode` labels and placeholder                                                                       |
| Combobox           | `inputRef`, `ReactNode` labels and placeholder                                                                       |
| Autocomplete       | `inputRef`, `ReactNode` value children                                                                               |

## Shared floating internals

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx` and `hooks/useDismiss.ts`. Each popup root creates its own `FloatingTree`. A press or a focus change inside a portaled descendant counts as inside a popup through `insideReactTree`, which React sets because portal events bubble through the React tree.

Local: nested popups share one floating tree, and the DOM has no React tree. `DismissInteraction` counts a press inside a tree child's portal, which holds that child's internal backdrop, as inside the parent. `FloatingFocusManager` treats focus that leaves a portaled popup without an outside press as staying inside, as upstream's `markInsideReactTree` does.

Component nesting links a popup to the portals rendered in its content. `setFloatingPopupScope(store)` runs in the component that renders a popup's content: `FloatingFocusManager`, `PreviewCard.Popup`, `Tooltip.Popup` and `NavigationMenu.Content`. Each `FloatingPortal` inside that content adds its host to `store.nestedPortals` and to those of the enclosing popups, whatever its `container`. `DismissInteraction` marks a press inside one of those hosts as inside, and `FloatingFocusManager` keeps the popup open when focus moves into one. A portal rendered beside the popup, such as a tooltip next to `Popover.Positioner` in `Popover.Portal`, is outside it, as upstream.

Test: `packages/floating-ui-svelte/src/hooks/useDismiss.svelte.spec.ts`, `packages/floating-ui-svelte/src/components/FloatingFocusManager.svelte.spec.ts`, `src/lib/internal/overlay-audit.svelte.spec.ts` (`closes only the inner modal popover on an outside touch tap`), `src/lib/context-menu/ContextMenu.svelte.spec.ts` (`keeps both context menus open on a press inside the portaled inner popup` and the `inside an open` cases), `src/lib/popover/Popover.svelte.spec.ts` (`keeps the popover open on a press in a tooltip rendered in its popup`), `src/lib/tooltip/TooltipRoot.svelte.spec.ts` (`keeps the tooltip open on a press inside the popover`), `src/lib/context-menu/ContextMenu.svelte.spec.ts` (`closes a context menu opened from an item without closing the outer one`) and the `nested` case in `src/routes/fixtures/context-menu/context-menu.e2e.ts`.

`setFloatingTree({ fresh: true })` starts a new tree instead of joining the enclosing one, as upstream `<FloatingTree>` does. The nested root still records the enclosing node as its parent, as upstream's node context does.

Test: `packages/floating-ui-svelte/src/components/FloatingTree.svelte.spec.ts` (`starts a fresh tree instead of joining the enclosing one`).

`FloatingFocusManager` waits one task before a focus-out close when focus moves from a nested popup's trigger into an open ancestor popup without a keyboard press or an outside press. It then closes with `focus-out` if the popup is still open. A Menu pointer highlight moves focus from a submenu trigger to a sibling item on pointer enter, and the same move's mousemove closes the submenu with `sibling-open`. Upstream renders that highlight after the input events, so the `sibling-open` close lands first there.

Test: `src/lib/menu/MenuRoot.triggerless.svelte.spec.ts` (`closes a sibling submenu without closing the root on click`) and `src/lib/popover/Popover.svelte.spec.ts` (`closes the inner popover when focus moves from its trigger to another control of the outer popup`).

### Queued list focus after close

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/floating-ui-react/hooks/useListNavigation.ts`. `focusItem` calls `enqueueFocus(item, { sync, preventScroll: true })` with no `shouldFocus`. A deferred item focus runs on the next frame even when the popup has closed in between.

Local: the queued focus passes `shouldFocus: () => store.isOpen()`. A Tab or Escape that closes the popup before the frame drops the focus, so it does not land on an item of a closed popup that stays mounted.

Test: `src/tests/list-navigation/useListNavigation.svelte.spec.ts` (`drops a queued item focus when the list closes before it lands`).

### Elements inside the focus manager

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`, `packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx`. `getInsideElements` lists elements outside the popup that count as inside it. A typeable `role="combobox"` reference with `initialFocus={false}` leaves focus untrapped: a modal popup renders no focus guards, does not stop Tab, closes on focus out, and keeps the reference exposed while it hides outside content. Each popup takes its tabbables from the floating focus element, so the guards of a manager inside a positioner are not among them. The typeable combobox reference of the nearest ancestor floating node also stays exposed. Upstream Combobox and Dialog register no floating node, so this applies to a Popover or Menu whose trigger is a typeable combobox.

Local: `FloatingFocusManager` takes `getInsideElements` for focus out, return focus and `aria-hidden`, and has the untrapped combobox mode and the tabbables of upstream. A press on an inside element is still tracked as an outside press, because focus out already counts that element as inside. The ancestor lookup is not ported: a floating node registers in a `$effect`, which runs after the nested focus manager's, so the popup's own node is not in the tree yet. Registering earlier would copy React's layout-effect order. A modal popup nested in a Popover whose trigger is a typeable combobox therefore hides that input. A Dialog or modal Popover opened from a Combobox popup hides the input, as upstream does. `PopoverPopup` does not pass `getInsideElements`. Its trigger registers its leading focus guard on the store instead, and only the popup's own guards and its trigger's guards count as inside, as described under Popover.

Test: `packages/floating-ui-svelte/src/components/FloatingFocusManager.focusModes.svelte.spec.ts`.

## Attribute props accept null

Pin: `ad7ecda5296b0295b41a51ecb01fce6204acd099`. React's element types have no `null`, so upstream types `disabled`, `id`, `name`, `form`, `required` and `readOnly` without it.

Local: Svelte's element types accept `null` for every attribute, and each part's `render` snippet receives those types as `props`. Parts that render a host element and declare `disabled`, `id`, `name`, `form`, `required` or `readonly` accept `null` too, and treat it as an absent attribute, as `<button disabled={null}>` does. A part's render snippet can therefore spread `props` onto another part on the same element, such as `Popover.Trigger` onto `Button`. `Select.Root`, `Combobox.Root`, `Autocomplete.Root`, `Tooltip.Root`, `Menu.Root` and `Menu.SubmenuRoot` render no host element and keep their types without `null`.

Test: `type-probes/render/PartAsPart.svelte`, `src/lib/button/Button.svelte.spec.ts` (`renders a popover trigger and opens its popover`, `treats disabled={null} as false in the render state`), `src/lib/field/null-id.svelte.spec.ts`, `type-probes/render/MenuPartAsPart.svelte`, `src/lib/menu/Menu.svelte.spec.ts` (`treats null id and disabled as absent`).

## DayPicker

Pin: react-day-picker v9.8.1, `bd55df2e3a4917f4c368020f3ef64f60b6882627`, `src/DayPicker.tsx`, `src/useCalendar.ts`, `src/useFocus.ts`, `src/useSelection.ts`, `src/selection`, `src/helpers`, `src/utils`, `src/formatters` and `src/labels`. `selected` with `onSelect` is controlled, and `selected` without `onSelect` is the initial value of an uncontrolled selection. `month` with `onMonthChange` is controlled, and `defaultMonth` is the initial month. `components` replaces any rendered part with a React component. `className`, `style`, `styles` and `modifiersStyles` style the parts.

Local: `src/lib/day-picker`, from `@sveltery/day-picker` 0.2.0 in sveltery/ui. `@sveltery/base/day-picker` exports `DayPicker`, `DayPickerState`, `DateLib`, `defaultClassNames`, `defaultFormatters`, `defaultLabels` and `DayPickerDataAttributes`. It imports `date-fns` and `@date-fns/tz`, which are optional peers, so it is a subpath only and `src/lib/index.ts` does not export it.

- `selected` and `month` are `$bindable` props, and the component writes each change in the click, key or change handler before it calls `onSelect` or `onMonthChange`. `defaultSelected` is added beside `selected`, as on a Base UI part. It and `defaultMonth` are read once, at mount. react-day-picker v9 has no `defaultSelected`.
- `components` becomes snippet props: `root`, `chevron`, `dayButton`, `weekNumber` and `footer`. Each snippet receives the attributes to spread on its element, and `dayButton` and `weekNumber` also receive the formatted `text`. The other parts are not replaceable.
- `class` replaces `className`, `autofocus` replaces `autoFocus`, and `style` is a CSS string. `styles` and `modifiersStyles` are not ported. Style the parts through `classNames`, `modifiersClassNames` or the `data-*` attributes.
- `locale` takes a date-fns locale. `dateLib`, `numerals`, `useAdditionalDayOfYearTokens` and `useAdditionalWeekYearTokens` are not ported, and only the Gregorian calendar is ported, without the `persian`, `jalali` and `utc` entries.
- `animate`, `broadcastCalendar`, `onDayKeyUp`, `onDayPointerEnter`, `onDayPointerLeave` and the `onDayTouch*` callbacks are not ported. The props upstream deprecates (`fromDate`, `fromMonth`, `fromYear`, `toDate`, `toMonth`, `toYear`, `initialFocus`, `onDayKeyPress` and `onWeekNumberClick`) are not ported.
- A `timeZone` change does not move the displayed month back to the initial month. Upstream resets it in an effect.

Test: `src/lib/day-picker/*.test.ts`, `src/lib/day-picker/DayPicker.svelte.spec.ts` and `src/routes/fixtures/day-picker/day-picker.e2e.ts`, which runs each case against react-day-picker 9.8.1.

## Resizable

`@sveltery/base/resizable` follows react-resizable-panels v4.5.8, not Base UI. `scripts/resizable/sync-upstream.mjs` copies the framework-free engine into `src/lib/resizable/engine` and applies `scripts/resizable/patches`. The parts are Svelte rewrites of upstream's React components.

### Public surface

Pin: react-resizable-panels v4.5.8 (`119437b6a973c10b6513613eb9453fc9fb850259`), `lib/index.ts`. Upstream exports `Group`, `Panel` and `Separator`, the `useDefaultLayout`, `useGroupRef`, `usePanelRef`, `useGroupCallbackRef` and `usePanelCallbackRef` hooks, and `isCoarsePointer`. Each part takes an `elementRef`, `Group` takes a `groupRef` and `Panel` a `panelRef` that receive its imperative handle. `className` and `style` are React props.

Local: the parts are `Resizable.Group`, `Resizable.Panel` and `Resizable.Separator`, because Base already exports `Separator`. `bind:this` on a group gives `getLayout()` and `setLayout()` (`ResizableGroupActions`), and on a panel `collapse()`, `expand()`, `getSize()`, `isCollapsed()` and `resize()` (`ResizablePanelActions`), in place of `groupRef` and `panelRef`. An attachment on a part reaches its element, in place of `elementRef`. The `use*Ref` hooks are not ported, because `bind:this` does their job. `class` and `style` are HTML attributes, and `style` is a string. The exported types carry a `Resizable` prefix: `ResizableLayout`, `ResizableLayoutStorage`, `ResizableOrientation`, `ResizablePanelSize` and `ResizableSizeUnit`. `useDefaultLayout` keeps its name and its options. Its debounce timer is a `ScopedTimeout`, so it is cleared when the component that called it is destroyed.

Rationale: Base parts are namespaces, take HTML prop names and have no ref props (AGENTS.md). Sveltery UI's `BlockViewer` resizes a panel from a toggle group, which `bind:this` covers.

Test: `src/lib/resizable/Resizable.svelte.spec.ts` (`applies a layout set through bind:this after validating it`, `collapses, expands and resizes a panel through bind:this`, `gives an attachment the group element`), `src/routes/fixtures/resizable/resizable.e2e.ts`.

### Panel resize takes every size unit

Pin: react-resizable-panels v4.5.8 (`119437b6a973c10b6513613eb9453fc9fb850259`), `lib/global/utils/getImperativePanelMethods.ts`. `resize()` reads a string with `parseFloat`, so `resize('300px')` sets the panel to 300 percent, which the layout then clamps, and `resize('10rem')` to 10 percent. Its own documentation says the method takes pixels, `rem`, `em`, `vh` and `vw`.

Local: `scripts/resizable/patches/0002-resize-accepts-size-units.patch` converts every unit from the measured group, with the change upstream made in [4.7.3](https://github.com/bvaughn/react-resizable-panels/commit/e8dd4300a1db74b127d91e77fc81b16ed0bd4af8). `0001-cursor-style-type.patch` types the cursor style as a string, so the engine does not import `csstype`.

Test: `src/lib/resizable/Resizable.svelte.spec.ts` (`resizes a panel to a size in pixels and rem`), `src/lib/resizable/engine/global/utils/getImperativePanelMethods.test.ts` (`units`).

## InputOTP

Source: input-otp v1.4.2 (`81ccdb48c010d800b24942aa231909f0c971b1ca`), `packages/input-otp/src`. Upstream exports `OTPInput`, `OTPInputContext`, the `REGEXP_ONLY_*` patterns and the `RenderProps` and `SlotProps` types. Its React fixture is `src/routes/fixtures/input-otp/react-reference.ts`, which mounts the `input-otp` package.

Test: `src/lib/input-otp/InputOTPRoot.svelte.spec.ts`, `src/routes/fixtures/input-otp/input-otp.e2e.ts`.

### Names

Pin: `81ccdb48c010d800b24942aa231909f0c971b1ca`, `packages/input-otp/src/input.tsx` and `types.ts`.

Local: `OTPInput` is `InputOTP.Root`. `OTPInputContext` is `getInputOTPContext()`. `RenderProps` is `InputOTPRootState` and `SlotProps` is `InputOTPSlotState`. Props use HTML names: `maxLength` is `maxlength`, `inputMode` is `inputmode` and `autoFocus` is `autofocus`. `containerClassName` is `containerClass`. `render` keeps upstream's meaning: it receives the state and draws the slots, and does not replace the root element as a Base UI part's `render` does.

### Value and the input element

Pin: `81ccdb48c010d800b24942aa231909f0c971b1ca`, `packages/input-otp/src/input.tsx`. Upstream takes `value` with `onChange`, or an uncontrolled `defaultValue`, and forwards its `ref` to the input.

Local: `bind:value` replaces `value` and `onChange`, and `defaultValue` is the code an empty binding starts from. There is no `onChange` or `ref`. Rest props, attachments included, go to the input, so `{@attach}` on `InputOTP.Root` reaches it.

Test: `src/lib/input-otp/InputOTPRoot.svelte.spec.ts` (`binds the value and calls onComplete once when the last slot fills`, `passes consumer attachments to the input`).

### Timers clear when the root is destroyed

Pin: `81ccdb48c010d800b24942aa231909f0c971b1ca`, `packages/input-otp/src/sync-timeouts.ts` and `use-pwm-badge.tsx`. `syncTimeouts` starts three timeouts on every value or focus change and never clears them.

Local: the sync timeouts still stack as upstream's do, in a `TimeoutManager` that clears them when the root is destroyed. The password-manager check uses `ScopedTimeout` and `ScopedInterval`.

### Sync timeouts run the selection handler

Pin: `81ccdb48c010d800b24942aa231909f0c971b1ca`, `packages/input-otp/src/input.tsx`. Each sync timeout copies the input's raw selection into the mirrored selection and into the previous selection that the `selectionchange` handler reads to tell a backward caret move from a forward one. When an arrow key lands in the 50 ms after a value or focus change, a timeout can record the collapsed caret before `selectionchange` runs. The handler then reads the move as forward, and ArrowLeft leaves the highlighted slot where it was.

Local: each sync timeout calls the `selectionchange` handler, which widens a collapsed caret to its slot and records the result, so a later `selectionchange` sees a range and keeps it. The handler clears the mirror once focus has left the input, so after a blur `data-input-otp-mss` and `data-input-otp-mse` are absent where upstream keeps the last selection. No React fixture case asserts either behavior.

Test: `src/lib/input-otp/InputOTPRoot.svelte.spec.ts` (`moves the selection left when ArrowLeft lands before the post-change sync runs`).

## Command

Pin: cmdk v1.1.1, `dd2250ed608443e8f32bafc5fa2d1d07a3746aa3`, `cmdk/src/index.tsx`. The parts render cmdk's elements, `cmdk-*` attributes, roles and ARIA, and `data-selected` and `data-disabled` keep cmdk's `"true"` and `"false"` values, because Sveltery UI's styles select them. While searching, the items that do not match unmount and the rest render in cmdk's ranked order. The port moved from Sveltery UI's `@sveltery/command` 0.2.0, where it shipped first.

### Selection and ranking

Local: where cmdk misbehaves, the port keeps the working behavior.

- `aria-activedescendant` always names the selected item. cmdk leaves it out when the menu opens and names the previous item after a search.
- Results are in score order whatever the previous search was. cmdk ranks the items a search brings back below the ones already shown.
- Clearing the search restores the declared order. cmdk keeps the last ranked order for items that stayed mounted.
- Groups are ordered by their best match while searching. cmdk means to, but its lookup never finds the group.
- A group that holds only force-mounted items stays visible while searching. cmdk hides it.
- Selection follows the item, not its value. Items that share a value are each reachable, and only the picked one is selected. Writing the bound `value` selects the first item with that value, unless the selected item already has it.
- Only the menu in use moves focus. cmdk moves focus to its input when any menu's input or root has focus.

Test: `src/lib/command/Command.svelte.spec.ts` and `src/lib/command/rank.spec.ts`.

### Scrolling and `onValueChange`

Local: only keyboard moves and a new search scroll the selection into view. The automatic selection on mount, the pointer, a click and a write to the bound `value` do not, so an inline menu does not scroll the page when it mounts. `onValueChange` fires for every change of the selected value, including the automatic selection on mount and on search, whether or not `value` is bound. cmdk calls it only when `value` is controlled.

Test: `src/lib/command/Command.svelte.spec.ts` (`scrolls keyboard and search selections into view` and `selects the first item on mount and reports it`).

### Svelte props and handlers

Local: Root binds `value` and takes `defaultValue`, and Input binds `value` for the search and takes the native `defaultValue`. They replace cmdk's controlled `value`, `defaultValue` and `onValueChange` on Input. `getCommandState()` replaces `useCommandState(selector)`. There is no `asChild`. Root `onkeydown` and Item `onclick` and `onpointermove` run before the part's own handling, and `event.preventDefault()` skips it. cmdk replaces those handlers.

Test: `src/lib/command/Command.svelte.spec.ts` (`Command props that cmdk has and Svelte names`).

### Server rendering

Local: the server renders the full list. Nothing is filtered, ordered or selected until Root mounts, so the server markup and the first client render match, and hydration adopts the server's nodes. Empty renders only after mount, and `getCommandState().count` reads 0 until then.

Test: `src/lib/command/command-ssr.spec.ts` and the hydration case in `src/routes/fixtures/command/command.e2e.ts`.

### Parts render in their List or Group

Local: Svelte cannot move the nodes it renders, so List and each Group render their parts themselves, in ranked order, and each part leaves only a comment where it is written. An element wrapped around an Item, Group, Separator, Empty or Loading stays empty. Other markup written in List or Group renders before its parts. Context set between List or Group and an Item does not reach the Item's content. A `{#each}` or `{#if}` around parts works.

Test: `src/lib/command/Command.svelte.spec.ts` (`Command outside the usual layout`).

## MessageScroller

Source: `@shadcn/react` v0.3.1 `packages/react/src/message-scroller` (`30a58d4498f270af1c1e981a7d78a15cf5740841`). The React fixture runs `@shadcn/react@0.3.1`. `geometry.ts` is upstream's file with `.js` import suffixes.

Pin: `30a58d4498f270af1c1e981a7d78a15cf5740841`, `packages/react/src/message-scroller/components.tsx`, `types.ts`, `use-message-scroller-controller.ts` and `use-message-scroller-commands.ts`.

| Upstream                                                                                                                         | Local                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useMessageScroller()` returns `{ scrollToEnd, scrollToMessage, scrollToStart }`                                                 | `getMessageScroller()` returns a `MessageScrollerController` with the same commands and two reactive getters, `scrollable` and `visibility`. Call it during component init  |
| `useMessageScrollerScrollable()` and `useMessageScrollerVisibility()` subscribe to stores                                        | `scroller.scrollable` and `scroller.visibility`. Visibility is tracked only while an effect or template reads it, as upstream observes only while the hook has a subscriber |
| Turning `autoScroll` off while following leaves the scroller in its follow mode, so `scrollable.end` stays `false` over overflow | Turning `autoScroll` off releases follow. `scrollable.end` reports real overflow, so the end button shows                                                                   |
| `MessageScroller.Button` takes `render` as an element or a function, through `useRender`                                         | `render` is a snippet that receives the props to spread and the state `{ active, direction }`                                                                               |
| `spacerClassName`, `tabIndex`, `onClick` and `ref` props                                                                         | `spacerClass`, `tabindex` and `onclick`. There is no `ref` prop                                                                                                             |
| A part outside the provider throws `useMessageScroller must be used within a MessageScroller.` or the item variant of that error | Every part and `getMessageScroller()` throw `getMessageScroller must be used within a MessageScroller.Provider.`                                                            |
| The controller sets `data-scrollable` and `data-autoscrolling` on the root and the viewport with `setAttribute`                  | The parts render the same attributes from reactive state                                                                                                                    |

Test: `src/lib/message-scroller/MessageScroller.svelte.spec.ts` (`arms follow when autoScroll turns on at the end and stops when it turns off`, `throws outside a Provider`), `src/lib/message-scroller/geometry.test.ts` and `src/routes/fixtures/message-scroller/message-scroller.e2e.ts`.
