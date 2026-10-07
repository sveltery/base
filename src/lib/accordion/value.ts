// Derived from Base UI v1.8.0 packages/react/src/accordion/root/AccordionRoot.tsx
// handleValueChange (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

/**
 * Next open values after one item asks to open or close.
 * Exclusive mode ignores `nextOpen` and keys off the first open value, matching upstream.
 */
export function nextAccordionValue(
	value: readonly unknown[],
	itemValue: unknown,
	nextOpen: boolean,
	multiple: boolean
): unknown[] {
	if (!multiple) {
		return value[0] === itemValue ? [] : [itemValue];
	}
	if (nextOpen) {
		const next = value.slice();
		next.push(itemValue);
		return next;
	}
	return value.filter((entry) => entry !== itemValue);
}
