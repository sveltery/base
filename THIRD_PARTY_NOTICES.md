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
- `src/lib/field/animations.ts` from `packages/react/src/internals/useAnimationsFinished.ts`
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
- `src/lib/switch/label.ts` from `findAssociatedLabel` in `packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts`
- `src/lib/switch/Switch.svelte.spec.ts` assertions from `packages/react/src/switch/root/SwitchRoot.test.tsx` and `packages/react/src/switch/thumb/SwitchThumb.test.tsx` that do not require Field
- `src/lib/checkbox/CheckboxRoot.svelte` from `packages/react/src/checkbox/root/CheckboxRoot.tsx`, the non-composite paths of `packages/react/src/internals/use-button/useButton.ts`, and the native-label fallback of `packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts`
- `src/lib/checkbox/CheckboxIndicator.svelte` from `packages/react/src/checkbox/indicator/CheckboxIndicator.tsx`, `packages/react/src/internals/useTransitionStatus.ts`, and `packages/react/src/internals/useOpenChangeComplete.tsx`
- `src/lib/checkbox/indicator-motion.ts` from `packages/react/src/internals/useAnimationsFinished.ts`
- `src/lib/checkbox/submitter.ts` from `packages/utils/src/getDefaultFormSubmitter.ts`
- `src/lib/checkbox/context.ts` from `packages/react/src/checkbox/root/CheckboxRootContext.ts`
- `src/lib/checkbox/attributes.ts` from `packages/react/src/checkbox/utils/getCheckboxStateAttributesMapping.ts` (Field validity attributes omitted)
- `src/lib/checkbox/label.ts` from `findAssociatedLabel` in `packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts`
- `src/lib/checkbox/Checkbox.svelte.spec.ts` assertions from `packages/react/src/checkbox/root/CheckboxRoot.test.tsx` and `packages/react/src/checkbox/indicator/CheckboxIndicator.test.tsx` that do not require Field or CheckboxGroup
- `src/lib/checkbox/group-context.ts` from the fields `Checkbox.Root` reads in `packages/react/src/checkbox-group/CheckboxGroupContext.ts`
- `src/lib/checkbox-group/CheckboxGroup.svelte` from `packages/react/src/checkbox-group/CheckboxGroup.tsx`
- `src/lib/checkbox-group/parent.ts` and `src/lib/checkbox-group/parent.svelte.ts` from `packages/react/src/checkbox-group/useCheckboxGroupParent.ts`
- `src/lib/checkbox-group/parent.spec.ts` assertions from the parent-toggle math in `packages/react/src/checkbox-group/useCheckboxGroupParent.ts`
- `src/lib/checkbox-group/CheckboxGroup.svelte.spec.ts` assertions from `packages/react/src/checkbox-group/CheckboxGroup.test.tsx` and `packages/react/src/checkbox-group/useCheckboxGroupParent.test.tsx` that do not require Field
- `src/lib/radio/RadioRoot.svelte` from `packages/react/src/radio/root/RadioRoot.tsx`, the non-composite paths of `packages/react/src/internals/use-button/useButton.ts`, and the native-label fallback of `packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts`
- `src/lib/radio/RadioIndicator.svelte` from `packages/react/src/radio/indicator/RadioIndicator.tsx`, `packages/react/src/internals/useTransitionStatus.ts`, and `packages/react/src/internals/useOpenChangeComplete.tsx`
- `src/lib/radio/indicator-motion.ts` from `packages/react/src/internals/useAnimationsFinished.ts`
- `src/lib/radio/context.ts` from `packages/react/src/radio/root/RadioRootContext.ts`
- `src/lib/radio/group-context.ts` from the fields `Radio.Root` reads in `packages/react/src/radio-group/RadioGroupContext.ts`
- `src/lib/radio-group/RadioGroup.svelte` from `packages/react/src/radio-group/RadioGroup.tsx`
- `src/lib/radio-group/roving-focus.svelte.ts` from the linear path of `packages/react/src/internals/composite/root/useCompositeRoot.ts` with RadioGroup's `CompositeRoot` options (orientation `both`, Home/End off, Shift allowed)
- `src/lib/radio-group/RadioGroup.svelte.spec.ts` assertions from `packages/react/src/radio-group/RadioGroup.test.tsx` that do not require Field or `inputRef`
- `src/lib/radio/attributes.ts` from `packages/react/src/radio/utils/stateAttributesMapping.ts` (Field validity attributes omitted)
- `src/lib/radio/label.ts` from `findAssociatedLabel` in `packages/react/src/internals/labelable-provider/useAriaLabelledBy.ts`
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
- `src/lib/number-field/dom.ts` from the `activeElement` and `getTarget` helpers NumberField calls, plus `ownerDocument`, `ownerWindow`, and `addEventListener`
- `src/lib/number-field/platform.ts` from the `ios`, `webkit`, and `gecko` flags in `packages/utils/src/platform`
- `src/lib/number-field/NumberField.svelte.spec.ts` assertions from `packages/react/src/number-field/**/*.test.tsx` that do not require React refs or `className` callbacks
- `src/lib/internal/event-details.ts` also exports the number-field change reasons (`input-change`, `input-clear`, `input-blur`, `input-paste`, `keyboard`, `increment-press`, `decrement-press`, `wheel`, `scrub`)
- `src/lib/scroll-area/ScrollAreaRoot.svelte` and `src/lib/scroll-area/model.svelte.ts` from `packages/react/src/scroll-area/root/ScrollAreaRoot.tsx` and `ScrollAreaRootContext.ts`
- `src/lib/scroll-area/ScrollAreaViewport.svelte` from `packages/react/src/scroll-area/viewport/ScrollAreaViewport.tsx`
- `src/lib/scroll-area/ScrollAreaScrollbar.svelte` from `packages/react/src/scroll-area/scrollbar/ScrollAreaScrollbar.tsx`
- `src/lib/scroll-area/ScrollAreaThumb.svelte` from `packages/react/src/scroll-area/thumb/ScrollAreaThumb.tsx`
- `src/lib/scroll-area/ScrollAreaContent.svelte` from `packages/react/src/scroll-area/content/ScrollAreaContent.tsx`
- `src/lib/scroll-area/ScrollAreaCorner.svelte` from `packages/react/src/scroll-area/corner/ScrollAreaCorner.tsx`
- `src/lib/scroll-area/attributes.ts` from the scroll-area `*DataAttributes.ts` modules and `root/stateAttributes.ts`
- `src/lib/scroll-area/css-vars.ts` from the scroll-area `*CssVars.ts` modules
- `src/lib/scroll-area/geometry.ts` from `packages/react/src/utils/scrollEdges.ts` and the pure helpers in `ScrollAreaRoot.tsx` / `ScrollAreaViewport.tsx`
- `src/lib/scroll-area/dom.ts` from `packages/utils/src/shadowDom.ts` (`contains`, `getTarget`), `packages/utils/src/addEventListener.ts`, and `packages/react/src/scroll-area/utils/getOffset.ts`
- `src/lib/scroll-area/platform.ts` from the `webkit` flag in `packages/utils/src/platform/engine.ts`
- `src/lib/scroll-area/ScrollArea.svelte.spec.ts` assertions from `packages/react/src/scroll-area/**/*.test.tsx` that do not require React refs, `className` callbacks, or `DirectionProvider` (direction is the root element's used CSS `direction`)

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
