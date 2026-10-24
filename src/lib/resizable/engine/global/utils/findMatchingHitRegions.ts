import { calculateHitRegions, type HitRegion } from '../dom/calculateHitRegions.js';
import type { MountedGroupMap } from '../mutableState.js';
import { findClosestHitRegion } from './findClosestHitRegion.js';
import { isViableHitTarget } from './isViableHitTarget.js';

export function findMatchingHitRegions(
	event: {
		clientX: number;
		clientY: number;
		target: EventTarget | null;
	},
	mountedGroups: MountedGroupMap
): HitRegion[] {
	const matchingHitRegions: HitRegion[] = [];

	mountedGroups.forEach((_, groupData) => {
		if (groupData.disabled) {
			return;
		}

		const hitRegions = calculateHitRegions(groupData);
		const match = findClosestHitRegion(groupData.orientation, hitRegions, {
			x: event.clientX,
			y: event.clientY
		});
		if (
			match &&
			match.distance.x <= 0 &&
			match.distance.y <= 0 &&
			isViableHitTarget({
				groupElement: groupData.element,
				hitRegion: match.hitRegion.rect,
				pointerEventTarget: event.target
			})
		) {
			matchingHitRegions.push(match.hitRegion);
		}
	});

	return matchingHitRegions;
}
