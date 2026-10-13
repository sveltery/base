// Derived from Base UI v1.9.0 packages/react/src/slider/utils/getMidpoint.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

export function getMidpoint(element: HTMLElement, vertical: boolean): number {
	const rect = element.getBoundingClientRect();
	return vertical ? (rect.top + rect.bottom) / 2 : (rect.left + rect.right) / 2;
}
