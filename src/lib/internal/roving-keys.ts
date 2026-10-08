// Shared arrow-key sets for composite roving focus.
// Derived from Base UI v1.8.0 packages/react/src/internals/composite/root/useCompositeRoot.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export const ARROWS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export const NAV_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);

export function modifierHeld(event: KeyboardEvent) {
	return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
}

export function axisKeys(vertical: boolean, rtl: boolean) {
	const forwardKey = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
	const backwardKey = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
	return { forwardKey, backwardKey };
}

/** Next index in a linear list. `null` means this key does not move. */
export function stepLinear(
	position: number,
	length: number,
	key: string,
	forwardKey: string,
	backwardKey: string,
	loop: boolean,
	homeEnd: boolean
): number | null {
	if (length === 0) return null;
	if (homeEnd && key === 'Home') return 0;
	if (homeEnd && key === 'End') return length - 1;
	if (key === forwardKey) {
		return position === length - 1 ? (loop ? 0 : position) : position + 1;
	}
	if (key === backwardKey) {
		return position === 0 ? (loop ? length - 1 : position) : position - 1;
	}
	return null;
}
