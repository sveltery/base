// Derived from Base UI v1.8.0 packages/react/src/internals/usePressAndHold.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { ownerWindow, ScopedInterval, ScopedTimeout } from '@sveltery/utils';
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
 * Construct during component init.
 */
export class PressAndHold {
	#isPressed = false;
	#movesAfterTouch = 0;
	#downX = 0;
	#downY = 0;
	#touchingButton = false;
	#ignoreClick = false;
	#pointerType = '';
	readonly #startTimer = new ScopedTimeout();
	readonly #tickInterval = new ScopedInterval();
	readonly #touchTimer = new ScopedTimeout();
	#removeContextMenu: (() => void) | undefined;
	#removePointerUp: (() => void) | undefined;

	constructor(private readonly options: PressAndHoldOptions) {
		$effect(() => {
			if (!options.getDisabled()) return;
			this.#isPressed = false;
			this.#touchingButton = false;
			this.#pointerType = '';
			this.#stopAutoChange();
		});
	}

	#stopAutoChange() {
		this.#touchTimer.clear();
		this.#startTimer.clear();
		this.#tickInterval.clear();
		this.#removeContextMenu?.();
		this.#removeContextMenu = undefined;
		this.#movesAfterTouch = 0;
	}

	#startAutoChange(triggerNativeEvent?: Event) {
		this.#stopAutoChange();
		const element = this.options.getElement();
		if (!element) return;
		const view = ownerWindow(element);

		this.#removeContextMenu = on(view, 'contextmenu', (event) => event.preventDefault());
		this.#removePointerUp?.();
		this.#removePointerUp = on(
			view,
			'pointerup',
			(event) => {
				this.#isPressed = false;
				this.#stopAutoChange();
				this.options.onStop?.(event as PointerEvent);
			},
			{ once: true }
		);

		if (!this.options.tick(triggerNativeEvent)) {
			this.#stopAutoChange();
			return;
		}

		this.#startTimer.start(START_DELAY, () => {
			this.#tickInterval.start(TICK_DELAY, () => {
				if (!this.options.tick(triggerNativeEvent)) this.#stopAutoChange();
			});
		});
	}

	attach = (_element: HTMLElement) => {
		return () => {
			this.#stopAutoChange();
			this.#removePointerUp?.();
			this.#removePointerUp = undefined;
		};
	};

	onTouchStart() {
		this.#touchingButton = true;
	}

	onTouchEnd() {
		this.#touchingButton = false;
	}

	onPointerDown(event: PointerEvent) {
		if (event.defaultPrevented || event.button || this.options.getDisabled()) return;
		this.#pointerType = event.pointerType;
		this.#ignoreClick = false;
		this.#isPressed = true;
		this.#downX = event.clientX;
		this.#downY = event.clientY;
		if (!isTouchLikePointerType(event.pointerType)) {
			event.preventDefault();
			this.#startAutoChange(event);
			return;
		}
		this.#touchTimer.start(TOUCH_TIMEOUT, () => {
			const moves = this.#movesAfterTouch;
			this.#movesAfterTouch = 0;
			if (this.#isPressed && moves < MAX_POINTER_MOVES_AFTER_TOUCH) {
				this.#startAutoChange(event);
				this.#ignoreClick = true;
			} else {
				this.#ignoreClick = false;
				this.#stopAutoChange();
			}
		});
	}

	onPointerUp(event: PointerEvent) {
		if (isTouchLikePointerType(event.pointerType)) this.#isPressed = false;
	}

	onPointerMove(event: PointerEvent) {
		if (
			this.options.getDisabled() ||
			!isTouchLikePointerType(event.pointerType) ||
			!this.#isPressed
		) {
			return;
		}
		this.#movesAfterTouch += 1;
		const dx = this.#downX - event.clientX;
		const dy = this.#downY - event.clientY;
		if (dx ** 2 + dy ** 2 > SCROLL_DISTANCE ** 2) this.#stopAutoChange();
	}

	onMouseEnter(event: MouseEvent) {
		if (
			event.defaultPrevented ||
			this.options.getDisabled() ||
			!this.#isPressed ||
			this.#touchingButton ||
			isTouchLikePointerType(this.#pointerType)
		) {
			return;
		}
		this.#startAutoChange(event);
	}

	onMouseLeave() {
		if (this.#touchingButton) return;
		this.#stopAutoChange();
	}

	onMouseUp() {
		if (this.#touchingButton) return;
		this.#stopAutoChange();
	}

	shouldSkipClick(event: MouseEvent) {
		if (event.defaultPrevented) return true;
		if (isTouchLikePointerType(this.#pointerType)) return this.#ignoreClick;
		return event.detail !== 0;
	}
}
