// Turns a React-style CSS property map into a native `style` attribute string.
// `visuallyHidden` and the indicator fill are stored the way Base UI stores them.

export function toCssStyle(style: Record<string, string | number>): string {
	return Object.entries(style)
		.map(([key, value]) => {
			const property = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
			return `${property}: ${value}`;
		})
		.join('; ');
}

export function mergeCssStyle(
	base: string | undefined,
	override: string | null | undefined
): string | undefined {
	if (base && override) {
		return `${base}; ${override}`;
	}
	return override || base || undefined;
}
