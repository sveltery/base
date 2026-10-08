// Derived from Base UI v1.8.0 packages/react/src/utils/useOpenInteractionType.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The interaction is recorded on the store when the trigger opens. It is not a React ref.

import { platform } from '../internal/platform.js';
import type { PopoverStore } from './store.svelte.js';
import type { InteractionType } from './types.js';

export function openMethodProps(store: PopoverStore, readOpen: () => boolean) {
	let pointer: string | undefined;
	return {
		onpointerdown(event: PointerEvent) {
			pointer = event.pointerType;
			store.lastInteraction = interactionFromPointer(pointer);
		},
		onkeydown(event: KeyboardEvent) {
			if (event.key === 'Enter' || event.key === ' ') store.lastInteraction = 'keyboard';
		},
		onclick(event: MouseEvent) {
			if (readOpen()) return;
			const type = interactionFromClick(event, pointer);
			store.openMethod = type;
			store.lastInteraction = type;
		}
	};
}

function interactionFromPointer(pointer: string | undefined): InteractionType {
	if (pointer === 'touch') return 'touch';
	if (pointer === 'pen') return 'pen';
	return 'mouse';
}

function interactionFromClick(event: MouseEvent, pointer: string | undefined): InteractionType {
	if (event.detail === 0) return 'keyboard';
	if (pointer === 'touch' || pointer === 'pen') return pointer;
	if (!pointer && platform.os.ios) return 'touch';
	return 'mouse';
}
