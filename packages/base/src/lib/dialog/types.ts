import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
import type { PreventableEvent } from '../merge-props/index.js';
import type { BaseUIComponentProps, WithBaseUIEvent } from '../internals/types.js';
import type { TransitionStatus } from '../internals/useTransitionStatus.svelte.js';
import type { InteractionType } from '../utils/useEnhancedClickHandler.js';
export type { InteractionType } from '../utils/useEnhancedClickHandler.js';
import type { DialogHandle } from './handle.svelte.js';
export type ChangeReason = 'trigger-press' | 'close-press' | 'escape-key' | 'outside-press' | 'focus-out' | 'imperative-action' | 'none';
export type ChangeEventDetails = BaseUIChangeEventDetails<ChangeReason, { preventUnmountOnClose(): void }>;
export type FocusTarget = boolean | { current: HTMLElement | null } | ((type: InteractionType) => boolean | HTMLElement | null | void);
export interface Actions { close(): void; unmount(): void }
export interface PopupState { open: boolean; nested: boolean; nestedDialogOpen: boolean; transitionStatus: TransitionStatus }
export type DialogRootState = Record<string, never>;
export interface DialogTriggerState { disabled: boolean; open: boolean }
export type DialogPortalState = Record<string, never>;
export interface DialogBackdropState { open: boolean; transitionStatus: PopupState['transitionStatus'] }
export type DialogPopupState = PopupState;
export type DialogViewportState = PopupState;
export type DialogTitleState = Record<string, never>;
export type DialogDescriptionState = Record<string, never>;
export interface DialogCloseState { disabled: boolean }
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

export type DialogElementProps<State = Record<string, never>, NativeProps = HTMLAttributes<HTMLElement>> = Omit<WithBaseUIEvent<NativeProps>, 'class' | 'style' | 'children'> & BaseUIComponentProps<State> & {
  children?: Snippet | undefined;
  ref?: HTMLElement | null | undefined;
};
export interface RootProps<Payload = unknown> {
  children?: Snippet<[{ payload: Payload | undefined }]> | undefined;
  handle?: DialogHandle<Payload> | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  modal?: boolean | 'trap-focus' | undefined;
  disablePointerDismissal?: boolean | undefined;
  triggerId?: string | null | undefined;
  defaultTriggerId?: string | null | undefined;
  onOpenChange?: ((open: boolean, details: ChangeEventDetails) => void) | undefined;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  /** Svelte adaptation of actionsRef: bind:actions. */
  actions?: Actions | null | undefined;
  /** Acceptance observation seam; called only after consumer cancellation check. */
  onInternalOpenChange?: ((open: boolean, details: ChangeEventDetails) => void) | undefined;
}
export type ButtonProps<State = { disabled: boolean; open?: boolean }> = Omit<DialogElementProps<State, HTMLButtonAttributes>, 'disabled' | 'type'> & { disabled?: boolean | undefined; nativeButton?: boolean | undefined; type?: 'button' | 'submit' | 'reset' | undefined };
export type TriggerProps<Payload = unknown> = ButtonProps<DialogTriggerState> & { handle?: DialogHandle<Payload> | undefined; payload?: NoInfer<Payload> | undefined };
export type DialogRootProps<Payload = unknown> = RootProps<Payload>;
export type DialogRootActions = Actions;
export type DialogRootChangeEventReason = ChangeReason;
export type DialogRootChangeEventDetails = ChangeEventDetails;
export type DialogTriggerProps<Payload = unknown> = TriggerProps<Payload>;
export type DialogPortalProps = DialogElementProps<DialogPortalState> & { keepMounted?: boolean | undefined; container?: HTMLElement | ShadowRoot | { current: HTMLElement | ShadowRoot | null } | null | undefined };
export type DialogBackdropProps = DialogElementProps<DialogBackdropState> & { forceRender?: boolean | undefined };
export type DialogViewportProps = DialogElementProps<DialogViewportState>;
export type DialogPopupProps = DialogElementProps<DialogPopupState> & { initialFocus?: FocusTarget | undefined; finalFocus?: FocusTarget | undefined };
export type DialogTitleProps = DialogElementProps<DialogTitleState>;
export type DialogDescriptionProps = DialogElementProps<DialogDescriptionState>;
export type DialogCloseProps = ButtonProps<DialogCloseState>;
