// The real input of a Checkbox, Switch or Radio covers its painted box and is invisible, so a
// click anywhere on the box reaches it and the browser draws nothing of its own. `z-index` keeps
// it above the box's own pseudo-elements, such as an enlarged hit area drawn with `::after`.
export const overlayInputStyle =
	'position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; margin: 0; padding: 0; opacity: 0; cursor: inherit; appearance: none';

/**
 * A click on the box itself, outside the input, such as on an enlarged hit area drawn with
 * `::after`, activates the input. A wrapping `<label>` already does that, so it is left alone.
 */
export function forwardBoxClick(input: HTMLInputElement | null) {
	return (event: MouseEvent) => {
		const box = event.currentTarget;
		if (!input || event.target !== box || !(box instanceof Element)) return;
		if (box.closest('label')) return;
		input.click();
	};
}
