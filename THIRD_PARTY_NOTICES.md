# Third-party notices

Parts of this package derive from [Base UI](https://github.com/mui/base-ui) v1.8.0, commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`:

- `src/lib/button/Button.svelte` from `packages/react/src/button/Button.tsx`, with the non-composite paths of `packages/react/src/internals/use-button/useButton.ts`, `packages/react/src/utils/useFocusableWhenDisabled.ts`, and `packages/react/src/utils/dispatchClickWithModifiers.ts`
- `src/lib/accordion/AccordionRoot.svelte` from `packages/react/src/accordion/root/AccordionRoot.tsx`
- `src/lib/accordion/AccordionItem.svelte` from `packages/react/src/accordion/item/AccordionItem.tsx` (open state is the existing Collapsible root)
- `src/lib/accordion/AccordionHeader.svelte` from `packages/react/src/accordion/header/AccordionHeader.tsx`
- `src/lib/accordion/AccordionTrigger.svelte` from `packages/react/src/accordion/trigger/AccordionTrigger.tsx` and the non-composite path of `packages/react/src/internals/use-button/useButton.ts`
- `src/lib/accordion/AccordionPanel.svelte` from `packages/react/src/accordion/panel/AccordionPanel.tsx` (panel motion is `CollapsiblePanelMotion`)
- `src/lib/accordion/context.svelte.ts` from `packages/react/src/accordion/root/AccordionRootContext.ts` and `packages/react/src/accordion/item/AccordionItemContext.ts`
- `src/lib/accordion/attributes.ts` from `packages/react/src/accordion/item/stateAttributesMapping.ts` and `packages/react/src/accordion/panel/AccordionPanelCssVars.ts`
- `src/lib/accordion/value.ts` from `handleValueChange` in `packages/react/src/accordion/root/AccordionRoot.tsx`
- `src/lib/accordion/Accordion.svelte.spec.ts` assertions from `packages/react/src/accordion/**/*.test.tsx`
- `src/lib/collapsible/CollapsibleRoot.svelte` from `packages/react/src/collapsible/root/CollapsibleRoot.tsx` and `useCollapsibleRoot.ts`
- `src/lib/collapsible/CollapsibleTrigger.svelte` from `packages/react/src/collapsible/trigger/CollapsibleTrigger.tsx` and the non-composite path of `packages/react/src/internals/use-button/useButton.ts`
- `src/lib/collapsible/CollapsiblePanel.svelte` from `packages/react/src/collapsible/panel/CollapsiblePanel.tsx`
- `src/lib/collapsible/context.svelte.ts` from `packages/react/src/collapsible/root/CollapsibleRootContext.ts` and `packages/react/src/internals/useTransitionStatus.ts`
- `src/lib/collapsible/panel-motion.svelte.ts` and `src/lib/collapsible/motion.ts` from `packages/react/src/collapsible/panel/useCollapsiblePanel.ts`, `useOpenChangeComplete`, and `useAnimationsFinished`
- `src/lib/collapsible/attributes.ts` from `packages/react/src/collapsible/root/stateAttributesMapping.ts`, `packages/react/src/utils/collapsibleOpenStateMapping.ts`, and `packages/react/src/internals/stateAttributesMapping.ts`
- `src/lib/collapsible/Collapsible.svelte.spec.ts` assertions from `packages/react/src/collapsible/**/*.test.tsx`
- `src/lib/internal/event-details.ts` also exports `REASONS.triggerPress` from `packages/react/src/internals/reason-parts.ts`
- `src/lib/button/Button.svelte.spec.ts` assertions from `packages/react/src/button/Button.test.tsx`
- `src/lib/fieldset/FieldsetRoot.svelte` from `packages/react/src/fieldset/root/FieldsetRoot.tsx`
- `src/lib/fieldset/FieldsetLegend.svelte` from `packages/react/src/fieldset/legend/FieldsetLegend.tsx`
- `src/lib/fieldset/context.svelte.ts` from `packages/react/src/fieldset/root/FieldsetRootContext.ts`
- `src/lib/fieldset/register-label-id.svelte.ts` from `packages/react/src/utils/useRegisteredLabelId.ts`
- `src/lib/fieldset/Fieldset.svelte.spec.ts` assertions from `packages/react/src/fieldset/root/FieldsetRoot.test.tsx`, `packages/react/src/fieldset/legend/FieldsetLegend.test.tsx`, and `packages/react/src/utils/useRegisteredLabelId.test.tsx`
- `src/lib/field/FieldRoot.svelte` and `src/lib/field/model.svelte.ts` from `packages/react/src/field/root/FieldRoot.tsx`, `useFieldValidation.ts`, and `packages/react/src/internals/field-register-control/useFieldControlRegistration.ts`
- `src/lib/field/FieldControl.svelte` from `packages/react/src/field/control/FieldControl.tsx`
- `src/lib/field/FieldLabel.svelte` from `packages/react/src/field/label/FieldLabel.tsx` and `packages/react/src/internals/labelable-provider/useLabel.ts`
- `src/lib/field/FieldDescription.svelte` from `packages/react/src/field/description/FieldDescription.tsx`
- `src/lib/field/FieldError.svelte` from `packages/react/src/field/error/FieldError.tsx`
- `src/lib/field/FieldItem.svelte` from `packages/react/src/field/item/FieldItem.tsx`
- `src/lib/field/FieldValidity.svelte` from `packages/react/src/field/validity/FieldValidity.tsx`
- `src/lib/field/labelable.svelte.ts` from `packages/react/src/internals/labelable-provider/LabelableProvider.tsx` and `useLabelableId.ts`
- `src/lib/field/validity.ts` from `packages/react/src/field/utils/getCombinedFieldValidityData.ts` and `isEligibleInput` in `useFieldValidation.ts`
- `src/lib/field/transition.svelte.ts` from `packages/react/src/internals/useTransitionStatus.ts` (`enableIdleState`, `deferEndingState`, and `animateInitialOpen` all false)
- `src/lib/field/attributes.ts` from `packages/react/src/internals/field-constants/constants.ts` and `packages/react/src/internals/stateAttributesMapping.ts`
- `src/lib/field/context.svelte.ts` from `packages/react/src/internals/field-root-context/FieldRootContext.ts` and `packages/react/src/field/item/FieldItemContext.ts`
- `src/lib/field/Field.svelte.spec.ts` assertions from `packages/react/src/field/**/*.test.tsx` that do not require Checkbox, Radio, or NumberField
- `src/lib/input/Input.svelte` from `packages/react/src/input/Input.tsx` (delegates to `Field.Control`)
- `src/lib/input/Input.svelte.spec.ts` assertions from `packages/react/src/input/Input.test.tsx` and the textarea host in `packages/react/src/input/Input.spec.tsx`
- `src/lib/separator/Separator.svelte` from `packages/react/src/separator/Separator.tsx`
- `src/lib/separator/Separator.svelte.spec.ts` assertions from `packages/react/src/separator/Separator.test.tsx`
- `src/lib/toggle/Toggle.svelte` from `packages/react/src/toggle/Toggle.tsx`, standalone and inside ToggleGroup
- `src/lib/toggle/Toggle.svelte.spec.ts` assertions from `packages/react/src/toggle/Toggle.test.tsx`
- `src/lib/toggle-group/ToggleGroup.svelte` from `packages/react/src/toggle-group/ToggleGroup.tsx`
- `src/lib/toggle-group/context.svelte.ts` from `packages/react/src/toggle-group/ToggleGroupContext.ts`
- `src/lib/toggle-group/roving-focus.svelte.ts` from the linear path of `packages/react/src/internals/composite/root/useCompositeRoot.ts` and `packages/react/src/internals/composite/item/useCompositeItem.ts`
- `src/lib/toggle-group/ToggleGroup.svelte.spec.ts` assertions from `packages/react/src/toggle-group/ToggleGroup.test.tsx`
- `src/lib/internal/event-details.ts` from `packages/react/src/internals/createBaseUIEventDetails.ts`
- `src/lib/internal/state-attributes.ts` from `packages/react/src/internals/getStateAttributesProps.ts`
- `src/lib/internal/valueToPercent.ts` from `packages/react/src/utils/valueToPercent.ts`
- `src/lib/internal/clamp.ts` from `packages/utils/src/clamp.ts`
- `src/lib/internal/controllable-value.svelte.ts` from `packages/utils/src/useControlled.ts` and `packages/react/src/internals/useValueChanged.ts`
- `src/lib/internal/formatNumber.ts` from `packages/utils/src/formatNumber.ts`
- `src/lib/internal/stringifyLocale.ts` from `packages/utils/src/stringifyLocale.ts` (cache key used by `formatNumber`)
- `src/lib/internal/visuallyHidden.ts` from `packages/utils/src/visuallyHidden.ts` (nonzero lengths use explicit `px` units for native style strings)
- `src/lib/internal/formatNumber.spec.ts` assertions from `packages/utils/src/formatNumber.test.ts`
- `src/lib/internal/stringifyLocale.spec.ts` assertions from `packages/utils/src/stringifyLocale.test.ts`
- `src/lib/avatar/Root.svelte` from `packages/react/src/avatar/root/AvatarRoot.tsx`
- `src/lib/avatar/Image.svelte` from `packages/react/src/avatar/image/AvatarImage.tsx`
- `src/lib/avatar/Fallback.svelte` from `packages/react/src/avatar/fallback/AvatarFallback.tsx`
- `src/lib/avatar/image-loading-status.svelte.ts` from `packages/react/src/avatar/image/useImageLoadingStatus.ts`
- `src/lib/avatar/attributes.ts` from `packages/react/src/avatar/root/stateAttributesMapping.ts`
- `src/lib/avatar/context.ts` from `packages/react/src/avatar/root/AvatarRootContext.ts`
- `src/lib/avatar/Avatar.svelte.spec.ts` assertions from the avatar root, image and fallback tests
- `src/lib/meter/MeterRoot.svelte` from `packages/react/src/meter/root/MeterRoot.tsx`
- `src/lib/meter/MeterTrack.svelte` from `packages/react/src/meter/track/MeterTrack.tsx`
- `src/lib/meter/MeterIndicator.svelte` from `packages/react/src/meter/indicator/MeterIndicator.tsx`
- `src/lib/meter/MeterValue.svelte` from `packages/react/src/meter/value/MeterValue.tsx`
- `src/lib/meter/MeterLabel.svelte` from `packages/react/src/meter/label/MeterLabel.tsx` and `packages/react/src/utils/useRegisteredLabelId.ts` (`useBaseUiId` ids use `$props.id()`, prefixed with `base-ui-`)
- `src/lib/meter/context.ts` from `packages/react/src/meter/root/MeterRootContext.ts`
- `src/lib/meter/Meter.svelte.spec.ts` assertions from the meter `*.test.tsx` files and `packages/react/src/utils/useRegisteredLabelId.test.tsx`
- `src/lib/progress/ProgressRoot.svelte` from `packages/react/src/progress/root/ProgressRoot.tsx`
- `src/lib/progress/ProgressRootContext.svelte.ts` from `packages/react/src/progress/root/ProgressRootContext.tsx`
- `src/lib/progress/compute.ts` from the value normalization in `packages/react/src/progress/root/ProgressRoot.tsx`
- `src/lib/progress/stateAttributesMapping.ts` from `packages/react/src/progress/root/stateAttributesMapping.ts`
- `src/lib/progress/ProgressTrack.svelte` from `packages/react/src/progress/track/ProgressTrack.tsx`
- `src/lib/progress/ProgressIndicator.svelte` from `packages/react/src/progress/indicator/ProgressIndicator.tsx`
- `src/lib/progress/ProgressValue.svelte` from `packages/react/src/progress/value/ProgressValue.tsx`
- `src/lib/progress/ProgressLabel.svelte` from `packages/react/src/progress/label/ProgressLabel.tsx` and `packages/react/src/utils/useRegisteredLabelId.ts`
- `src/lib/progress/Progress.svelte.spec.ts` assertions from `packages/react/src/progress/**/*.test.tsx`
- `src/lib/progress/compute.spec.ts` assertions from the value math in `packages/react/src/progress/root/ProgressRoot.test.tsx`
- `src/lib/form/Form.svelte` from `packages/react/src/form/Form.tsx`
- `src/lib/form/context.ts` from `packages/react/src/internals/form-context/FormContext.ts`
- `src/lib/form/document-order.ts` from `comesBeforeInSameTree` in `packages/react/src/form/Form.tsx`
- `src/lib/form/Form.svelte.spec.ts` assertions from `packages/react/src/form/Form.test.tsx` that Form can observe without Field
- `src/lib/internal/event-details.ts` also includes `createGenericEventDetails` from `packages/react/src/internals/createBaseUIEventDetails.ts`
- `src/lib/switch/SwitchRoot.svelte` from `packages/react/src/switch/root/SwitchRoot.tsx`, the non-composite paths of `packages/react/src/internals/use-button/useButton.ts`, and the native-label fallback of `packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts`
- `src/lib/switch/SwitchThumb.svelte` from `packages/react/src/switch/thumb/SwitchThumb.tsx`
- `src/lib/switch/context.ts` from `packages/react/src/switch/root/SwitchRootContext.ts`
- `src/lib/switch/attributes.ts` from `packages/react/src/switch/stateAttributesMapping.ts` (Field validity attributes omitted)
- `src/lib/internal/associated-label.ts` from `findAssociatedLabel` in `packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts`
- `src/lib/switch/Switch.svelte.spec.ts` assertions from `packages/react/src/switch/root/SwitchRoot.test.tsx` and `packages/react/src/switch/thumb/SwitchThumb.test.tsx` that do not require Field
- `src/lib/checkbox/CheckboxRoot.svelte` from `packages/react/src/checkbox/root/CheckboxRoot.tsx`, the non-composite paths of `packages/react/src/internals/use-button/useButton.ts`, and the native-label fallback of `packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts`
- `src/lib/checkbox/CheckboxIndicator.svelte` from `packages/react/src/checkbox/indicator/CheckboxIndicator.tsx`, `packages/react/src/internals/useTransitionStatus.ts`, and `packages/react/src/internals/useOpenChangeComplete.tsx`
- `src/lib/internal/animations-finished.ts` from `packages/react/src/internals/useAnimationsFinished.ts` (checkbox, radio, tabs, field error, and collapsible)
- `src/lib/internal/composite-skip.ts` from the skip rule in `packages/react/src/internals/composite/root/useCompositeRoot.ts` (Tabs and Toolbar; RadioGroup keeps its own `aria-disabled` skip)
- `src/lib/checkbox/submitter.ts` from `packages/utils/src/getDefaultFormSubmitter.ts`
- `src/lib/checkbox/context.ts` from `packages/react/src/checkbox/root/CheckboxRootContext.ts`
- `src/lib/checkbox/attributes.ts` from `packages/react/src/checkbox/utils/getCheckboxStateAttributesMapping.ts` (Field validity attributes omitted)
- `src/lib/checkbox/Checkbox.svelte.spec.ts` assertions from `packages/react/src/checkbox/root/CheckboxRoot.test.tsx` and `packages/react/src/checkbox/indicator/CheckboxIndicator.test.tsx` that do not require Field or CheckboxGroup
- `src/lib/checkbox/group-context.ts` from the fields `Checkbox.Root` reads in `packages/react/src/checkbox-group/CheckboxGroupContext.ts`
- `src/lib/checkbox-group/CheckboxGroup.svelte` from `packages/react/src/checkbox-group/CheckboxGroup.tsx`
- `src/lib/checkbox-group/parent.ts` and `src/lib/checkbox-group/parent.svelte.ts` from `packages/react/src/checkbox-group/useCheckboxGroupParent.ts`
- `src/lib/checkbox-group/parent.spec.ts` assertions from the parent-toggle math in `packages/react/src/checkbox-group/useCheckboxGroupParent.ts`
- `src/lib/checkbox-group/CheckboxGroup.svelte.spec.ts` assertions from `packages/react/src/checkbox-group/CheckboxGroup.test.tsx` and `packages/react/src/checkbox-group/useCheckboxGroupParent.test.tsx` that do not require Field
- `src/lib/radio/RadioRoot.svelte` from `packages/react/src/radio/root/RadioRoot.tsx`, the non-composite paths of `packages/react/src/internals/use-button/useButton.ts`, and the native-label fallback of `packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts`
- `src/lib/radio/RadioIndicator.svelte` from `packages/react/src/radio/indicator/RadioIndicator.tsx`, `packages/react/src/internals/useTransitionStatus.ts`, and `packages/react/src/internals/useOpenChangeComplete.tsx`
- `src/lib/radio/context.ts` from `packages/react/src/radio/root/RadioRootContext.ts`
- `src/lib/radio/group-context.ts` from the fields `Radio.Root` reads in `packages/react/src/radio-group/RadioGroupContext.ts`
- `src/lib/radio-group/RadioGroup.svelte` from `packages/react/src/radio-group/RadioGroup.tsx`
- `src/lib/radio-group/roving-focus.svelte.ts` from the linear path of `packages/react/src/internals/composite/root/useCompositeRoot.ts` with RadioGroup's `CompositeRoot` options (orientation `both`, Home/End off, Shift allowed)
- `src/lib/radio-group/RadioGroup.svelte.spec.ts` assertions from `packages/react/src/radio-group/RadioGroup.test.tsx` that do not require Field or `inputRef`
- `src/lib/radio/attributes.ts` from `packages/react/src/radio/utils/stateAttributesMapping.ts` (Field validity attributes omitted)
- `src/lib/radio/serialize-value.ts` from `packages/react/src/internals/serializeValue.ts`
- `src/lib/radio/Radio.svelte.spec.ts` assertions from `packages/react/src/radio/root/RadioRoot.test.tsx` and `packages/react/src/radio/indicator/RadioIndicator.test.tsx` that do not require Field or RadioGroup
- `src/lib/internal/event-details.ts` also exports `REASONS.disabled`, `REASONS.missing`, and `REASONS.initial` from `packages/react/src/internals/reason-parts.ts`
- `src/lib/tabs/TabsRoot.svelte` from `packages/react/src/tabs/root/TabsRoot.tsx`
- `src/lib/tabs/TabsList.svelte` from `packages/react/src/tabs/list/TabsList.tsx`
- `src/lib/tabs/TabsTab.svelte` from `packages/react/src/tabs/tab/TabsTab.tsx` and the non-composite path of `packages/react/src/internals/use-button/useButton.ts`
- `src/lib/tabs/TabsPanel.svelte` from `packages/react/src/tabs/panel/TabsPanel.tsx`, `useTransitionStatus` (default arguments), and `useOpenChangeComplete`
- `src/lib/tabs/TabsIndicator.svelte` and `src/lib/tabs/indicator.ts` from `packages/react/src/tabs/indicator/TabsIndicator.tsx`, `packages/react/src/utils/getCssDimensions.ts`, and `packages/react/src/utils/getElementTransform.ts`
- `src/lib/tabs/context.svelte.ts` from `packages/react/src/tabs/root/TabsRootContext.ts` and `packages/react/src/tabs/list/TabsListContext.ts`
- `src/lib/tabs/roving-focus.svelte.ts` from the linear path of `packages/react/src/internals/composite/root/useCompositeRoot.ts` with `Tabs.List`'s empty `disabledIndices`
- `src/lib/tabs/direction.ts` from `computeActivationDirection` in `packages/react/src/tabs/root/TabsRoot.tsx`
- `src/lib/tabs/attributes.ts` from `packages/react/src/tabs/root/stateAttributesMapping.ts`, `packages/react/src/tabs/panel/TabsPanelDataAttributes.ts`, and `packages/react/src/tabs/indicator/TabsIndicatorCssVars.ts`
- `src/lib/tabs/Tabs.svelte.spec.ts` assertions from `packages/react/src/tabs/**/*.test.tsx`
- `src/lib/toolbar/ToolbarRoot.svelte` from `packages/react/src/toolbar/root/ToolbarRoot.tsx`
- `src/lib/toolbar/ToolbarButton.svelte` from `packages/react/src/toolbar/button/ToolbarButton.tsx`, the composite path of `packages/react/src/internals/use-button/useButton.ts`, and `packages/react/src/utils/useFocusableWhenDisabled.ts`
- `src/lib/toolbar/ToolbarGroup.svelte` from `packages/react/src/toolbar/group/ToolbarGroup.tsx`
- `src/lib/toolbar/ToolbarLink.svelte` from `packages/react/src/toolbar/link/ToolbarLink.tsx`
- `src/lib/toolbar/context.svelte.ts` from `packages/react/src/toolbar/root/ToolbarRootContext.ts` and `packages/react/src/toolbar/group/ToolbarGroupContext.ts`
- `src/lib/toolbar/roving-focus.svelte.ts` from the linear path of `packages/react/src/internals/composite/root/useCompositeRoot.ts` and `packages/react/src/internals/composite/item/useCompositeItem.ts` with Toolbar's CompositeRoot options (Home/End off)
- `src/lib/toolbar/Toolbar.svelte.spec.ts` assertions from `packages/react/src/toolbar/**/*.test.tsx` that do not require Toolbar.Input or an overlay
- `src/lib/number-field/NumberFieldRoot.svelte` and `src/lib/number-field/model.svelte.ts` from `packages/react/src/number-field/root/NumberFieldRoot.tsx`
- `src/lib/number-field/NumberFieldGroup.svelte` from `packages/react/src/number-field/group/NumberFieldGroup.tsx`
- `src/lib/number-field/NumberFieldInput.svelte` from `packages/react/src/number-field/input/NumberFieldInput.tsx`
- `src/lib/number-field/NumberFieldStepper.svelte`, `NumberFieldIncrement.svelte`, and `NumberFieldDecrement.svelte` from `packages/react/src/number-field/root/useNumberFieldStepperButton.ts`, `packages/react/src/number-field/increment/NumberFieldIncrement.tsx`, `packages/react/src/number-field/decrement/NumberFieldDecrement.tsx`, and the non-composite path of `packages/react/src/internals/use-button/useButton.ts` with `packages/react/src/utils/useFocusableWhenDisabled.ts`
- `src/lib/number-field/NumberFieldScrubArea.svelte` from `packages/react/src/number-field/scrub-area/NumberFieldScrubArea.tsx`
- `src/lib/number-field/NumberFieldScrubAreaCursor.svelte` from `packages/react/src/number-field/scrub-area-cursor/NumberFieldScrubAreaCursor.tsx`
- `src/lib/number-field/press-and-hold.svelte.ts` from `packages/react/src/internals/usePressAndHold.ts`
- `src/lib/number-field/parse.ts` and `validate.ts` from `packages/react/src/number-field/utils/parse.ts` and `validate.ts`
- `src/lib/number-field/viewport.ts` from `packages/react/src/number-field/utils/getViewportRect.ts`
- `src/lib/number-field/NumberField.svelte.spec.ts` assertions from `packages/react/src/number-field/**/*.test.tsx` that do not require React refs or `className` callbacks
- `src/lib/internal/event-details.ts` also exports the number-field change reasons (`input-change`, `input-clear`, `input-blur`, `input-paste`, `keyboard`, `increment-press`, `decrement-press`, `wheel`, `scrub`) and the slider reasons (`track-press`, `drag`)
- `src/lib/scroll-area/ScrollAreaRoot.svelte` and `src/lib/scroll-area/model.svelte.ts` from `packages/react/src/scroll-area/root/ScrollAreaRoot.tsx` and `ScrollAreaRootContext.ts`
- `src/lib/scroll-area/ScrollAreaViewport.svelte` from `packages/react/src/scroll-area/viewport/ScrollAreaViewport.tsx`
- `src/lib/scroll-area/ScrollAreaScrollbar.svelte` from `packages/react/src/scroll-area/scrollbar/ScrollAreaScrollbar.tsx`
- `src/lib/scroll-area/ScrollAreaThumb.svelte` from `packages/react/src/scroll-area/thumb/ScrollAreaThumb.tsx`
- `src/lib/scroll-area/ScrollAreaContent.svelte` from `packages/react/src/scroll-area/content/ScrollAreaContent.tsx`
- `src/lib/scroll-area/ScrollAreaCorner.svelte` from `packages/react/src/scroll-area/corner/ScrollAreaCorner.tsx`
- `src/lib/scroll-area/attributes.ts` from the scroll-area `*DataAttributes.ts` modules and `root/stateAttributes.ts`
- `src/lib/scroll-area/css-vars.ts` from the scroll-area `*CssVars.ts` modules
- `src/lib/scroll-area/geometry.ts` from `packages/react/src/utils/scrollEdges.ts` and the pure helpers in `ScrollAreaRoot.tsx` / `ScrollAreaViewport.tsx`
- `src/lib/scroll-area/dom.ts` from `packages/react/src/scroll-area/utils/getOffset.ts`
- `src/lib/scroll-area/ScrollArea.svelte.spec.ts` assertions from `packages/react/src/scroll-area/**/*.test.tsx` that do not require React refs, `className` callbacks, or `DirectionProvider` (direction is the root element's used CSS `direction`)
- `src/lib/slider/SliderRoot.svelte` and `src/lib/slider/model.svelte.ts` from `packages/react/src/slider/root/SliderRoot.tsx` and `packages/react/src/slider/control/SliderControl.tsx`
- `src/lib/slider/SliderControl.svelte` from `packages/react/src/slider/control/SliderControl.tsx`
- `src/lib/slider/SliderTrack.svelte` from `packages/react/src/slider/track/SliderTrack.tsx`
- `src/lib/slider/SliderIndicator.svelte` and `src/lib/slider/indicator-style.ts` from `packages/react/src/slider/indicator/SliderIndicator.tsx`
- `src/lib/slider/SliderThumb.svelte` and `src/lib/slider/prehydration.ts` from `packages/react/src/slider/thumb/SliderThumb.tsx` and `prehydrationScript.min.ts`
- `src/lib/slider/SliderLabel.svelte` from `packages/react/src/slider/label/SliderLabel.tsx` and the non-native path of `packages/react/src/internals/labelable-provider/useLabel.ts`
- `src/lib/slider/SliderValue.svelte` from `packages/react/src/slider/value/SliderValue.tsx`
- `src/lib/slider/asc.ts`, `roundValueToStep.ts`, `getSliderValue.ts`, `validateMinimumDistance.ts`, `getMidpoint.ts`, `getPushedThumbValues.ts`, and `resolveThumbCollision.ts` from the matching files in `packages/react/src/slider/utils`
- `src/lib/slider/dom.ts` from the `isElement`, `matchesFocusVisible`, and `focusElement` helpers Slider calls
- `src/lib/slider/Slider.svelte.spec.ts` assertions from `packages/react/src/slider/**/*.test.tsx` that do not require React refs or `className` callbacks
- `src/lib/direction-provider/DirectionProvider.svelte` from `packages/react/src/direction-provider/DirectionProvider.tsx`
- `src/lib/internal/direction-context.ts` from `packages/react/src/internals/direction-context/DirectionContext.tsx`
- `src/lib/direction-provider/DirectionProvider.svelte.spec.ts` assertions from `packages/react/src/direction-provider/DirectionProvider.test.tsx`
- `src/lib/otp-field/OTPFieldRoot.svelte` and `src/lib/otp-field/model.svelte.ts` from `packages/react/src/otp-field/root/OTPFieldRoot.tsx` and `OTPFieldRootContext.ts`
- `src/lib/otp-field/OTPFieldInput.svelte` from `packages/react/src/otp-field/input/OTPFieldInput.tsx`
- `src/lib/otp-field/slots.svelte.ts` from the flat-list registration in `packages/react/src/internals/composite/list/CompositeList.tsx` and `useCompositeListItem.ts` (DOM order and render-order indexes only)
- `src/lib/otp-field/otp.ts` from `packages/react/src/otp-field/utils/otp.ts`
- `src/lib/otp-field/attributes.ts` from `packages/react/src/otp-field/utils/stateAttributesMapping.ts` and the OTP field data-attribute modules
- `src/lib/otp-field/dom.ts` from `packages/react/src/floating-ui-react/utils/event.ts` (`stopEvent`)
- `src/lib/internal/platform.ts` from `packages/utils/src/platform` (`os`, `engine`, `screenReader`, `env`, `mediaQuery`)
- `src/lib/internal/shadow-dom.ts` from `packages/utils/src/shadowDom.ts` (`activeElement`, `contains`, `getTarget`)
- `src/lib/internal/owner.ts` from `packages/utils/src/owner.ts`
- `src/lib/internal/css-style.ts` from the style-string helpers shared by Progress, NumberField, OTP Field, Slider, Checkbox, Radio, and Switch
- `src/lib/internal/click.ts` from `packages/react/src/utils/dispatchClickWithModifiers.ts` and the host and link checks in `packages/react/src/internals/use-button/useButton.ts`
- `src/lib/internal/document-order.ts` from the composite list DOM-order comparison
- `src/lib/internal/roving-slot.ts` from the render-order index in `packages/react/src/internals/composite/list/useCompositeListItem.ts` (`createSlotClaim`, `includeSorted`)
- `src/lib/internal/timeout.ts` from `packages/utils/src/useTimeout.ts` (`Timeout`), `packages/utils/src/useAnimationFrame.ts` (`AnimationFrame`), and `packages/react/src/internals/TimeoutManager.ts`. The React hooks are not ported.
- `src/lib/otp-field/otp.spec.ts` assertions from `packages/react/src/otp-field/utils/otp.test.ts`
- `src/lib/otp-field/OTPField.svelte.spec.ts` assertions from `packages/react/src/otp-field/**/*.test.tsx` that do not require React refs or `className` callbacks
- `src/lib/csp-provider/CSPProvider.svelte` from `packages/react/src/csp-provider/CSPProvider.tsx`
- `src/lib/internal/csp-context.ts` from `packages/react/src/internals/csp-context/CSPContext.tsx`
- `src/lib/csp-provider/CSPProvider.svelte.spec.ts` assertions from `packages/react/src/csp-provider/CSPProvider.test.tsx` (the context values those ScrollArea and Select style-tag checks depend on; the style tags themselves stay with those components)
- `src/lib/internal/mergeProps.ts` from `packages/react/src/merge-props/mergeProps.ts` (consumer handler first; a later handler is skipped when `defaultPrevented` is set)
- `src/lib/internal/floating-ui-react/**` from `packages/react/src/floating-ui-react/**` (phase 1a: portal, focus manager, dismiss, click, tree, and the DOM helpers those call; phase 1b: `useBaseUIFloating`, hover, `safePolygon`, and the local arrow middleware)
- `src/lib/internal/floating-ui-react/usePosition.svelte.ts` from `@floating-ui/react-dom` `useFloating` (positioning only; `computePosition` and `autoUpdate` stay in this file)
- `src/lib/internal/useAnchorPositioning.svelte.ts` from `packages/react/src/internals/useAnchorPositioning.ts`
- `src/lib/internal/hideMiddleware.ts` from `packages/react/src/utils/hideMiddleware.ts`
- `src/lib/internal/CommonPositionerCssVars.ts` from `packages/react/src/utils/CommonPositionerCssVars.ts`
- `src/lib/internal/useAnchoredPopupScrollLock.svelte.ts` from `packages/react/src/utils/useAnchoredPopupScrollLock.ts`
- `src/lib/internal/popups/useTriggerFocusGuards.ts` from `packages/react/src/utils/popups/useTriggerFocusGuards.ts`
- `src/lib/internal/popups/**` from `packages/react/src/utils/popups/**` and `packages/react/src/dialog/store/DialogStore.ts` (`setOpen`'s immediate `preventUnmountOnClose`)
- `src/lib/internal/useScrollLock.svelte.ts` from `packages/utils/src/useScrollLock.ts`
- `src/lib/internal/useTransitionStatus.svelte.ts` from `packages/react/src/internals/useTransitionStatus.ts` (popup arguments: idle and deferred ending off)
- `src/lib/internal/useOpenChangeComplete.svelte.ts` from `packages/react/src/internals/useOpenChangeComplete.tsx`
- `src/lib/internal/openInteraction.ts` from `packages/react/src/utils/useOpenInteractionType.ts` and `packages/utils/src/useEnhancedClickHandler.ts`
- `src/lib/internal/popupStateMapping.ts`, `CommonPopupDataAttributes.ts`, and `CommonTriggerDataAttributes.ts` from the matching files in `packages/react/src/utils`
- `src/lib/internal/FocusGuard.svelte` and `InternalBackdrop.svelte` from `packages/react/src/utils/FocusGuard.tsx` and `InternalBackdrop.tsx`
- `src/lib/internal/event-details.ts` also exports the popup reasons `trigger-hover`, `escape-key`, `outside-press`, `focus-out`, `close-press`, and `imperative-action`
- `src/lib/popover/PopoverRoot.svelte` from `packages/react/src/popover/root/PopoverRoot.tsx`
- `src/lib/popover/PopoverTrigger.svelte` from `packages/react/src/popover/trigger/PopoverTrigger.tsx`
- `src/lib/popover/PopoverPortal.svelte` from `packages/react/src/popover/portal/PopoverPortal.tsx`
- `src/lib/popover/PopoverPositioner.svelte` from `packages/react/src/popover/positioner/PopoverPositioner.tsx`
- `src/lib/popover/PopoverPopup.svelte` from `packages/react/src/popover/popup/PopoverPopup.tsx`
- `src/lib/popover/PopoverArrow.svelte` from `packages/react/src/popover/arrow/PopoverArrow.tsx`
- `src/lib/popover/PopoverBackdrop.svelte` from `packages/react/src/popover/backdrop/PopoverBackdrop.tsx`
- `src/lib/popover/PopoverTitle.svelte` from `packages/react/src/popover/title/PopoverTitle.tsx`
- `src/lib/popover/PopoverDescription.svelte` from `packages/react/src/popover/description/PopoverDescription.tsx`
- `src/lib/popover/PopoverClose.svelte` from `packages/react/src/popover/close/PopoverClose.tsx`
- `src/lib/popover/PopoverViewport.svelte` from `packages/react/src/popover/viewport/PopoverViewport.tsx` and `packages/react/src/utils/usePopupViewport.tsx`
- `src/lib/popover/store.svelte.ts` from `packages/react/src/popover/store/PopoverStore.ts` (open changes go through the shared `PopupStore`; popover adds deferred unmount, hover stick, and instant type)
- `src/lib/popover/handle.ts` from `packages/react/src/popover/store/PopoverHandle.ts`
- `src/lib/popover/context.svelte.ts` from the popover root, portal, and positioner context modules
- `src/lib/internal/popups/popupHandle.ts` from `packages/react/src/utils/popups/popupHandle.ts`
- `src/lib/internal/useButton.ts` from the non-composite path of `packages/react/src/internals/use-button/useButton.ts`
- `src/lib/internal/openInteraction.ts` from `packages/react/src/utils/useOpenInteractionType.ts`
- `src/lib/internal/adaptiveOriginMiddleware.ts` from `packages/react/src/utils/adaptiveOriginMiddleware.ts`
- `src/lib/internal/compositeKeys.ts` from `COMPOSITE_KEYS` in `packages/react/src/popover/utils/constants.ts`
- `createDefaultInitialFocus` and `resolveFocus` in `src/lib/internal/popups/popupStoreUtils.ts` from `packages/react/src/utils/popups/popupStoreUtils.ts`
- `src/lib/popover/Popover.svelte.spec.ts` assertions from `packages/react/src/popover/**/*.test.tsx` that do not require Menu, Combobox, or React refs

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
