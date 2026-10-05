// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md.
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { TransitionStatus } from '../internals/useTransitionStatus.svelte.js';
export type CollapsibleTransitionStatus = TransitionStatus;
export interface CollapsibleRootState { open: boolean; disabled: boolean; transitionStatus: CollapsibleTransitionStatus }
export type CollapsibleTriggerState = CollapsibleRootState;
export type CollapsiblePanelState = CollapsibleRootState;
export type CollapsibleRootChangeEventReason = 'trigger-press' | 'none';
export type CollapsibleRootChangeEventDetails = BaseUIChangeEventDetails<CollapsibleRootChangeEventReason>;
type PartProps<State, NativeProps> = Omit<WithBaseUIEvent<NativeProps>, 'class' | 'style' | 'children'> & BaseUIComponentProps<State> & {
  children?: Snippet;
  /** Bind to the actual default or replacement host. */
  ref?: HTMLElement | null;
};
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
