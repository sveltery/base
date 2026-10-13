// Derived from Base UI v1.9.0 packages/react/src/utils/getElementTransform.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
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
