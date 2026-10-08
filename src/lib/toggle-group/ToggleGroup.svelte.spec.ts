// Assertions follow Base UI v1.8.0 packages/react/src/toggle-group/ToggleGroup.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance and Toolbar nesting are not ported.
// Cases under "native Svelte" have no upstream counterpart.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { controllableRootCases } from '../../tests/controllable-root-cases.js';
import ToggleGroupHarness from '../../tests/ToggleGroupHarness.svelte';

function button(name: string) {
	return page.getByRole('button', { name, exact: true });
}

function calls() {
	return JSON.parse(page.getByTestId('calls').element().textContent ?? '[]') as {
		value: string[];
		reason: string;
		canceled: boolean;
	}[];
}

describe('ToggleGroup', () => {
	it('renders a group', async () => {
		render(ToggleGroupHarness, { scenario: 'exclusive' });
		await expect.element(page.getByRole('group', { name: 'Formatting' })).toBeVisible();
	});

	describe('uncontrolled', () => {
		it('pressed state', async () => {
			render(ToggleGroupHarness, { scenario: 'exclusive' });
			const one = button('One');
			const two = button('Two');

			await expect.element(one).toHaveAttribute('aria-pressed', 'false');
			await expect.element(two).toHaveAttribute('aria-pressed', 'false');

			await one.click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'true');
			await expect.element(one).toHaveAttribute('data-pressed', '');
			await expect.element(two).toHaveAttribute('aria-pressed', 'false');

			await two.click();
			await expect.element(two).toHaveAttribute('aria-pressed', 'true');
			await expect.element(two).toHaveAttribute('data-pressed', '');
			await expect.element(one).toHaveAttribute('aria-pressed', 'false');
		});

		it('prop: value sets the initial pressed toggle', async () => {
			render(ToggleGroupHarness, { scenario: 'initial' });
			const one = button('One');
			const two = button('Two');

			await expect.element(two).toHaveAttribute('aria-pressed', 'true');
			await expect.element(two).toHaveAttribute('data-pressed', '');
			await expect.element(one).toHaveAttribute('aria-pressed', 'false');

			await one.click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'true');
			await expect.element(one).toHaveAttribute('data-pressed', '');
			await expect.element(two).toHaveAttribute('aria-pressed', 'false');
		});

		it('when Toggles omit value', async () => {
			render(ToggleGroupHarness, { scenario: 'omit' });
			const one = button('One');
			const two = button('Two');

			await expect.element(one).toHaveAttribute('aria-pressed', 'false');
			await expect.element(two).toHaveAttribute('aria-pressed', 'false');

			await one.click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'true');
			await expect.element(two).toHaveAttribute('aria-pressed', 'false');

			await two.click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'false');
			await expect.element(two).toHaveAttribute('aria-pressed', 'true');
		});

		it('warns once when a grouped Toggle has no value and the group value was set', async () => {
			const error = vi.spyOn(console, 'error').mockImplementation(() => {});
			render(ToggleGroupHarness, { scenario: 'warn' });
			await expect.element(button('One')).toBeVisible();
			expect(error).toHaveBeenCalledExactlyOnceWith(
				'Base UI: A `<Toggle>` component rendered in a `<ToggleGroup>` has no explicit `value` prop. This will cause issues between the Toggle Group and Toggle values. Provide the `<Toggle>` with a `value` prop matching the `<ToggleGroup>` values prop type.'
			);
			error.mockRestore();
		});
	});

	describe('controlled', () => {
		it('follows a one-way value until a click, then until the parent changes it', async () => {
			render(ToggleGroupHarness, { scenario: 'controlled' });
			const one = button('One');
			const two = button('Two');

			await expect.element(one).toHaveAttribute('aria-pressed', 'false');
			await expect.element(two).toHaveAttribute('aria-pressed', 'true');
			await expect.element(two).toHaveAttribute('data-pressed', '');

			await button('Set one').click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'true');
			await expect.element(two).toHaveAttribute('aria-pressed', 'false');

			await two.click();
			await expect.element(two).toHaveAttribute('aria-pressed', 'true');
			await expect.element(one).toHaveAttribute('aria-pressed', 'false');

			await button('Set one').click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'true');
			await expect.element(two).toHaveAttribute('aria-pressed', 'false');
		});
	});

	describe('prop: disabled', () => {
		it('can disable the whole group', async () => {
			render(ToggleGroupHarness, { scenario: 'disabled-group' });
			const one = button('One');
			const two = button('Two');

			await expect.element(one).toHaveAttribute('aria-disabled', 'true');
			await expect.element(one).toHaveAttribute('data-disabled', '');
			await expect.element(two).toHaveAttribute('aria-disabled', 'true');
			await expect.element(two).toHaveAttribute('data-disabled', '');
		});

		it('can disable individual items', async () => {
			render(ToggleGroupHarness, { scenario: 'disabled-item' });
			const one = button('One');
			const two = button('Two');

			await expect.element(one).toHaveAttribute('aria-disabled', 'false');
			await expect.element(one).not.toHaveAttribute('data-disabled');
			await expect.element(two).toHaveAttribute('aria-disabled', 'true');
			await expect.element(two).toHaveAttribute('data-disabled', '');
		});
	});

	describe('prop: orientation', () => {
		it('vertical', async () => {
			render(ToggleGroupHarness, { scenario: 'keys', orientation: 'vertical' });
			await expect
				.element(page.getByRole('group', { name: 'Formatting' }))
				.toHaveAttribute('data-orientation', 'vertical');
		});

		it('does not render aria-orientation on role=group', async () => {
			render(ToggleGroupHarness, { scenario: 'exclusive' });
			await expect
				.element(page.getByRole('group', { name: 'Formatting' }))
				.not.toHaveAttribute('aria-orientation');
			await expect
				.element(page.getByRole('group', { name: 'Formatting' }))
				.toHaveAttribute('data-orientation', 'horizontal');
		});
	});

	describe('prop: multiple', () => {
		it('sets data-multiple only when true', async () => {
			render(ToggleGroupHarness, { scenario: 'multiple-flip' });
			const group = page.getByRole('group', { name: 'Formatting' });
			await expect.element(group).not.toHaveAttribute('data-multiple');

			await button('Flip multiple').click();
			await expect.element(group).toHaveAttribute('data-multiple', '');

			await button('Flip multiple').click();
			await expect.element(group).not.toHaveAttribute('data-multiple');
		});

		it('multiple items can be pressed when true', async () => {
			render(ToggleGroupHarness, { scenario: 'multiple' });
			const one = button('One');
			const two = button('Two');

			await one.click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'true');
			await two.click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'true');
			await expect.element(two).toHaveAttribute('aria-pressed', 'true');
		});

		it('only one item can be pressed when false', async () => {
			render(ToggleGroupHarness, { scenario: 'initial' });
			await button('Two').click();
			await button('One').click();
			await expect.element(button('One')).toHaveAttribute('aria-pressed', 'true');
			await expect.element(button('Two')).toHaveAttribute('aria-pressed', 'false');
		});

		it('preserves selection and roving focus when multiple changes', async () => {
			render(ToggleGroupHarness, { scenario: 'multiple-flip' });
			const one = button('One');
			const two = button('Two');

			await expect.element(one).toHaveAttribute('aria-pressed', 'true');
			await expect.element(two).toHaveAttribute('aria-pressed', 'false');

			one.element().focus();
			await userEvent.keyboard('{ArrowRight}');
			expect(document.activeElement).toBe(two.element());

			await two.click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'false');
			await expect.element(two).toHaveAttribute('aria-pressed', 'true');

			await button('Flip multiple').click();
			await expect.element(page.getByRole('group')).toHaveAttribute('data-multiple', '');

			await one.click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'true');
			await expect.element(two).toHaveAttribute('aria-pressed', 'true');

			await two.click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'true');
			await expect.element(two).toHaveAttribute('aria-pressed', 'false');

			await button('Flip multiple').click();
			await expect.element(page.getByRole('group')).not.toHaveAttribute('data-multiple');

			await two.click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'false');
			await expect.element(two).toHaveAttribute('aria-pressed', 'true');

			await userEvent.keyboard('{ArrowLeft}');
			expect(document.activeElement).toBe(one.element());
		});
	});

	describe('keyboard interactions', () => {
		const right = 'ArrowRight';
		const left = 'ArrowLeft';
		const down = 'ArrowDown';
		const up = 'ArrowUp';
		it.each([
			['ltr', 'horizontal', right, left, down, up],
			['ltr', 'vertical', down, up, right, left],
			['rtl', 'horizontal', left, right, down, up],
			['rtl', 'vertical', down, up, left, right]
		] as const)(
			'%s orientation %s',
			async (dir, orientation, nextKey, prevKey, ignoredNext, ignoredPrev) => {
				render(ToggleGroupHarness, { scenario: 'keys', dir, orientation });
				const one = button('One');
				const two = button('Two');
				const three = button('Three');

				await expect.element(one).toHaveAttribute('tabindex', '0');
				await expect.element(two).toHaveAttribute('tabindex', '-1');
				one.element().focus();
				expect(document.activeElement).toBe(one.element());

				await userEvent.keyboard(`{${nextKey}}`);
				await expect.element(two).toHaveAttribute('tabindex', '0');
				expect(document.activeElement).toBe(two.element());

				await userEvent.keyboard(`{${nextKey}}`);
				await expect.element(three).toHaveAttribute('tabindex', '0');
				expect(document.activeElement).toBe(three.element());

				await userEvent.keyboard(`{${nextKey}}`);
				await expect.element(one).toHaveAttribute('tabindex', '0');
				expect(document.activeElement).toBe(one.element());

				await userEvent.keyboard(`{${prevKey}}`);
				await expect.element(three).toHaveAttribute('tabindex', '0');
				expect(document.activeElement).toBe(three.element());

				await userEvent.keyboard(`{${prevKey}}`);
				await expect.element(two).toHaveAttribute('tabindex', '0');
				expect(document.activeElement).toBe(two.element());

				await userEvent.keyboard(`{${ignoredNext}}`);
				expect(document.activeElement).toBe(two.element());
				await userEvent.keyboard(`{${ignoredPrev}}`);
				expect(document.activeElement).toBe(two.element());
			}
		);

		it('Home and End move to the ends', async () => {
			render(ToggleGroupHarness, { scenario: 'keys' });
			const one = button('One');
			const two = button('Two');
			const three = button('Three');

			one.element().focus();
			await userEvent.keyboard('{ArrowRight}{ArrowRight}');
			expect(document.activeElement).toBe(three.element());

			await userEvent.keyboard('{Home}');
			await expect.element(one).toHaveAttribute('tabindex', '0');
			expect(document.activeElement).toBe(one.element());

			await userEvent.keyboard('{End}');
			await expect.element(three).toHaveAttribute('tabindex', '0');
			expect(document.activeElement).toBe(three.element());

			await userEvent.keyboard('{ArrowLeft}');
			expect(document.activeElement).toBe(two.element());
		});

		it.each(['Enter', 'Space'] as const)('%s toggles the pressed state', async (key) => {
			render(ToggleGroupHarness, { scenario: 'exclusive' });
			const one = button('One');
			await expect.element(one).toHaveAttribute('aria-pressed', 'false');
			one.element().focus();
			await userEvent.keyboard(`{${key}}`);
			await expect.element(one).toHaveAttribute('aria-pressed', 'true');
			await userEvent.keyboard(`{${key}}`);
			await expect.element(one).toHaveAttribute('aria-pressed', 'false');
		});

		it('skips a disabled item and does not leave the tab stop on it', async () => {
			render(ToggleGroupHarness, { scenario: 'disabled-first' });
			const one = button('One');
			const two = button('Two');
			const three = button('Three');

			await expect.element(one).toHaveAttribute('tabindex', '-1');
			await expect.element(two).toHaveAttribute('tabindex', '0');

			two.element().focus();
			await userEvent.keyboard('{ArrowRight}');
			expect(document.activeElement).toBe(three.element());
			await userEvent.keyboard('{ArrowRight}');
			expect(document.activeElement).toBe(two.element());
		});

		it('moves the tab stop off an item that becomes disabled', async () => {
			render(ToggleGroupHarness, { scenario: 'disable-active' });
			const one = button('One');
			const two = button('Two');
			await expect.element(one).toHaveAttribute('tabindex', '0');
			await button('Disable one').click();
			await expect.element(one).toHaveAttribute('tabindex', '-1');
			await expect.element(two).toHaveAttribute('tabindex', '0');
		});

		it('stops at the ends when loopFocus is false', async () => {
			render(ToggleGroupHarness, { scenario: 'keys', loopFocus: false });
			const one = button('One');
			const three = button('Three');
			one.element().focus();
			await userEvent.keyboard('{ArrowLeft}');
			expect(document.activeElement).toBe(one.element());
			await userEvent.keyboard('{End}');
			expect(document.activeElement).toBe(three.element());
			await userEvent.keyboard('{ArrowRight}');
			expect(document.activeElement).toBe(three.element());
		});
	});

	describe('prop: onValueChange', () => {
		it('fires when an item is clicked', async () => {
			render(ToggleGroupHarness, { scenario: 'change' });
			await button('One').click();
			expect(calls()).toEqual([{ value: ['one'], reason: 'none', canceled: false }]);
			await button('Two').click();
			expect(calls()).toEqual([
				{ value: ['one'], reason: 'none', canceled: false },
				{ value: ['two'], reason: 'none', canceled: false }
			]);
		});

		it('does not change the value when the event is canceled', async () => {
			render(ToggleGroupHarness, { scenario: 'cancel' });
			const one = button('One');
			await one.click();
			expect(calls()).toEqual([{ value: ['one'], reason: 'none', canceled: true }]);
			await expect.element(one).toHaveAttribute('aria-pressed', 'false');
		});

		it.each(['Enter', 'Space'] as const)('fires when %s is pressed', async (key) => {
			render(ToggleGroupHarness, { scenario: 'change' });
			button('One').element().focus();
			await userEvent.keyboard(`{${key}}`);
			expect(calls()[0]).toEqual({ value: ['one'], reason: 'none', canceled: false });
			button('Two').element().focus();
			await userEvent.keyboard(`{${key}}`);
			expect(calls()[1]).toEqual({ value: ['two'], reason: 'none', canceled: false });
		});
	});

	describe('native Svelte', () => {
		it('canceling onPressedChange vetoes the group', async () => {
			render(ToggleGroupHarness, { scenario: 'veto' });
			const one = button('One');
			await one.click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'false');
		});

		it('preventDefault on click skips the toggle', async () => {
			render(ToggleGroupHarness, { scenario: 'prevented' });
			const one = button('One');
			await one.click();
			await expect.element(one).toHaveAttribute('aria-pressed', 'false');
		});

		it('render snippet receives props, state, and the roving tabindex', async () => {
			render(ToggleGroupHarness, { scenario: 'render' });
			const custom = page.getByTestId('custom');
			await expect.element(custom).toHaveAttribute('aria-pressed', 'false');
			await expect.element(custom).toHaveAttribute('tabindex', '0');
			await expect.element(custom).toHaveAttribute('data-state', 'off');
			await custom.click();
			await expect.element(custom).toHaveAttribute('aria-pressed', 'true');
			await expect.element(custom).toHaveAttribute('data-state', 'on');
			await userEvent.keyboard('{ArrowRight}');
			expect(document.activeElement).toBe(button('Two').element());
		});

		it('passes the registration attachment through to the host', async () => {
			render(ToggleGroupHarness, { scenario: 'attach' });
			await expect.element(page.getByTestId('attached')).toHaveTextContent('One');
		});
	});
});

describe('controllable value', () => {
	controllableRootCases('toggle-group');
});
