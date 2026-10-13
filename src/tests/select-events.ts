import { createAttachmentKey } from 'svelte/attachments';

/** A touch tap: the pointer, touch and compatibility mouse events a mobile browser sends. */
export function pressWithTouch(target: Element) {
	const init = { bubbles: true, cancelable: true, button: 0, detail: 1 };
	target.dispatchEvent(new PointerEvent('pointerdown', { ...init, pointerType: 'touch' }));
	target.dispatchEvent(new PointerEvent('pointerup', { ...init, pointerType: 'touch' }));
	target.dispatchEvent(new MouseEvent('mousedown', init));
	target.dispatchEvent(new MouseEvent('mouseup', init));
	target.dispatchEvent(new PointerEvent('click', { ...init, pointerType: 'touch' }));
}

/** A mouse press held for `holdMs` before release. */
export async function fireHeldPress(target: Element, holdMs = 50) {
	const down = { bubbles: true, cancelable: true, button: 0, buttons: 1 };
	const up = { bubbles: true, cancelable: true, button: 0, buttons: 0 };
	target.dispatchEvent(new PointerEvent('pointerdown', { ...down, pointerType: 'mouse' }));
	target.dispatchEvent(new MouseEvent('mousedown', down));
	// eslint-disable-next-line sveltery/no-unscoped-timer -- a test wait, no component owns it
	await new Promise((resolve) => setTimeout(resolve, holdMs));
	target.dispatchEvent(new PointerEvent('pointerup', { ...up, pointerType: 'mouse' }));
	target.dispatchEvent(new MouseEvent('mouseup', up));
	target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
}

export function scrollLocked() {
	return (
		document.documentElement.style.overflowY === 'hidden' ||
		document.body.style.overflowY === 'hidden'
	);
}

/** Props carrying an attachment that gives the element fixed scroll geometry. */
export function scrollGeometry(geometry: {
	scrollTop: { get: () => number; set?: (value: number) => void } | number;
	scrollHeight: number;
	clientHeight: number;
}) {
	return {
		[createAttachmentKey()]: (node: HTMLElement) => {
			const { scrollTop } = geometry;
			Object.defineProperty(
				node,
				'scrollTop',
				typeof scrollTop === 'number'
					? { configurable: true, value: scrollTop, writable: true }
					: { configurable: true, get: scrollTop.get, set: scrollTop.set ?? (() => {}) }
			);
			Object.defineProperty(node, 'scrollHeight', {
				configurable: true,
				value: geometry.scrollHeight
			});
			Object.defineProperty(node, 'clientHeight', {
				configurable: true,
				value: geometry.clientHeight
			});
		}
	};
}

// eslint-disable-next-line sveltery/no-unscoped-timer -- a test wait, no component owns it
export const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
// eslint-disable-next-line sveltery/no-unscoped-timer -- a test wait, no component owns it
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
