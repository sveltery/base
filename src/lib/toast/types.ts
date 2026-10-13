// Derived from Base UI v1.9.0 packages/react/src/toast/useToastManager.ts,
// packages/react/src/toast/createToastManager.ts, and the part prop and state types in
// packages/react/src/toast/**/Toast*.tsx (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
// Upstream defaults toast `Data` to `any`, so `toast.data.x` type-checks without a type argument.
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Snippet } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { PortalProps } from '../internal/portal-props.js';
import type { Align, AnchorPositioningParameters, Side } from '../internal/popups/index.js';
import type { RenderChildren } from '../internal/render-children.js';
import type { toastManagerSubscribe } from './create-toast-manager.js';

export type { Align, Side };

/** Text, or a snippet for rich content. `''` renders nothing, like an empty React node. */
export type ToastNode = string | Snippet;

export type ToastSwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface ToastObject<Data extends object = any> {
	/** The unique identifier for the toast. */
	id: string;
	/** The toast's root element. `Toast.Root` writes it. Focus management reads it. */
	element?: HTMLElement | null | undefined;
	/** The title of the toast. */
	title?: ToastNode | undefined;
	/**
	 * The type of the toast. Used to conditionally style the toast,
	 * including conditionally rendering elements based on the type.
	 */
	type?: string | undefined;
	/** The description of the toast. */
	description?: ToastNode | undefined;
	/**
	 * The amount of time (in ms) before the toast is auto dismissed.
	 * A value of `0` will prevent the toast from being dismissed automatically.
	 * @default 5000
	 */
	timeout?: number | undefined;
	/**
	 * The priority of the toast.
	 * - `low` - The toast will be announced politely.
	 * - `high` - The toast will be announced urgently.
	 * @default 'low'
	 */
	priority?: 'low' | 'high' | undefined;
	/** The transition status of the toast. */
	transitionStatus?: 'starting' | 'ending' | undefined;
	/** A counter that increments whenever the toast is updated or upserted. */
	updateKey?: number | undefined;
	/** Whether the toast was limited because the toast limit was exceeded. */
	limited?: boolean | undefined;
	/** The height of the toast. */
	height?: number | undefined;
	/** Called when the toast is closed. */
	onClose?: (() => void) | undefined;
	/** Called when the toast is removed from the list after any animations are complete when closed. */
	onRemove?: (() => void) | undefined;
	/** The props for the action button. `children` is the button's content. */
	actionProps?: ToastActionButtonProps | undefined;
	/** Positioning options for `Toast.Positioner` when rendering anchored toasts. */
	positionerProps?: ToastManagerPositionerProps | undefined;
	/** Custom data for the toast. */
	data?: Data | undefined;
}

export interface ToastActionButtonProps extends Omit<HTMLButtonAttributes, 'children'> {
	children?: ToastNode | undefined;
}

/** Positioning options shared by `Toast.Positioner` and a toast's `positionerProps`. */
export interface ToastPositioningOptions {
	/**
	 * Determines which CSS `position` property to use.
	 * @default 'absolute'
	 */
	positionMethod?: AnchorPositioningParameters['positionMethod'];
	/**
	 * Which side of the anchor element to align the toast against.
	 * May automatically change to avoid collisions.
	 * @default 'top'
	 */
	side?: Side;
	/**
	 * How to align the toast relative to the specified side.
	 * @default 'center'
	 */
	align?: Align;
	/**
	 * Distance between the anchor and the toast in pixels, or a function of the anchor and
	 * positioner dimensions, side, and alignment.
	 * @default 0
	 */
	sideOffset?: AnchorPositioningParameters['sideOffset'];
	/**
	 * Additional offset along the alignment axis in pixels, or a function of the anchor and
	 * positioner dimensions, side, and alignment.
	 * @default 0
	 */
	alignOffset?: AnchorPositioningParameters['alignOffset'];
	/**
	 * An element or a rectangle that delimits the area that the toast is confined to.
	 * @default 'clipping-ancestors'
	 */
	collisionBoundary?: AnchorPositioningParameters['collisionBoundary'];
	/**
	 * Additional space to maintain from the edge of the collision boundary.
	 * @default 5
	 */
	collisionPadding?: AnchorPositioningParameters['collisionPadding'];
	/**
	 * Minimum distance to maintain between the arrow and the edges of the toast.
	 * @default 5
	 */
	arrowPadding?: number;
	/**
	 * Whether to maintain the toast in the viewport after the anchor element was scrolled out of view.
	 * @default false
	 */
	sticky?: boolean;
	/**
	 * Whether to disable the toast from tracking any layout shift of its positioning anchor.
	 * @default false
	 */
	disableAnchorTracking?: boolean;
	/**
	 * Determines how to handle collisions when positioning the toast.
	 * @default { fallbackAxisSide: 'end' }
	 */
	collisionAvoidance?: AnchorPositioningParameters['collisionAvoidance'];
}

export interface ToastManagerPositionerProps extends ToastPositioningOptions {
	/** An element to position the toast against. */
	anchor?: Element | null | undefined;
}

export interface ToastManagerAddOptions<Data extends object = any> extends Omit<
	ToastObject<Data>,
	'id' | 'element' | 'height' | 'limited' | 'updateKey'
> {
	/**
	 * The unique identifier for the toast. Adding a toast with an existing ID
	 * updates it in place and refreshes its auto-dismiss timer.
	 */
	id?: string | undefined;
}

export type ToastManagerUpdateOptions<Data extends object = any> = Partial<
	Omit<
		ToastObject<Data>,
		'id' | 'element' | 'height' | 'transitionStatus' | 'limited' | 'updateKey'
	>
>;

export type ToastManagerUpdate<Data extends object = any> =
	| ToastManagerUpdateOptions<Data>
	| ((prevToast: ToastObject<Data>) => ToastManagerUpdateOptions<Data>);

export interface ToastManagerPromiseOptions<Value, Data extends object = any> {
	loading: string | ToastManagerUpdateOptions<Data>;
	success:
		| string
		| ToastManagerUpdateOptions<Data>
		| ((result: Value) => string | ToastManagerUpdateOptions<Data>);
	error:
		| string
		| ToastManagerUpdateOptions<Data>
		| ((error: any) => string | ToastManagerUpdateOptions<Data>);
}

/** What `getToastManager()` returns. Read `toasts` from the object; do not destructure it. */
export interface GetToastManagerReturnValue<Data extends object = any> {
	readonly toasts: ToastObject<Data>[];
	add: <T extends Data = Data>(options: ToastManagerAddOptions<T>) => string;
	close: (toastId?: string) => void;
	update: <T extends Data = Data>(toastId: string, options: ToastManagerUpdate<T>) => void;
	promise: <Value, T extends Data = Data>(
		promise: Promise<Value>,
		options: ToastManagerPromiseOptions<Value, T>
	) => Promise<Value>;
}

export type ToastManagerEvent =
	| { action: 'add'; options: ToastManagerAddOptions & { id: string } }
	| { action: 'close'; options: { id: string | undefined } }
	| { action: 'update'; options: { id: string; updates: ToastManagerUpdate } }
	| {
			action: 'promise';
			options: ToastManagerPromiseOptions<any> & {
				promise: Promise<any>;
				setPromise: (promise: Promise<any>) => void;
			};
	  };

/** A toast manager for use outside of components. Pass it to `Toast.Provider`. */
export interface ToastManager<Data extends object = any> {
	[toastManagerSubscribe]: (listener: (event: ToastManagerEvent) => void) => () => void;
	add: <T extends Data = Data>(options: ToastManagerAddOptions<T>) => string;
	close: (id?: string) => void;
	update: <T extends Data = Data>(id: string, updates: ToastManagerUpdate<T>) => void;
	promise: <Value, T extends Data = Data>(
		promiseValue: Promise<Value>,
		options: ToastManagerPromiseOptions<Value, T>
	) => Promise<Value>;
}

type PartRender<Props, State> = Snippet<[props: Props, state: State, children: RenderChildren]>;

export type ToastProviderState = Record<string, never>;

export interface ToastProviderProps {
	children?: Snippet;
	/**
	 * The default amount of time (in ms) before a toast is auto dismissed.
	 * A value of `0` will prevent the toast from being dismissed automatically.
	 * @default 5000
	 */
	timeout?: number;
	/**
	 * The maximum number of toasts that can be displayed at once.
	 * When the limit is exceeded, the oldest toasts are marked as `limited` (via the `data-limited`
	 * attribute) rather than removed, so they can be hidden or animated out.
	 * @default 3
	 */
	limit?: number;
	/** A global manager for toasts to use outside of a component. */
	toastManager?: ToastManager;
}

export interface ToastViewportState {
	/** Whether toasts are expanded in the viewport. */
	expanded: boolean;
}

export interface ToastViewportProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLAttributes<HTMLDivElement>, ToastViewportState>;
	children?: Snippet;
}

export interface ToastRootState {
	/** The transition status of the component. */
	transitionStatus: 'starting' | 'ending' | undefined;
	/** Whether the toasts in the viewport are expanded. */
	expanded: boolean;
	/** Whether the toast was limited because the toast limit was exceeded. */
	limited: boolean;
	/** The type of the toast. */
	type: string | undefined;
	/** Whether the toast is being swiped. */
	swiping: boolean;
	/** The direction the toast is being swiped. */
	swipeDirection: ToastSwipeDirection | undefined;
}

export interface ToastRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** The toast to render. */
	toast: ToastObject;
	/**
	 * Direction(s) in which the toast can be swiped to dismiss.
	 * @default ['down', 'right']
	 */
	swipeDirection?: ToastSwipeDirection | ToastSwipeDirection[];
	render?: PartRender<HTMLAttributes<HTMLDivElement>, ToastRootState>;
	children?: Snippet;
}

export interface ToastContentState {
	/** Whether the toast viewport is expanded. */
	expanded: boolean;
	/** Whether the toast is behind the frontmost toast in the stack. */
	behind: boolean;
}

export interface ToastContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLAttributes<HTMLDivElement>, ToastContentState>;
	children?: Snippet;
}

export interface ToastTitleState {
	/** The type of the toast. */
	type: string | undefined;
}

export interface ToastTitleProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> {
	render?: PartRender<HTMLAttributes<HTMLHeadingElement>, ToastTitleState>;
	/** Content. Falls back to the toast's `title`. */
	children?: Snippet;
}

export interface ToastDescriptionState {
	/** The type of the toast. */
	type: string | undefined;
}

export interface ToastDescriptionProps extends Omit<
	HTMLAttributes<HTMLParagraphElement>,
	'children'
> {
	render?: PartRender<HTMLAttributes<HTMLParagraphElement>, ToastDescriptionState>;
	/** Content. Falls back to the toast's `description`. */
	children?: Snippet;
}

export interface ToastActionState {
	/** The type of the toast. */
	type: string | undefined;
}

export interface ToastActionProps extends Omit<HTMLButtonAttributes, 'children' | 'disabled'> {
	disabled?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `false` when `render` supplies a non-button element.
	 * @default true
	 */
	nativeButton?: boolean;
	render?: PartRender<HTMLButtonAttributes, ToastActionState>;
	/** Content. The toast's `actionProps.children` wins over it. */
	children?: Snippet;
}

export interface ToastCloseState {
	/** The type of the toast. */
	type: string | undefined;
}

export interface ToastCloseProps extends Omit<HTMLButtonAttributes, 'children' | 'disabled'> {
	disabled?: boolean;
	/**
	 * Whether the host is a native `<button>`.
	 * Set `false` when `render` supplies a non-button element.
	 * @default true
	 */
	nativeButton?: boolean;
	render?: PartRender<HTMLButtonAttributes, ToastCloseState>;
	children?: Snippet;
}

export type ToastPortalState = Record<string, never>;

export interface ToastPortalProps extends Omit<PortalProps, 'keepMounted'> {
	/**
	 * Replace the portal element. The snippet receives host props, an empty state, and the children snippet.
	 * Host props include the move attachment.
	 */
	render?: Snippet<
		[
			props: HTMLAttributes<HTMLDivElement> & Record<symbol, Attachment<HTMLDivElement>>,
			state: ToastPortalState,
			children: RenderChildren
		]
	>;
}

export interface ToastPositionerState {
	/** The side of the anchor the component is placed on. */
	side: Side;
	/** The alignment of the component relative to the anchor. */
	align: Align;
	/** Whether the anchor element is hidden. */
	anchorHidden: boolean;
}

export interface ToastPositionerProps
	extends ToastPositioningOptions, Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** The toast object associated with the positioner. */
	toast: ToastObject;
	/** An element to position the toast against. Defaults to the toast's `positionerProps.anchor`. */
	anchor?: Element | null;
	render?: PartRender<HTMLAttributes<HTMLDivElement>, ToastPositionerState>;
	children?: Snippet;
}

export interface ToastArrowState {
	/** The side of the anchor the component is placed on. */
	side: Side;
	/** The alignment of the component relative to the anchor. */
	align: Align;
	/** Whether the arrow cannot be centered on the anchor. */
	uncentered: boolean;
}

export interface ToastArrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	render?: PartRender<HTMLAttributes<HTMLDivElement>, ToastArrowState>;
	children?: Snippet;
}
