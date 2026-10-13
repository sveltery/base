// Event helpers that match what @testing-library's fireEvent dispatches in upstream tests.
// `mouseEnter` and `mouseLeave` also dispatch the bubbling `mouseover` and `mouseout`,
// as React's enter and leave emulation needs. Pointer helpers default to a mouse.

type Point = { clientX?: number; clientY?: number };
type MouseInit = Point & { relatedTarget?: EventTarget | null };

function mouse(element: Element, type: string, init: MouseInit = {}, bubbles = true) {
	element.dispatchEvent(
		new MouseEvent(type, { bubbles, cancelable: true, composed: true, ...init })
	);
}

function pointer(
	element: Element,
	type: string,
	init: Point & { pointerType?: string },
	bubbles: boolean
) {
	element.dispatchEvent(
		new PointerEvent(type, {
			bubbles,
			cancelable: true,
			composed: true,
			pointerType: 'mouse',
			...init
		})
	);
}

export const fire = {
	pointerDown(element: Element, init: Point & { pointerType?: string } = {}) {
		pointer(element, 'pointerdown', init, true);
	},
	pointerEnter(element: Element, init: Point & { pointerType?: string } = {}) {
		pointer(element, 'pointerover', init, true);
		pointer(element, 'pointerenter', init, false);
	},
	pointerMove(element: Element, init: Point & { pointerType?: string } = {}) {
		pointer(element, 'pointermove', init, true);
	},
	mouseEnter(element: Element, init: MouseInit = {}) {
		mouse(element, 'mouseenter', init, false);
		mouse(element, 'mouseover', init);
	},
	mouseLeave(element: Element, init: MouseInit = {}) {
		mouse(element, 'mouseleave', init, false);
		mouse(element, 'mouseout', init);
	},
	mouseMove(element: Element, init: MouseInit = {}) {
		mouse(element, 'mousemove', init);
	},
	mouseOver(element: Element, init: MouseInit = {}) {
		mouse(element, 'mouseover', init);
	},
	mouseOut(element: Element, init: MouseInit = {}) {
		mouse(element, 'mouseout', init);
	},
	click(element: Element) {
		mouse(element, 'click', { clientX: 0, clientY: 0 });
	},
	keyDown(element: Element, key: string) {
		element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
	}
};

/** Upstream `enterWithMouse`: the pointer, enter, and move events a real mouse produces. */
export function hoverWithMouse(element: Element, init: Point = {}) {
	fire.pointerDown(element, init);
	fire.mouseEnter(element, init);
	fire.mouseMove(element, init);
}

export function byTestId(id: string) {
	return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}
