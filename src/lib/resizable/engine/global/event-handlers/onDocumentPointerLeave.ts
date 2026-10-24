import { read } from '../mutableState.js';
import { updateActiveHitRegions } from '../utils/updateActiveHitRegion.js';

export function onDocumentPointerLeave(event: PointerEvent) {
	const { cursorFlags, interactionState, mountedGroups } = read();

	switch (interactionState.state) {
		case 'active': {
			updateActiveHitRegions({
				document: event.currentTarget as Document,
				event,
				hitRegions: interactionState.hitRegions,
				initialLayoutMap: interactionState.initialLayoutMap,
				mountedGroups,
				prevCursorFlags: cursorFlags
			});
		}
	}
}
