import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { PreventableEvent } from '../merge-props/index.js';
import type { DialogHandle } from './handle.svelte.js';
export type ChangeReason = 'trigger-press' | 'close-press' | 'escape-key' | 'outside-press' | 'focus-out' | 'imperative-action' | 'none';
export type ChangeEventDetails = BaseUIChangeEventDetails<ChangeReason, { preventUnmountOnClose(): void }>;
export type InteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard';
export type FocusTarget = boolean | { current: HTMLElement | null } | ((type: InteractionType) => boolean | HTMLElement | null | void);
export interface Actions { close(): void; unmount(): void }
export interface PopupState { open: boolean; nested: boolean; nestedDialogOpen: boolean; transitionStatus: 'starting' | 'ending' | undefined }
type PreventableHandlers<Props> = {
  [Key in keyof Props]: Key extends `on:${string}` ? Props[Key] : Key extends `on${string}`
    ? NonNullable<Props[Key]> extends (event: infer E) => infer Result
      ? E extends Event ? ((event: E & PreventableEvent) => Result) | Extract<Props[Key], null | undefined> : Props[Key]
      : Props[Key]
    : Props[Key];
};
export type ElementProps<State = Record<string, never>, NativeProps = HTMLAttributes<HTMLElement>> = Omit<PreventableHandlers<NativeProps>, 'class' | 'style' | 'children'> & {
  children?: Snippet;
  render?: Snippet<[Record<string | symbol, unknown>, State, Snippet | undefined]>;
  class?: string | ((state: State) => string | undefined);
  style?: string | ((state: State) => string | undefined);
  ref?: HTMLElement | null;
};
export interface RootProps<Payload = unknown> {
  children?: Snippet<[{ payload: Payload | undefined }]>;
  handle?: DialogHandle<Payload>;
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
export type ButtonProps = Omit<ElementProps<{ disabled: boolean; open?: boolean }, HTMLButtonAttributes>, 'disabled' | 'type'> & { disabled?: boolean; nativeButton?: boolean; type?: 'button' | 'submit' | 'reset' };
export type TriggerProps<Payload = unknown> = ButtonProps & { handle?: DialogHandle<Payload>; payload?: NoInfer<Payload> };
