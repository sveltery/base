// Derived from Base UI v1.8.0 packages/react/src/slider/utils/getSliderValue.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { clamp } from '../internal/clamp.js';
import { asc } from './asc.js';

export function getSliderValue(
	valueInput: number,
	index: number,
	min: number,
	max: number,
	range: boolean,
	values: readonly number[]
) {
	const clamped = clamp(valueInput, min, max);

	if (!range) {
		return clamped;
	}

	const output = values.slice();
	// Bound the new value to the thumb's neighbours.
	output[index] = clamp(clamped, values[index - 1] ?? -Infinity, values[index + 1] ?? Infinity);
	return output.sort(asc);
}

export function areArraysEqual(a: readonly number[], b: readonly number[]) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i += 1) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

export function areValuesEqual(
	newValue: number | readonly number[],
	oldValue: number | readonly number[]
) {
	return (
		newValue === oldValue ||
		(Array.isArray(newValue) && Array.isArray(oldValue) && areArraysEqual(newValue, oldValue))
	);
}
