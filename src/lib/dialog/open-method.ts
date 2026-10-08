// Derived from Base UI v1.8.0 packages/utils/src/useEnhancedClickHandler.ts
// and packages/react/src/utils/useOpenInteractionType.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Records the interaction that opens a dialog. An empty iOS hit is treated as touch.

import { platform } from '../internal/platform.js';
import type { DialogStore } from './store.svelte.js';
import type { InteractionType } from './types.js';

export function noteOpenPointer(store: DialogStore<unknown>, event: PointerEvent) {
	if (event.defaultPrevented || store.open) return;
	const type = (event.pointerType || (platform.os.ios ? 'touch' : '')) as InteractionType;
	store.pointerType = type;
	store.openMethod = type;
}

export function noteOpenClick(store: DialogStore<unknown>, event: MouseEvent) {
	if (store.open) return;
	if (event.detail === 0) {
		store.pointerType = 'keyboard';
		store.openMethod = 'keyboard';
		return;
	}
	const pointer =
		event instanceof PointerEvent && event.pointerType
			? (event.pointerType as InteractionType)
			: store.pointerType;
	const type = (pointer || (platform.os.ios ? 'touch' : '')) as InteractionType;
	store.pointerType = type;
	store.openMethod = type;
}

export function closeInteraction(
	event: Event,
	pointerType: InteractionType | null
): InteractionType {
	if (event instanceof KeyboardEvent) return 'keyboard';
	if (event.type === 'click' && event instanceof MouseEvent && event.detail === 0)
		return 'keyboard';
	if (event instanceof PointerEvent && event.pointerType) {
		return event.pointerType as InteractionType;
	}
	return pointerType ?? '';
}
