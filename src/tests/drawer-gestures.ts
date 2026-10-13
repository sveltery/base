// Gesture helpers for the Drawer specs, after Base UI v1.9.0 packages/react/src/drawer tests
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';

export type SwipeStep = {
	type: 'down' | 'move' | 'up';
	x: number;
	y: number;
	time: number;
};

/** Each step carries its own `timeStamp`, so release velocity does not depend on the wall clock. */
function withTimeStamp<T extends Event>(event: T, time: number | undefined): T {
	if (time !== undefined) Object.defineProperty(event, 'timeStamp', { value: time });
	return event;
}

export function firePointer(
	target: EventTarget,
	type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
	init: PointerEventInit & { time?: number } = {}
) {
	const { time, ...rest } = init;
	const event = new PointerEvent(type, {
		bubbles: true,
		cancelable: true,
		composed: true,
		pointerId: 1,
		pointerType: 'mouse',
		button: type === 'pointerdown' || type === 'pointerup' ? 0 : -1,
		buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
		...rest
	});
	return target.dispatchEvent(withTimeStamp(event, time));
}

export async function swipe(target: EventTarget, steps: SwipeStep[]) {
	for (const step of steps) {
		const init = { clientX: step.x, clientY: step.y, time: step.time };
		if (step.type === 'down') firePointer(target, 'pointerdown', init);
		else if (step.type === 'move') firePointer(target, 'pointermove', init);
		else firePointer(target, 'pointerup', init);
		await tick();
	}
}

/** A swipe that sets its direction one pixel in, then travels the rest. */
export function downSwipe(
	target: EventTarget,
	startY: number,
	endY: number,
	times: { start: number; move: number; end: number; settle?: number },
	x = 100
) {
	return swipe(target, [
		{ type: 'down', x, y: startY, time: times.start },
		{ type: 'move', x, y: startY + 1, time: times.move },
		...(times.settle === undefined
			? []
			: [{ type: 'move' as const, x, y: endY - 1, time: times.settle }]),
		{ type: 'move', x, y: endY, time: times.end - 1 },
		{ type: 'up', x, y: endY, time: times.end }
	]);
}

export function rightSwipe(
	target: EventTarget,
	startX: number,
	endX: number,
	times: { start: number; move: number; end: number },
	y = 100
) {
	return swipe(target, [
		{ type: 'down', x: startX, y, time: times.start },
		{ type: 'move', x: startX + 1, y, time: times.move },
		{ type: 'move', x: endX, y, time: times.end - 1 },
		{ type: 'up', x: endX, y, time: times.end }
	]);
}

export type TouchPoint = { x: number; y: number; id?: number };

export function fireTouch(
	target: EventTarget,
	type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
	points: TouchPoint[],
	init: { time?: number; cancelable?: boolean } = {}
) {
	const touches = points.map(
		(point) =>
			new Touch({
				identifier: point.id ?? 1,
				target: target as Element,
				clientX: point.x,
				clientY: point.y
			})
	);
	const ended = type === 'touchend' || type === 'touchcancel';
	const event = new TouchEvent(type, {
		bubbles: true,
		cancelable: init.cancelable ?? true,
		composed: true,
		touches: ended ? [] : touches,
		targetTouches: ended ? [] : touches,
		changedTouches: touches
	});
	target.dispatchEvent(withTimeStamp(event, init.time));
	return event;
}

/** Points hit testing at `element`, as a swipe that starts on the popup would. */
export function pointAt(element: Element) {
	const original = document.elementFromPoint;
	document.elementFromPoint = () => element;
	return () => {
		document.elementFromPoint = original;
	};
}

export async function frame() {
	await new Promise<void>((resolve) => {
		// eslint-disable-next-line sveltery/no-unscoped-timer -- a test helper that awaits one frame
		requestAnimationFrame(() => resolve());
	});
	await tick();
}
