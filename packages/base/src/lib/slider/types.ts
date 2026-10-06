// Native Svelte declarations of Base UI Slider v1.8.0 at 47b40521 (MIT).
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLOutputAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { FieldRootState } from '../field/types.js';
import type {
  BaseUIChangeEventDetails,
  BaseUIGenericEventDetails,
} from '../internals/createBaseUIEventDetails.js';
export interface SliderRootState extends FieldRootState {
  activeThumbIndex: number;
  disabled: boolean;
  dragging: boolean;
  max: number;
  min: number;
  minStepsBetweenValues: number;
  orientation: 'horizontal' | 'vertical';
  step: number;
  values: readonly number[];
}
export type SliderRootChangeEventReason =
  'input-change' | 'track-press' | 'drag' | 'keyboard' | 'none';
export type SliderRootCommitEventReason = SliderRootChangeEventReason;
export interface SliderRootChangeEventCustomProperties {
  activeThumbIndex: number;
}
export type SliderRootChangeEventDetails = BaseUIChangeEventDetails<
  SliderRootChangeEventReason,
  SliderRootChangeEventCustomProperties
>;
export type SliderRootCommitEventDetails = BaseUIGenericEventDetails<SliderRootCommitEventReason>;
type PartProps<State, Native> = Omit<WithBaseUIEvent<Native>, 'class' | 'style' | 'children'> &
  BaseUIComponentProps<State> & {
    children?: Snippet | undefined;
    ref?: HTMLElement | null | undefined;
  };
export type SliderRootProps<Value extends number | readonly number[] = number | readonly number[]> =
  PartProps<SliderRootState, HTMLAttributes<HTMLDivElement>> & {
    defaultValue?: Value | undefined;
    disabled?: boolean | undefined;
    format?: Intl.NumberFormatOptions | undefined;
    locale?: Intl.LocalesArgument | undefined;
    max?: number | undefined;
    min?: number | undefined;
    minStepsBetweenValues?: number | undefined;
    name?: string | undefined;
    form?: string | undefined;
    orientation?: 'horizontal' | 'vertical' | undefined;
    step?: number | undefined;
    largeStep?: number | undefined;
    thumbAlignment?: 'center' | 'edge' | 'edge-client-only' | undefined;
    thumbCollisionBehavior?: 'push' | 'swap' | 'none' | undefined;
    value?: Value | undefined;
    onValueChange?:
      | ((
          value: Value extends number ? number : Value,
          details: SliderRootChangeEventDetails,
        ) => void)
      | undefined;
    onValueCommitted?:
      | ((
          value: Value extends number ? number : Value,
          details: SliderRootCommitEventDetails,
        ) => void)
      | undefined;
  };
export type SliderControlState = SliderRootState;
export type SliderControlProps = PartProps<SliderControlState, HTMLAttributes<HTMLDivElement>>;
export type SliderTrackState = SliderRootState;
export type SliderTrackProps = PartProps<SliderTrackState, HTMLAttributes<HTMLDivElement>>;
export type SliderIndicatorState = SliderRootState;
export type SliderIndicatorProps = PartProps<SliderIndicatorState, HTMLAttributes<HTMLDivElement>>;
export type SliderLabelState = SliderRootState;
export type SliderLabelProps = Omit<
  PartProps<SliderLabelState, HTMLAttributes<HTMLDivElement>>,
  'id'
>;
export type SliderValueState = SliderRootState;
export type SliderValueProps = Omit<
  PartProps<SliderValueState, HTMLOutputAttributes>,
  'children'
> & {
  children?: Snippet<[readonly string[], readonly number[]]> | null | undefined;
};
export type SliderThumbState = SliderRootState;
export type SliderThumbProps = Omit<
  PartProps<SliderThumbState, HTMLAttributes<HTMLDivElement>>,
  'onblur' | 'onfocus' | 'onkeydown'
> & {
  disabled?: boolean | undefined;
  'aria-valuetext'?: string | undefined;
  getAriaLabel?: ((index: number) => string) | null | undefined;
  getAriaValueText?:
    ((formattedValue: string, value: number, index: number) => string) | null | undefined;
  index?: number | undefined;
  inputRef?: HTMLInputElement | null | undefined;
  onblur?: WithBaseUIEvent<HTMLAttributes<HTMLInputElement>>['onblur'] | undefined;
  onfocus?: WithBaseUIEvent<HTMLAttributes<HTMLInputElement>>['onfocus'] | undefined;
  onkeydown?: WithBaseUIEvent<HTMLAttributes<HTMLInputElement>>['onkeydown'] | undefined;
  tabindex?: number | undefined;
};
export interface ThumbMetadata {
  inputId: string | undefined;
}
