# Third-party notices

Parts of this package derive from [Base UI](https://github.com/mui/base-ui) v1.8.0, commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`:

- `src/lib/button/Button.svelte` from `packages/react/src/button/Button.tsx`, with the non-composite paths of `packages/react/src/internals/use-button/useButton.ts`, `packages/react/src/utils/useFocusableWhenDisabled.ts`, and `packages/react/src/utils/dispatchClickWithModifiers.ts`
- `src/lib/button/Button.svelte.spec.ts` assertions from `packages/react/src/button/Button.test.tsx`
- `src/lib/fieldset/FieldsetRoot.svelte` from `packages/react/src/fieldset/root/FieldsetRoot.tsx`
- `src/lib/fieldset/FieldsetLegend.svelte` from `packages/react/src/fieldset/legend/FieldsetLegend.tsx`
- `src/lib/fieldset/context.svelte.ts` from `packages/react/src/fieldset/root/FieldsetRootContext.ts`
- `src/lib/fieldset/register-label-id.svelte.ts` from `packages/react/src/utils/useRegisteredLabelId.ts`
- `src/lib/fieldset/Fieldset.svelte.spec.ts` assertions from `packages/react/src/fieldset/root/FieldsetRoot.test.tsx`, `packages/react/src/fieldset/legend/FieldsetLegend.test.tsx`, and `packages/react/src/utils/useRegisteredLabelId.test.tsx`
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
