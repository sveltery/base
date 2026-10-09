export function measure(el) {
	return el.getBoundingClientRect();
}

export function readWidth(el) {
	const { offsetWidth } = el;
	return offsetWidth;
}
