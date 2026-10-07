// Derived from Base UI v1.8.0 packages/react/src/internals/usePressAndHold.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { addEventListener, ownerWindow } from './dom.js';

const TICK_DELAY = 60;
const START_DELAY = 400;
const SCROLL_DISTANCE = 8;
const TOUCH_TIMEOUT = 50;
const MAX_POINTER_MOVES_AFTER_TOUCH = 3;

export function isTouchLikePointerType(pointerType: string) {
	return pointerType === 'touch' || pointerType === 'pen';
}

export interface PressAndHoldOptions {
	getDisabled: () => boolean;
	getElement: () => HTMLElement | null;
	tick: (triggerEvent?: Event) => boolean;
	onStop?: (nativeEvent: PointerEvent) => void;
}

/**
 * Press-and-hold for the stepper buttons.
 * One action on pointer down, then repeated actions after a delay.
 * Call during component init.
 */
export function createPressAndHold(options: PressAndHoldOptions) {
	let isPressed = false;
	let movesAfterTouch = 0;
	let downX = 0;
	let downY = 0;
	let touchingButton = false;
	let ignoreClick = false;
	let pointerType = '';
	let startTimer: ReturnType<typeof setTimeout> | undefined;
	let tickTimer: ReturnType<typeof setInterval> | undefined;
	let touchTimer: ReturnType<typeof setTimeout> | undefined;
	let removeContextMenu: (() => void) | undefined;
	let removePointerUp: (() => void) | undefined;

	function clearStart() {
		if (startTimer !== undefined) clearTimeout(startTimer);
		startTimer = undefined;
	}

	function clearTick() {
		if (tickTimer !== undefined) clearInterval(tickTimer);
		tickTimer = undefined;
	}

	function clearTouch() {
		if (touchTimer !== undefined) clearTimeout(touchTimer);
		touchTimer = undefined;
	}

	function stopAutoChange() {
		clearTouch();
		clearStart();
		clearTick();
		removeContextMenu?.();
		removeContextMenu = undefined;
		movesAfterTouch = 0;
	}

	function startAutoChange(triggerNativeEvent?: Event) {
		stopAutoChange();
		const element = options.getElement();
		if (!element) return;
		const view = ownerWindow(element);

		function handleContextMenu(event: Event) {
			event.preventDefault();
		}

		removeContextMenu = addEventListener(view, 'contextmenu', handleContextMenu);
		removePointerUp?.();
		removePointerUp = addEventListener(
			view,
			'pointerup',
			(event) => {
				isPressed = false;
				stopAutoChange();
				options.onStop?.(event as PointerEvent);
			},
			{ once: true }
		);

		if (!options.tick(triggerNativeEvent)) {
			stopAutoChange();
			return;
		}

		startTimer = setTimeout(() => {
			tickTimer = setInterval(() => {
				if (!options.tick(triggerNativeEvent)) stopAutoChange();
			}, TICK_DELAY);
		}, START_DELAY);
	}

	function attach(_element: HTMLElement) {
		return () => {
			stopAutoChange();
			removePointerUp?.();
			removePointerUp = undefined;
		};
	}

	$effect(() => {
		if (!options.getDisabled()) return;
		isPressed = false;
		touchingButton = false;
		pointerType = '';
		stopAutoChange();
	});

	return {
		attach,
		onTouchStart() {
			touchingButton = true;
		},
		onTouchEnd() {
			touchingButton = false;
		},
		onPointerDown(event: PointerEvent) {
			if (event.defaultPrevented || event.button || options.getDisabled()) return;
			pointerType = event.pointerType;
			ignoreClick = false;
			isPressed = true;
			downX = event.clientX;
			downY = event.clientY;
			const touch = isTouchLikePointerType(event.pointerType);
			if (!touch) {
				event.preventDefault();
				startAutoChange(event);
				return;
			}
			clearTouch();
			touchTimer = setTimeout(() => {
				const moves = movesAfterTouch;
				movesAfterTouch = 0;
				if (isPressed && moves < MAX_POINTER_MOVES_AFTER_TOUCH) {
					startAutoChange(event);
					ignoreClick = true;
				} else {
					ignoreClick = false;
					stopAutoChange();
				}
			}, TOUCH_TIMEOUT);
		},
		onPointerUp(event: PointerEvent) {
			if (isTouchLikePointerType(event.pointerType)) isPressed = false;
		},
		onPointerMove(event: PointerEvent) {
			if (options.getDisabled() || !isTouchLikePointerType(event.pointerType) || !isPressed) return;
			movesAfterTouch += 1;
			const dx = downX - event.clientX;
			const dy = downY - event.clientY;
			if (dx ** 2 + dy ** 2 > SCROLL_DISTANCE ** 2) stopAutoChange();
		},
		onMouseEnter(event: MouseEvent) {
			if (
				event.defaultPrevented ||
				options.getDisabled() ||
				!isPressed ||
				touchingButton ||
				isTouchLikePointerType(pointerType)
			) {
				return;
			}
			startAutoChange(event);
		},
		onMouseLeave() {
			if (touchingButton) return;
			stopAutoChange();
		},
		onMouseUp() {
			if (touchingButton) return;
			stopAutoChange();
		},
		shouldSkipClick(event: MouseEvent) {
			if (event.defaultPrevented) return true;
			if (isTouchLikePointerType(pointerType)) return ignoreClick;
			return event.detail !== 0;
		}
	};
}
