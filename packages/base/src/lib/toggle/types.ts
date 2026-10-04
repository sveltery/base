// Base UI v1.8.0 Toggle public contracts; MIT: THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
export interface ToggleState { pressed: boolean; disabled: boolean }
export type ToggleChangeEventReason = 'none';
export type ToggleChangeEventDetails = BaseUIChangeEventDetails<ToggleChangeEventReason>;
/** Native Svelte snippets, attachments and a bindable actual-host ref. */
export type ToggleProps<Value extends string = string> =
  Omit<WithBaseUIEvent<HTMLButtonAttributes>, 'class' | 'style' | 'children' | 'color' | 'disabled' | 'value'> &
  BaseUIComponentProps<ToggleState> & {
    children?: Snippet | undefined;
    ref?: HTMLElement | null | undefined;
    pressed?: boolean | undefined;
    defaultPressed?: boolean | undefined;
    disabled?: boolean | undefined;
    nativeButton?: boolean | undefined;
    onPressedChange?: ((pressed: boolean, details: ToggleChangeEventDetails) => void) | undefined;
    value?: Value | undefined;
  };
