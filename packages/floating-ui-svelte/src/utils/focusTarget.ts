// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/utils/element.ts
// (`getFloatingFocusElement`, `isTypeableCombobox`) and utils/enqueueFocus.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { AnimationFrame } from '@sveltery/utils';
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

// eslint-disable-next-line sveltery/no-unscoped-timer -- page-wide like upstream; each caller cancels its own request
const queuedFocus = new AnimationFrame();

/**
 * Upstream `enqueueFocus` with its `sync` option. One frame is queued at a time across the page,
 * so a later request supersedes an earlier one.
 */
export function enqueueFocus(
	element: HTMLElement | null,
	options: { preventScroll?: boolean; sync?: boolean; shouldFocus?: () => boolean } = {}
) {
	const { preventScroll = false, sync = false, shouldFocus } = options;
	queuedFocus.cancel();

	function exec() {
		if (shouldFocus && !shouldFocus()) return;
		element?.focus({ preventScroll });
	}

	if (sync) {
		exec();
		return () => {};
	}

	queuedFocus.request(exec);
	const frame = queuedFocus.currentId;
	return () => {
		if (queuedFocus.currentId === frame) queuedFocus.cancel();
	};
}
