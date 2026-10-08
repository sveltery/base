// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/utils/tabbable.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { isHTMLElement } from '@floating-ui/utils/dom';
import { ownerDocument } from '../../owner.js';
import { activeElement } from '../../shadow-dom.js';
import { isElementVisible } from './composite.js';

const CANDIDATE_SELECTOR =
	'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex],[contenteditable]:not([contenteditable="false"])';

export function getTabbableCandidates(container: Element): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>(CANDIDATE_SELECTOR)).filter(
		(element) => {
			if (element.closest('[inert]')) return false;
			const tabIndex = element.getAttribute('tabindex');
			if (tabIndex === '-1') return false;
			if (!isHTMLElement(element)) return false;
			return isElementVisible(element);
		}
	);
}

export function getNextTabbable(container: Element, current: Element | null, direction: 1 | -1) {
	const items = getTabbableCandidates(container);
	if (items.length === 0) return null;
	const index = current ? items.indexOf(current as HTMLElement) : -1;
	const next = index === -1 ? (direction === 1 ? 0 : items.length - 1) : index + direction;
	if (next < 0) return items[items.length - 1];
	if (next >= items.length) return items[0];
	return items[next];
}

function tabbablesInDocument(referenceElement: Element | null) {
	if (!referenceElement) return [];
	return getTabbableCandidates(ownerDocument(referenceElement).body);
}

export function getTabbableAfterElement(referenceElement: Element | null): HTMLElement | null {
	const list = tabbablesInDocument(referenceElement);
	if (!referenceElement || list.length === 0) return null;
	const index = list.indexOf(referenceElement as HTMLElement);
	if (index === -1) return null;
	return list[(index + 1) % list.length] ?? null;
}

export function getTabbableBeforeElement(referenceElement: Element | null): HTMLElement | null {
	const list = tabbablesInDocument(referenceElement);
	if (!referenceElement || list.length === 0) return null;
	const index = list.indexOf(referenceElement as HTMLElement);
	if (index === -1) return null;
	return list[(index - 1 + list.length) % list.length] ?? null;
}

export function isOutsideEvent(event: FocusEvent, container?: Element | null) {
	const containerElement = container || (event.currentTarget as Element | null);
	const relatedTarget = event.relatedTarget;
	if (!containerElement || !(relatedTarget instanceof Node)) return true;
	return !containerElement.contains(relatedTarget);
}

export function activeElementIn(container: Element | null) {
	if (!container) return null;
	const active = activeElement(ownerDocument(container));
	if (active && container.contains(active)) return active;
	return null;
}
