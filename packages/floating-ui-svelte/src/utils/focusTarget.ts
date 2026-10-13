// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/utils/element.ts
// (`getFloatingFocusElement`, `isTypeableCombobox`)
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { FOCUSABLE_ATTRIBUTE } from './constants.js';
import { isTypeableElement } from './element.js';

/** The element that carries the floating props. A positioner wrapper hands focus to its child. */
export function getFloatingFocusElement(floatingElement: HTMLElement | null | undefined) {
	if (!floatingElement) return null;
	return floatingElement.hasAttribute(FOCUSABLE_ATTRIBUTE)
		? floatingElement
		: (floatingElement.querySelector<HTMLElement>(`[${FOCUSABLE_ATTRIBUTE}]`) ?? floatingElement);
}

export function isTypeableCombobox(element: Element | null) {
	if (!element) return false;
	return element.getAttribute('role') === 'combobox' && isTypeableElement(element);
}

// List navigation and FloatingFocusManager share one queued-focus slot, as upstream does.
export { enqueueFocus } from './enqueueFocus.js';
