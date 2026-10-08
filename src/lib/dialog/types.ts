import type { Attachment } from 'svelte/attachments';
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';
import type { PortalProps } from '../internal/portal-props.js';
import type { PopupTransitionStatus } from '../internal/useTransitionStatus.svelte.js';
import type { DialogHandle } from './handle.svelte.js';

export type DialogInteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | '';

export type DialogChangeEventReason =
	| typeof REASONS.triggerPress
	| typeof REASONS.outsidePress
	| typeof REASONS.escapeKey
	| typeof REASONS.closePress
	| typeof REASONS.focusOut
	| typeof REASONS.imperativeAction
	| typeof REASONS.none;

export type DialogChangeEventDetails = BaseUIChangeEventDetails<DialogChangeEventReason> & {
	preventUnmountOnClose: () => void;
};

/** Methods on the `Dialog.Root` instance. Reach them with `bind:this`. */
export interface DialogActions {
	unmount: () => void;
	close: () => void;
}

export type DialogFocusTarget =
	| boolean
	| HTMLElement
	| null
	| ((interaction: DialogInteractionType) => boolean | HTMLElement | null | void);

export type DialogRootState = Record<string, never>;

export interface DialogTriggerState {
	/** Whether the trigger is currently disabled. */
	disabled: boolean;
	/** Whether the dialog is open and was opened by this trigger. */
	open: boolean;
}

export interface DialogPopupState {
	/** Whether the dialog is currently open. */
	open: boolean;
	/** Open/close motion phase. */
	transitionStatus: PopupTransitionStatus;
	/** Whether this dialog is nested inside a parent dialog. */
	nested: boolean;
	/** Whether a dialog nested inside this one is open. */
	nestedDialogOpen: boolean;
}

export interface DialogBackdropState {
	open: boolean;
	transitionStatus: PopupTransitionStatus;
}

export interface DialogCloseState {
	disabled: boolean;
}

export type DialogViewportState = DialogPopupState;
export type DialogTitleState = Record<string, never>;
export type DialogDescriptionState = Record<string, never>;
export type DialogPortalState = Record<string, never>;

export type DialogDivProps = HTMLAttributes<HTMLDivElement> &
	Record<symbol, Attachment<HTMLDivElement>>;

type PartRender<Element extends EventTarget, State> = Snippet<
	[
		props: HTMLAttributes<Element> & Record<symbol, Attachment<Element>>,
		state: State,
		children: Snippet
	]
>;

export interface DialogRootProps<Payload = unknown> {
	/**
	 * Whether the dialog is open.
	 * Use `bind:open` to share it with the parent.
	 * @default false
	 */
	open?: boolean;
	/**
	 * Whether the dialog is initially open.
	 * Omit `open` to let the dialog own it. Pass `open` to hold it.
	 * @default false
	 */
	defaultOpen?: boolean;
	/**
	 * `true` traps focus, locks page scroll, and blocks outside pointer interaction.
	 * `false` leaves the rest of the page usable.
	 * `'trap-focus'` traps focus without locking scroll or outside pointers.
	 * @default true
	 */
	modal?: boolean | 'trap-focus';
	/** Called before the open state changes. Call `eventDetails.cancel()` to veto it. */
	onOpenChange?: (open: boolean, eventDetails: DialogChangeEventDetails) => void;
	/** Called after the open or close animation finishes. */
	onOpenChangeComplete?: (open: boolean) => void;
	/**
	 * Do not close on outside presses.
	 * Non-modal dialogs also stay open when focus moves outside.
	 * @default false
	 */
	disablePointerDismissal?: boolean;
	/** Connects detached triggers. Create one with `Dialog.createHandle()`. */
	handle?: DialogHandle<Payload>;
	/**
	 * Id of the trigger that owns the dialog.
	 * Use `bind:triggerId` to share it with the parent.
	 */
	triggerId?: string | null;
	/**
	 * Trigger id used with `defaultOpen` before a trigger opens the dialog.
	 * @default null
	 */
	defaultTriggerId?: string | null;
	children?: Snippet<[{ payload: Payload | undefined }]>;
}

export type DialogTriggerHostProps = HTMLAttributes<HTMLElement>;

type DialogControlProps = Omit<HTMLButtonAttributes, 'children'> & {
	/** `false` renders through `render` instead of a native button. @default true */
	nativeButton?: boolean;
	children?: Snippet;
};

export interface DialogTriggerProps<Payload = unknown> extends DialogControlProps {
	/** Passed to the dialog when this trigger opens it. */
	payload?: Payload;
	/** Associates this trigger with a dialog that is not its parent. */
	handle?: DialogHandle<Payload>;
	id?: string;
	render?: Snippet<[props: DialogTriggerHostProps, state: DialogTriggerState, children: Snippet]>;
}

export type DialogPortalProps = PortalProps;

export interface DialogPopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Element to focus when the dialog opens.
	 * Touch opens focus the popup itself unless this says otherwise.
	 * Pass an element or a function. There is no ref object.
	 */
	initialFocus?: DialogFocusTarget;
	/**
	 * Element to focus when the dialog closes.
	 * Pass an element or a function. There is no ref object.
	 */
	finalFocus?: DialogFocusTarget;
	render?: PartRender<HTMLDivElement, DialogPopupState>;
	children?: Snippet;
}

export interface DialogBackdropProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Render the backdrop even when this dialog is nested.
	 * @default false
	 */
	forceRender?: boolean;
	render?: PartRender<HTMLDivElement, DialogBackdropState>;
	children?: Snippet;
}

export interface DialogCloseProps extends DialogControlProps {
	render?: Snippet<[props: DialogTriggerHostProps, state: DialogCloseState, children: Snippet]>;
}

export interface DialogTitleProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
	render?: PartRender<HTMLHeadingElement, DialogTitleState>;
	children?: Snippet;
}

export interface DialogDescriptionProps extends Omit<
	HTMLAttributes<HTMLParagraphElement>,
	'children'
> {
	render?: PartRender<HTMLParagraphElement, DialogDescriptionState>;
	children?: Snippet;
}

export interface DialogViewportProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLDivElement, DialogViewportState>;
	children?: Snippet;
}
