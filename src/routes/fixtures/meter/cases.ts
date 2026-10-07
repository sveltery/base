export const cases = [
	'basic',
	'range',
	'live',
	'currency',
	'clamp',
	'label',
	'locale',
	'aria'
] as const;

export type MeterCase = (typeof cases)[number];

export const currencyFormat = {
	style: 'currency',
	currency: 'USD'
} as const satisfies Intl.NumberFormatOptions;

/** Shared with the React reference so both fixtures speak the same value text. */
export function ariaValueText(formattedValue: string, value: number) {
	return `${value} of 100 (${formattedValue})`;
}
