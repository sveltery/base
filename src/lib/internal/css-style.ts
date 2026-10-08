// Turns a React-style CSS property map into a native `style` attribute string.
// Length zeros are written as `0px`, matching the computed style React produces.
// Unitless zeros, such as `opacity` and `z-index`, stay `0`.
// Custom properties keep their leading dashes. Empty values are omitted.

const UNITLESS_ZERO = new Set([
	'animation-iteration-count',
	'aspect-ratio',
	'border-image-outset',
	'border-image-slice',
	'border-image-width',
	'box-flex',
	'box-flex-group',
	'box-ordinal-group',
	'column-count',
	'columns',
	'flex',
	'flex-grow',
	'flex-positive',
	'flex-shrink',
	'flex-negative',
	'flex-order',
	'grid-area',
	'grid-row',
	'grid-row-end',
	'grid-row-span',
	'grid-row-start',
	'grid-column',
	'grid-column-end',
	'grid-column-span',
	'grid-column-start',
	'font-weight',
	'line-clamp',
	'line-height',
	'opacity',
	'order',
	'orphans',
	'scale',
	'tab-size',
	'widows',
	'z-index',
	'zoom',
	'fill-opacity',
	'flood-opacity',
	'stop-opacity',
	'stroke-dasharray',
	'stroke-dashoffset',
	'stroke-miterlimit',
	'stroke-opacity',
	'stroke-width'
]);

export function toCssStyle(style: Record<string, string | number | undefined | null>): string {
	return Object.entries(style)
		.filter((entry): entry is [string, string | number] => entry[1] != null && entry[1] !== '')
		.map(([key, value]) => {
			const property = key.startsWith('--')
				? key
				: key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
			const printed =
				value === 0 && !property.startsWith('--') && !UNITLESS_ZERO.has(property) ? '0px' : value;
			return `${property}: ${printed}`;
		})
		.join('; ');
}

export function mergeCssStyle(base: string, override: string | null | undefined): string;
export function mergeCssStyle(
	base: string | undefined,
	override: string | null | undefined
): string | undefined;
export function mergeCssStyle(
	base: string | undefined,
	override: string | null | undefined
): string | undefined {
	if (base && override) return `${base}; ${override}`;
	return override || base || undefined;
}
