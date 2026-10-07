// Layout math from Base UI v1.8.0 packages/react/src/tabs/indicator/TabsIndicator.tsx,
// packages/react/src/utils/getCssDimensions.ts and getElementTransform.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Shadow-boundary parent walks are not ported: scrolling ancestors are parentElement.

import {
	activeTabBottom,
	activeTabHeight,
	activeTabLeft,
	activeTabRight,
	activeTabTop,
	activeTabWidth
} from './attributes.js';

const MAX_LAYOUT_ROUNDING_ERROR = 2;

export interface IndicatorGeometry {
	left: number;
	right: number;
	top: number;
	bottom: number;
	width: number;
	height: number;
}

export function indicatorStyle(geometry: IndicatorGeometry): string {
	return [
		`${activeTabLeft}:${geometry.left}px`,
		`${activeTabRight}:${geometry.right}px`,
		`${activeTabTop}:${geometry.top}px`,
		`${activeTabBottom}:${geometry.bottom}px`,
		`${activeTabWidth}:${geometry.width}px`,
		`${activeTabHeight}:${geometry.height}px`
	].join(';');
}

export function measureIndicator(
	activeTab: HTMLElement,
	tabsListElement: HTMLElement
): IndicatorGeometry {
	const { width: computedWidth, height: computedHeight } = getCssDimensions(activeTab);
	const { width: tabListWidth, height: tabListHeight } = getCssDimensions(tabsListElement);
	const tabRect = activeTab.getBoundingClientRect();
	const tabsListRect = tabsListElement.getBoundingClientRect();
	const scaleX = tabListWidth > 0 ? tabsListRect.width / tabListWidth : 1;
	const scaleY = tabListHeight > 0 ? tabsListRect.height / tabListHeight : 1;

	const layoutOffset = getLayoutOffset(activeTab, tabsListElement);
	let left = layoutOffset.left;
	let top = layoutOffset.top;

	const rectLeft =
		(tabRect.left - tabsListRect.left) / scaleX +
		tabsListElement.scrollLeft -
		tabsListElement.clientLeft;
	const rectTop =
		(tabRect.top - tabsListRect.top) / scaleY +
		tabsListElement.scrollTop -
		tabsListElement.clientTop;

	const tabTranslation = getActiveTabTranslation(activeTab);
	if (
		Math.abs(rectLeft - tabTranslation.x - left) <= MAX_LAYOUT_ROUNDING_ERROR &&
		Math.abs(rectTop - tabTranslation.y - top) <= MAX_LAYOUT_ROUNDING_ERROR
	) {
		left = rectLeft;
		top = rectTop;
	}

	const width = computedWidth;
	const height = computedHeight;
	return {
		left,
		top,
		width,
		height,
		right: tabsListElement.scrollWidth - left - width,
		bottom: tabsListElement.scrollHeight - top - height
	};
}

function getCssDimensions(element: Element) {
	const css = getComputedStyle(element);
	let width = parseFloat(css.width) || 0;
	let height = parseFloat(css.height) || 0;
	const offsetWidth = element instanceof HTMLElement ? element.offsetWidth : width;
	const offsetHeight = element instanceof HTMLElement ? element.offsetHeight : height;
	if (Math.round(width) !== offsetWidth || Math.round(height) !== offsetHeight) {
		width = offsetWidth;
		height = offsetHeight;
	}
	return { width, height };
}

function getLayoutOffset(element: HTMLElement, ancestor: HTMLElement) {
	const elementOffset = getCumulativeOffset(element);
	const ancestorOffset = getCumulativeOffset(ancestor);
	let left = elementOffset.left - ancestorOffset.left - ancestor.clientLeft;
	let top = elementOffset.top - ancestorOffset.top - ancestor.clientTop;

	let node: HTMLElement | null = element.parentElement;
	while (node && node !== ancestor && node !== node.ownerDocument.documentElement) {
		left -= node.scrollLeft;
		top -= node.scrollTop;
		node = node.parentElement;
	}

	return { left, top };
}

function getCumulativeOffset(element: HTMLElement) {
	let left = 0;
	let top = 0;
	let currentElement: HTMLElement | null = element;

	while (currentElement != null) {
		left += currentElement.offsetLeft;
		top += currentElement.offsetTop;
		const offsetParent: Element | null = currentElement.offsetParent;
		if (offsetParent instanceof HTMLElement) {
			left += offsetParent.clientLeft;
			top += offsetParent.clientTop;
		}
		currentElement = offsetParent instanceof HTMLElement ? offsetParent : null;
	}

	return { left, top };
}

function getActiveTabTranslation(element: HTMLElement) {
	const computedStyle = getComputedStyle(element);
	const { x, y } = getElementTransform(computedStyle);
	let translateX = x;
	let translateY = y;
	const { translate } = computedStyle;
	if (translate && translate !== 'none') {
		const parts = translate.split(' ');
		translateX += resolveTranslateLength(parts[0], element.offsetWidth);
		translateY += resolveTranslateLength(parts[1], element.offsetHeight);
	}
	return { x: translateX, y: translateY };
}

function getElementTransform(computedStyle: CSSStyleDeclaration) {
	const transform = computedStyle.transform;
	let translateX = 0;
	let translateY = 0;
	if (transform && transform !== 'none') {
		const matrix = transform.match(/matrix(?:3d)?\(([^)]+)\)/);
		if (matrix) {
			const values = matrix[1].split(', ').map(parseFloat);
			if (values.length === 6) {
				translateX = values[4];
				translateY = values[5];
			} else if (values.length === 16) {
				translateX = values[12];
				translateY = values[13];
			}
		}
	}
	return { x: translateX, y: translateY };
}

function resolveTranslateLength(value: string | undefined, referenceSize: number): number {
	if (!value) return 0;
	const numeric = parseFloat(value);
	if (!Number.isFinite(numeric)) return 0;
	return value.endsWith('%') ? (numeric / 100) * referenceSize : numeric;
}
