// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md; parity/slider/source-correspondence.md.
import { clamp } from '../../utils/clamp.js';
import { asc } from './asc.js';

export function getSliderValue(
  valueInput: number,
  index: number,
  min: number,
  max: number,
  range: boolean,
  values: readonly number[],
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
