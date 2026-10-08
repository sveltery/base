// Derived from Base UI v1.8.0 packages/react/src/utils/useOpenInteractionType.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// `useClick` writes the result onto `PopupStore`. `setOpen(false)` clears it.

import { platform } from '../platform.js';

export type OpenInteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | '';

export type OpenPointerKind = 'mouse' | 'pen' | 'touch' | 'virtual' | undefined;

/**
 * How the trigger press opened the popup.
 * A key press wins. An empty click on iOS counts as touch, matching the hitslop case upstream.
 */
export function useOpenInteractionType(
	pointerType: OpenPointerKind,
	fromKeyboard: boolean
): OpenInteractionType {
	if (fromKeyboard || pointerType === 'virtual') return 'keyboard';
	if (pointerType === 'mouse' || pointerType === 'pen' || pointerType === 'touch')
		return pointerType;
	if (platform.os.ios) return 'touch';
	return '';
}
