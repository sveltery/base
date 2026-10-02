// Base UI v1.8.0 Toggle API adaptation; MIT: THIRD_PARTY_NOTICES.md.
import type { HTMLButtonAttributes } from 'svelte/elements';
import type { ElementProps } from '../dialog/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
export interface ToggleState { pressed: boolean; disabled: boolean }
export type ToggleChangeEventReason = 'none';
export type ToggleChangeEventDetails = BaseUIChangeEventDetails<ToggleChangeEventReason>;
/** Standalone Toggle only. ToggleGroup/composite integration is deferred. */
export type ToggleProps = Omit<ElementProps<ToggleState, HTMLButtonAttributes>, 'disabled' | 'value'> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  disabled?: boolean;
  nativeButton?: boolean;
  onPressedChange?: (pressed: boolean, details: ToggleChangeEventDetails) => void;
  /** Accepted and stripped, as upstream; standalone Toggle has no form value. */
  value?: string;
};
