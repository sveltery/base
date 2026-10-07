// Assertions follow Base UI v1.8.0 packages/react/src/progress/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Cases under "native Svelte" have no upstream counterpart.
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProgressLabel from './ProgressLabel.svelte';
import ProgressLabelsHarness from '../../tests/ProgressLabelsHarness.svelte';
import ProgressRenderHarness from '../../tests/ProgressRenderHarness.svelte';
import ProgressView from '../../tests/ProgressView.svelte';

function formatPercent(value: number) {
	return value.toLocaleString(undefined, { style: 'percent' });
}

function partLocators() {
	return [
		page.getByRole('progressbar'),
		page.getByTestId('label'),
		page.getByTestId('value'),
		page.getByTestId('track'),
		page.getByTestId('indicator')
	];
}

async function expectStatus(status: 'indeterminate' | 'progressing' | 'complete') {
	const attribute = {
		indeterminate: 'data-indeterminate',
		progressing: 'data-progressing',
		complete: 'data-complete'
	} as const;
	const others = (['indeterminate', 'progressing', 'complete'] as const).filter(
		(name) => name !== status
	);
	for (const part of partLocators()) {
		await expect.element(part).toHaveAttribute(attribute[status], '');
		for (const other of others) {
			await expect.element(part).not.toHaveAttribute(attribute[other]);
		}
	}
}

function indicator(): HTMLElement {
	return page.getByTestId('indicator').element() as HTMLElement;
}

describe('Progress', () => {
	describe('ARIA attributes', () => {
		it('sets the correct aria attributes', async () => {
			await render(ProgressView, { value: 30, label: 'Downloading' });

			const progressbar = page.getByRole('progressbar');
			const label = page.getByText('Downloading');

			await expect.element(progressbar).toHaveAttribute('aria-valuenow', '30');
			await expect.element(progressbar).toHaveAttribute('aria-valuemin', '0');
			await expect.element(progressbar).toHaveAttribute('aria-valuemax', '100');
			await expect.element(progressbar).toHaveAttribute('aria-valuetext', formatPercent(0.3));
			await expect.element(label).toHaveAttribute('id');
			await expect
				.element(progressbar)
				.toHaveAttribute('aria-labelledby', label.element().getAttribute('id') ?? '');
			await expect.element(page.getByTestId('value')).toHaveAttribute('aria-hidden', 'true');
		});

		it('should update aria-valuenow when value changes', async () => {
			const { rerender } = await render(ProgressView, { value: 50 });
			const progressbar = page.getByRole('progressbar');
			await rerender({ value: 77 });
			await expect.element(progressbar).toHaveAttribute('aria-valuenow', '77');
		});
	});

	describe('data attributes', () => {
		it('keeps every composed part synchronized through the status cycle', async () => {
			const { rerender } = await render(ProgressView, { value: null });
			const progressbar = page.getByRole('progressbar');
			const value = page.getByTestId('value');

			await expectStatus('indeterminate');
			await expect.element(progressbar).not.toHaveAttribute('aria-valuenow');
			await expect.element(progressbar).toHaveAttribute('aria-valuetext', 'indeterminate progress');
			await expect.poll(() => value.element().textContent).toBe('');
			await expect.poll(() => indicator().style.width).toBe('');

			await rerender({ value: 50 });
			await expectStatus('progressing');
			await expect.element(progressbar).toHaveAttribute('aria-valuenow', '50');
			await expect.poll(() => value.element().textContent).toBe(formatPercent(0.5));
			await expect.poll(() => indicator().style.width).toBe('50%');

			await rerender({ value: 100 });
			await expectStatus('complete');
			await expect.element(progressbar).toHaveAttribute('aria-valuenow', '100');
			await expect.poll(() => value.element().textContent).toBe(formatPercent(1));
			await expect.poll(() => indicator().style.width).toBe('100%');

			await rerender({ value: null });
			await expectStatus('indeterminate');
			await expect.element(progressbar).not.toHaveAttribute('aria-valuenow');
			await expect.element(progressbar).toHaveAttribute('aria-valuetext', 'indeterminate progress');
			await expect.poll(() => value.element().textContent).toBe('');
			await expect.poll(() => indicator().style.width).toBe('');
		});
	});

	describe('range', () => {
		it('normalizes the formatted value, aria-valuetext, and indicator within a custom range', async () => {
			const expected = formatPercent(0.5);
			await render(ProgressView, { min: 20, max: 40, value: 30 });
			const progressbar = page.getByRole('progressbar');
			await expect.poll(() => indicator().style.width).toBe('50%');
			await expect.poll(() => page.getByTestId('value').element().textContent).toBe(expected);
			await expect.element(progressbar).toHaveAttribute('aria-valuetext', expected);
		});

		it('clamps aria-valuenow, the value text, and the indicator when the value overshoots max', async () => {
			const expected = formatPercent(1);
			await render(ProgressView, { min: 0, max: 40, value: 50 });
			const progressbar = page.getByRole('progressbar');
			await expect.element(progressbar).toHaveAttribute('aria-valuenow', '40');
			await expect.element(progressbar).toHaveAttribute('aria-valuemax', '40');
			await expect.element(progressbar).toHaveAttribute('aria-valuetext', expected);
			await expect.poll(() => page.getByTestId('value').element().textContent).toBe(expected);
			await expect.poll(() => indicator().style.width).toBe('100%');
		});

		it('clamps aria-valuenow, the value text, and the indicator when the value undershoots min', async () => {
			const expected = formatPercent(0);
			await render(ProgressView, { min: 20, max: 40, value: 10 });
			const progressbar = page.getByRole('progressbar');
			await expect.element(progressbar).toHaveAttribute('aria-valuenow', '20');
			await expect.element(progressbar).toHaveAttribute('aria-valuemin', '20');
			await expect.element(progressbar).toHaveAttribute('aria-valuetext', expected);
			await expect.poll(() => page.getByTestId('value').element().textContent).toBe(expected);
			await expect.poll(() => indicator().style.width).toBe('0%');
		});

		it.each([
			{ value: 50, expectedValue: 40 },
			{ value: 10, expectedValue: 20 }
		])(
			'formats the clamped value $expectedValue when a custom-formatted value $value is outside the range',
			async ({ value, expectedValue }) => {
				const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
				const expected = new Intl.NumberFormat(undefined, format).format(expectedValue);
				const getAriaValueText = vi.fn((formattedValue: string, rawValue: number | null) => {
					return `${formattedValue} (raw: ${rawValue})`;
				});

				await render(ProgressView, {
					min: 20,
					max: 40,
					value,
					format,
					getAriaValueText
				});

				const progressbar = page.getByRole('progressbar');
				await expect.element(progressbar).toHaveAttribute('aria-valuenow', String(expectedValue));
				await expect.poll(() => page.getByTestId('value').element().textContent).toBe(expected);
				expect(getAriaValueText).toHaveBeenLastCalledWith(expected, value);
				await expect
					.element(progressbar)
					.toHaveAttribute('aria-valuetext', `${expected} (raw: ${value})`);
			}
		);

		it('reports complete when the value reaches or exceeds max', async () => {
			await render(ProgressView, { min: 0, max: 40, value: 45 });
			await expect.element(page.getByRole('progressbar')).toHaveAttribute('data-complete', '');
		});

		it('normalizes aria attributes when min equals max', async () => {
			const expected = formatPercent(0);
			await render(ProgressView, { min: 5, max: 5, value: 5 });
			const progressbar = page.getByRole('progressbar');
			await expect.element(progressbar).toHaveAttribute('aria-valuenow', '5');
			await expect.element(progressbar).toHaveAttribute('aria-valuetext', expected);
			await expect.poll(() => page.getByTestId('value').element().textContent).toBe(expected);
			await expect.poll(() => indicator().style.width).toBe('0%');
		});

		it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
			'keeps non-finite value %s indeterminate',
			async (value) => {
				await render(ProgressView, { value });
				const progressbar = page.getByRole('progressbar');
				await expect.element(progressbar).toHaveAttribute('data-indeterminate', '');
				await expect.element(progressbar).not.toHaveAttribute('aria-valuenow');
				await expect
					.element(progressbar)
					.toHaveAttribute('aria-valuetext', 'indeterminate progress');
				await expect.poll(() => page.getByTestId('value').element().textContent).toBe('');
				await expect.poll(() => indicator().style.width).toBe('');
			}
		);
	});

	describe('prop: getAriaValueText', () => {
		it('receives the formatted and raw values for determinate and indeterminate states', async () => {
			const getAriaValueText = vi.fn((formattedValue: string, value: number | null) =>
				value == null ? 'Waiting to start' : `${formattedValue} uploaded`
			);
			const { rerender } = await render(ProgressView, { value: 30, getAriaValueText });
			const progressbar = page.getByRole('progressbar');
			const formattedValue = formatPercent(0.3);

			expect(getAriaValueText).toHaveBeenLastCalledWith(formattedValue, 30);
			await expect
				.element(progressbar)
				.toHaveAttribute('aria-valuetext', `${formattedValue} uploaded`);
			await expect.poll(() => page.getByTestId('value').element().textContent).toBe(formattedValue);

			await rerender({ value: null });
			expect(getAriaValueText).toHaveBeenLastCalledWith('', null);
			await expect.element(progressbar).toHaveAttribute('aria-valuetext', 'Waiting to start');
			await expect.poll(() => page.getByTestId('value').element().textContent).toBe('');
		});
	});

	describe('prop: format', () => {
		it('formats the value', async () => {
			const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
			function formatValue(v: number) {
				return new Intl.NumberFormat(undefined, format).format(v);
			}

			await render(ProgressView, { value: 30, format });
			await expect
				.poll(() => page.getByTestId('value').element().textContent)
				.toBe(formatValue(30));
			await expect
				.element(page.getByRole('progressbar'))
				.toHaveAttribute('aria-valuetext', formatValue(30));
		});

		it('reflects format changes without lagging a commit', async () => {
			const usd: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
			const eur: Intl.NumberFormatOptions = { style: 'currency', currency: 'EUR' };
			function formatValue(v: number, options: Intl.NumberFormatOptions) {
				return new Intl.NumberFormat(undefined, options).format(v);
			}

			const { rerender } = await render(ProgressView, { value: 30, format: usd });
			const value = page.getByTestId('value');
			await expect.poll(() => value.element().textContent).toBe(formatValue(30, usd));

			await rerender({ format: eur });
			await expect.poll(() => value.element().textContent).toBe(formatValue(30, eur));
		});
	});

	describe('prop: locale', () => {
		it('sets the locale when formatting the value', async () => {
			const expectedValue = new Intl.NumberFormat('de-DE').format(70.51);
			await render(ProgressView, {
				value: 70.51,
				format: {
					style: 'decimal',
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				},
				locale: 'de-DE'
			});
			await expect.poll(() => page.getByTestId('value').element().textContent).toBe(expectedValue);
		});
	});

	describe('indicator styles', () => {
		it('sets the determinate fill', async () => {
			await render(ProgressView, { value: 33 });
			await expect.poll(() => indicator().style.width).toBe('33%');
			await expect.poll(() => indicator().style.getPropertyValue('inset-inline-start')).toBe('0px');
			await expect.poll(() => indicator().style.height).toBe('inherit');
			await expect.poll(() => getComputedStyle(indicator()).insetInlineStart).toBe('0px');
		});

		it('sets zero width when value is 0', async () => {
			await render(ProgressView, { value: 0 });
			await expect.poll(() => indicator().style.width).toBe('0%');
			await expect.poll(() => getComputedStyle(indicator()).width).toBe('0px');
			await expect.poll(() => getComputedStyle(indicator()).insetInlineStart).toBe('0px');
		});

		it('sets no fill while indeterminate', async () => {
			await render(ProgressView, { value: null });
			await expect.poll(() => indicator().style.width).toBe('');
			await expect.poll(() => indicator().getAttribute('style')).toBe(null);
		});
	});

	describe('value children', () => {
		it('renders the formatted value when children is not provided', async () => {
			await render(ProgressView, { value: 30 });
			await expect
				.poll(() => page.getByTestId('value').element().textContent)
				.toBe(formatPercent(0.3));
		});

		it('passes the formatted and raw values into the children snippet', async () => {
			const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
			const expected = new Intl.NumberFormat(undefined, format).format(30);
			await render(ProgressView, { value: 30, format, customValue: true });
			await expect
				.poll(() => page.getByTestId('value').element().textContent)
				.toBe(`${expected}|30`);
		});

		it.each([
			{ value: null as number | null, raw: 'null' },
			{ value: Number.NaN, raw: 'NaN' }
		])('passes indeterminate for value $raw', async ({ value, raw }) => {
			await render(ProgressView, { value, customValue: true });
			await expect
				.poll(() => page.getByTestId('value').element().textContent)
				.toBe(`indeterminate|${raw}`);
		});
	});

	describe('label', () => {
		it('updates and clears the progress bar label association', async () => {
			const { rerender } = await render(ProgressView, {
				value: 40,
				labelId: 'label-a',
				showLabel: true
			});
			const progressbar = page.getByRole('progressbar');
			await expect.element(progressbar).toHaveAttribute('aria-labelledby', 'label-a');

			await rerender({ labelId: 'label-b' });
			await expect.element(progressbar).toHaveAttribute('aria-labelledby', 'label-b');

			await rerender({ showLabel: false });
			await expect.element(progressbar).not.toHaveAttribute('aria-labelledby');
		});

		it('does not let an older label cleanup clear a newer label', async () => {
			const { rerender } = await render(ProgressLabelsHarness, { mode: 'old' });
			const progressbar = page.getByRole('progressbar');
			await expect.element(progressbar).toHaveAttribute('aria-labelledby', 'old-label');

			await rerender({ mode: 'both' });
			await expect.element(progressbar).toHaveAttribute('aria-labelledby', 'new-label');

			await rerender({ mode: 'new' });
			await expect.element(progressbar).toHaveAttribute('aria-labelledby', 'new-label');
		});

		it('throws a descriptive error when rendered outside Progress.Root', async () => {
			await expect(async () => {
				await render(ProgressLabel);
			}).rejects.toThrow(
				'Base UI: ProgressRootContext is missing. Progress parts must be placed within <Progress.Root>.'
			);
		});
	});

	describe('native Svelte', () => {
		it('hides an x inside the progress bar for screen readers', async () => {
			await render(ProgressView, { value: 30 });
			const hidden = page.getByRole('progressbar').element().lastElementChild as HTMLElement;
			expect(hidden.textContent).toBe('x');
			expect(hidden.getAttribute('role')).toBe('presentation');
			expect(hidden.style.position).toBe('fixed');
			expect(hidden.style.width).toBe('1px');
			expect(hidden.style.height).toBe('1px');
			expect(hidden.style.margin).toBe('-1px');
		});

		it('passes consumer attachments to the default root', async () => {
			await render(ProgressRenderHarness);
			await expect.element(page.getByTestId('host')).toHaveTextContent('div:default-host');
			await expect.element(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '33');
		});

		it('render snippet receives props, state, and the indicator fill', async () => {
			await render(ProgressRenderHarness, { custom: true });
			const indicatorElement = page.getByTestId('indicator');
			await expect
				.element(indicatorElement)
				.toHaveAttribute('data-indicator-status', 'progressing');
			await expect.poll(() => (indicatorElement.element() as HTMLElement).style.width).toBe('33%');
			await expect.element(page.getByTestId('host')).toHaveTextContent(/^div:/);
		});
	});
});
