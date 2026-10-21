// A remote form spread carries a range input's value as a string, and `''` when the field is
// empty. The parts read every value prop through these, so a spread renders on the server.

import type { SliderValue } from './types.js';

/** One thumb's value. `undefined` for an empty or non-numeric string. */
export function readThumbValue(raw: unknown): number | undefined {
	if (typeof raw === 'number') return raw;
	if (typeof raw !== 'string' || raw.trim() === '') return undefined;
	const parsed = Number(raw);
	return Number.isNaN(parsed) ? undefined : parsed;
}

/** A slider value: a number, or one number per thumb. `undefined` when there is none. */
export function readSliderValue(raw: unknown): SliderValue | undefined {
	if (!Array.isArray(raw)) return readThumbValue(raw);
	if (raw.every((item) => typeof item === 'number')) return raw;
	const values = raw.map(readThumbValue);
	return values.every((item) => item !== undefined) ? values : undefined;
}
