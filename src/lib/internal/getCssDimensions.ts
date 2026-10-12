// Derived from Base UI v1.8.0 packages/react/src/utils/getCssDimensions.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export function getCssDimensions(element: Element) {
	const css = getComputedStyle(element);
	let width = parseFloat(css.width) || 0;
	let height = parseFloat(css.height) || 0;
	const offsetWidth = element instanceof HTMLElement ? element.offsetWidth : width;
	const offsetHeight = element instanceof HTMLElement ? element.offsetHeight : height;
	if (Math.round(width) !== offsetWidth || Math.round(height) !== offsetHeight) {
		width = offsetWidth;
		height = offsetHeight;
	}
	return { width, height };
}
