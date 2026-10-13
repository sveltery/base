# Third-party notices

Parts of this package derive from [Base UI](https://github.com/mui/base-ui) v1.8.0, commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`:

- `src/lib/accordion/AccordionRoot.svelte` from `packages/react/src/accordion/root/AccordionRoot.tsx`
- `src/lib/accordion/AccordionItem.svelte` from `packages/react/src/accordion/item/AccordionItem.tsx` (open state is the existing Collapsible root)
- `src/lib/accordion/AccordionHeader.svelte` from `packages/react/src/accordion/header/AccordionHeader.tsx`
- `src/lib/accordion/AccordionPanel.svelte` from `packages/react/src/accordion/panel/AccordionPanel.tsx` (panel motion is `CollapsiblePanelMotion`)
- `src/lib/accordion/attributes.ts` from `packages/react/src/accordion/item/stateAttributesMapping.ts` and `packages/react/src/accordion/panel/AccordionPanelCssVars.ts`
- `src/lib/accordion/value.ts` from `handleValueChange` in `packages/react/src/accordion/root/AccordionRoot.tsx`
- `src/lib/accordion/Accordion.svelte.spec.ts` assertions from `packages/react/src/accordion/**/*.test.tsx`
- `src/lib/collapsible/CollapsibleRoot.svelte` from `packages/react/src/collapsible/root/CollapsibleRoot.tsx` and `useCollapsibleRoot.ts`
- `src/lib/collapsible/CollapsiblePanel.svelte` from `packages/react/src/collapsible/panel/CollapsiblePanel.tsx`
- `src/lib/collapsible/context.svelte.ts` from `packages/react/src/collapsible/root/CollapsibleRootContext.ts` and `packages/react/src/collapsible/root/useCollapsibleRoot.ts`
- `src/lib/collapsible/motion.ts` from `packages/react/src/collapsible/panel/useCollapsiblePanel.ts`
- `src/lib/collapsible/Collapsible.svelte.spec.ts` assertions from `packages/react/src/collapsible/**/*.test.tsx`
- `packages/utils/src/event-details.ts` also exports `REASONS.triggerPress` from `packages/react/src/internals/reason-parts.ts`
- `src/lib/internal/render-children.ts` from the `props.children` contract of `packages/react/src/internals/useRenderElement.tsx`
- `src/lib/button/Button.svelte.spec.ts` assertions from `packages/react/src/button/Button.test.tsx`
- `src/lib/fieldset/Fieldset.svelte.spec.ts` assertions from `packages/react/src/fieldset/root/FieldsetRoot.test.tsx`, `packages/react/src/fieldset/legend/FieldsetLegend.test.tsx`, and `packages/react/src/utils/useRegisteredLabelId.test.tsx`
- `src/lib/field/FieldRoot.svelte` from `packages/react/src/field/root/FieldRoot.tsx`
- `src/lib/field/FieldDescription.svelte` from `packages/react/src/field/description/FieldDescription.tsx`
- `src/lib/field/FieldError.svelte` from `packages/react/src/field/error/FieldError.tsx`
- `src/lib/field/FieldItem.svelte` from `packages/react/src/field/item/FieldItem.tsx`
- `src/lib/field/FieldValidity.svelte` from `packages/react/src/field/validity/FieldValidity.tsx`
- `src/lib/field/choice-controls.svelte.spec.ts` assertions from the Field cases of `packages/react/src/checkbox/root/CheckboxRoot.test.tsx`, `switch/root/SwitchRoot.test.tsx`, `radio-group/RadioGroup.test.tsx` and `checkbox-group/CheckboxGroup.test.tsx`
- `src/lib/field/Field.svelte.spec.ts` assertions from `packages/react/src/field/**/*.test.tsx` that do not require Checkbox, Radio, or NumberField
- `src/lib/input/Input.svelte` from `packages/react/src/input/Input.tsx` (delegates to `Field.Control`)
- `src/lib/input/Input.svelte.spec.ts` assertions from `packages/react/src/input/Input.test.tsx` and the textarea host in `packages/react/src/input/Input.spec.tsx`
- `src/lib/separator/Separator.svelte.spec.ts` assertions from `packages/react/src/separator/Separator.test.tsx`
- `src/lib/toggle/Toggle.svelte` from `packages/react/src/toggle/Toggle.tsx`, standalone and inside ToggleGroup
- `src/lib/toggle/Toggle.svelte.spec.ts` assertions from `packages/react/src/toggle/Toggle.test.tsx`
- `src/lib/toggle-group/ToggleGroup.svelte` from `packages/react/src/toggle-group/ToggleGroup.tsx`
- `src/lib/internal/composite-root.svelte.ts` from the linear path of `packages/react/src/internals/composite/root/useCompositeRoot.ts` and `packages/react/src/internals/composite/item/useCompositeItem.ts`, including Toolbar's Home/End off, RadioGroup's orientation `both` with Shift allowed, and `Tabs.List`'s empty `disabledIndices`
- `src/lib/toggle-group/ToggleGroup.svelte.spec.ts` assertions from `packages/react/src/toggle-group/ToggleGroup.test.tsx`
- `packages/utils/src/event-details.ts` from `packages/react/src/internals/createBaseUIEventDetails.ts`
- `src/lib/avatar/Root.svelte` from `packages/react/src/avatar/root/AvatarRoot.tsx`
- `src/lib/avatar/Image.svelte` from `packages/react/src/avatar/image/AvatarImage.tsx`
- `src/lib/avatar/Fallback.svelte` from `packages/react/src/avatar/fallback/AvatarFallback.tsx`
- `src/lib/avatar/Avatar.svelte.spec.ts` assertions from the avatar root, image and fallback tests
- `src/lib/meter/MeterRoot.svelte` from `packages/react/src/meter/root/MeterRoot.tsx`
- `src/lib/meter/MeterTrack.svelte` from `packages/react/src/meter/track/MeterTrack.tsx`
- `src/lib/meter/MeterIndicator.svelte` from `packages/react/src/meter/indicator/MeterIndicator.tsx`
- `src/lib/meter/MeterLabel.svelte` from `packages/react/src/meter/label/MeterLabel.tsx` and `packages/react/src/utils/useRegisteredLabelId.ts` (`useBaseUiId` ids use `$props.id()`, prefixed with `base-ui-`)
- `src/lib/progress/ProgressRoot.svelte` from `packages/react/src/progress/root/ProgressRoot.tsx`
- `src/lib/progress/compute.ts` from the value normalization in `packages/react/src/progress/root/ProgressRoot.tsx`
- `src/lib/progress/compute.spec.ts` assertions from the value math in `packages/react/src/progress/root/ProgressRoot.test.tsx`
- `src/lib/form/Form.svelte` from `packages/react/src/form/Form.tsx`
- `src/lib/form/document-order.ts` from `comesBeforeInSameTree` in `packages/react/src/form/Form.tsx`
- `src/lib/form/Form.svelte.spec.ts` assertions from `packages/react/src/form/Form.test.tsx` that Form can observe without Field
- `packages/utils/src/event-details.ts` also includes `createGenericEventDetails` from `packages/react/src/internals/createBaseUIEventDetails.ts`
- `src/lib/internal/associated-label.ts` from `findAssociatedLabel` in `packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts`
- `src/lib/switch/Switch.svelte.spec.ts` assertions from `packages/react/src/switch/root/SwitchRoot.test.tsx` and `packages/react/src/switch/thumb/SwitchThumb.test.tsx` that do not require Field
- `src/lib/checkbox/CheckboxIndicator.svelte` from `packages/react/src/checkbox/indicator/CheckboxIndicator.tsx`
- `src/lib/internal/composite-skip.ts` from the skip rule in `packages/react/src/internals/composite/root/useCompositeRoot.ts` (Tabs and Toolbar; RadioGroup keeps its own `aria-disabled` skip)
- `src/lib/checkbox/Checkbox.svelte.spec.ts` assertions from `packages/react/src/checkbox/root/CheckboxRoot.test.tsx` and `packages/react/src/checkbox/indicator/CheckboxIndicator.test.tsx` that do not require Field or CheckboxGroup
- `src/lib/checkbox-group/CheckboxGroup.svelte` from `packages/react/src/checkbox-group/CheckboxGroup.tsx`
- `src/lib/checkbox-group/parent.ts` and `src/lib/checkbox-group/parent.svelte.ts` from `packages/react/src/checkbox-group/useCheckboxGroupParent.ts`
- `src/lib/checkbox-group/parent.spec.ts` assertions from the parent-toggle math in `packages/react/src/checkbox-group/useCheckboxGroupParent.ts`
- `src/lib/checkbox-group/CheckboxGroup.svelte.spec.ts` assertions from `packages/react/src/checkbox-group/CheckboxGroup.test.tsx` and `packages/react/src/checkbox-group/useCheckboxGroupParent.test.tsx` that do not require Field
- `src/lib/radio/RadioIndicator.svelte` from `packages/react/src/radio/indicator/RadioIndicator.tsx`
- `src/lib/radio-group/RadioGroup.svelte.spec.ts` assertions from `packages/react/src/radio-group/RadioGroup.test.tsx` that do not require Field or `inputRef`
- `src/lib/radio/Radio.svelte.spec.ts` assertions from `packages/react/src/radio/root/RadioRoot.test.tsx` and `packages/react/src/radio/indicator/RadioIndicator.test.tsx` that do not require Field or RadioGroup
- `packages/utils/src/event-details.ts` also exports `REASONS.disabled`, `REASONS.missing`, and `REASONS.initial` from `packages/react/src/internals/reason-parts.ts`
- `src/lib/tabs/TabsRoot.svelte` from `packages/react/src/tabs/root/TabsRoot.tsx`
- `src/lib/tabs/TabsList.svelte` from `packages/react/src/tabs/list/TabsList.tsx`
- `src/lib/tabs/TabsPanel.svelte` from `packages/react/src/tabs/panel/TabsPanel.tsx`
- `src/lib/internal/getCssDimensions.ts` from `packages/react/src/utils/getCssDimensions.ts` (Tabs indicator and popup auto-resize)
- `src/lib/tabs/direction.ts` from `computeActivationDirection` in `packages/react/src/tabs/root/TabsRoot.tsx`
- `src/lib/tabs/Tabs.svelte.spec.ts` assertions from `packages/react/src/tabs/**/*.test.tsx`
- `src/lib/toolbar/ToolbarRoot.svelte` from `packages/react/src/toolbar/root/ToolbarRoot.tsx`
- `src/lib/toolbar/ToolbarButton.svelte` from `packages/react/src/toolbar/button/ToolbarButton.tsx`
- `src/lib/toolbar/ToolbarGroup.svelte` from `packages/react/src/toolbar/group/ToolbarGroup.tsx`
- `src/lib/toolbar/Toolbar.svelte.spec.ts` assertions from `packages/react/src/toolbar/**/*.test.tsx` that do not require Toolbar.Input or an overlay
- `src/lib/number-field/NumberFieldRoot.svelte` from `packages/react/src/number-field/root/NumberFieldRoot.tsx`
- `src/lib/number-field/NumberFieldStepper.svelte`, `NumberFieldIncrement.svelte`, and `NumberFieldDecrement.svelte` from `packages/react/src/number-field/root/useNumberFieldStepperButton.ts`, `packages/react/src/number-field/increment/NumberFieldIncrement.tsx`, and `packages/react/src/number-field/decrement/NumberFieldDecrement.tsx`
- `src/lib/internal/usePressAndHold.svelte.ts` from `packages/react/src/internals/usePressAndHold.ts`
- `src/lib/number-field/NumberField.svelte.spec.ts` assertions from `packages/react/src/number-field/**/*.test.tsx` that do not require React refs or `className` callbacks
- `packages/utils/src/event-details.ts` also exports the number-field change reasons (`input-change`, `input-clear`, `input-blur`, `input-paste`, `keyboard`, `increment-press`, `decrement-press`, `wheel`, `scrub`) and the slider reasons (`track-press`, `drag`)
- `src/lib/scroll-area/attributes.ts` from the scroll-area `*DataAttributes.ts` modules and `root/stateAttributes.ts`
- `src/lib/scroll-area/css-vars.ts` from the scroll-area `*CssVars.ts` modules
- `src/lib/scroll-area/geometry.ts` from the pure helpers in `packages/react/src/scroll-area/root/ScrollAreaRoot.tsx` and `packages/react/src/scroll-area/viewport/ScrollAreaViewport.tsx`
- `src/lib/scroll-area/ScrollArea.svelte.spec.ts` assertions from `packages/react/src/scroll-area/**/*.test.tsx` that do not require React refs, `className` callbacks, or `DirectionProvider` (direction is the root element's used CSS `direction`)
- `src/lib/slider/SliderRoot.svelte` from `packages/react/src/slider/root/SliderRoot.tsx`
- `src/lib/slider/SliderControl.svelte` from `packages/react/src/slider/control/SliderControl.tsx`
- `src/lib/slider/SliderTrack.svelte` from `packages/react/src/slider/track/SliderTrack.tsx`
- `src/lib/slider/dom.ts` from the `isElement`, `matchesFocusVisible`, and `focusElement` helpers Slider calls
- `src/lib/slider/Slider.svelte.spec.ts` assertions from `packages/react/src/slider/**/*.test.tsx` that do not require React refs or `className` callbacks
- `src/lib/direction-provider/DirectionProvider.svelte` from `packages/react/src/direction-provider/DirectionProvider.tsx`
- `src/lib/direction-provider/DirectionProvider.svelte.spec.ts` assertions from `packages/react/src/direction-provider/DirectionProvider.test.tsx`
- `src/lib/otp-field/OTPFieldRoot.svelte` from `packages/react/src/otp-field/root/OTPFieldRoot.tsx`
- `src/lib/otp-field/dom.ts` from `packages/react/src/floating-ui-react/utils/event.ts` (`stopEvent`)
- `src/lib/internal/css-style.ts` from the style-string helpers shared by Progress, NumberField, OTP Field, Slider, Checkbox, Radio, and Switch
- `src/lib/internal/click.ts` from `packages/react/src/utils/dispatchClickWithModifiers.ts`
- `src/lib/internal/button.svelte.ts` from `packages/react/src/internals/use-button/useButton.ts` and `packages/react/src/utils/useFocusableWhenDisabled.ts`
- `src/lib/internal/element-list.svelte.ts` from the DOM-order list and render-order index in `packages/react/src/internals/composite/list/useCompositeListItem.ts` and `CompositeList.tsx` (`ElementList`, `RenderOrder`, `byDocumentOrder`)
- `src/lib/toolbar/item-registration.svelte.ts` from the item ref in `packages/react/src/internals/composite/item/useCompositeItem.ts`
- `src/lib/internal/roving-keys.ts` from the arrow-key helpers in `packages/react/src/internals/composite/root/useCompositeRoot.ts` (`modifierHeld`, `axisKeys`)
- `src/lib/otp-field/otp.spec.ts` assertions from `packages/react/src/otp-field/utils/otp.test.ts`
- `src/lib/otp-field/OTPField.svelte.spec.ts` assertions from `packages/react/src/otp-field/**/*.test.tsx` that do not require React refs or `className` callbacks
- `src/lib/csp-provider/CSPProvider.svelte` from `packages/react/src/csp-provider/CSPProvider.tsx`
- `src/lib/internal/mergeProps.ts` from `packages/react/src/merge-props/mergeProps.ts` (rightmost bag wins; its handler runs first; `preventBaseUIHandler()` skips the rest). `chain` and `mergeClass` live there too.
- `packages/floating-ui-svelte/src/**` from `packages/react/src/floating-ui-react/**` (phase 1a: portal, focus manager, dismiss, click, tree, and the DOM helpers those call; phase 1b: hover, `safePolygon`, and the local arrow middleware)
- `packages/floating-ui-svelte/src/usePosition.svelte.ts` from `@floating-ui/react-dom` `useFloating` (positioning only; `computePosition` and `autoUpdate` stay in this file)
- `src/lib/internal/useAnchorPositioning.svelte.ts` from `packages/react/src/internals/useAnchorPositioning.ts`
- `src/lib/internal/hideMiddleware.ts` from `packages/react/src/utils/hideMiddleware.ts`
- `src/lib/internal/CommonPositionerCssVars.ts` from `packages/react/src/utils/CommonPositionerCssVars.ts`
- `src/lib/internal/useAnchoredPopupScrollLock.svelte.ts` from `packages/react/src/utils/useAnchoredPopupScrollLock.ts`
- `src/lib/internal/popups/triggerFocusGuards.ts` from `packages/react/src/utils/popups/useTriggerFocusGuards.ts`
- `src/lib/internal/popups/**` from `packages/react/src/utils/popups/**` and `packages/react/src/dialog/store/DialogStore.ts` (`setOpen`'s immediate `preventUnmountOnClose`)
- `src/lib/internal/useScrollLock.svelte.ts` from `packages/utils/src/useScrollLock.ts`
- `src/lib/internal/useTransitionStatus.svelte.ts` from `packages/react/src/internals/useTransitionStatus.ts`
- `packages/utils/src/openInteraction.ts` from `packages/react/src/utils/useOpenInteractionType.ts` and `packages/utils/src/useEnhancedClickHandler.ts`
- `src/lib/internal/popupStateMapping.ts`, `CommonPopupDataAttributes.ts`, and `CommonTriggerDataAttributes.ts` from the matching files in `packages/react/src/utils`
- `packages/utils/src/FocusGuard.svelte` and `InternalBackdrop.svelte` from `packages/react/src/utils/FocusGuard.tsx` and `InternalBackdrop.tsx`
- `packages/utils/src/event-details.ts` also exports the popup reasons `trigger-hover`, `escape-key`, `outside-press`, `focus-out`, `close-press`, and `imperative-action`
- `src/lib/popover/PopoverRoot.svelte` from `packages/react/src/popover/root/PopoverRoot.tsx`
- `src/lib/popover/PopoverTrigger.svelte` from `packages/react/src/popover/trigger/PopoverTrigger.tsx`
- `src/lib/popover/PopoverPortal.svelte` from `packages/react/src/popover/portal/PopoverPortal.tsx`
- `src/lib/internal/portal-props.ts` from the host props of `packages/react/src/dialog/portal/DialogPortal.tsx` and `packages/react/src/popover/portal/PopoverPortal.tsx` (one shared type)
- `src/lib/popover/PopoverPositioner.svelte` from `packages/react/src/popover/positioner/PopoverPositioner.tsx`
- `src/lib/popover/PopoverPopup.svelte` from `packages/react/src/popover/popup/PopoverPopup.tsx`
- `src/lib/popover/PopoverArrow.svelte` from `packages/react/src/popover/arrow/PopoverArrow.tsx`
- `src/lib/popover/PopoverBackdrop.svelte` from `packages/react/src/popover/backdrop/PopoverBackdrop.tsx`
- `src/lib/popover/PopoverTitle.svelte` from `packages/react/src/popover/title/PopoverTitle.tsx`
- `src/lib/popover/PopoverDescription.svelte` from `packages/react/src/popover/description/PopoverDescription.tsx`
- `src/lib/popover/PopoverClose.svelte` from `packages/react/src/popover/close/PopoverClose.tsx`
- `src/lib/popover/PopoverViewport.svelte` from `packages/react/src/popover/viewport/PopoverViewport.tsx`
- `src/lib/internal/usePopupViewport.svelte.ts` from `packages/react/src/utils/usePopupViewport.tsx`
- `src/lib/internal/usePopupAutoResize.svelte.ts` from `packages/react/src/utils/usePopupAutoResize.ts`
- `src/lib/popover/store.svelte.ts` from `packages/react/src/popover/store/PopoverStore.ts` (open changes go through the shared `PopupStore`; popover adds deferred unmount, hover stick, and instant type)
- `src/lib/popover/handle.svelte.ts` from `packages/react/src/popover/store/PopoverHandle.ts` (extends the shared `PopupHandle`; Dialog's payload writers are not included)
- `src/lib/popover/PopoverLabel.svelte` from `packages/react/src/popover/title/PopoverTitle.tsx` and `packages/react/src/popover/description/PopoverDescription.tsx`
- `src/lib/popover/context.svelte.ts` from the popover root, portal, and positioner context modules
- `src/lib/internal/composite-keys.ts` from Base UI `COMPOSITE_KEYS` and the arrow subset (`ARROW_KEYS`), shared by dialog, popover, slider, tabs, toggle group, toolbar, and radio group
- `src/lib/internal/adaptiveOriginMiddleware.ts` from `packages/react/src/utils/adaptiveOriginMiddleware.ts`
- `createDefaultInitialFocus` and `resolveFocus` in `src/lib/internal/popups/popupStoreUtils.ts` from `packages/react/src/utils/popups/popupStoreUtils.ts`
- `src/lib/popover/Popover.svelte.spec.ts` assertions from `packages/react/src/popover/**/*.test.tsx` that do not require Menu, Combobox, or React refs
- `src/lib/dialog/DialogRoot.svelte` from `packages/react/src/dialog/root/DialogRoot.tsx` (setup is `src/lib/dialog/root.svelte.ts`, below)
- `src/lib/dialog/DialogTrigger.svelte` from `packages/react/src/dialog/trigger/DialogTrigger.tsx` (button behavior is the existing `Button`)
- `src/lib/dialog/DialogPortal.svelte` from `packages/react/src/dialog/portal/DialogPortal.tsx`
- `src/lib/dialog/DialogPopup.svelte` from `packages/react/src/dialog/popup/DialogPopup.tsx`
- `src/lib/dialog/DialogBackdrop.svelte` from `packages/react/src/dialog/backdrop/DialogBackdrop.tsx`
- `src/lib/dialog/DialogTitle.svelte` and `src/lib/dialog/DialogLabel.svelte` from `packages/react/src/dialog/title/DialogTitle.tsx`
- `src/lib/internal/popups/labelId.ts` from the dialog and popover title/description id registration (`DialogLabel` and `PopoverLabel` call it)
- `src/lib/dialog/DialogDescription.svelte` from `packages/react/src/dialog/description/DialogDescription.tsx` (`DialogLabel` also covers this part)
- `src/lib/dialog/DialogClose.svelte` and `src/lib/dialog/DialogAction.svelte` from `packages/react/src/dialog/close/DialogClose.tsx` and `packages/react/src/dialog/trigger/DialogTrigger.tsx`
- `src/lib/dialog/DialogViewport.svelte` from `packages/react/src/dialog/viewport/DialogViewport.tsx`
- `src/lib/dialog/store.svelte.ts` from `packages/react/src/dialog/store/DialogStore.ts` (extends the landed `PopupStore`)
- `src/lib/internal/popups/popupHandle.svelte.ts` from `packages/react/src/utils/popups/popupHandle.ts` and `src/lib/dialog/handle.svelte.ts` from `packages/react/src/dialog/store/DialogHandle.ts` (`openWithPayload` stays on `Dialog.Handle`)
- `src/lib/dialog/context.svelte.ts` from `packages/react/src/dialog/root/DialogRootContext.ts` and `packages/react/src/dialog/portal/DialogPortalContext.ts`
- `src/lib/dialog/attributes.ts` from `packages/react/src/dialog/utils/stateAttributesMapping.ts` and the dialog `*DataAttributes.ts` files
- `src/lib/dialog/Dialog.svelte.spec.ts` assertions from `packages/react/src/dialog/**/*.test.tsx` that do not require Alert Dialog, Drawer, Menu, or Select
- `src/lib/internal/popups/store.svelte.ts` `forceUnmount` and `notifyOpenChangeComplete` expose the close-completion path Dialog's `unmount()` and open animation use
- `src/lib/tooltip/**` from `packages/react/src/tooltip/**` of Base UI v1.9.0, commit `ad7ecda5296b0295b41a51ecb01fce6204acd099` (Provider, Root, Trigger, Portal, Positioner, Popup, Arrow, Viewport and the handle; `store.svelte.ts` extends the shared `TriggerOwnedPopupStore`)
- `src/lib/tooltip/*.svelte.spec.ts` assertions from `packages/react/src/tooltip/**/*.test.tsx` of that commit that do not require React refs, StrictMode, or SSR hydration
- PreviewCard derives from Base UI v1.9.0, commit `ad7ecda5296b0295b41a51ecb01fce6204acd099`:
- `src/lib/preview-card/PreviewCardRoot.svelte` and `PreviewCardInteractions.svelte` from `packages/react/src/preview-card/root/PreviewCardRoot.tsx`
- `src/lib/preview-card/PreviewCardTrigger.svelte` and `PreviewCardTriggerInteractions.svelte` from `packages/react/src/preview-card/trigger/PreviewCardTrigger.tsx`
- `src/lib/preview-card/PreviewCardPortal.svelte`, `PreviewCardPositioner.svelte`, `PreviewCardPopup.svelte`, `PreviewCardArrow.svelte`, `PreviewCardBackdrop.svelte` and `PreviewCardViewport.svelte` from the matching files under `packages/react/src/preview-card/`
- `src/lib/preview-card/store.svelte.ts` from `packages/react/src/preview-card/store/PreviewCardStore.ts` and the dismiss-close and instant-type rules of `packages/react/src/utils/popups/popupStoreUtils.ts` (extends the shared `TriggerOwnedPopupStore`)
- `src/lib/preview-card/handle.svelte.ts` from `packages/react/src/preview-card/store/PreviewCardHandle.ts` (extends the shared `PopupHandle`)
- `src/lib/preview-card/inline-rect.ts` from `packages/react/src/utils/popups/inlineRect.ts`
- `src/lib/preview-card/constants.ts` and `context.svelte.ts` from `packages/react/src/preview-card/utils/constants.ts` and the preview card root, portal, and positioner context modules
- `src/lib/preview-card/inline-rect.spec.ts` assertions from `packages/react/src/utils/popups/inlineRect.test.ts`
- `src/lib/preview-card/PreviewCard*.svelte.spec.ts` assertions from `packages/react/src/preview-card/**/*.test.tsx`, `packages/react/test/popupConformanceTests.tsx`, `detachedTriggersConformanceTests.tsx`, `positionerConformanceTests.tsx` and `viewportConformanceTests.tsx`
- `src/lib/internal/popups/triggerOwnedStore.svelte.ts`, the trigger ownership Tooltip and PreviewCard share, from `useImplicitActiveTrigger` and `useTriggerDataForwarding` in `packages/react/src/utils/popups/popupStoreUtils.ts` of that commit

Parts derive from Base UI v1.9.0, commit `ad7ecda5296b0295b41a51ecb01fce6204acd099`:

- `src/lib/dialog/root.svelte.ts` from `packages/react/src/dialog/root/useRenderDialogRoot.tsx` and `useDialogRoot.ts` (the setup Dialog and Alert Dialog roots share, including the nested-dialog count)
- `src/lib/alert-dialog/AlertDialogRoot.svelte` from `packages/react/src/alert-dialog/root/AlertDialogRoot.tsx`
- `src/lib/alert-dialog/handle.svelte.ts` from `packages/react/src/alert-dialog/handle.ts`
- `src/lib/alert-dialog/types.ts` and `src/lib/alert-dialog/index.ts` from `packages/react/src/alert-dialog/index.ts`, `index.parts.ts`, `root/AlertDialogRoot.tsx`, and `trigger/AlertDialogTrigger.tsx` (the other parts are the Dialog components)
- `src/lib/alert-dialog/AlertDialog.svelte.spec.ts` assertions from `packages/react/src/alert-dialog/root/AlertDialogRoot.test.tsx`, the handle-type checks in `AlertDialogRoot.spec.tsx`, `packages/react/test/popupConformanceTests.tsx`, `packages/react/test/dialogRootSharedTests.tsx`, and `packages/react/test/detachedTriggersConformanceTests.tsx`
- `src/lib/alert-dialog/AlertDialogTrigger.svelte` from `packages/react/src/alert-dialog/trigger/AlertDialogTrigger.tsx` (renders `Dialog.Trigger`)
- `src/tests/PayloadTypes.svelte` type checks from `packages/react/src/dialog/root/DialogRoot.spec.tsx`, `packages/react/src/alert-dialog/root/AlertDialogRoot.spec.tsx`, and `packages/react/src/popover/root/PopoverRoot.spec.tsx`
- `src/lib/dialog/DialogTrigger.svelte` payload forwarding from `packages/react/src/utils/popups/popupStoreUtils.ts` (`useTriggerDataForwarding` and `useImplicitActiveTrigger`: the trigger that owns the mounted popup, or the only trigger of a popup not opened deliberately without one, supplies the payload)
- `openedWithoutTrigger` in `src/lib/internal/popups/popupStoreUtils.ts` `createPopupOpenState` and `src/lib/internal/popups/store.svelte.ts` from `packages/react/src/utils/popups/popupStoreUtils.ts` and `store.ts`
- `src/lib/dialog/Dialog.svelte.spec.ts` programmatic payload cases from `packages/react/src/dialog/root/DialogRoot.detached-triggers.test.tsx`, and the `openedWithoutTrigger` cases in `src/lib/internal/popups/popupStoreUtils.spec.ts` from `packages/react/src/utils/popups/popupStoreUtils.test.tsx`
- `src/lib/dialog/store.svelte.ts` `onNestedDialogOpen` from `packages/react/src/dialog/root/useDialogRoot.ts` (a closed, unmounted root ignores nested counts)
- `src/lib/button/Button.svelte` from `packages/react/src/button/Button.tsx`
- `src/lib/accordion/AccordionTrigger.svelte` from `packages/react/src/accordion/trigger/AccordionTrigger.tsx`
- `src/lib/accordion/context.svelte.ts` from `packages/react/src/accordion/root/AccordionRootContext.ts` and `packages/react/src/accordion/item/AccordionItemContext.ts`
- `src/lib/collapsible/CollapsibleTrigger.svelte` from `packages/react/src/collapsible/trigger/CollapsibleTrigger.tsx`
- `src/lib/collapsible/attributes.ts` from `packages/react/src/collapsible/root/stateAttributesMapping.ts`, `packages/react/src/utils/collapsibleOpenStateMapping.ts`, and `packages/react/src/internals/stateAttributesMapping.ts`
- `src/lib/fieldset/FieldsetRoot.svelte` from `packages/react/src/fieldset/root/FieldsetRoot.tsx`
- `src/lib/fieldset/FieldsetLegend.svelte` from `packages/react/src/fieldset/legend/FieldsetLegend.tsx`
- `src/lib/fieldset/context.svelte.ts` from `packages/react/src/fieldset/root/FieldsetRootContext.ts`
- `src/lib/internal/register-label-id.svelte.ts` from `packages/react/src/utils/useRegisteredLabelId.ts`
- `src/lib/field/FieldControl.svelte` from `packages/react/src/field/control/FieldControl.tsx`
- `src/lib/internal/field-register-control.svelte.ts` from `packages/react/src/internals/field-register-control/useRegisterFieldControl.ts`
- `src/lib/field/FieldLabel.svelte` from `packages/react/src/field/label/FieldLabel.tsx` and `packages/react/src/internals/labelable-provider/useLabel.ts`
- `src/lib/internal/labelable-provider.svelte.ts` from `packages/react/src/internals/labelable-provider/LabelableProvider.tsx`, `useLabelableId.ts` and `useAriaLabelledBy.ts`
- `src/lib/field/validity.ts` from `packages/react/src/field/utils/getCombinedFieldValidityData.ts` and `isEligibleInput` in `useFieldValidation.ts`
- `src/lib/field/attributes.ts` from `packages/react/src/internals/field-constants/constants.ts` and `packages/react/src/internals/stateAttributesMapping.ts`
- `src/lib/internal/field-constants.ts` from `packages/react/src/internals/field-constants/constants.ts`
- `src/lib/internal/field-root-context.ts` from `packages/react/src/internals/field-root-context/FieldRootContext.ts`
- `src/lib/field/item-context.ts` from `packages/react/src/field/item/FieldItemContext.ts`
- `src/lib/separator/Separator.svelte` from `packages/react/src/separator/Separator.tsx`
- `src/lib/toggle-group/context.svelte.ts` from `packages/react/src/toggle-group/ToggleGroupContext.ts`
- `src/lib/internal/state-attributes.ts` from `packages/react/src/internals/getStateAttributesProps.ts` and `packages/react/src/internals/stateAttributesMapping.ts` (`transitionStatusMapping`)
- `src/lib/internal/valueToPercent.ts` from `packages/react/src/utils/valueToPercent.ts`
- `src/lib/internal/clamp.ts` from `packages/utils/src/clamp.ts`
- `packages/utils/src/areArraysEqual.ts` from `packages/utils/src/areArraysEqual.ts`
- `src/lib/internal/useValueChanged.svelte.ts` from `packages/react/src/internals/useValueChanged.ts`
- `src/lib/internal/formatNumber.ts` from `packages/utils/src/formatNumber.ts`
- `src/lib/internal/stringifyLocale.ts` from `packages/utils/src/stringifyLocale.ts` (cache key used by `formatNumber`)
- `packages/utils/src/visuallyHidden.ts` from `packages/utils/src/visuallyHidden.ts` (nonzero lengths use explicit `px` units for native style strings)
- `src/lib/internal/formatNumber.spec.ts` assertions from `packages/utils/src/formatNumber.test.ts`
- `src/lib/internal/stringifyLocale.spec.ts` assertions from `packages/utils/src/stringifyLocale.test.ts`
- `src/lib/avatar/image-loading-status.svelte.ts` from `packages/react/src/avatar/image/useImageLoadingStatus.ts`
- `src/lib/avatar/attributes.ts` from `packages/react/src/avatar/root/stateAttributesMapping.ts`
- `src/lib/avatar/context.ts` from `packages/react/src/avatar/root/AvatarRootContext.ts`
- `src/lib/meter/MeterValue.svelte` from `packages/react/src/meter/value/MeterValue.tsx`
- `src/lib/meter/context.ts` from `packages/react/src/meter/root/MeterRootContext.ts`
- `src/lib/meter/Meter.svelte.spec.ts` assertions from the meter `*.test.tsx` files and `packages/react/src/utils/useRegisteredLabelId.test.tsx`
- `src/lib/progress/ProgressRootContext.svelte.ts` from `packages/react/src/progress/root/ProgressRootContext.tsx`
- `src/lib/progress/stateAttributesMapping.ts` from `packages/react/src/progress/root/stateAttributesMapping.ts`
- `src/lib/progress/ProgressTrack.svelte` from `packages/react/src/progress/track/ProgressTrack.tsx`
- `src/lib/progress/ProgressIndicator.svelte` from `packages/react/src/progress/indicator/ProgressIndicator.tsx`
- `src/lib/progress/ProgressValue.svelte` from `packages/react/src/progress/value/ProgressValue.tsx`
- `src/lib/progress/ProgressLabel.svelte` from `packages/react/src/progress/label/ProgressLabel.tsx` and `packages/react/src/utils/useRegisteredLabelId.ts`
- `src/lib/progress/Progress.svelte.spec.ts` assertions from `packages/react/src/progress/**/*.test.tsx`
- `src/lib/internal/form-context.ts` from `packages/react/src/internals/form-context/FormContext.ts`
- `src/lib/switch/SwitchRoot.svelte` from `packages/react/src/switch/root/SwitchRoot.tsx` and the native-label fallback of `packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts`
- `src/lib/switch/SwitchThumb.svelte` from `packages/react/src/switch/thumb/SwitchThumb.tsx`
- `src/lib/switch/context.ts` from `packages/react/src/switch/root/SwitchRootContext.ts`
- `src/lib/switch/attributes.ts` from `packages/react/src/switch/stateAttributesMapping.ts` (Field validity attributes omitted)
- `src/lib/checkbox/CheckboxRoot.svelte` from `packages/react/src/checkbox/root/CheckboxRoot.tsx` and the native-label fallback of `packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts`
- `src/lib/internal/animations-finished.ts` from `packages/react/src/internals/useAnimationsFinished.ts` (checkbox, radio, tabs, field error, and collapsible)
- `src/lib/internal/getDefaultFormSubmitter.ts` from `packages/utils/src/getDefaultFormSubmitter.ts`
- `src/lib/checkbox/context.ts` from `packages/react/src/checkbox/root/CheckboxRootContext.ts`
- `src/lib/checkbox/attributes.ts` from `packages/react/src/checkbox/utils/getCheckboxStateAttributesMapping.ts` (Field validity attributes omitted)
- `src/lib/checkbox/group-context.ts` from the fields `Checkbox.Root` reads in `packages/react/src/checkbox-group/CheckboxGroupContext.ts`
- `src/lib/radio/RadioRoot.svelte` from `packages/react/src/radio/root/RadioRoot.tsx` and the native-label fallback of `packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts`
- `src/lib/radio/context.ts` from `packages/react/src/radio/root/RadioRootContext.ts`
- `src/lib/radio/group-context.ts` from the fields `Radio.Root` reads in `packages/react/src/radio-group/RadioGroupContext.ts`
- `src/lib/radio-group/RadioGroup.svelte` from `packages/react/src/radio-group/RadioGroup.tsx`
- `src/lib/radio/attributes.ts` from `packages/react/src/radio/utils/stateAttributesMapping.ts` (Field validity attributes omitted)
- `src/lib/internal/serializeValue.ts` from `packages/react/src/internals/serializeValue.ts`
- `src/lib/tabs/TabsTab.svelte` from `packages/react/src/tabs/tab/TabsTab.tsx`
- `src/lib/tabs/TabsIndicator.svelte` and `src/lib/tabs/indicator.ts` from `packages/react/src/tabs/indicator/TabsIndicator.tsx`
- `src/lib/internal/getElementTransform.ts` from `packages/react/src/utils/getElementTransform.ts`
- `src/lib/tabs/context.svelte.ts` from `packages/react/src/tabs/root/TabsRootContext.ts` and `packages/react/src/tabs/list/TabsListContext.ts`
- `src/lib/tabs/attributes.ts` from `packages/react/src/tabs/root/stateAttributesMapping.ts`, `packages/react/src/tabs/panel/TabsPanelDataAttributes.ts`, and `packages/react/src/tabs/indicator/TabsIndicatorCssVars.ts`
- `src/lib/toolbar/ToolbarLink.svelte` from `packages/react/src/toolbar/link/ToolbarLink.tsx`
- `src/lib/toolbar/context.svelte.ts` from `packages/react/src/toolbar/root/ToolbarRootContext.ts` and `packages/react/src/toolbar/group/ToolbarGroupContext.ts`
- `src/lib/number-field/NumberFieldGroup.svelte` from `packages/react/src/number-field/group/NumberFieldGroup.tsx`
- `src/lib/number-field/NumberFieldInput.svelte` from `packages/react/src/number-field/input/NumberFieldInput.tsx`
- `src/lib/number-field/NumberFieldScrubArea.svelte` from `packages/react/src/number-field/scrub-area/NumberFieldScrubArea.tsx`
- `src/lib/number-field/NumberFieldScrubAreaCursor.svelte` from `packages/react/src/number-field/scrub-area-cursor/NumberFieldScrubAreaCursor.tsx`
- `src/lib/number-field/parse.ts` and `validate.ts` from `packages/react/src/number-field/utils/parse.ts` and `validate.ts`
- `src/lib/number-field/viewport.ts` from `packages/react/src/number-field/utils/getViewportRect.ts`
- `src/lib/scroll-area/ScrollAreaRoot.svelte` and `src/lib/scroll-area/model.svelte.ts` from `packages/react/src/scroll-area/root/ScrollAreaRoot.tsx` and `ScrollAreaRootContext.ts`
- `src/lib/scroll-area/ScrollAreaViewport.svelte` from `packages/react/src/scroll-area/viewport/ScrollAreaViewport.tsx`
- `src/lib/scroll-area/ScrollAreaScrollbar.svelte` from `packages/react/src/scroll-area/scrollbar/ScrollAreaScrollbar.tsx`
- `src/lib/scroll-area/ScrollAreaThumb.svelte` from `packages/react/src/scroll-area/thumb/ScrollAreaThumb.tsx`
- `src/lib/scroll-area/ScrollAreaContent.svelte` from `packages/react/src/scroll-area/content/ScrollAreaContent.tsx`
- `src/lib/scroll-area/ScrollAreaCorner.svelte` from `packages/react/src/scroll-area/corner/ScrollAreaCorner.tsx`
- `src/lib/internal/scrollEdges.ts` from `packages/react/src/utils/scrollEdges.ts`
- `src/lib/internal/styles.ts` from `packages/react/src/utils/styles.tsx` (the disable-scrollbar class and CSS)
- `src/lib/scroll-area/constants.ts` from `packages/react/src/scroll-area/constants.ts`
- `src/lib/scroll-area/dom.ts` from `packages/react/src/scroll-area/utils/getOffset.ts`
- `src/lib/slider/SliderIndicator.svelte` and `src/lib/slider/indicator-style.ts` from `packages/react/src/slider/indicator/SliderIndicator.tsx`
- `src/lib/slider/SliderThumb.svelte` and `src/lib/slider/prehydration.ts` from `packages/react/src/slider/thumb/SliderThumb.tsx` and `prehydrationScript.min.ts`
- `src/lib/internal/PrehydrationScript.ts` from `packages/react/src/internals/PrehydrationScript.tsx`
- `src/lib/slider/SliderLabel.svelte` from `packages/react/src/slider/label/SliderLabel.tsx` and the non-native path of `packages/react/src/internals/labelable-provider/useLabel.ts`
- `src/lib/slider/SliderValue.svelte` from `packages/react/src/slider/value/SliderValue.tsx`
- `src/lib/slider/asc.ts`, `roundValueToStep.ts`, `getSliderValue.ts`, `validateMinimumDistance.ts`, `getMidpoint.ts`, `getPushedThumbValues.ts`, and `resolveThumbCollision.ts` from the matching files in `packages/react/src/slider/utils`
- `src/lib/internal/direction-context.ts` from `packages/react/src/internals/direction-context/DirectionContext.tsx`
- `src/lib/otp-field/OTPFieldInput.svelte` from `packages/react/src/otp-field/input/OTPFieldInput.tsx`
- `src/lib/otp-field/otp.ts` from `packages/react/src/otp-field/utils/otp.ts`
- `src/lib/otp-field/attributes.ts` from `packages/react/src/otp-field/utils/stateAttributesMapping.ts` and the OTP field data-attribute modules
- `packages/utils/src/platform.ts` from `packages/utils/src/platform` (`os`, `engine`, `screenReader`, `env`, `mediaQuery`)
- `packages/utils/src/shadow-dom.ts` from `packages/utils/src/shadowDom.ts` (`activeElement`, `contains`, `getTarget`)
- `packages/utils/src/owner.ts` from `packages/utils/src/owner.ts`
- `packages/utils/src/log.ts` from `packages/utils/src/createLogOnce.ts`, `packages/utils/src/warn.ts`, and `packages/utils/src/error.ts`
- `src/lib/scroll-area/track-style.ts` and `src/lib/scroll-area/scrollbar-part.svelte.ts` from the scrollbar geometry in `packages/react/src/scroll-area/scrollbar/ScrollAreaScrollbar.tsx`
- `packages/utils/src/timeout.ts` from `packages/utils/src/useTimeout.ts` (`Timeout`), `packages/utils/src/useAnimationFrame.ts` (`AnimationFrame`), and `packages/react/src/internals/TimeoutManager.ts`
- `packages/utils/src/timeout.svelte.ts` from `packages/utils/src/useTimeout.ts` (`useTimeout`) and `packages/utils/src/useAnimationFrame.ts` (`useAnimationFrame`) as `ScopedTimeout`, `ScopedInterval` and `ScopedAnimationFrame`. Cleanup is `$effect`, not `useOnMount`
- `src/lib/internal/csp-context.ts` from `packages/react/src/internals/csp-context/CSPContext.tsx`
- `src/lib/csp-provider/CSPProvider.svelte.spec.ts` assertions from `packages/react/src/csp-provider/CSPProvider.test.tsx` (the context values those ScrollArea and Select style-tag checks depend on; the style tags themselves stay with those components)
- `src/lib/internal/useOpenChangeComplete.svelte.ts` from `packages/react/src/internals/useOpenChangeComplete.tsx`
- `src/lib/collapsible/PanelHost.svelte` from `packages/react/src/collapsible/panel/CollapsiblePanel.tsx`
- `src/lib/collapsible/panel-motion.svelte.ts` from `packages/react/src/collapsible/panel/useCollapsiblePanel.ts`, `useOpenChangeComplete`, and `useAnimationsFinished`
- `src/lib/field/model.svelte.ts` from `packages/react/src/field/root/FieldRoot.tsx`, `useFieldValidation.ts`, and `packages/react/src/internals/field-register-control/useFieldControlRegistration.ts`
- `src/lib/number-field/model.svelte.ts` from `packages/react/src/number-field/root/NumberFieldRoot.tsx`
- `src/lib/slider/model.svelte.ts` from `packages/react/src/slider/root/SliderRoot.tsx` and `packages/react/src/slider/control/SliderControl.tsx`
- `src/lib/otp-field/model.svelte.ts` from `packages/react/src/otp-field/root/OTPFieldRoot.tsx` and `OTPFieldRootContext.ts`
- `src/lib/internal/useSetFieldFocused.svelte.ts` from `packages/react/src/internals/field-root-context/useSetFieldFocused.ts`
- `src/lib/internal/useLabel.ts` from `getControlById` in `packages/react/src/internals/labelable-provider/useLabel.ts`
- `src/lib/internal/getFiniteAnimations.ts` from `packages/react/src/utils/getFiniteAnimations.ts`
- `packages/utils/src/shadow-dom.ts` `closest` from `packages/utils/src/shadowDom.ts`
- `src/lib/field/field-focus.svelte.spec.ts` assertions from the stale focus cases in the Checkbox, Field.Control, NumberField, OTPField, Radio, RadioGroup, Slider and Switch root `*.test.tsx` files
- `src/tests/aria-label-preference-cases.ts` assertions from `packages/react/src/checkbox/root/CheckboxRoot.test.tsx`, `packages/react/src/radio/root/RadioRoot.test.tsx` and `packages/react/src/switch/root/SwitchRoot.test.tsx`
- `src/lib/field/label-shadow-dom.svelte.spec.ts` assertions from `packages/react/src/internals/labelable-provider/useLabel.test.tsx` and `packages/react/src/slider/label/SliderLabel.test.tsx`
- `src/lib/otp-field/otp-composition.svelte.spec.ts` and `otp-composition-android.svelte.spec.ts` assertions from `packages/react/src/otp-field/input/OTPFieldInput.test.tsx` and `OTPFieldInput.android.test.tsx`
- `src/lib/scroll-area/scroll-area-animations.svelte.spec.ts` assertions from `packages/react/src/scroll-area/viewport/ScrollAreaViewport.test.tsx`
- `src/lib/internal/visually-hidden.svelte.spec.ts` assertions from `packages/utils/src/visuallyHidden.test.tsx`
- The v1.9.0 cases in the Accordion, Checkbox, Collapsible, Field, NumberField, Radio, RadioGroup, ScrollArea, Slider and Switch specs, from the commits each spec header names
- `src/lib/drawer/DrawerRoot.svelte`, `src/lib/drawer/root.svelte.ts`, and `src/lib/drawer/snap-points.ts` from `packages/react/src/drawer/root/DrawerRoot.tsx`, `DrawerRootContext.ts`, and `useDrawerSnapPoints.ts` (the dialog setup is `createDialogRoot`)
- `src/lib/drawer/DrawerTrigger.svelte`, `DrawerPopup.svelte`, `DrawerBackdrop.svelte`, `DrawerViewport.svelte`, `DrawerSwipeArea.svelte`, `DrawerContent.svelte`, `DrawerProvider.svelte`, `DrawerIndent.svelte`, `DrawerIndentBackground.svelte`, and `DrawerVirtualKeyboardProvider.svelte` from the matching `packages/react/src/drawer/*/Drawer*.tsx` part files
- `src/lib/drawer/context.svelte.ts`, `src/lib/drawer/handle.svelte.ts`, `src/lib/drawer/attributes.ts`, `src/lib/drawer/types.ts`, and `src/lib/drawer/index.ts` from `packages/react/src/drawer/provider/DrawerProvider.tsx`, `handle.ts`, the drawer `*CssVars.ts` and `*DataAttributes.ts` files, `index.ts`, and `index.parts.ts` (Portal, Title, Description, and Close are the Dialog components)
- `src/lib/internal/useSwipeDismiss.svelte.ts` from `packages/react/src/utils/useSwipeDismiss.ts`
- `src/lib/internal/scrollable.ts` from `packages/react/src/utils/scrollable.ts`, `src/lib/internal/getElementAtPoint.ts` from `packages/react/src/utils/getElementAtPoint.ts`, and `src/lib/internal/swipe-ignore.ts` from the swipe-ignore attribute in `packages/react/src/internals/constants.ts`
- `src/lib/internal/getElementTransform.ts` `scale` from `packages/react/src/utils/getElementTransform.ts`
- `packages/utils/src/shadow-dom.ts` `closest`, and `contains` across shadow roots, from `packages/utils/src/shadowDom.ts`
- `packages/utils/src/event-details.ts` `closeWatcher` and `swipe` reasons from `packages/react/src/internals/reason-parts.ts`
- `src/lib/dialog/store.svelte.ts` `nestedOpenDrawerCount` and `outsidePressEnabled`, and their reporting in `src/lib/dialog/root.svelte.ts`, from `packages/react/src/dialog/root/useDialogRoot.ts` and `packages/react/src/drawer/swipe-area/DrawerSwipeArea.tsx`
- `src/lib/drawer/*.svelte.spec.ts`, `src/lib/drawer/snap-points.spec.ts`, `src/lib/drawer/ssr.spec.ts`, `src/tests/drawer-gestures.ts`, and the `src/tests/Drawer*.svelte` harnesses from `packages/react/src/drawer/**/*.test.tsx` and `useDrawerSnapPoints.test.ts`
- `packages/utils/src/event-details.ts` also exports `REASONS.listNavigation` from `packages/react/src/internals/reason-parts.ts`
- `packages/floating-ui-svelte/src/utils/enqueueFocus.ts` from `packages/react/src/floating-ui-react/utils/enqueueFocus.ts` (the `sync` option and one queued focus per page)
- `packages/floating-ui-svelte/src/hooks/useListNavigation.svelte.ts` from `packages/react/src/floating-ui-react/hooks/useListNavigation.ts` as `ListNavigation` (no `grid` option)
- `packages/floating-ui-svelte/src/utils/listIndex.ts` from the list helpers in `packages/react/src/floating-ui-react/utils/composite.ts`
- `packages/floating-ui-svelte/src/utils/listOrientation.ts` from the orientation-key helpers in `packages/react/src/floating-ui-react/hooks/useListNavigation.ts`
- `packages/floating-ui-svelte/src/utils/focusTarget.ts` from `getFloatingFocusElement` and `isTypeableCombobox` in `packages/react/src/floating-ui-react/utils/element.ts`
- `src/tests/list-navigation/useListNavigation.svelte.spec.ts` assertions from `packages/react/src/floating-ui-react/hooks/useListNavigation.test.tsx` that do not require grid navigation, with harnesses from `packages/react/test/floating-ui-tests/ListboxFocus.tsx` and `Menu.tsx`
- `packages/floating-ui-svelte/src/hooks/useTypeahead.svelte.ts` from `packages/react/src/floating-ui-react/hooks/useTypeahead.ts` as `Typeahead`
- `src/tests/list-navigation/useTypeahead.svelte.spec.ts` assertions from `packages/react/src/floating-ui-react/hooks/useTypeahead.test.tsx`
- `src/lib/internal/composite-root.svelte.ts` render claims from `packages/react/src/internals/composite/list/useCompositeListItem.ts` and `CompositeList.tsx` (each item keeps the index it guessed, and `unregister` drops only that item's entry)
- `packages/utils/src/event-details.ts` the remaining reasons from `packages/react/src/internals/reason-parts.ts` (including the menu reasons `trigger-focus`, `item-press`, `sibling-open`, `cancel-open`, and `pointer`) and the custom properties of `createGenericEventDetails` from `packages/react/src/internals/createBaseUIEventDetails.ts`
- `src/lib/internal/getHighlightReason.ts` from `packages/react/src/utils/getHighlightReason.ts`
- `src/lib/internal/click.ts` `detail` and `pointerType` options, and `packages/floating-ui-svelte/src/utils/event.ts` 1x1 screen reader presses, with `packages/floating-ui-svelte/src/utils/event.spec.ts` assertions from `packages/react/src/floating-ui-react/utils/event.test.ts`
- `packages/floating-ui-svelte/src/hooks/useDismiss.svelte.ts` outside presses bubble by default and a press in a child's portal counts as inside, from `normalizeProp` and `insideReactTree` in `packages/react/src/floating-ui-react/hooks/useDismiss.ts`, with `packages/floating-ui-svelte/src/hooks/useDismiss.svelte.spec.ts` assertions from `useDismiss.test.tsx`
- `packages/floating-ui-svelte/src/components/FloatingPortal.svelte` the generated host `id`, `portalOwnerRole`, and the owner element styles from `packages/react/src/floating-ui-react/components/FloatingPortal.tsx` and `ownerVisuallyHidden` in `packages/react/src/internals/constants.ts`, with `packages/floating-ui-svelte/src/components/FloatingPortal.svelte.spec.ts` assertions from `FloatingFocusManager.test.tsx`
- `src/lib/internal/popups/triggerFocusGuards.ts` and `getTabbableNearElement` in `packages/floating-ui-svelte/src/utils/tabbable.ts` from `packages/react/src/utils/popups/useTriggerFocusGuards.ts` and `packages/react/src/floating-ui-react/utils/tabbable.ts`, with `src/lib/internal/popups/triggerFocusGuards.svelte.spec.ts` and `packages/floating-ui-svelte/src/utils/tabbable.svelte.spec.ts` assertions from `useTriggerFocusGuards.test.tsx` and `tabbable.test.ts`
- `packages/floating-ui-svelte/src/components/FloatingFocusManager.svelte` `preferPreviousFocus` and `markInsideReactTree` from `packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx`
- `packages/floating-ui-svelte/src/hooks/useHoverReferenceInteraction.svelte.ts` `isOverInactiveTrigger` and `externalTree` from `packages/react/src/floating-ui-react/hooks/useHoverReferenceInteraction.ts`, and the open-method record on `pointerdown` in `packages/floating-ui-svelte/src/hooks/useClick.svelte.ts` from `packages/react/src/utils/useOpenInteractionType.ts` and `packages/utils/src/useEnhancedClickHandler.ts`
- `packages/floating-ui-svelte/src/components/FloatingTree.svelte.ts` tree nodes without a floating context and the `externalTree` argument of `useFloatingNodeId` from `packages/react/src/floating-ui-react/components/FloatingTree.tsx`
- `packages/floating-ui-svelte/src/hooks/useDismiss.svelte.ts` capture-phase outside press listeners that close from a one-time target listener, from `addTargetEventListenerOnce` and `closeOnPressOutsideCapture` in `packages/react/src/floating-ui-react/hooks/useDismiss.ts`
- Menu derives from Base UI v1.9.0, commit `ad7ecda5296b0295b41a51ecb01fce6204acd099`:
- `src/lib/menu/MenuRoot.svelte`, `MenuSubmenuRoot.svelte` and `root.svelte.ts` from `packages/react/src/menu/root/MenuRoot.tsx` and `packages/react/src/menu/submenu-root/MenuSubmenuRoot.tsx`
- `src/lib/menu/store.svelte.ts` from `packages/react/src/menu/store/MenuStore.ts` and the `setOpen` of `MenuRoot.tsx` (extends the shared `PopupStore`)
- `src/lib/menu/handle.svelte.ts` from `packages/react/src/menu/store/MenuHandle.ts` (extends the shared `PopupHandle`)
- `src/lib/menu/MenuTrigger.svelte` and `MenuTriggerInteractions.svelte` from `packages/react/src/menu/trigger/MenuTrigger.tsx`
- `src/lib/menu/MenuSubmenuTrigger.svelte` from `packages/react/src/menu/submenu-trigger/MenuSubmenuTrigger.tsx`
- `src/lib/menu/MenuPortal.svelte`, `MenuPositioner.svelte`, `MenuPopup.svelte`, `MenuArrow.svelte`, `MenuBackdrop.svelte`, `MenuViewport.svelte`, `MenuItem.svelte`, `MenuLinkItem.svelte`, `MenuGroup.svelte`, `MenuGroupLabel.svelte`, `MenuRadioGroup.svelte`, `MenuRadioItem.svelte`, `MenuRadioItemIndicator.svelte`, `MenuCheckboxItem.svelte` and `MenuCheckboxItemIndicator.svelte` from the matching files under `packages/react/src/menu/`
- `src/lib/menu/item.svelte.ts` from `packages/react/src/menu/item/useMenuItem.ts` and `useMenuItemCommonProps.ts`
- `src/lib/menu/item-mapping.ts` from `packages/react/src/menu/utils/stateAttributesMapping.ts`
- `src/lib/menu/context.svelte.ts` from the menu root, portal, positioner, group, radio group, checkbox item and radio item context modules
- `src/lib/menu/parent.svelte.ts` from `MenuParent` in `MenuRoot.tsx`, `packages/react/src/menubar/MenubarContext.ts` and `packages/react/src/context-menu/root/ContextMenuRootContext.ts`
- `src/lib/menu/constants.ts` from `packages/react/src/internals/constants.ts`, `packages/react/src/internals/reasons.ts` and `packages/react/src/menu/utils/isKeyboardOpen.ts`
- `src/lib/menu/dom.ts` from `packages/react/src/utils/getPseudoElementBounds.ts` and `packages/react/src/menu/utils/findRootOwnerId.ts`
- `src/lib/menu/*.svelte.spec.ts` assertions from `packages/react/src/menu/**/*.test.tsx` that do not require the filter parts, React refs, StrictMode or React render counts, and from `packages/react/test/detachedTriggersConformanceTests.tsx`
- `src/tests/menu/**` harnesses from the fixtures of those tests

MIT License

Copyright (c) 2019 Material-UI SAS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

Parts of this package derive from [SvelteKit](https://github.com/sveltejs/kit) v3.0.1 (`@sveltejs/kit`):

- `src/lib/form/kit/codec.ts` from `packages/kit/src/runtime/form-utils.js` (the remote-form field-name encoding, FormData conversion, prototype-pollution guard, issue flattening and field proxy, without the `/form_id` name suffix)
- `src/lib/form/kit/parse-form.ts` from the issue builder and input redaction in `packages/kit/src/runtime/app/server/remote/form.js`, the action name lookup in `packages/kit/src/runtime/server/page/actions.js`, and the `HasNonOptionalBoolean` check in `packages/kit/types/index.d.ts`
- `src/lib/form/kit/action-form.svelte.ts` from the client state, input, focusout and reset handling of `packages/kit/src/runtime/client/remote-functions/form.svelte.js`

MIT License

Copyright (c) 2020 [these people](https://github.com/sveltejs/kit/graphs/contributors)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
