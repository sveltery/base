// Derived from Base UI v1.8.0 packages/utils/src/clamp.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export function clamp(
	val: number,
	min: number = Number.MIN_SAFE_INTEGER,
	max: number = Number.MAX_SAFE_INTEGER
): number {
	return Math.max(min, Math.min(val, max));
}
