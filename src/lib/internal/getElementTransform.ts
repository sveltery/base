// Derived from Base UI v1.8.0 packages/react/src/utils/getElementTransform.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). The scale follows v1.9.0
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Takes the resolved style. The `translate` and `scale` longhands are not part of `transform`.

export function getElementTransform(computedStyle: CSSStyleDeclaration) {
	const transform = computedStyle.transform;
	let translateX = 0;
	let translateY = 0;
	let scale = 1;
	if (transform && transform !== 'none') {
		const matrix = transform.match(/matrix(?:3d)?\(([^)]+)\)/);
		if (matrix) {
			const values = matrix[1].split(', ').map(parseFloat);
			if (values.length === 6) {
				translateX = values[4];
				translateY = values[5];
				scale = Math.sqrt(values[0] * values[0] + values[1] * values[1]);
			} else if (values.length === 16) {
				translateX = values[12];
				translateY = values[13];
				scale = values[0];
			}
		}
	}
	return { x: translateX, y: translateY, scale };
}
