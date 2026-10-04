// Public contracts from Base UI v1.8.0 (47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c), MIT.
import type DialogTrigger from '../dialog/Trigger.svelte';
import type { DialogRootProps, DialogRootState, DialogRootActions, DialogRootChangeEventReason, DialogRootChangeEventDetails, DialogTriggerProps, DialogTriggerState } from '../dialog/types.js';
import type { AlertDialogHandle } from './handle.js';

export interface AlertDialogRootProps<Payload = unknown> extends Omit<DialogRootProps<Payload>, 'modal' | 'disablePointerDismissal' | 'onOpenChange' | 'actions' | 'handle'> {
  onOpenChange?: ((open: boolean, details: AlertDialogRootChangeEventDetails) => void) | undefined;
  /** Native bind:actions replaces Source actionsRef. */
  actions?: AlertDialogRootActions | null | undefined;
  handle?: AlertDialogHandle<Payload> | undefined;
}
export type AlertDialogRootState = DialogRootState;
export type AlertDialogRootActions = DialogRootActions;
export type AlertDialogRootChangeEventReason = DialogRootChangeEventReason;
export type AlertDialogRootChangeEventDetails = DialogRootChangeEventDetails;
export interface AlertDialogTriggerProps<Payload = unknown> extends Omit<DialogTriggerProps<Payload>, 'handle'> {
  handle?: AlertDialogHandle<Payload> | undefined;
}
export type AlertDialogTriggerState = DialogTriggerState;

/** The actual generic native Dialog Trigger with the narrower Source handle contract. */
export interface AlertDialogTrigger {
  <Payload = unknown>(internals: Parameters<typeof DialogTrigger<Payload>>[0], props: AlertDialogTriggerProps<Payload>): ReturnType<typeof DialogTrigger<Payload>>;
  z_$$bindings?: typeof DialogTrigger.z_$$bindings;
}

export type {
  DialogBackdropProps as AlertDialogBackdropProps,
  DialogBackdropState as AlertDialogBackdropState,
  DialogCloseProps as AlertDialogCloseProps,
  DialogCloseState as AlertDialogCloseState,
  DialogDescriptionProps as AlertDialogDescriptionProps,
  DialogDescriptionState as AlertDialogDescriptionState,
  DialogPopupProps as AlertDialogPopupProps,
  DialogPopupState as AlertDialogPopupState,
  DialogPortalProps as AlertDialogPortalProps,
  DialogPortalState as AlertDialogPortalState,
  DialogTitleProps as AlertDialogTitleProps,
  DialogTitleState as AlertDialogTitleState,
  DialogViewportProps as AlertDialogViewportProps,
  DialogViewportState as AlertDialogViewportState,
} from '../dialog/types.js';
