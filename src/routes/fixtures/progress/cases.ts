export const cases = [
	'determinate',
	'indeterminate',
	'cycle',
	'range',
	'formatted',
	'locale',
	'aria-text',
	'value-child',
	'label',
	'nonfinite',
	'equal'
] as const;

export type ProgressCase = (typeof cases)[number];

export function scenarioModel(scenario: ProgressCase): {
	value: number | null;
	min: number;
	max: number;
	locale?: string;
} {
	if (scenario === 'indeterminate' || scenario === 'cycle') {
		return { value: null, min: 0, max: 100, locale: 'en-US' };
	}
	if (scenario === 'nonfinite') {
		return { value: Number.NaN, min: 0, max: 100, locale: 'en-US' };
	}
	if (scenario === 'equal') {
		return { value: 5, min: 5, max: 5, locale: 'en-US' };
	}
	if (scenario === 'range') {
		return { value: 30, min: 20, max: 40, locale: 'en-US' };
	}
	if (scenario === 'label') {
		return { value: 40, min: 0, max: 100, locale: 'en-US' };
	}
	if (scenario === 'locale') {
		return { value: 70.51, min: 0, max: 100, locale: 'de-DE' };
	}
	return { value: 30, min: 0, max: 100, locale: 'en-US' };
}
