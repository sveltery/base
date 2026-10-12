// Shared key helpers for composite roving focus.
// Derived from Base UI v1.8.0 packages/react/src/internals/composite/root/useCompositeRoot.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// The key sets live in `composite-keys.ts` (`COMPOSITE_KEYS`, `ARROW_KEYS`).

export function modifierHeld(event: KeyboardEvent) {
	return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
}

export function axisKeys(vertical: boolean, rtl: boolean) {
	const forwardKey = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
	const backwardKey = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
	return { forwardKey, backwardKey };
}
