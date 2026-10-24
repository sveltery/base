import type { Layout, RegisteredGroup } from '../components/group/types.js';
import type { Point } from '../types.js';
import type { HitRegion } from './dom/calculateHitRegions.js';

export type InteractionInactive = {
	state: 'inactive';
};

export type InteractionHover = {
	hitRegions: HitRegion[];
	state: 'hover';
};

export type InteractionActive = {
	hitRegions: HitRegion[];
	initialLayoutMap: Map<RegisteredGroup, Layout>;
	pointerDownAtPoint: Point;
	state: 'active';
};

export type InteractionState = InteractionInactive | InteractionHover | InteractionActive;
