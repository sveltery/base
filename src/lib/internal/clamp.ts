// Derived from Base UI v1.9.0 packages/utils/src/clamp.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

export function clamp(
	val: number,
	min: number = Number.MIN_SAFE_INTEGER,
	max: number = Number.MAX_SAFE_INTEGER
): number {
	return Math.max(min, Math.min(val, max));
}
