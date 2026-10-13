// Derived from Base UI v1.9.0 packages/react/src/alert-dialog/index.ts,
// root/AlertDialogRoot.tsx and trigger/AlertDialogTrigger.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Every part except Root and Trigger is the Dialog part, so its types are Dialog's.

import type {
	DialogActions,
	DialogBackdropProps,
	DialogBackdropState,
	DialogChangeEventDetails,
	DialogChangeEventReason,
	DialogCloseProps,
	DialogCloseState,
	DialogDescriptionProps,
	DialogDescriptionState,
	DialogPopupProps,
	DialogPopupState,
	DialogPortalProps,
	DialogPortalState,
	DialogRootProps,
	DialogTitleProps,
	DialogTitleState,
	DialogTriggerProps,
	DialogTriggerState,
	DialogViewportProps,
	DialogViewportState
} from '../dialog/types.js';
import type { AlertDialogHandle } from './handle.svelte.js';

export type AlertDialogChangeEventReason = DialogChangeEventReason;
export type AlertDialogChangeEventDetails = DialogChangeEventDetails;
/** Methods on the `AlertDialog.Root` instance. Reach them with `bind:this`. */
export type AlertDialogActions = DialogActions;
export type AlertDialogRootState = Record<string, never>;

export interface AlertDialogRootProps<Payload = unknown> extends Omit<
	DialogRootProps<Payload>,
	'modal' | 'disablePointerDismissal' | 'handle' | 'onOpenChange'
> {
	/** Called before the open state changes. Call `eventDetails.cancel()` to veto it. */
	onOpenChange?: (open: boolean, eventDetails: AlertDialogChangeEventDetails) => void;
	/** Connects detached triggers. Create one with `AlertDialog.createHandle()`. */
	handle?: AlertDialogHandle<Payload>;
}

export interface AlertDialogTriggerProps<Payload = unknown> extends Omit<
	DialogTriggerProps<Payload>,
	'handle'
> {
	/** Associates this trigger with an alert dialog that is not its parent. */
	handle?: AlertDialogHandle<Payload>;
}

export type AlertDialogTriggerState = DialogTriggerState;
export type AlertDialogBackdropProps = DialogBackdropProps;
export type AlertDialogBackdropState = DialogBackdropState;
export type AlertDialogCloseProps = DialogCloseProps;
export type AlertDialogCloseState = DialogCloseState;
export type AlertDialogDescriptionProps = DialogDescriptionProps;
export type AlertDialogDescriptionState = DialogDescriptionState;
export type AlertDialogPopupProps = DialogPopupProps;
export type AlertDialogPopupState = DialogPopupState;
export type AlertDialogPortalProps = DialogPortalProps;
export type AlertDialogPortalState = DialogPortalState;
export type AlertDialogTitleProps = DialogTitleProps;
export type AlertDialogTitleState = DialogTitleState;
export type AlertDialogViewportProps = DialogViewportProps;
export type AlertDialogViewportState = DialogViewportState;
