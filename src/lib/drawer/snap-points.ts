// Derived from Base UI v1.9.0 packages/react/src/drawer/root/useDrawerSnapPoints.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The measured inputs live on DrawerRootState. These are the pure resolvers.

import { clamp } from '../internal/clamp.js';

export type DrawerSnapPoint = number | string;

export interface ResolvedDrawerSnapPoint {
	value: DrawerSnapPoint;
	height: number;
	offset: number;
}

/**
 * The vertical swipe movement for a snap point. Square-root damping applies once the drag passes
 * the fully open edge, so the popup resists travelling past it.
 */
export function getSnapPointSwipeMovement(baseOffset: number, movementValue: number): number {
	const nextOffset = baseOffset + movementValue;
	if (nextOffset >= 0) return movementValue;
	return -Math.sqrt(-nextOffset) - baseOffset;
}

/** Numbers up to 1 are fractions of the viewport height. Larger numbers and `px`/`rem` are lengths. */
export function resolveSnapPointValue(
	snapPoint: DrawerSnapPoint,
	viewportHeight: number,
	rootFontSize: number
): number | null {
	if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) return null;
	if (typeof snapPoint === 'number') {
		if (!Number.isFinite(snapPoint)) return null;
		return snapPoint <= 1 ? clamp(snapPoint, 0, 1) * viewportHeight : snapPoint;
	}
	const trimmed = snapPoint.trim();
	if (trimmed.endsWith('px')) {
		const value = Number.parseFloat(trimmed);
		return Number.isFinite(value) ? value : null;
	}
	if (trimmed.endsWith('rem')) {
		const value = Number.parseFloat(trimmed);
		return Number.isFinite(value) ? value * rootFontSize : null;
	}
	return null;
}

/** The index of the value closest to `target`, the first on ties, or `-1` when empty. */
export function closestSnapPointIndex(values: number[], target: number): number {
	let closestIndex = -1;
	let closestDistance = Infinity;
	for (let index = 0; index < values.length; index += 1) {
		const distance = Math.abs(values[index] - target);
		if (distance < closestDistance) {
			closestDistance = distance;
			closestIndex = index;
		}
	}
	return closestIndex;
}

/** Drops unresolvable points, clamps heights to the popup, and keeps the last of near-duplicates. */
export function resolveSnapPoints(
	snapPoints: readonly DrawerSnapPoint[] | undefined,
	viewportHeight: number,
	popupHeight: number,
	rootFontSize: number
): ResolvedDrawerSnapPoint[] {
	if (!snapPoints || snapPoints.length === 0 || viewportHeight <= 0 || popupHeight <= 0) {
		return [];
	}
	const maxHeight = Math.min(popupHeight, viewportHeight);
	const resolved: ResolvedDrawerSnapPoint[] = [];
	for (const value of snapPoints) {
		const height = resolveSnapPointValue(value, viewportHeight, rootFontSize);
		if (height === null) continue;
		const clamped = clamp(height, 0, maxHeight);
		resolved.push({ value, height: clamped, offset: Math.max(0, popupHeight - clamped) });
	}
	if (resolved.length <= 1) return resolved;

	const deduped: ResolvedDrawerSnapPoint[] = [];
	const seenHeights: number[] = [];
	for (let index = resolved.length - 1; index >= 0; index -= 1) {
		const point = resolved[index];
		if (seenHeights.some((height) => Math.abs(height - point.height) <= 1)) continue;
		seenHeights.push(point.height);
		deduped.push(point);
	}
	return deduped.reverse();
}

/** The resolved point for `activeSnapPoint`: an exact match, else the closest by height. */
export function resolveActiveSnapPoint(
	activeSnapPoint: DrawerSnapPoint | null,
	resolved: ResolvedDrawerSnapPoint[],
	viewportHeight: number,
	popupHeight: number,
	rootFontSize: number
): ResolvedDrawerSnapPoint | undefined {
	if (activeSnapPoint === null) return undefined;
	const exact = resolved.find((point) => Object.is(point.value, activeSnapPoint));
	if (exact) return exact;
	const height = resolveSnapPointValue(activeSnapPoint, viewportHeight, rootFontSize);
	if (height === null) return undefined;
	const clamped = clamp(height, 0, Math.min(popupHeight, viewportHeight));
	return resolved[
		closestSnapPointIndex(
			resolved.map((point) => point.height),
			clamped
		)
	];
}
