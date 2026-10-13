// Derived from Base UI v1.9.0 packages/react/src/utils/valueToPercent.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

export function valueToPercent(value: number, min: number, max: number) {
	return ((value - min) * 100) / (max - min);
}
