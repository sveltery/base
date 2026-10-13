// Derived from Base UI v1.8.0 packages/react/src/internals/serializeValue.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export function serializeValue(value: unknown): string {
	if (value == null) return '';
	if (typeof value === 'string') return value;
	try {
		return JSON.stringify(value) ?? String(value);
	} catch {
		return String(value);
	}
}
