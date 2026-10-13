// Derived from Base UI v1.9.0 packages/react/src/internals/serializeValue.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

export function serializeValue(value: unknown): string {
	if (value == null) return '';
	if (typeof value === 'string') return value;
	try {
		return JSON.stringify(value) ?? String(value);
	} catch {
		return String(value);
	}
}
