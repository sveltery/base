// The hidden `<select>` that Select.Root submits through.

export const nativeSelect = () =>
	document.querySelector<HTMLSelectElement>('select[aria-hidden="true"]')!;

/** The values the hidden select would submit. */
export const selectedValues = (select: HTMLSelectElement = nativeSelect()) =>
	Array.from(select.selectedOptions, (option) => option.value);

/** What browser autofill does: selects the options with these values and fires the events. */
export function autofill(...values: string[]) {
	const select = nativeSelect();
	for (const option of select.options) option.selected = values.includes(option.value);
	select.dispatchEvent(new Event('input', { bubbles: true }));
	select.dispatchEvent(new Event('change', { bubbles: true }));
}
