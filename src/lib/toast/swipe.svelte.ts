// Swipe-to-dismiss for one toast.
// Derived from Base UI v1.9.0 packages/react/src/toast/root/ToastRoot.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream keeps the gesture in a dozen refs and states. Here the rendered state is four fields,
// and everything a gesture only needs while the pointer is down lives in one `Gesture` object.
// `gesture === null` is upstream's `activePointerIdRef.current === null`.

import { on } from 'svelte/events';
import { closest, contains, getTarget, ownerDocument, ownerWindow } from '@sveltery/utils';
import { getElementTransform } from '../internal/getElementTransform.js';
import { ToastRootCssVariables } from './constants.js';
import type { ToastSwipeDirection } from './types.js';
import { TOAST_SWIPE_IGNORE_SELECTOR, getDisplacement } from './utils.js';

const SWIPE_THRESHOLD = 40;
const REVERSE_CANCEL_THRESHOLD = 10;
const OPPOSITE_DIRECTION_DAMPING_FACTOR = 0.5;
const MIN_DRAG_THRESHOLD = 1;
const INTERACTIVE_SELECTOR = `button,a,input,textarea,[role="button"],${TOAST_SWIPE_IGNORE_SELECTOR}`;

interface Point {
	x: number;
	y: number;
}

interface Transform extends Point {
	scale: number;
}

interface Gesture {
	pointerId: number;
	start: Point;
	/** Moves with the pointer whenever it reverses, so a change of mind is measured from there. */
	cancelBaseline: Point;
	firstMove: boolean;
	/** The pointer moved at least `MIN_DRAG_THRESHOLD`. */
	real: boolean;
	/** Set on the first real move when both axes are swipeable. */
	lockedAxis: 'horizontal' | 'vertical' | null;
	intended: ToastSwipeDirection | undefined;
	maxDisplacement: number;
	cancelled: boolean;
	stopListening: () => void;
}

export interface ToastSwipeOptions {
	directions: ToastSwipeDirection[];
	/** Touch presses pause the auto-dismiss timers. */
	pauseTimers: () => void;
	/** A press counts as hovering the viewport. */
	press: () => void;
	dismiss: () => void;
}

const ORIGIN: Transform = { x: 0, y: 0, scale: 1 };

export class ToastSwipe {
	swiping = $state(false);
	direction = $state<ToastSwipeDirection | undefined>(undefined);
	dragOffset = $state.raw<Point>({ x: 0, y: 0 });
	initialTransform = $state.raw<Transform>(ORIGIN);

	#gesture: Gesture | null = null;

	constructor(private readonly options: () => ToastSwipeOptions) {}

	get active() {
		return this.#gesture !== null;
	}

	/** Upstream's `getDragStyles()`. */
	get style(): Record<string, string | undefined> {
		const { dragOffset, initialTransform, swiping } = this;
		return {
			transition: swiping ? 'none' : undefined,
			// While swiping, freeze the element at its current visual transform so it doesn't
			// snap to the end position.
			transform: swiping
				? `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) scale(${initialTransform.scale})`
				: undefined,
			[ToastRootCssVariables.swipeMovementX]: `${dragOffset.x - initialTransform.x}px`,
			[ToastRootCssVariables.swipeMovementY]: `${dragOffset.y - initialTransform.y}px`
		};
	}

	/** Clears what a previous lifecycle left behind when a root is reused. */
	reset() {
		this.direction = undefined;
		this.initialTransform = ORIGIN;
		this.dragOffset = { x: 0, y: 0 };
	}

	dispose() {
		this.#gesture?.stopListening();
		this.#gesture = null;
	}

	pointerdown = (event: PointerEvent) => {
		if (event.button !== 0) return;
		const { pauseTimers, press } = this.options();

		if (event.pointerType === 'touch') pauseTimers();

		if (closest(getTarget(event), INTERACTIVE_SELECTOR)) return;

		const element = event.currentTarget as HTMLElement;
		const start = { x: event.clientX, y: event.clientY };

		this.#gesture?.stopListening();
		const doc = ownerDocument(element);
		const offUp = on(doc, 'pointerup', this.end);
		const offCancel = on(doc, 'pointercancel', this.end);

		this.#gesture = {
			pointerId: event.pointerId,
			start,
			cancelBaseline: start,
			firstMove: true,
			real: false,
			lockedAxis: null,
			intended: undefined,
			maxDisplacement: 0,
			cancelled: false,
			stopListening: () => {
				offUp();
				offCancel();
			}
		};

		const transform = getElementTransform(ownerWindow(element).getComputedStyle(element));
		this.initialTransform = transform;
		this.dragOffset = { x: transform.x, y: transform.y };

		press();
		this.swiping = true;

		element.setPointerCapture?.(event.pointerId);
	};

	pointermove = (event: PointerEvent) => {
		const gesture = this.#gesture;
		if (!gesture || event.pointerId !== gesture.pointerId) return;
		const { directions } = this.options();

		// Prevent text selection on Safari.
		event.preventDefault();

		if (gesture.firstMove) {
			// Adjust the starting position to the current position on the first move
			// to account for the delay between pointerdown and the first pointermove on iOS.
			gesture.start = { x: event.clientX, y: event.clientY };
			gesture.firstMove = false;
		}

		const { clientX, clientY, movementX, movementY } = event;
		const baseline = gesture.cancelBaseline;

		if ((movementY < 0 && clientY > baseline.y) || (movementY > 0 && clientY < baseline.y)) {
			gesture.cancelBaseline = { x: gesture.cancelBaseline.x, y: clientY };
		}
		if ((movementX < 0 && clientX > baseline.x) || (movementX > 0 && clientX < baseline.x)) {
			gesture.cancelBaseline = { x: clientX, y: gesture.cancelBaseline.y };
		}

		const deltaX = clientX - gesture.start.x;
		const deltaY = clientY - gesture.start.y;
		const cancelDeltaX = clientX - gesture.cancelBaseline.x;
		const cancelDeltaY = clientY - gesture.cancelBaseline.y;

		const hasHorizontal = directions.includes('left') || directions.includes('right');
		const hasVertical = directions.includes('up') || directions.includes('down');

		if (!gesture.real && Math.hypot(deltaX, deltaY) >= MIN_DRAG_THRESHOLD) {
			gesture.real = true;
			// Locking is only meaningful when both axes are swipeable; otherwise the single
			// axis already constrains the gesture.
			if (hasHorizontal && hasVertical) {
				gesture.lockedAxis = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
			}
		}

		if (!gesture.intended) {
			const candidate = candidateDirection(gesture.lockedAxis, deltaX, deltaY);
			if (candidate && directions.includes(candidate)) {
				gesture.intended = candidate;
				gesture.maxDisplacement = getDisplacement(candidate, deltaX, deltaY);
				this.direction = candidate;
			}
		} else {
			const direction = gesture.intended;
			const currentDisplacement = getDisplacement(direction, cancelDeltaX, cancelDeltaY);
			if (currentDisplacement > SWIPE_THRESHOLD) {
				gesture.cancelled = false;
				this.direction = direction;
			} else if (
				!(directions.includes('left') && directions.includes('right')) &&
				!(directions.includes('up') && directions.includes('down')) &&
				gesture.maxDisplacement - currentDisplacement >= REVERSE_CANCEL_THRESHOLD
			) {
				// A change of mind.
				gesture.cancelled = true;
			}
		}

		const damped = applyDirectionalDamping(directions, deltaX, deltaY);
		let x = this.initialTransform.x;
		let y = this.initialTransform.y;
		if (gesture.lockedAxis !== 'vertical' && hasHorizontal) x += damped.x;
		if (gesture.lockedAxis !== 'horizontal' && hasVertical) y += damped.y;
		this.dragOffset = { x, y };
	};

	/** `pointerup` and `pointercancel`, on the toast and on its document. */
	end = (event: PointerEvent) => {
		const gesture = this.#gesture;
		if (!gesture || event.pointerId !== gesture.pointerId) return;

		gesture.stopListening();
		this.#gesture = null;
		this.swiping = false;

		const initial = this.initialTransform;

		if (event.type === 'pointercancel' || gesture.cancelled) {
			this.dragOffset = { x: initial.x, y: initial.y };
			this.direction = undefined;
			return;
		}

		const deltaX = this.dragOffset.x - initial.x;
		const deltaY = this.dragOffset.y - initial.y;
		const { directions, dismiss } = this.options();
		const dismissDirection = directions.find(
			(direction) => getDisplacement(direction, deltaX, deltaY) > SWIPE_THRESHOLD
		);

		if (dismissDirection) {
			this.direction = dismissDirection;
			dismiss();
		} else {
			this.dragOffset = { x: initial.x, y: initial.y };
			this.direction = undefined;
		}
	};

	/**
	 * A non-passive `touchmove` listener for the toast element. `preventDefault` on
	 * `pointermove` does not stop iOS from scrolling while dragging.
	 */
	blockTouchScroll = (element: HTMLElement) =>
		on(
			element,
			'touchmove',
			(event) => {
				if (this.#gesture === null || !contains(element, getTarget(event))) return;
				event.preventDefault();
			},
			{ passive: false }
		);
}

function candidateDirection(
	lockedAxis: Gesture['lockedAxis'],
	deltaX: number,
	deltaY: number
): ToastSwipeDirection | undefined {
	if (lockedAxis === 'vertical') {
		if (deltaY > 0) return 'down';
		if (deltaY < 0) return 'up';
		return undefined;
	}
	if (lockedAxis === 'horizontal') {
		if (deltaX > 0) return 'right';
		if (deltaX < 0) return 'left';
		return undefined;
	}
	if (Math.abs(deltaX) >= Math.abs(deltaY)) return deltaX > 0 ? 'right' : 'left';
	return deltaY > 0 ? 'down' : 'up';
}

function applyDirectionalDamping(
	directions: ToastSwipeDirection[],
	deltaX: number,
	deltaY: number
): Point {
	const damp = (delta: number) =>
		delta > 0
			? delta ** OPPOSITE_DIRECTION_DAMPING_FACTOR
			: -(Math.abs(delta) ** OPPOSITE_DIRECTION_DAMPING_FACTOR);
	const dampX =
		(deltaX > 0 && !directions.includes('right')) || (deltaX < 0 && !directions.includes('left'));
	const dampY =
		(deltaY > 0 && !directions.includes('down')) || (deltaY < 0 && !directions.includes('up'));
	return { x: dampX ? damp(deltaX) : deltaX, y: dampY ? damp(deltaY) : deltaY };
}
