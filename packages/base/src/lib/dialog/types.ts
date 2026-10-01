import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { PreventableEvent } from '../merge-props/index.js';
export type ChangeReason = 'trigger-press' | 'close-press' | 'escape-key' | 'outside-press' | 'focus-out' | 'imperative-action' | 'none';
export type ChangeEventDetails = BaseUIChangeEventDetails<ChangeReason, { preventUnmountOnClose(): void }>;
export type InteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard';
export type FocusTarget = boolean | { current: HTMLElement | null } | ((type: InteractionType) => boolean | HTMLElement | null | void);
export interface Actions { close(): void; unmount(): void }
export interface PopupState { open: boolean; nested: boolean; nestedDialogOpen: boolean; transitionStatus: 'starting' | 'ending' | undefined }
export type ElementProps<State = Record<string, never>> = Omit<HTMLAttributes<HTMLElement>, 'class' | 'style' | 'children' | 'onclick' | 'onkeydown' | 'onkeyup'> & {
  children?: Snippet;
  render?: Snippet<[Record<string | symbol, unknown>, State, Snippet | undefined]>;
  class?: string | ((state: State) => string | undefined);
  style?: string | ((state: State) => string | undefined);
  ref?: HTMLElement | null;
  onclick?: (event: MouseEvent & PreventableEvent) => void;
  onkeydown?: (event: KeyboardEvent & PreventableEvent) => void;
  onkeyup?: (event: KeyboardEvent & PreventableEvent) => void;
};
export interface RootProps {
  children?: Snippet;
  open?: boolean;
  defaultOpen?: boolean;
  modal?: boolean | 'trap-focus';
  disablePointerDismissal?: boolean;
  triggerId?: string | null;
  defaultTriggerId?: string | null;
  onOpenChange?: (open: boolean, details: ChangeEventDetails) => void;
  onOpenChangeComplete?: (open: boolean) => void;
  /** Svelte adaptation of actionsRef: bind:actions. */
  actions?: Actions | null;
  /** Acceptance observation seam; called only after consumer cancellation check. */
  onInternalOpenChange?: (open: boolean, details: ChangeEventDetails) => void;
}
export type ButtonProps = ElementProps<{ disabled: boolean; open?: boolean }> & { disabled?: boolean; nativeButton?: boolean; type?: 'button' | 'submit' | 'reset' };
