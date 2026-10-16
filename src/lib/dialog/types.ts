import type { Attachment } from 'svelte/attachments';
import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { PortalProps } from '../internal/portal-props.js';
import type { TransitionStatusValue } from '../internal/useTransitionStatus.svelte.js';
import type { DialogHandle } from './handle.svelte.js';
import type { RenderChildren } from '../internal/render-children.js';

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
	transitionStatus: TransitionStatusValue;
	/** Whether this dialog is nested inside a parent dialog. */
	nested: boolean;
	/** Whether a dialog nested inside this one is open. */
	nestedDialogOpen: boolean;
}

export interface DialogBackdropState {
	open: boolean;
	transitionStatus: TransitionStatusValue;
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
		children: RenderChildren
	]
>;

export interface DialogRootProps<Payload = unknown> {
	/**
	 * Whether the dialog is currently open.
	 * @default false
	 */
	open?: boolean;
	/**
	 * Determines if the dialog enters a modal state when open.
	 * - `true`: user interaction is limited to just the dialog: focus is trapped, document page scroll is locked, and pointer interactions on outside elements are disabled.
	 * - `false`: user interaction with the rest of the document is allowed.
	 * - `'trap-focus'`: focus is trapped inside the dialog, but document page scroll is not locked and pointer interactions outside of it remain enabled.
	 *
	 * When `modal` is `true` or `'trap-focus'`, render `<Dialog.Close>` inside `<Dialog.Popup>` so
	 * touch screen readers can escape the popup.
	 * @default true
	 */
	modal?: boolean | 'trap-focus';
	/** Event handler called when the dialog is opened or closed. */
	onOpenChange?: (open: boolean, eventDetails: DialogChangeEventDetails) => void;
	/** Event handler called after any animations complete when the dialog is opened or closed. */
	onOpenChangeComplete?: (open: boolean) => void;
	/**
	 * Whether to prevent the dialog from closing on outside presses.
	 * For non-modal dialogs, this also prevents the dialog from closing when focus moves outside of it.
	 * @default false
	 */
	disablePointerDismissal?: boolean;
	/**
	 * A handle to associate the dialog with a trigger.
	 * If specified, allows external triggers to control the dialog's open state.
	 * Can be created with the Dialog.createHandle() method.
	 */
	handle?: DialogHandle<Payload>;
	/**
	 * ID of the trigger that the dialog is associated with.
	 * This is useful in conjunction with `bind:open` to create a controlled dialog.
	 * There's no need to specify this prop when the dialog is uncontrolled (that is, when `open` is not bound).
	 * @default null
	 */
	triggerId?: string | null;
	children?: Snippet<[{ payload: Payload | undefined }]>;
}

export type DialogTriggerHostProps = HTMLAttributes<HTMLElement>;

type DialogControlProps = Omit<HTMLButtonAttributes, 'children'> & {
	/**
	 * Whether the component renders a native `<button>` element when replacing it
	 * via the `render` prop.
	 * Set to `false` if the rendered element is not a button (for example, `<div>`).
	 * @default true
	 */
	nativeButton?: boolean;
	children?: Snippet;
};

export interface DialogTriggerProps<Payload = unknown> extends DialogControlProps {
	/**
	 * A handle to associate the trigger with a dialog.
	 * Can be created with the Dialog.createHandle() method.
	 */
	handle?: DialogHandle<Payload>;
	/** A payload to pass to the dialog when it is opened. */
	payload?: Payload;
	/**
	 * ID of the trigger. In addition to being forwarded to the rendered element,
	 * it is also used to specify the active trigger for the dialog in controlled mode (with the Dialog.Root `triggerId` prop).
	 */
	id?: string | null;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: DialogTriggerHostProps, state: DialogTriggerState, children: RenderChildren]
	>;
}

export interface DialogPortalProps extends PortalProps {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, DialogPortalState>;
}

export interface DialogPopupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Determines the element to focus when the dialog is opened.
	 * By default, focus moves to the first tabbable element inside the popup, except when the dialog
	 * is opened by touch — then the popup itself is focused to avoid opening the virtual keyboard.
	 *
	 * - `false`: Do not move focus.
	 * - `true`: Move focus based on the default behavior (first tabbable element or popup).
	 * - `HTMLElement`: Move focus to that element.
	 * - `function`: Called with the interaction type (`mouse`, `touch`, `pen`, or `keyboard`).
	 *   Return an element to focus, `true` to use the default behavior, `null` to fall back to the default behavior, or `false`/`undefined` to do nothing.
	 */
	initialFocus?: DialogFocusTarget;
	/**
	 * Determines the element to focus when the dialog is closed.
	 *
	 * - `false`: Do not move focus.
	 * - `true`: Move focus based on the default behavior (trigger or previously focused element).
	 * - `HTMLElement`: Move focus to that element.
	 * - `function`: Called with the interaction type (`mouse`, `touch`, `pen`, or `keyboard`).
	 *   Return an element to focus, `true` to use the default behavior, `null` to fall back to the default behavior, or `false`/`undefined` to do nothing.
	 */
	finalFocus?: DialogFocusTarget;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, DialogPopupState>;
	children?: Snippet;
}

export interface DialogBackdropProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Whether the backdrop is forced to render even when nested.
	 * @default false
	 */
	forceRender?: boolean;
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, DialogBackdropState>;
	children?: Snippet;
}

export interface DialogCloseProps extends DialogControlProps {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: Snippet<
		[props: DialogTriggerHostProps, state: DialogCloseState, children: RenderChildren]
	>;
}

export interface DialogTitleProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLHeadingElement, DialogTitleState>;
	children?: Snippet;
}

export interface DialogDescriptionProps extends Omit<
	HTMLAttributes<HTMLParagraphElement>,
	'children'
> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLParagraphElement, DialogDescriptionState>;
	children?: Snippet;
}

export interface DialogViewportProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/**
	 * Allows you to replace the component's HTML element
	 * with a different tag, or compose it with another component.
	 * Accepts a snippet that receives the props to spread onto the element, the component's state,
	 * and the children to render.
	 */
	render?: PartRender<HTMLDivElement, DialogViewportState>;
	children?: Snippet;
}
