// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/useListNavigation.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream writes the orientation to `dataRef.current.orientation`. A nested list reads its
// parent's through the tree. Here each list registers a getter against its store instead.

import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';

export type ListOrientation = 'vertical' | 'horizontal' | 'both';

const orientations = new WeakMap<FloatingRootStore, () => ListOrientation>();

export function registerListOrientation(store: FloatingRootStore, read: () => ListOrientation) {
	orientations.set(store, read);
}

export function readListOrientation(store: FloatingRootStore | undefined) {
	return store ? orientations.get(store)?.() : undefined;
}

function doSwitch(
	orientation: ListOrientation | undefined,
	vertical: boolean,
	horizontal: boolean
) {
	switch (orientation) {
		case 'vertical':
			return vertical;
		case 'horizontal':
			return horizontal;
		default:
			return vertical || horizontal;
	}
}

export function isMainOrientationKey(key: string, orientation: ListOrientation | undefined) {
	const vertical = key === 'ArrowUp' || key === 'ArrowDown';
	const horizontal = key === 'ArrowLeft' || key === 'ArrowRight';
	return doSwitch(orientation, vertical, horizontal);
}

export function isMainOrientationToEndKey(
	key: string,
	orientation: ListOrientation | undefined,
	rtl: boolean
) {
	const vertical = key === 'ArrowDown';
	const horizontal = rtl ? key === 'ArrowLeft' : key === 'ArrowRight';
	return (
		doSwitch(orientation, vertical, horizontal) || key === 'Enter' || key === ' ' || key === ''
	);
}

export function isCrossOrientationOpenKey(
	key: string,
	orientation: ListOrientation | undefined,
	rtl: boolean
) {
	const vertical = rtl ? key === 'ArrowLeft' : key === 'ArrowRight';
	const horizontal = key === 'ArrowDown';
	return doSwitch(orientation, vertical, horizontal);
}

/** `grid` keeps upstream's signature. This package has no grid navigation, so callers pass `false`. */
export function isCrossOrientationCloseKey(
	key: string,
	orientation: ListOrientation | undefined,
	rtl: boolean,
	grid = false
) {
	const vertical = rtl ? key === 'ArrowRight' : key === 'ArrowLeft';
	const horizontal = key === 'ArrowUp';
	if (orientation === 'both' || (orientation === 'horizontal' && grid)) {
		return key === 'Escape';
	}
	return doSwitch(orientation, vertical, horizontal);
}
