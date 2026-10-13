// Derived from Base UI v1.9.0 packages/react/src/utils/scrollable.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import {
	getComputedStyle,
	getParentNode,
	isElement,
	isHTMLElement,
	isLastTraversableNode
} from '@floating-ui/utils/dom';

export type ScrollAxis = 'horizontal' | 'vertical';

// With `allowOverflowIntent`, a container that overflows only once extra space is added (the
// drawer's keyboard scroll slack) still counts, as long as it has layout size on the axis.
export function isScrollable(
	element: HTMLElement,
	axis: ScrollAxis,
	allowOverflowIntent = false
): boolean {
	const style = getComputedStyle(element);
	const overflow = axis === 'vertical' ? style.overflowY : style.overflowX;
	if (overflow !== 'auto' && overflow !== 'scroll') return false;
	if (axis === 'vertical') {
		return allowOverflowIntent
			? element.clientHeight > 0
			: element.scrollHeight > element.clientHeight;
	}
	return allowOverflowIntent ? element.clientWidth > 0 : element.scrollWidth > element.clientWidth;
}

export function findScrollableAncestor(
	target: EventTarget | null,
	root: HTMLElement,
	axis: ScrollAxis,
	allowOverflowIntent = false
): HTMLElement | null {
	// `getParentNode` crosses shadow boundaries and slots. SVG and MathML targets can't scroll,
	// but their HTML ancestors can.
	let node: unknown = target;
	while (isElement(node) && node !== root && !isLastTraversableNode(node)) {
		if (isHTMLElement(node) && isScrollable(node, axis, allowOverflowIntent)) return node;
		node = getParentNode(node);
	}
	return null;
}

export function findScrollableTouchTarget(
	target: EventTarget | null,
	root: HTMLElement,
	axis: ScrollAxis = 'vertical',
	allowOverflowIntent = false
): HTMLElement | null {
	return (
		findScrollableAncestor(target, root, axis, allowOverflowIntent) ??
		(isScrollable(root, axis, allowOverflowIntent) ? root : null)
	);
}
