import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';
import type { PopupTransitionStatus } from '../internal/useTransitionStatus.svelte.js';
import type { DialogHandle } from './handle.svelte.js';

export type InteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | '';

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

export interface DialogActions {
	unmount: () => void;
	close: () => void;
}

export type FocusTarget =
	| boolean
	| HTMLElement
	| null
	| ((interaction: InteractionType) => boolean | HTMLElement | null | void);

export interface DialogRootState {}

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
export interface DialogTitleState {}
export interface DialogDescriptionState {}
export interface DialogPortalState {}

type PartRender<Element extends EventTarget, State> = Snippet<
	[props: HTMLAttributes<Element>, state: State, children: Snippet]
>;

export interface DialogRootProps<Payload = unknown> {
	/**
	 * Whether the dialog is open.
	 * Use `bind:open` to share it with the parent.
	 * @default false
	 */
	open?: boolean;
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
	/** Imperative `close` and `unmount`. Assign with `bind:actions`. */
	actions?: DialogActions;
	/** Connects detached triggers. Create one with `Dialog.createHandle()`. */
	handle?: DialogHandle<Payload>;
	/**
	 * Id of the trigger that owns the dialog.
	 * Use `bind:triggerId` to share it with the parent.
	 */
	triggerId?: string | null;
	children?: Snippet<[{ payload: Payload | undefined }]>;
}

export type DialogTriggerHostProps = HTMLAttributes<HTMLElement>;

export interface DialogTriggerProps<Payload = unknown> extends Omit<
	HTMLButtonAttributes,
	'children' | 'disabled' | 'onclick' | 'onmousedown' | 'onpointerdown' | 'onkeydown' | 'onkeyup'
> {
	disabled?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `false` when `render` supplies a non-button element.
	 * @default true
	 */
	nativeButton?: boolean;
	/** Runs before the trigger opens the dialog. Call `event.preventDefault()` to skip it. */
	onclick?: HTMLAttributes<HTMLElement>['onclick'];
	onmousedown?: HTMLAttributes<HTMLElement>['onmousedown'];
	onpointerdown?: HTMLAttributes<HTMLElement>['onpointerdown'];
	onkeydown?: HTMLAttributes<HTMLElement>['onkeydown'];
	onkeyup?: HTMLAttributes<HTMLElement>['onkeyup'];
	/** Passed to the dialog when this trigger opens it. */
	payload?: Payload;
	/** Associates this trigger with a dialog that is not its parent. */
	handle?: DialogHandle<Payload>;
	id?: string;
	render?: Snippet<[props: DialogTriggerHostProps, state: DialogTriggerState, children: Snippet]>;
	children?: Snippet;
}

export interface DialogPortalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Keep the portal mounted while the dialog is closed.
	 * @default false
	 */
	keepMounted?: boolean;
	/** Element the portal is appended to. Defaults to `document.body`. */
	container?: HTMLElement | null;
	children?: Snippet;
}

export interface DialogPopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Element to focus when the dialog opens.
	 * Touch opens focus the popup itself unless this says otherwise.
	 * Pass an element or a function. There is no ref object.
	 */
	initialFocus?: FocusTarget;
	/**
	 * Element to focus when the dialog closes.
	 * Pass an element or a function. There is no ref object.
	 */
	finalFocus?: FocusTarget;
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

export interface DialogCloseProps extends Omit<
	HTMLButtonAttributes,
	'children' | 'disabled' | 'onclick' | 'onmousedown' | 'onpointerdown' | 'onkeydown' | 'onkeyup'
> {
	disabled?: boolean;
	nativeButton?: boolean;
	onclick?: HTMLAttributes<HTMLElement>['onclick'];
	onmousedown?: HTMLAttributes<HTMLElement>['onmousedown'];
	onpointerdown?: HTMLAttributes<HTMLElement>['onpointerdown'];
	onkeydown?: HTMLAttributes<HTMLElement>['onkeydown'];
	onkeyup?: HTMLAttributes<HTMLElement>['onkeyup'];
	render?: Snippet<[props: DialogTriggerHostProps, state: DialogCloseState, children: Snippet]>;
	children?: Snippet;
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
