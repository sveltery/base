// Derived from Base UI v1.8.0 packages/react/src/scroll-area/utils/getOffset.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// `contains` and `getTarget` live in `src/lib/internal/shadow-dom.ts`.

export function getOffset(
	element: Element | null,
	prop: 'margin' | 'padding',
	axis: 'x' | 'y'
): number {
	if (!element) {
		return 0;
	}

	const styles = getComputedStyle(element);
	const key = `${prop}${axis === 'x' ? 'Inline' : 'Block'}` as const;
	const start = parseFloat(styles[`${key}Start`]);

	// Safari misreports `marginInlineEnd` in RTL.
	// We have to assume the start/end values are symmetrical, which is likely.
	if (axis === 'x' && prop === 'margin') {
		return start * 2;
	}

	return start + parseFloat(styles[`${key}End`]);
}
