// Base UI v1.8.0 ToggleGroup public contracts; MIT: THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
export interface ToggleGroupState {
  disabled: boolean;
  multiple: boolean;
  orientation: 'horizontal' | 'vertical';
}
export type ToggleGroupChangeEventReason = 'none';
export type ToggleGroupChangeEventDetails = BaseUIChangeEventDetails<ToggleGroupChangeEventReason>;
export type ToggleGroupProps<Value extends string = string> = Omit<
  WithBaseUIEvent<HTMLAttributes<HTMLDivElement>>,
  'class' | 'style' | 'children' | 'color'
> &
  BaseUIComponentProps<ToggleGroupState> & {
    children?: Snippet | undefined;
    ref?: HTMLElement | null | undefined;
    value?: readonly Value[] | undefined;
    defaultValue?: readonly Value[] | undefined;
    onValueChange?: ((value: Value[], details: ToggleGroupChangeEventDetails) => void) | undefined;
    disabled?: boolean | undefined;
    orientation?: ToggleGroupState['orientation'] | undefined;
    loopFocus?: boolean | undefined;
    multiple?: boolean | undefined;
  };
