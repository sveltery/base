// Derived from Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/gridNavigation.ts and
// getGridNavigatedIndex in packages/react/src/floating-ui-react/utils/composite.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Only the uniform 1x1 path is ported. Cell maps for multi-cell items are not.

import { stopEvent } from '../utils/event.js';
import {
	findNonDisabledListIndex,
	isIndexOutOfListBounds,
	isListIndexDisabled,
	type DisabledIndices
} from '../utils/listIndex.js';
import type { ListOrientation } from '../utils/listOrientation.js';

type List = ReadonlyArray<HTMLElement | null>;
type Direction = 'up' | 'down';

function isDifferentGridRow(index: number, cols: number, prevRow: number) {
	return Math.floor(index / cols) !== prevRow;
}

export interface GridNavigatedIndexOptions {
	event: KeyboardEvent;
	orientation: ListOrientation;
	loopFocus: boolean;
	rtl: boolean;
	cols: number;
	disabledIndices: DisabledIndices | undefined;
	minIndex: number;
	maxIndex: number;
	prevIndex: number;
	stopEvent?: boolean;
}

function readRows(list: List) {
	const rows: number[][] = [];
	const rowIndexMap: number[] = [];
	let hasRoleRow = false;
	let visibleItemCount = 0;
	let currentRowEl: Element | null = null;
	let currentRowIndex = -1;

	list.forEach((el, index) => {
		if (el == null) return;
		visibleItemCount += 1;
		const rowEl = el.closest('[role="row"]');
		if (rowEl) hasRoleRow = true;
		if (rowEl !== currentRowEl || currentRowIndex === -1) {
			currentRowEl = rowEl;
			currentRowIndex += 1;
			rows[currentRowIndex] = [];
		}
		rows[currentRowIndex].push(index);
		rowIndexMap[index] = currentRowIndex;
	});

	return { rows, rowIndexMap, hasRoleRow, visibleItemCount };
}

/** Moves through a grid whose items each fill one cell. Returns `prevIndex` for keys it ignores. */
export function getGridNavigatedIndex(
	list: List,
	{
		event,
		orientation,
		loopFocus,
		rtl,
		cols,
		disabledIndices,
		minIndex,
		maxIndex,
		prevIndex,
		stopEvent: stop = false
	}: GridNavigatedIndexOptions
): number {
	let nextIndex = prevIndex;

	const verticalDirection: Direction | undefined =
		event.key === 'ArrowUp' ? 'up' : event.key === 'ArrowDown' ? 'down' : undefined;

	if (verticalDirection) {
		const { rows, rowIndexMap, hasRoleRow, visibleItemCount } = readRows(list);

		let hasDomRows = false;
		let inferredDomCols = 0;
		if (hasRoleRow) {
			for (const row of rows) {
				if (row.length > inferredDomCols) inferredDomCols = row.length;
				if (row.length !== cols) hasDomRows = true;
			}
		}

		const hasVirtualizedGaps = hasDomRows && visibleItemCount < list.length;
		const verticalCols = inferredDomCols || cols;

		const navigateVertically = (direction: Direction) => {
			if (!hasDomRows || prevIndex === -1) return undefined;
			const currentRow = rowIndexMap[prevIndex];
			if (currentRow == null) return undefined;

			const colInRow = rows[currentRow].indexOf(prevIndex);
			const step = direction === 'up' ? -1 : 1;

			for (let nextRow = currentRow + step, i = 0; i < rows.length; i += 1, nextRow += step) {
				if (nextRow < 0 || nextRow >= rows.length) {
					if (!loopFocus || hasVirtualizedGaps) return undefined;
					nextRow = nextRow < 0 ? rows.length - 1 : 0;
				}
				const targetRow = rows[nextRow];
				for (let col = Math.min(colInRow, targetRow.length - 1); col >= 0; col -= 1) {
					const candidate = targetRow[col];
					if (!isListIndexDisabled(list, candidate, disabledIndices)) return candidate;
				}
			}
			return undefined;
		};

		const navigateVerticallyWithInferredRows = (direction: Direction) => {
			if (!hasVirtualizedGaps || prevIndex === -1) return undefined;

			const colInRow = prevIndex % verticalCols;
			const rowStep = direction === 'up' ? -verticalCols : verticalCols;
			const lastRowStart = maxIndex - (maxIndex % verticalCols);
			const rowCount = Math.floor(maxIndex / verticalCols) + 1;

			for (
				let rowStart = prevIndex - colInRow + rowStep, i = 0;
				i < rowCount;
				i += 1, rowStart += rowStep
			) {
				if (rowStart < 0 || rowStart > maxIndex) {
					if (!loopFocus) return undefined;
					rowStart = rowStart < 0 ? lastRowStart : 0;
				}
				const rowEnd = Math.min(rowStart + verticalCols - 1, maxIndex);
				for (
					let candidate = Math.min(rowStart + colInRow, rowEnd);
					candidate >= rowStart;
					candidate -= 1
				) {
					if (!isListIndexDisabled(list, candidate, disabledIndices)) return candidate;
				}
			}
			return undefined;
		};

		if (stop) stopEvent(event);

		const verticalCandidate =
			navigateVertically(verticalDirection) ??
			navigateVerticallyWithInferredRows(verticalDirection);

		if (verticalCandidate !== undefined) {
			nextIndex = verticalCandidate;
		} else if (prevIndex === -1) {
			nextIndex = verticalDirection === 'up' ? maxIndex : minIndex;
		} else {
			nextIndex = findNonDisabledListIndex(list, {
				startingIndex: prevIndex,
				amount: verticalCols,
				decrement: verticalDirection === 'up',
				disabledIndices
			});

			if (loopFocus) {
				if (verticalDirection === 'up' && (prevIndex - verticalCols < minIndex || nextIndex < 0)) {
					const col = prevIndex % verticalCols;
					const maxCol = maxIndex % verticalCols;
					const offset = maxIndex - (maxCol - col);
					if (maxCol === col) nextIndex = maxIndex;
					else nextIndex = maxCol > col ? offset : offset - verticalCols;
				}

				if (verticalDirection === 'down' && prevIndex + verticalCols > maxIndex) {
					nextIndex = findNonDisabledListIndex(list, {
						startingIndex: (prevIndex % verticalCols) - verticalCols,
						amount: verticalCols,
						disabledIndices
					});
				}
			}
		}

		if (isIndexOutOfListBounds(list, nextIndex)) nextIndex = prevIndex;
	}

	if (orientation === 'both') {
		const prevRow = Math.floor(prevIndex / cols);
		const forwardKey = rtl ? 'ArrowLeft' : 'ArrowRight';
		const backwardKey = rtl ? 'ArrowRight' : 'ArrowLeft';

		if (event.key === forwardKey) {
			if (stop) stopEvent(event);
			const rowWrapStart = prevIndex - (prevIndex % cols) - 1;
			if (prevIndex % cols !== cols - 1) {
				nextIndex = findNonDisabledListIndex(list, { startingIndex: prevIndex, disabledIndices });
				if (loopFocus && isDifferentGridRow(nextIndex, cols, prevRow)) {
					nextIndex = findNonDisabledListIndex(list, {
						startingIndex: rowWrapStart,
						disabledIndices
					});
				}
			} else if (loopFocus) {
				nextIndex = findNonDisabledListIndex(list, {
					startingIndex: rowWrapStart,
					disabledIndices
				});
			}
			if (isDifferentGridRow(nextIndex, cols, prevRow)) nextIndex = prevIndex;
		}

		if (event.key === backwardKey) {
			if (stop) stopEvent(event);
			const rowWrapStart = prevIndex + (cols - (prevIndex % cols));
			if (prevIndex % cols !== 0) {
				nextIndex = findNonDisabledListIndex(list, {
					startingIndex: prevIndex,
					decrement: true,
					disabledIndices
				});
				if (loopFocus && isDifferentGridRow(nextIndex, cols, prevRow)) {
					nextIndex = findNonDisabledListIndex(list, {
						startingIndex: rowWrapStart,
						decrement: true,
						disabledIndices
					});
				}
			} else if (loopFocus) {
				nextIndex = findNonDisabledListIndex(list, {
					startingIndex: rowWrapStart,
					decrement: true,
					disabledIndices
				});
			}
			if (isDifferentGridRow(nextIndex, cols, prevRow)) nextIndex = prevIndex;
		}

		const lastRow = Math.floor(maxIndex / cols) === prevRow;
		if (isIndexOutOfListBounds(list, nextIndex)) {
			if (loopFocus && lastRow) {
				nextIndex =
					event.key === backwardKey
						? maxIndex
						: findNonDisabledListIndex(list, {
								startingIndex: prevIndex - (prevIndex % cols) - 1,
								disabledIndices
							});
			} else {
				nextIndex = prevIndex;
			}
		}
	}

	return nextIndex;
}

/** A `GridNavigator` for `ListNavigation`'s `grid` option over a list of 1x1 cells. */
export function gridNavigation(
	event: KeyboardEvent,
	prevIndex: number,
	items: List,
	orientation: ListOrientation,
	loopFocus: boolean,
	rtl: boolean,
	disabledIndices: DisabledIndices | undefined,
	minIndex: number,
	maxIndex: number,
	cols = 2
): number | undefined {
	const nextIndex = getGridNavigatedIndex(items, {
		event,
		orientation,
		loopFocus,
		rtl,
		cols,
		disabledIndices,
		minIndex,
		maxIndex,
		// An out-of-range previous index falls back to the first enabled item.
		prevIndex: prevIndex > maxIndex ? minIndex : prevIndex,
		stopEvent: true
	});
	// `-1` means there was nothing to move from, which the caller treats as no navigation.
	return isIndexOutOfListBounds(items, nextIndex) ? undefined : nextIndex;
}
