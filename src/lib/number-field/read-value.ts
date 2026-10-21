// A remote form spread carries a number input's value as a string, and `''` when the field is
// empty. NumberField reads its value props through this, so a spread renders on the server.

/** A number field value. `null` for an empty or non-numeric string, or no value. */
export function readNumber(raw: unknown): number | null {
	if (typeof raw === 'number') return raw;
	if (typeof raw !== 'string' || raw.trim() === '') return null;
	const parsed = Number(raw);
	return Number.isNaN(parsed) ? null : parsed;
}
