// Derived from Base UI v1.8.0 packages/react/src/utils/useOpenInteractionType.ts
// and packages/utils/src/useEnhancedClickHandler.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// One helper. `useClick` writes the result onto `PopupStore` only when the popup is closed.
// `setOpen(false)` clears it. `event.detail === 0` is a keyboard or virtual click.

import { platform } from './platform.js';

export type OpenInteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | '';

export type OpenPointerKind = 'mouse' | 'pen' | 'touch' | 'virtual' | undefined;

/**
 * Interaction that opened the popup, from the click itself.
 * `detail === 0` is keyboard. Otherwise a PointerEvent's `pointerType` wins,
 * then the type remembered from `pointerdown`. An empty type on iOS counts as touch.
 */
export function useOpenInteractionType(
	event: MouseEvent,
	pointerType: OpenPointerKind
): OpenInteractionType {
	if (event.detail === 0) return 'keyboard';
	const fromEvent =
		'pointerType' in event && typeof event.pointerType === 'string' && event.pointerType
			? event.pointerType
			: pointerType;
	if (fromEvent === 'mouse' || fromEvent === 'pen' || fromEvent === 'touch') return fromEvent;
	if (fromEvent === 'virtual') return 'keyboard';
	if (platform.os.ios) return 'touch';
	return '';
}
