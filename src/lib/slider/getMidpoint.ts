// Derived from Base UI v1.8.0 packages/react/src/slider/utils/getMidpoint.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export function getMidpoint(element: HTMLElement, vertical: boolean): number {
	const rect = element.getBoundingClientRect();
	return vertical ? (rect.top + rect.bottom) / 2 : (rect.left + rect.right) / 2;
}
