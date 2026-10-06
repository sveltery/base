// Source SliderRootContext at Base UI 47b40521; native Svelte context, MIT.
import { getContext, setContext } from 'svelte';
import type { CompositeMetadata } from '../../internals/composite/list/CompositeListContext.js';
import type { UseFieldValidationReturnValue } from '../../field/root/useFieldValidation.svelte.js';
import type {
  SliderRootState,
  SliderRootChangeEventReason,
  SliderRootChangeEventDetails,
  SliderRootCommitEventDetails,
  ThumbMetadata,
} from '../types.js';
export interface SliderRootContext {
  readonly active: number;
  readonly lastUsedThumbIndex: number;
  controlRef: { current: HTMLElement | null };
  readonly dragging: boolean;
  readonly disabled: boolean;
  validation: UseFieldValidationReturnValue;
  readonly format: Intl.NumberFormatOptions | undefined;
  handleInputChange(value: number, index: number, event: KeyboardEvent | Event): void;
  readonly indicatorPosition: (number | undefined)[];
  readonly inset: boolean;
  readonly labelId: string | undefined;
  readonly rootLabelId: string | undefined;
  readonly largeStep: number;
  lastChangeReasonRef: { current: SliderRootChangeEventReason };
  readonly locale: Intl.LocalesArgument | undefined;
  readonly max: number;
  readonly min: number;
  readonly minStepsBetweenValues: number;
  readonly form: string | undefined;
  readonly name: string | undefined;
  onValueCommitted(value: number | readonly number[], details: SliderRootCommitEventDetails): void;
  readonly orientation: SliderRootState['orientation'];
  pressedThumbCenterOffsetRef: { current: number | null };
  pressedThumbIndexRef: { current: number };
  pressedValuesRef: { current: readonly number[] | null };
  readonly renderBeforeHydration: boolean;
  registerFieldControlRef(element: HTMLElement | null): void;
  setActive(index: number): void;
  setDragging(value: boolean): void;
  setIndicatorPosition(
    value: (number | undefined)[] | ((previous: (number | undefined)[]) => (number | undefined)[]),
  ): void;
  setLabelId(
    value: string | undefined | ((previous: string | undefined) => string | undefined),
  ): void;
  setValue(value: number | number[], details: SliderRootChangeEventDetails): boolean;
  readonly state: SliderRootState;
  readonly step: number;
  readonly thumbCollisionBehavior: 'push' | 'swap' | 'none';
  readonly thumbMap: Map<Element, CompositeMetadata & ThumbMetadata>;
  thumbRefs: { current: (HTMLElement | null)[] };
  readonly values: readonly number[];
}
const sliderKey = Symbol('base-ui-slider');
export function setSliderRootContext(context: SliderRootContext) {
  setContext(sliderKey, context);
}
export function useSliderRootContext(): SliderRootContext {
  const context = getContext<SliderRootContext | undefined>(sliderKey);
  if (context === undefined)
    throw new Error(
      'Base UI: SliderRootContext is missing. Slider parts must be placed within <Slider.Root>.',
    );
  return context;
}
