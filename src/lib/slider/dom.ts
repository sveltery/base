// Derived from Base UI v1.8.0 packages/utils/src/addEventListener.ts and the
// floating-ui DOM helpers Slider calls (`isElement`, `matchesFocusVisible`).
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// `activeElement`, `contains`, `getTarget`, `ownerDocument`, and `ownerWindow` live in
// `src/lib/internal`.

export function isElement(value: EventTarget | null | undefined): value is Element {
	return value instanceof Element;
}

export function matchesFocusVisible(element: Element) {
	try {
		return element.matches(':focus-visible');
	} catch {
		return false;
	}
}

export function addEventListener(
	target: EventTarget,
	type: string,
	listener: EventListener,
	options?: boolean | AddEventListenerOptions
) {
	target.addEventListener(type, listener, options);
	return () => {
		target.removeEventListener(type, listener, options);
	};
}

export function focusElement(
	element: HTMLElement,
	options: { preventScroll?: boolean; focusVisible?: boolean }
) {
	element.focus(options as FocusOptions);
}
