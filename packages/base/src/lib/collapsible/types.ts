// Adapted from Base UI v1.8.0 Collapsible at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md.
import type { ClassValue, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { ElementProps } from '../dialog/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
export type CollapsibleTransitionStatus = 'starting' | 'ending' | 'idle' | undefined;
export interface CollapsibleRootState { open: boolean; disabled: boolean; transitionStatus: CollapsibleTransitionStatus }
export type CollapsibleTriggerState = CollapsibleRootState;
export type CollapsiblePanelState = CollapsibleRootState;
export type CollapsibleRootChangeEventReason = 'trigger-press' | 'none';
export type CollapsibleRootChangeEventDetails = BaseUIChangeEventDetails<CollapsibleRootChangeEventReason>;
type PartProps<State, NativeProps> = Omit<ElementProps<State, NativeProps>, 'class'> & { class?: ClassValue | ((state: State) => ClassValue) };
export type CollapsibleRootProps = PartProps<CollapsibleRootState, HTMLAttributes<HTMLDivElement>> & {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean, details: CollapsibleRootChangeEventDetails) => void;
};
export type CollapsibleTriggerProps = Omit<PartProps<CollapsibleTriggerState, HTMLButtonAttributes>, 'disabled'> & {
  disabled?: boolean;
  nativeButton?: boolean;
};
export type CollapsiblePanelProps = PartProps<CollapsiblePanelState, HTMLAttributes<HTMLDivElement>> & {
  keepMounted?: boolean;
  hiddenUntilFound?: boolean;
};
