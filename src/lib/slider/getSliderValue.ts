// Derived from Base UI v1.9.0 packages/react/src/slider/utils/getSliderValue.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { areArraysEqual } from '@sveltery/utils';
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

export function areValuesEqual(
	newValue: number | readonly number[],
	oldValue: number | readonly number[]
) {
	return (
		newValue === oldValue ||
		(Array.isArray(newValue) && Array.isArray(oldValue) && areArraysEqual(newValue, oldValue))
	);
}
