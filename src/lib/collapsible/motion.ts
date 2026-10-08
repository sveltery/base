// Derived from Base UI v1.8.0 packages/react/src/collapsible/panel/useCollapsiblePanel.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { devWarn } from './warn.js';

export type AnimationType = 'css-transition' | 'css-animation' | 'none';

export interface Dimensions {
	height: number | undefined;
	width: number | undefined;
}

export const EMPTY_DIMENSIONS: Dimensions = { height: undefined, width: undefined };

export function getDimensions(element: HTMLElement): Dimensions {
	return { height: element.scrollHeight, width: element.scrollWidth };
}

export function getAnimationType(
	element: HTMLElement,
	hasSuppressedMountAnimation: boolean
): AnimationType {
	const view = element.ownerDocument.defaultView ?? window;
	const panelStyles = view.getComputedStyle(element);
	const hasAnimation =
		(panelStyles.animationName
			.split(',')
			.map((name) => name.trim())
			.some((name) => name !== '' && name !== 'none') ||
			hasSuppressedMountAnimation) &&
		hasNonZeroDuration(panelStyles.animationDuration);
	const hasTransition = hasNonZeroDuration(panelStyles.transitionDuration);

	if (hasAnimation && hasTransition) {
		devWarn(
			'CSS transitions and CSS animations both detected on Collapsible or Accordion panel.',
			'Only one of either animation type should be used.'
		);
		return 'css-transition';
	}
	if (hasTransition) return 'css-transition';
	if (hasAnimation) return 'css-animation';
	return 'none';
}

function hasNonZeroDuration(value: string) {
	return value
		.split(',')
		.map((part) => part.trim())
		.some((part) => part !== '' && Number.parseFloat(part) > 0);
}

/** Temporarily overrides an inline style and returns a restore function. */
export function setTemporaryStyle(
	element: HTMLElement,
	property: string,
	value: string
): () => void {
	const previousValue = element.style.getPropertyValue(property);
	const previousPriority = element.style.getPropertyPriority(property);
	element.style.setProperty(property, value);
	return () => {
		if (previousValue === '') {
			element.style.removeProperty(property);
			return;
		}
		element.style.setProperty(property, previousValue, previousPriority);
	};
}

/**
 * Resets inline alignment styles that distort scroll measurements, then restores
 * them on the next frame. The returned cleanup restores immediately.
 */
export function resetLayoutStyles(element: HTMLElement): () => void {
	const original = {
		'justify-content': element.style.justifyContent,
		'align-items': element.style.alignItems,
		'align-content': element.style.alignContent,
		'justify-items': element.style.justifyItems
	};

	for (const key of Object.keys(original)) {
		element.style.setProperty(key, 'initial', 'important');
	}

	function restore() {
		for (const [key, value] of Object.entries(original)) {
			if (value === '') {
				element.style.removeProperty(key);
				continue;
			}
			element.style.setProperty(key, value);
		}
	}

	const frame = requestAnimationFrame(restore);
	return () => {
		cancelAnimationFrame(frame);
		restore();
	};
}

export function joinStyles(...parts: Array<string | undefined>): string | undefined {
	const present = parts.filter((part) => part != null && part !== '');
	if (present.length === 0) return undefined;
	return present.join(';');
}

export function dimensionStyle(height: number | undefined, width: number | undefined): string {
	const heightValue = height === undefined ? 'auto' : `${height}px`;
	const widthValue = width === undefined ? 'auto' : `${width}px`;
	return `--collapsible-panel-height:${heightValue};--collapsible-panel-width:${widthValue}`;
}
