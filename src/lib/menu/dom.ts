// Derived from Base UI v1.9.0 packages/react/src/utils/dispatchClickWithModifiers.ts,
// packages/react/src/utils/getPseudoElementBounds.ts and
// packages/react/src/menu/utils/findRootOwnerId.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { getParentNode, isHTMLElement, isLastTraversableNode } from '@floating-ui/utils/dom';
import { ownerWindow } from '@sveltery/utils';

/**
 * A constructed click carrying the source event's modifiers. `detail: 1` and
 * `pointerType: 'mouse'` mark a mouse gesture, so the menu does not treat it as a keyboard click.
 */
export function dispatchClickWithModifiers(
	target: Element,
	source: { shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean },
	{ detail = 0, pointerType = '' }: { detail?: number; pointerType?: string } = {}
) {
	target.dispatchEvent(
		new (ownerWindow(target).PointerEvent)('click', {
			bubbles: true,
			cancelable: true,
			composed: true,
			detail,
			pointerType,
			shiftKey: source.shiftKey,
			ctrlKey: source.ctrlKey,
			altKey: source.altKey,
			metaKey: source.metaKey
		})
	);
}

// Tolerance for pointer drift during a press, matching typical drag thresholds.
const BOUNDARY_OFFSET = 5;

/** Whether a mouse event lies within the element and its pseudo-elements, with drift tolerance. */
export function isMouseWithinBounds(event: MouseEvent, element: HTMLElement): boolean {
	const rect = element.getBoundingClientRect();
	const view = ownerWindow(element);
	const before = view.getComputedStyle(element, '::before');
	const after = view.getComputedStyle(element, '::after');
	let { left, right, top, bottom } = rect;
	if (before.content !== 'none' || after.content !== 'none') {
		const width = Math.max(rect.width, parseFloat(before.width) || 0, parseFloat(after.width) || 0);
		const height = Math.max(
			rect.height,
			parseFloat(before.height) || 0,
			parseFloat(after.height) || 0
		);
		left -= (width - rect.width) / 2;
		right += (width - rect.width) / 2;
		top -= (height - rect.height) / 2;
		bottom += (height - rect.height) / 2;
	}
	return (
		event.clientX >= left - BOUNDARY_OFFSET &&
		event.clientX <= right + BOUNDARY_OFFSET &&
		event.clientY >= top - BOUNDARY_OFFSET &&
		event.clientY <= bottom + BOUNDARY_OFFSET
	);
}

export function findRootOwnerId(node: Node): string | undefined {
	if (isHTMLElement(node) && node.hasAttribute('data-rootownerid')) {
		return node.getAttribute('data-rootownerid')!;
	}
	if (isLastTraversableNode(node)) return undefined;
	return findRootOwnerId(getParentNode(node));
}
