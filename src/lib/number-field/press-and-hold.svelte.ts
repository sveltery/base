// Derived from Base UI v1.8.0 packages/react/src/internals/usePressAndHold.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { ownerWindow } from '../internal/owner.js';
import { useInterval, useTimeout } from '../internal/timeout.svelte.js';
import { on } from 'svelte/events';

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
	const startTimer = useTimeout();
	const tickInterval = useInterval();
	const touchTimer = useTimeout();
	let removeContextMenu: (() => void) | undefined;
	let removePointerUp: (() => void) | undefined;

	function clearStart() {
		startTimer.clear();
	}

	function clearTick() {
		tickInterval.clear();
	}

	function clearTouch() {
		touchTimer.clear();
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

		removeContextMenu = on(view, 'contextmenu', handleContextMenu);
		removePointerUp?.();
		removePointerUp = on(
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

		startTimer.start(START_DELAY, () => {
			tickInterval.start(TICK_DELAY, () => {
				if (!options.tick(triggerNativeEvent)) stopAutoChange();
			});
		});
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
			touchTimer.start(TOUCH_TIMEOUT, () => {
				const moves = movesAfterTouch;
				movesAfterTouch = 0;
				if (isPressed && moves < MAX_POINTER_MOVES_AFTER_TOUCH) {
					startAutoChange(event);
					ignoreClick = true;
				} else {
					ignoreClick = false;
					stopAutoChange();
				}
			});
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
