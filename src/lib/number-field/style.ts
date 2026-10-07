// Turns a React-style CSS property map into a native `style` attribute string.

export function toCssStyle(style: Record<string, string | number>): string {
	return Object.entries(style)
		.map(([key, value]) => {
			const property = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
			return `${property}: ${value}`;
		})
		.join('; ');
}

export function mergeCssStyle(base: string, override: string | null | undefined): string {
	if (!override) return base;
	return `${base}; ${override}`;
}
