import { layoutNumbersEqual } from './layoutNumbersEqual.js';

export function compareLayoutNumbers(actual: number, expected: number) {
	if (layoutNumbersEqual(actual, expected)) {
		return 0;
	} else {
		return actual > expected ? 1 : -1;
	}
}
