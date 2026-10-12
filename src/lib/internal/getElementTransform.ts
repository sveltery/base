// Derived from Base UI v1.8.0 packages/react/src/utils/getElementTransform.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Takes the resolved style. Only the translation is ported.

export function getElementTransform(computedStyle: CSSStyleDeclaration) {
	const transform = computedStyle.transform;
	let translateX = 0;
	let translateY = 0;
	if (transform && transform !== 'none') {
		const matrix = transform.match(/matrix(?:3d)?\(([^)]+)\)/);
		if (matrix) {
			const values = matrix[1].split(', ').map(parseFloat);
			if (values.length === 6) {
				translateX = values[4];
				translateY = values[5];
			} else if (values.length === 16) {
				translateX = values[12];
				translateY = values[13];
			}
		}
	}
	return { x: translateX, y: translateY };
}
