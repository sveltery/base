import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DayPickerBindHarness from '../../tests/DayPickerBindHarness.svelte';
import DayPickerSnippetHarness from '../../tests/DayPickerSnippetHarness.svelte';
import { DayPicker, DayPickerDataAttributes } from './index.js';

const today = new Date(2025, 5, 18);

describe('DayPicker', () => {
	describe('selection', () => {
		it('writes a clicked day to bind:selected and reports it to onSelect', async () => {
			const onSelect = vi.fn();
			render(DayPickerBindHarness, { onSelect });
			await page.getByRole('button', { name: 'Friday, June 20th, 2025' }).click();
			await expect.element(page.getByTestId('selected')).toHaveTextContent('2025-06-20');
			expect(onSelect).toHaveBeenCalledOnce();
			expect(onSelect.mock.calls[0][0]).toEqual(new Date(2025, 5, 20));
			expect(onSelect.mock.calls[0][1]).toEqual(new Date(2025, 5, 20));
		});

		it('follows the owner when it changes bind:selected', async () => {
			render(DayPickerBindHarness);
			await page.getByRole('button', { name: 'Owner selects' }).click();
			await expect
				.element(page.getByRole('button', { name: 'Monday, June 2nd, 2025, selected' }))
				.toBeInTheDocument();
		});

		it('starts an empty binding from defaultSelected and reads it once', async () => {
			const view = render(DayPickerBindHarness, { defaultSelected: new Date(2025, 5, 3) });
			await expect.element(page.getByTestId('selected')).toHaveTextContent('2025-06-03');
			await view.rerender({ defaultSelected: new Date(2025, 5, 4) });
			await expect.element(page.getByTestId('selected')).toHaveTextContent('2025-06-03');
		});

		it('keeps an unbound selection inside the component', async () => {
			render(DayPicker, { mode: 'single', today, defaultSelected: new Date(2025, 5, 3) });
			await page.getByRole('button', { name: 'Tuesday, June 10th, 2025' }).click();
			await expect
				.element(page.getByRole('button', { name: 'Tuesday, June 10th, 2025, selected' }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: 'Tuesday, June 3rd, 2025' }))
				.toBeInTheDocument();
		});
	});

	describe('month', () => {
		it('starts an empty binding from defaultMonth and reads it once', async () => {
			const view = render(DayPickerBindHarness, { defaultMonth: new Date(2025, 1, 1) });
			await expect.element(page.getByRole('grid')).toHaveAccessibleName('February 2025');
			await expect.element(page.getByTestId('month')).toHaveTextContent('2025-02-01');
			await view.rerender({ defaultMonth: new Date(2025, 3, 1) });
			await expect.element(page.getByRole('grid')).toHaveAccessibleName('February 2025');
		});

		it('writes navigation to bind:month and reports it to onMonthChange', async () => {
			const onMonthChange = vi.fn();
			render(DayPickerBindHarness, { onMonthChange });
			await page.getByRole('button', { name: 'Go to the Next Month' }).click();
			await expect.element(page.getByRole('grid')).toHaveAccessibleName('July 2025');
			await expect.element(page.getByTestId('month')).toHaveTextContent('2025-07-01');
			expect(onMonthChange).toHaveBeenCalledExactlyOnceWith(new Date(2025, 6, 1));
		});

		it('follows the owner when it changes bind:month', async () => {
			render(DayPickerBindHarness);
			await page.getByRole('button', { name: 'Owner shows October' }).click();
			await expect.element(page.getByRole('grid')).toHaveAccessibleName('October 2025');
		});

		it('reports the previous and next buttons', async () => {
			const onPrevClick = vi.fn();
			const onNextClick = vi.fn();
			render(DayPicker, { today, onPrevClick, onNextClick });
			await page.getByRole('button', { name: 'Go to the Previous Month' }).click();
			expect(onPrevClick).toHaveBeenCalledExactlyOnceWith(new Date(2025, 4, 1));
			await page.getByRole('button', { name: 'Go to the Next Month' }).click();
			expect(onNextClick).toHaveBeenCalledExactlyOnceWith(new Date(2025, 5, 1));
		});

		it('does not navigate past endMonth', async () => {
			render(DayPicker, { today, endMonth: new Date(2025, 5, 1) });
			const next = page.getByRole('button', { name: 'Go to the Next Month' });
			await expect.element(next).toHaveAttribute('aria-disabled', 'true');
			await next.click({ force: true });
			await expect.element(page.getByRole('grid')).toHaveAccessibleName('June 2025');
		});
	});

	describe('rendering', () => {
		it('renders a plain grid without buttons when nothing is selectable', async () => {
			render(DayPicker, { today });
			await expect
				.element(page.getByRole('gridcell', { name: 'Today, Wednesday, June 18th, 2025' }))
				.toBeInTheDocument();
			expect(document.querySelectorAll('[data-day] button')).toHaveLength(0);
		});

		it('sets the root data attributes', async () => {
			render(DayPicker, { mode: 'range', required: true, today, numberOfMonths: 2 });
			const root = document.querySelector('.rdp-root')!;
			expect(root.getAttribute(DayPickerDataAttributes.mode)).toBe('range');
			expect(root.getAttribute(DayPickerDataAttributes.required)).toBe('true');
			expect(root.getAttribute(DayPickerDataAttributes.multipleMonths)).toBe('true');
			expect(root.hasAttribute(DayPickerDataAttributes.weekNumbers)).toBe(false);
			const cell = document.querySelector('[data-day="2025-06-18"]')!;
			expect(cell.getAttribute(DayPickerDataAttributes.today)).toBe('true');
		});

		it('renders the snippets, classes and data attributes it is given', async () => {
			render(DayPickerSnippetHarness);
			const root = page.getByRole('region', { name: 'Calendar' });
			await expect.element(root).toHaveClass('rdp-root extra');
			await expect.element(root).toHaveAttribute('data-testid', 'calendar');
			await expect
				.element(page.getByRole('button', { name: 'Tuesday, June 10th, 2025' }))
				.toHaveTextContent('[10]');
			await expect
				.element(page.getByRole('button', { name: 'Tuesday, June 10th, 2025' }))
				.toHaveAttribute('data-booked', 'true');
			expect(document.querySelector('[data-day="2025-06-10"]')!.className).toBe('cell is-booked');
			expect(
				[...document.querySelectorAll('[data-testid="chevron"]')].map((node) => node.textContent)
			).toEqual(['left', 'right']);
			await expect.element(page.getByRole('rowheader').first()).toHaveTextContent('W23');
			await expect.element(page.getByRole('status').last()).toHaveTextContent('Pick a day');
		});

		it('moves focus to the focus target on mount with autofocus', async () => {
			render(DayPicker, { mode: 'single', today, autofocus: true });
			await expect
				.element(page.getByRole('button', { name: 'Today, Wednesday, June 18th, 2025' }))
				.toHaveFocus();
			await userEvent.keyboard('{ArrowLeft}');
			await expect
				.element(page.getByRole('button', { name: 'Tuesday, June 17th, 2025' }))
				.toHaveFocus();
		});

		it('computes days in timeZone', async () => {
			render(DayPicker, {
				mode: 'single',
				timeZone: 'Pacific/Kiritimati',
				today: new Date('2025-06-18T20:00:00Z'),
				defaultSelected: new Date('2025-06-18T20:00:00Z')
			});
			await expect
				.element(page.getByRole('button', { name: 'Today, Thursday, June 19th, 2025, selected' }))
				.toBeInTheDocument();
		});
	});
});
