// Derived from Base UI v1.9.0 packages/react/src/select/popup/utils.ts,
// the helpers of packages/react/src/select/popup/SelectPopup.tsx and
// packages/react/src/select/scroll-arrow/SelectScrollArrow.tsx,
// packages/react/src/utils/getPseudoElementBounds.ts, and `getMaxScrollOffset` of
// packages/react/src/utils/scrollEdges.ts (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import { platform as floatingPlatform } from '@floating-ui/dom';
import { rectToClientRect, type ClientRectObject } from '@floating-ui/utils';
import { normalizeScrollOffset, SCROLL_EDGE_TOLERANCE_PX } from '../internal/scrollEdges.js';

export function getMaxScrollOffset(scrollSize: number, clientSize: number) {
	return Math.max(0, scrollSize - clientSize);
}

export function getMaxScrollTop(scroller: HTMLElement) {
	return getMaxScrollOffset(scroller.scrollHeight, scroller.clientHeight);
}

/** Inline styles the aligned popup writes onto the positioner, keyed by CSS property. */
export type InlineStyles = Partial<Record<string, string>>;

export function clearStyles(element: HTMLElement | null | undefined, styles: InlineStyles) {
	if (!element) return;
	for (const [property, value] of Object.entries(styles)) {
		element.style.setProperty(property, value ?? '');
	}
}

export const LIST_FUNCTIONAL_STYLES = {
	position: 'relative',
	maxHeight: '100%',
	overflowX: 'hidden',
	overflowY: 'auto'
} as const;

export function getMaxPopupHeight(popupStyles: CSSStyleDeclaration) {
	const maxHeightStyle = popupStyles.maxHeight;
	return maxHeightStyle.endsWith('px') ? parseFloat(maxHeightStyle) || Infinity : Infinity;
}

export function getScale(element: HTMLElement) {
	// The DOM platform returns a plain scale object, not a promise.
	return floatingPlatform.getScale(element) as unknown as { x: number; y: number };
}

export function normalizeSize(size: number, axis: 'x' | 'y', scale: { x: number; y: number }) {
	return size / scale[axis];
}

export function normalizeRect(
	rect: DOMRect | DOMRectReadOnly,
	scale: { x: number; y: number }
): ClientRectObject {
	return rectToClientRect({
		x: normalizeSize(rect.x, 'x', scale),
		y: normalizeSize(rect.y, 'y', scale),
		width: normalizeSize(rect.width, 'x', scale),
		height: normalizeSize(rect.height, 'y', scale)
	});
}

const TRANSFORM_STYLE_RESETS = [
	['transform', 'none'],
	['scale', '1'],
	['translate', '0 0']
] as const;

/** Measures without the popup's own transforms. Returns the restore function. */
export function unsetTransformStyles(popupElement: HTMLElement) {
	const { style } = popupElement;
	const original: Record<string, string> = {};
	for (const [property, value] of TRANSFORM_STYLE_RESETS) {
		original[property] = style.getPropertyValue(property);
		style.setProperty(property, value, 'important');
	}
	return () => {
		for (const [property] of TRANSFORM_STYLE_RESETS) {
			const value = original[property];
			if (value) style.setProperty(property, value);
			else style.removeProperty(property);
		}
	};
}

/** The scroll offset that brings the next item past a scroll arrow into view. */
export function getTargetScrollTop(
	items: ReadonlyArray<HTMLElement | null>,
	isUp: boolean,
	scrollTop: number,
	clientHeight: number,
	scrollArrowHeight: number,
	maxScrollTop: number
) {
	if (isUp) {
		let firstVisibleIndex = 0;
		const visibleTop = scrollTop + scrollArrowHeight - SCROLL_EDGE_TOLERANCE_PX;
		for (let i = 0; i < items.length; i += 1) {
			const item = items[i];
			if (item && item.offsetTop >= visibleTop) {
				firstVisibleIndex = i;
				break;
			}
		}
		const targetIndex = Math.max(0, firstVisibleIndex - 1);
		const targetItem = items[targetIndex];
		return targetIndex < firstVisibleIndex && targetItem
			? normalizeScrollOffset(targetItem.offsetTop - scrollArrowHeight, maxScrollTop)
			: 0;
	}

	let lastVisibleIndex = items.length - 1;
	const visibleBottom = scrollTop + clientHeight - scrollArrowHeight + SCROLL_EDGE_TOLERANCE_PX;
	for (let i = 0; i < items.length; i += 1) {
		const item = items[i];
		if (item && item.offsetTop + item.offsetHeight > visibleBottom) {
			lastVisibleIndex = Math.max(0, i - 1);
			break;
		}
	}
	const targetIndex = Math.min(items.length - 1, lastVisibleIndex + 1);
	const targetItem = items[targetIndex];
	return targetIndex > lastVisibleIndex && targetItem
		? normalizeScrollOffset(
				targetItem.offsetTop + targetItem.offsetHeight - clientHeight + scrollArrowHeight,
				maxScrollTop
			)
		: maxScrollTop;
}

/** Whether a mouse event landed on the element or its pseudo-elements, with a 5px tolerance. */
export function isMouseWithinBounds(event: MouseEvent, element: HTMLElement): boolean {
	const bounds = getPseudoElementBounds(element);
	const offset = 5;
	return (
		event.clientX >= bounds.left - offset &&
		event.clientX <= bounds.right + offset &&
		event.clientY >= bounds.top - offset &&
		event.clientY <= bounds.bottom + offset
	);
}

function getPseudoElementBounds(element: HTMLElement) {
	const rect = element.getBoundingClientRect();
	const win = element.ownerDocument.defaultView ?? window;
	const before = win.getComputedStyle(element, '::before');
	const after = win.getComputedStyle(element, '::after');
	if (before.content === 'none' && after.content === 'none') return rect;
	const width = Math.max(rect.width, parseFloat(before.width) || 0, parseFloat(after.width) || 0);
	const height = Math.max(
		rect.height,
		parseFloat(before.height) || 0,
		parseFloat(after.height) || 0
	);
	const widthDiff = width - rect.width;
	const heightDiff = height - rect.height;
	return {
		left: rect.left - widthDiff / 2,
		right: rect.right + widthDiff / 2,
		top: rect.top - heightDiff / 2,
		bottom: rect.bottom + heightDiff / 2
	};
}
