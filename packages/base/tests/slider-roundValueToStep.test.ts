// Unchanged Base UI 1.8.0 helper assertions at immutable 47b40521; MIT. Only imports adapted.
import { describe, expect, it } from 'vitest';
import { roundValueToStep } from '../src/lib/slider/utils/roundValueToStep.js';

describe('roundValueToStep', () => {
  it('preserves precision from the step origin', () => {
    expect(roundValueToStep(0.35, 0.1, 0.25)).toBe(0.35);
  });

  it('preserves decimal precision for steps greater than one', () => {
    expect(roundValueToStep(13.2, 1.5, 10.2)).toBe(13.2);
  });
});
