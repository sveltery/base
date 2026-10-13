// Derived from Base UI v1.9.0 packages/react/src/navigation-menu/utils/isOutsideMenuEvent.ts,
// packages/react/src/navigation-menu/utils/setSharedFixedSize.ts, the
// `getPositionerFixedSize` helper of packages/react/src/navigation-menu/root/NavigationMenuRoot.tsx,
// and `getPlacementFromElements` of packages/react/src/navigation-menu/trigger/NavigationMenuTrigger.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { getNodeChildren, type useFloatingTree } from '@sveltery/floating-ui-svelte';
import { contains } from '@sveltery/utils';
import {
	POPUP_HEIGHT_VAR,
	POPUP_WIDTH_VAR,
	POSITIONER_HEIGHT_VAR,
	POSITIONER_WIDTH_VAR
} from './constants.js';
import type { StyleVars } from './style-vars.svelte.js';

type FloatingTree = ReturnType<typeof useFloatingTree>;

export interface SizeTargets {
	popup: HTMLElement;
	positioner: HTMLElement;
	popupVars: StyleVars;
	positionerVars: StyleVars;
}

export function setSharedFixedSize(targets: SizeTargets, width: number, height: number) {
	setPopupSize(targets, `${width}px`, `${height}px`);
	setPositionerSize(targets, `${width}px`, `${height}px`);
}

export function setPopupSize(targets: SizeTargets, width: string | null, height: string | null) {
	targets.popupVars.set(targets.popup, { [POPUP_WIDTH_VAR]: width, [POPUP_HEIGHT_VAR]: height });
}

export function setPositionerSize(
	targets: SizeTargets,
	width: string | null,
	height: string | null
) {
	targets.positionerVars.set(targets.positioner, {
		[POSITIONER_WIDTH_VAR]: width,
		[POSITIONER_HEIGHT_VAR]: height
	});
}

/**
 * The last fixed positioner size. A closing popup can already measure 0, so the close
 * transition starts from this size instead of a measurement.
 */
export function getPositionerFixedSize(positioner: HTMLElement) {
	const width = parseFloat(positioner.style.getPropertyValue(POSITIONER_WIDTH_VAR)) || 0;
	const height = parseFloat(positioner.style.getPropertyValue(POSITIONER_HEIGHT_VAR)) || 0;
	if (width <= 0 || height <= 0) return null;
	return { width, height };
}

export function isOutsideMenuEvent(
	targets: { currentTarget: EventTarget | null; relatedTarget: EventTarget | null },
	params: {
		popupElement: HTMLElement | null;
		rootElement: HTMLElement | null;
		tree: FloatingTree;
		nodeId: string | null;
	}
) {
	const { currentTarget, relatedTarget } = targets;
	const { popupElement, rootElement, tree, nodeId } = params;
	const nodeChildrenContains = tree
		? getNodeChildren(tree.nodes, nodeId).some((node) =>
				contains(node.context?.floatingElement, relatedTarget)
			)
		: false;

	if (!popupElement) {
		return !contains(rootElement, relatedTarget) && !nodeChildrenContains;
	}

	return (
		!contains(popupElement, currentTarget) &&
		!contains(popupElement, relatedTarget) &&
		!contains(rootElement, relatedTarget) &&
		!nodeChildrenContains
	);
}

/** Side of `floating` relative to `reference`, for a nested viewport that has no positioner. */
export function getPlacementFromElements(reference: Element, floating: Element) {
	const referenceRect = reference.getBoundingClientRect();
	const floatingRect = floating.getBoundingClientRect();
	const deltaX =
		floatingRect.left + floatingRect.width / 2 - (referenceRect.left + referenceRect.width / 2);
	const deltaY =
		floatingRect.top + floatingRect.height / 2 - (referenceRect.top + referenceRect.height / 2);

	if (Math.abs(deltaX) >= Math.abs(deltaY)) {
		return deltaX >= 0 ? 'right' : 'left';
	}
	return deltaY >= 0 ? 'bottom' : 'top';
}
