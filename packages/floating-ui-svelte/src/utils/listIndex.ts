// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/utils/composite.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The list helpers only. Grid navigation is not ported. Lists are passed directly, not as refs.

import { isElementVisible } from './composite.js';

export type DisabledIndices = ReadonlyArray<number> | ((index: number) => boolean);

type List = ReadonlyArray<HTMLElement | null>;

export function isIndexOutOfListBounds(list: List, index: number) {
	return index < 0 || index >= list.length;
}

export function isListIndexDisabled(list: List, index: number, disabledIndices?: DisabledIndices) {
	const isExplicitlyDisabled =
		typeof disabledIndices === 'function'
			? disabledIndices(index)
			: (disabledIndices?.includes(index) ?? false);
	if (isExplicitlyDisabled) return true;

	const element = list[index];
	if (!element) return false;
	if (!isElementVisible(element)) return true;
	// A natively disabled element can never take focus, even when `disabledIndices` says it is
	// enabled. Only `aria-disabled` items can be focusable while disabled.
	if (element.matches(':disabled')) return true;

	return (
		!disabledIndices &&
		(element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true')
	);
}

export function findNonDisabledListIndex(
	list: List,
	{
		startingIndex = -1,
		decrement = false,
		disabledIndices,
		amount = 1
	}: {
		startingIndex?: number;
		decrement?: boolean;
		disabledIndices?: DisabledIndices;
		amount?: number;
	} = {}
): number {
	let index = startingIndex;
	do {
		index += decrement ? -amount : amount;
	} while (
		index >= 0 &&
		index <= list.length - 1 &&
		isListIndexDisabled(list, index, disabledIndices)
	);
	return index;
}

export function getMinListIndex(list: List, disabledIndices?: DisabledIndices) {
	return findNonDisabledListIndex(list, { disabledIndices });
}

export function getMaxListIndex(list: List, disabledIndices?: DisabledIndices) {
	return findNonDisabledListIndex(list, {
		decrement: true,
		startingIndex: list.length,
		disabledIndices
	});
}

export interface ListStepOptions {
	/** Whether the step moves toward the start of the list. */
	decrement: boolean;
	loopFocus: boolean;
	/** Whether stepping past either end leaves the list instead of wrapping. */
	allowEscape: boolean;
	disabledIndices?: DisabledIndices;
	minIndex: number;
	maxIndex: number;
}

/**
 * The index one arrow step moves the highlight to from `currentIndex`, or `-1` when the step
 * leaves the list. `wrapped` reports a jump from one end of the list to the other.
 */
export function getNextListIndex(
	list: List,
	currentIndex: number,
	options: ListStepOptions
): { index: number; wrapped: boolean } {
	const { decrement, loopFocus, allowEscape, disabledIndices, minIndex, maxIndex } = options;
	const step = () =>
		findNonDisabledListIndex(list, { startingIndex: currentIndex, decrement, disabledIndices });

	let index: number;
	let wrapped = false;

	if (!loopFocus) {
		index = decrement ? Math.max(minIndex, step()) : Math.min(maxIndex, step());
	} else if (decrement ? currentIndex <= minIndex : currentIndex >= maxIndex) {
		// Escaping is only possible from inside the list. From outside it, a step enters at the far end.
		const outside = decrement ? -1 : list.length;
		if (allowEscape && currentIndex !== outside) {
			index = -1;
		} else {
			index = decrement ? maxIndex : minIndex;
			wrapped = true;
		}
	} else {
		index = step();
	}

	return { index: isIndexOutOfListBounds(list, index) ? -1 : index, wrapped };
}
