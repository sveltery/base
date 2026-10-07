// Turns a React-style CSS property map into a native `style` attribute string.
// Length zeros are written as `0px`, matching the computed style React produces.

export function toCssStyle(style: Record<string, string | number | undefined | null>): string {
	return Object.entries(style)
		.filter((entry): entry is [string, string | number] => entry[1] != null && entry[1] !== '')
		.map(([key, value]) => {
			const property = key.startsWith('--')
				? key
				: key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
			const printed = value === 0 ? '0px' : value;
			return `${property}: ${printed}`;
		})
		.join('; ');
}

export function mergeCssStyle(base: string | undefined, override: string | null | undefined) {
	if (base && override) return `${base}; ${override}`;
	return override || base || undefined;
}
