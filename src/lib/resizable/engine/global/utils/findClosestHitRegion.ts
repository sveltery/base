import type { Orientation } from '../../components/group/types.js';
import type { Point } from '../../types.js';
import type { HitRegion } from '../dom/calculateHitRegions.js';
import { getDistanceBetweenPointAndRect } from './getDistanceBetweenPointAndRect.js';

export function findClosestHitRegion(
	orientation: Orientation,
	hitRegions: HitRegion[],
	point: Point
) {
	let closestHitRegion: HitRegion | undefined = undefined;
	let minDistance = {
		x: Infinity,
		y: Infinity
	};

	for (const hitRegion of hitRegions) {
		const data = getDistanceBetweenPointAndRect(point, hitRegion.rect);
		switch (orientation) {
			case 'horizontal': {
				if (data.x <= minDistance.x) {
					closestHitRegion = hitRegion;
					minDistance = data;
				}
				break;
			}
			case 'vertical': {
				if (data.y <= minDistance.y) {
					closestHitRegion = hitRegion;
					minDistance = data;
				}
				break;
			}
		}
	}

	return closestHitRegion
		? {
				distance: minDistance,
				hitRegion: closestHitRegion
			}
		: undefined;
}
