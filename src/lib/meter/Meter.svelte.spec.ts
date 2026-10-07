// Assertions follow Base UI v1.8.0 meter tests
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// packages/react/src/meter/root/MeterRoot.test.tsx
// packages/react/src/meter/indicator/MeterIndicator.test.tsx
// packages/react/src/meter/label/MeterLabel.test.tsx
// packages/react/src/meter/track/MeterTrack.test.tsx
// packages/react/src/meter/value/MeterValue.test.tsx
// packages/react/src/utils/useRegisteredLabelId.test.tsx
// Cases under "native Svelte" have no upstream counterpart.
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Meter } from '#lib';
import MeterAttachHarness from '../../tests/MeterAttachHarness.svelte';
import MeterDuplicateLabelHarness from '../../tests/MeterDuplicateLabelHarness.svelte';
import MeterIndicatorRenderHarness from '../../tests/MeterIndicatorRenderHarness.svelte';
import MeterLabelHarness from '../../tests/MeterLabelHarness.svelte';
import MeterPartsHarness from '../../tests/MeterPartsHarness.svelte';
import MeterValueSnippetHarness from '../../tests/MeterValueSnippetHarness.svelte';

function formatPercent(value: number) {
	return new Intl.NumberFormat(undefined, { style: 'percent' }).format(value);
}

function inlineStyle(testId: string) {
	return (page.getByTestId(testId).element() as HTMLElement).style;
}

describe('Meter', () => {
	describe('root', () => {
		it('renders a div meter', async () => {
			render(MeterPartsHarness, { value: 50 });
			const meter = page.getByRole('meter');
			await expect.element(meter).toHaveRole('meter');
			expect(meter.element().tagName).toBe('DIV');
		});

		it('sets the correct aria attributes', async () => {
			render(MeterPartsHarness, { value: 30, label: 'Battery Level' });
			const meter = page.getByRole('meter');
			const label = page.getByText('Battery Level');

			await expect.element(meter).toHaveAttribute('aria-valuenow', '30');
			await expect.element(meter).toHaveAttribute('aria-valuemin', '0');
			await expect.element(meter).toHaveAttribute('aria-valuemax', '100');
			await expect.element(meter).toHaveAttribute('aria-valuetext', formatPercent(0.3));
			await expect.element(meter).toHaveAttribute('aria-labelledby', label.element().id);
			expect(page.getByText('x', { exact: true }).element().getAttribute('role')).toBe(
				'presentation'
			);
		});

		it('defaults aria-valuetext to the localized formatted value, matching Meter.Value', async () => {
			const expected = new Intl.NumberFormat('de-DE', { style: 'percent' }).format(0.3);
			render(MeterPartsHarness, { value: 30, locale: 'de-DE' });
			const meter = page.getByRole('meter');

			await expect.element(meter).toHaveAttribute('aria-valuetext', expected);
			// toHaveTextContent collapses the narrow no-break space German percent formatting uses.
			expect(page.getByTestId('value').element().textContent).toBe(expected);
		});

		it('rounds the default aria-valuetext like the displayed value', async () => {
			const expected = formatPercent(0.33333);
			render(MeterPartsHarness, { value: 33.333 });
			const meter = page.getByRole('meter');

			await expect.element(meter).toHaveAttribute('aria-valuetext', expected);
			await expect.element(page.getByTestId('value')).toHaveTextContent(expected);
		});

		it('refreshes aria, the value text, and the indicator when value changes', async () => {
			const fiftyPercent = formatPercent(0.5);
			const seventySevenPercent = formatPercent(0.77);
			const view = render(MeterPartsHarness, { value: 50 });
			const meter = page.getByRole('meter');

			await expect.element(meter).toHaveAttribute('aria-valuenow', '50');
			await expect.element(meter).toHaveAttribute('aria-valuetext', fiftyPercent);
			await expect.element(page.getByTestId('value')).toHaveTextContent(fiftyPercent);
			expect(inlineStyle('indicator').width).toBe('50%');

			await view.rerender({ value: 77 });

			await expect.element(meter).toHaveAttribute('aria-valuenow', '77');
			await expect.element(meter).toHaveAttribute('aria-valuetext', seventySevenPercent);
			await expect.element(page.getByTestId('value')).toHaveTextContent(seventySevenPercent);
			expect(inlineStyle('indicator').width).toBe('77%');
		});

		it('uses getAriaValueText for the spoken text and leaves the visible value formatted', async () => {
			const formatted = formatPercent(0.3);
			const getAriaValueText = vi.fn(
				(formattedValue: string, raw: number) => `${raw} of 100 (${formattedValue})`
			);
			render(MeterPartsHarness, { value: 30, getAriaValueText });

			await expect
				.element(page.getByRole('meter'))
				.toHaveAttribute('aria-valuetext', `30 of 100 (${formatted})`);
			expect(getAriaValueText).toHaveBeenCalledWith(formatted, 30);
			await expect.element(page.getByTestId('value')).toHaveTextContent(formatted);
		});

		it('lets an author aria-valuetext override the formatted text', async () => {
			render(MeterPartsHarness, { value: 30, ariaValuetext: 'halfway' });
			await expect.element(page.getByRole('meter')).toHaveAttribute('aria-valuetext', 'halfway');
		});

		describe('range', () => {
			it('formats the value as its position within a custom range and keeps the indicator in sync', async () => {
				const expected = formatPercent(0.5);
				render(MeterPartsHarness, { value: 0.5, min: 0, max: 1 });
				const meter = page.getByRole('meter');

				await expect.element(meter).toHaveAttribute('aria-valuenow', '0.5');
				await expect.element(meter).toHaveAttribute('aria-valuetext', expected);
				await expect.element(page.getByTestId('value')).toHaveTextContent(expected);
				expect(inlineStyle('indicator').width).toBe('50%');
			});

			it('formats the value relative to a non-zero min', async () => {
				const expected = formatPercent(0.5);
				render(MeterPartsHarness, { value: 30, min: 20, max: 40 });

				await expect.element(page.getByRole('meter')).toHaveAttribute('aria-valuetext', expected);
				await expect.element(page.getByTestId('value')).toHaveTextContent(expected);
			});

			it('keeps range attributes, formatted text, and the indicator synchronized on rerender', async () => {
				const initialValue = formatPercent(0.5);
				const updatedValue = formatPercent(0.75);
				const view = render(MeterPartsHarness, { value: 20, min: 10, max: 30 });
				const meter = page.getByRole('meter');

				await expect.element(meter).toHaveAttribute('aria-valuemin', '10');
				await expect.element(meter).toHaveAttribute('aria-valuemax', '30');
				await expect.element(meter).toHaveAttribute('aria-valuenow', '20');
				await expect.element(meter).toHaveAttribute('aria-valuetext', initialValue);
				await expect.element(page.getByTestId('value')).toHaveTextContent(initialValue);
				expect(inlineStyle('indicator').width).toBe('50%');

				await view.rerender({ min: 20, max: 60, value: 50 });

				await expect.element(meter).toHaveAttribute('aria-valuemin', '20');
				await expect.element(meter).toHaveAttribute('aria-valuemax', '60');
				await expect.element(meter).toHaveAttribute('aria-valuenow', '50');
				await expect.element(meter).toHaveAttribute('aria-valuetext', updatedValue);
				await expect.element(page.getByTestId('value')).toHaveTextContent(updatedValue);
				expect(inlineStyle('indicator').width).toBe('75%');
			});

			it.each([
				{
					label: 'value exceeds max',
					props: { value: 150 },
					ariaValueNow: '100',
					ariaValueText: formatPercent(1)
				},
				{
					label: 'value is below min',
					props: { value: -10 },
					ariaValueNow: '0',
					ariaValueText: formatPercent(0)
				},
				{
					label: 'min equals max',
					props: { value: 5, min: 5, max: 5 },
					ariaValueNow: '5',
					ariaValueText: formatPercent(0)
				},
				{
					label: 'value is NaN',
					props: { value: Number.NaN },
					ariaValueNow: '0',
					ariaValueText: formatPercent(0)
				}
			])(
				'normalizes aria attributes when $label',
				async ({ props, ariaValueNow, ariaValueText }) => {
					render(MeterPartsHarness, props);
					const meter = page.getByRole('meter');
					await expect.element(meter).toHaveAttribute('aria-valuenow', ariaValueNow);
					await expect.element(meter).toHaveAttribute('aria-valuetext', ariaValueText);
				}
			);
		});

		describe('prop: format', () => {
			it('formats the value', async () => {
				const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
				const expected = new Intl.NumberFormat(undefined, format).format(30);
				render(MeterPartsHarness, { value: 30, format });

				await expect.element(page.getByTestId('value')).toHaveTextContent(expected);
				await expect.element(page.getByRole('meter')).toHaveAttribute('aria-valuetext', expected);
			});

			it('formats the clamped value while clamping range attributes and indicator width', async () => {
				const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
				const expectedValue = new Intl.NumberFormat(undefined, format).format(100);
				const getAriaValueText = vi.fn(
					(formattedValue: string, rawValue: number) => `${formattedValue} (raw: ${rawValue})`
				);
				render(MeterPartsHarness, { value: 150, format, getAriaValueText });

				await expect.element(page.getByTestId('value')).toHaveTextContent(expectedValue);
				await expect.element(page.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
				expect(getAriaValueText).toHaveBeenLastCalledWith(expectedValue, 150);
				await expect
					.element(page.getByRole('meter'))
					.toHaveAttribute('aria-valuetext', `${expectedValue} (raw: 150)`);
				expect(inlineStyle('indicator').width).toBe('100%');
			});
		});

		describe('prop: locale', () => {
			it('sets the locale when formatting the value', async () => {
				const expected = new Intl.NumberFormat('de-DE', {
					style: 'decimal',
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				}).format(86.49);
				render(MeterPartsHarness, {
					value: 86.49,
					format: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 },
					locale: 'de-DE'
				});

				await expect.element(page.getByTestId('value')).toHaveTextContent(expected);
			});
		});
	});

	describe('indicator', () => {
		it('renders a div', async () => {
			render(MeterPartsHarness, { value: 30 });
			expect(page.getByTestId('indicator').element().tagName).toBe('DIV');
		});

		it('clamps the width to 100% when the value exceeds max', async () => {
			render(MeterPartsHarness, { value: 150 });
			expect(inlineStyle('indicator').width).toBe('100%');
		});

		it('clamps the width to 0% when the value is below min', async () => {
			render(MeterPartsHarness, { value: -10 });
			expect(inlineStyle('indicator').width).toBe('0%');
		});

		it('produces a finite width when min equals max', async () => {
			render(MeterPartsHarness, { value: 5, min: 5, max: 5 });
			expect(inlineStyle('indicator').width).toBe('0%');
		});

		it('sets positioning styles', async () => {
			render(MeterPartsHarness, { value: 33, rootStyle: 'width:100px' });
			const indicator = page.getByTestId('indicator').element() as HTMLElement;
			const computed = getComputedStyle(indicator);
			expect(computed.left).toBe('0px');
			expect(computed.width).toBe('33px');
		});

		it('sets zero width when value is 0', async () => {
			render(MeterPartsHarness, { value: 0, rootStyle: 'width:100px' });
			const indicator = page.getByTestId('indicator').element() as HTMLElement;
			const computed = getComputedStyle(indicator);
			expect(computed.insetInlineStart).toBe('0px');
			expect(computed.width).toBe('0px');
		});

		it('passes the fill style to a render snippet', async () => {
			render(MeterIndicatorRenderHarness);
			expect(inlineStyle('custom-indicator').width).toBe('40%');
		});
	});

	describe('track', () => {
		it('renders a div', async () => {
			render(MeterPartsHarness, { value: 30 });
			expect(page.getByTestId('track').element().tagName).toBe('DIV');
		});
	});

	describe('value', () => {
		it('renders a span with the formatted value', async () => {
			render(MeterPartsHarness, { value: 30 });
			const value = page.getByTestId('value');
			expect(value.element().tagName).toBe('SPAN');
			await expect.element(value).toHaveAttribute('aria-hidden', 'true');
			await expect.element(value).toHaveTextContent(formatPercent(0.3));
		});

		it('renders a formatted value when a format is provided', async () => {
			const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
			render(MeterPartsHarness, { value: 30, format });
			await expect
				.element(page.getByTestId('value'))
				.toHaveTextContent(new Intl.NumberFormat(undefined, format).format(30));
		});

		it('accepts a children snippet and updates its arguments', async () => {
			const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' };
			const formatted = new Intl.NumberFormat(undefined, format).format(30);
			const view = render(MeterValueSnippetHarness, { value: 30, format });

			await expect.element(page.getByTestId('value')).toHaveTextContent(`${formatted}|30`);

			await view.rerender({ value: 60, format: undefined });

			await expect.element(page.getByTestId('value')).toHaveTextContent(`${formatPercent(0.6)}|60`);
		});

		it('passes the raw value when the displayed value is clamped', async () => {
			const view = render(MeterValueSnippetHarness, { value: 150 });
			await expect.element(page.getByTestId('value')).toHaveTextContent(`${formatPercent(1)}|150`);

			await view.rerender({ value: 160 });

			await expect.element(page.getByTestId('value')).toHaveTextContent(`${formatPercent(1)}|160`);
		});
	});

	describe('label', () => {
		it('renders a span', async () => {
			render(MeterPartsHarness, { value: 50, label: 'Battery level' });
			expect(page.getByText('Battery level').element().tagName).toBe('SPAN');
		});

		it('updates and clears the meter label association', async () => {
			render(MeterLabelHarness);
			const meter = page.getByRole('meter');

			await expect.element(meter).toHaveAttribute('aria-labelledby', 'label-a');
			await page.getByRole('button', { name: 'Change id' }).click();
			await expect.element(meter).toHaveAttribute('aria-labelledby', 'label-b');
			await page.getByRole('button', { name: 'Remove label' }).click();
			await expect.element(meter).not.toHaveAttribute('aria-labelledby');
		});

		it('does not let an older label cleanup clear a newer label', async () => {
			render(MeterDuplicateLabelHarness);
			const meter = page.getByRole('meter');

			await expect.element(meter).toHaveAttribute('aria-labelledby', 'old-label');
			await page.getByRole('button', { name: 'Show both' }).click();
			await expect.element(meter).toHaveAttribute('aria-labelledby', 'new-label');
			await page.getByRole('button', { name: 'Drop old' }).click();
			await expect.element(meter).toHaveAttribute('aria-labelledby', 'new-label');
		});

		it('throws a descriptive error when rendered outside Meter.Root', async () => {
			await expect(async () => {
				await render(Meter.Label);
			}).rejects.toThrow(
				'Base UI: MeterRootContext is missing. Meter parts must be placed within <Meter.Root>.'
			);
		});

		it('throws the same error for Indicator and Value outside Meter.Root', async () => {
			await expect(async () => {
				await render(Meter.Indicator);
			}).rejects.toThrow(
				'Base UI: MeterRootContext is missing. Meter parts must be placed within <Meter.Root>.'
			);
			await expect(async () => {
				await render(Meter.Value);
			}).rejects.toThrow(
				'Base UI: MeterRootContext is missing. Meter parts must be placed within <Meter.Root>.'
			);
		});
	});

	describe('native Svelte', () => {
		it('passes consumer attachments to the default root', async () => {
			render(MeterAttachHarness);
			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
			await expect.element(page.getByRole('meter')).toHaveClass('default-host');
		});

		it('render snippet receives props, state, children and consumer attachments', async () => {
			render(MeterAttachHarness, { custom: true });
			const meter = page.getByRole('meter');

			await expect.element(meter).toHaveAttribute('data-custom', 'true');
			await expect.element(meter).toHaveAttribute('data-state-keys', '0');
			await expect.element(meter).toHaveClass('from-props');
			await expect.element(page.getByTestId('host')).toHaveTextContent('from-props');
			await expect
				.element(meter)
				.toHaveAttribute('aria-labelledby', page.getByText('Level').element().id);
			expect(meter.element().tagName).toBe('DIV');
			expect(meter.element().textContent).toContain('x');
		});

		it('indicator style string overrides width and keeps the fill position', async () => {
			render(MeterPartsHarness, { value: 40, indicatorStyle: 'width:10px' });
			const style = inlineStyle('indicator');
			expect(style.width).toBe('10px');
			expect(style.insetInlineStart).toBe('0px');
		});
	});
});
