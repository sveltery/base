// Assertions follow Base UI v1.9.0 packages/react/src/toolbar/input/ToolbarInput.test.tsx and
// packages/react/src/toolbar/separator/ToolbarSeparator.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance and the Toolbar.Input caret and selection cases are not ported:
// the toolbar composite has no text-field arrow exceptions yet.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { vi } from 'vitest';
import ToolbarInput from './ToolbarInput.svelte';
import ToolbarSeparator from './ToolbarSeparator.svelte';
import ToolbarPartsHarness from '../../tests/ToolbarPartsHarness.svelte';

const missing =
	'Base UI: ToolbarRootContext is missing. Toolbar parts must be placed within <Toolbar.Root>.';

describe('<Toolbar.Separator />', () => {
	it.each([
		['horizontal', 'vertical'],
		['vertical', 'horizontal']
	] as const)(
		'uses a %s separator in a %s toolbar',
		async (separatorOrientation, toolbarOrientation) => {
			render(ToolbarPartsHarness, { scenario: 'separator', orientation: toolbarOrientation });
			const separator = page.getByRole('separator');
			await expect.element(separator).toHaveAttribute('aria-orientation', separatorOrientation);
			await expect.element(separator).toHaveAttribute('data-orientation', separatorOrientation);
		}
	);

	it('allows its orientation to be overridden', async () => {
		render(ToolbarPartsHarness, {
			scenario: 'separator',
			orientation: 'horizontal',
			separatorOrientation: 'horizontal'
		});
		await expect
			.element(page.getByRole('separator'))
			.toHaveAttribute('aria-orientation', 'horizontal');
	});

	it('throws a descriptive error when rendered outside Toolbar.Root', () => {
		expect(() => render(ToolbarSeparator)).toThrow(missing);
	});
});

describe('<Toolbar.Input />', () => {
	it('throws a descriptive error when rendered outside Toolbar.Root', () => {
		expect(() => render(ToolbarInput)).toThrow(missing);
	});

	describe('pointer interactions', () => {
		it('does not steal focus while disabled and becomes pointer-focusable when enabled', async () => {
			const screen = render(ToolbarPartsHarness, { scenario: 'input', disabled: true });
			const button = page.getByTestId('button1');
			const input = page.getByTestId('input');

			await userEvent.keyboard('{Tab}');
			await expect.element(button).toHaveFocus();
			// Playwright treats aria-disabled as disabled, so the press is forced.
			await input.click({ force: true });
			await expect.element(button).toHaveFocus();

			await screen.rerender({ disabled: false });
			await input.click();
			await expect.element(input).toHaveFocus();
		});

		it('prevents click default actions while disabled', async () => {
			const screen = render(ToolbarPartsHarness, {
				scenario: 'input',
				type: 'checkbox',
				disabled: true
			});
			const input = page.getByRole('checkbox');

			await input.click({ force: true });
			await expect.element(input).not.toBeChecked();

			await screen.rerender({ disabled: false });
			await input.click();
			await expect.element(input).toBeChecked();
		});

		it('runs consumer click and pointerdown handlers before preventing them while disabled', async () => {
			const seen: string[] = [];
			const record = (event: Event) => seen.push(`${event.type}:${event.defaultPrevented}`);
			render(ToolbarPartsHarness, {
				scenario: 'input',
				type: 'checkbox',
				disabled: true,
				onclick: record,
				onpointerdown: record
			});
			const input = page.getByRole('checkbox');

			await input.click({ force: true });

			expect(seen).toEqual(['pointerdown:false', 'click:false']);
			await expect.element(input).not.toBeChecked();
		});
	});

	describe('disabled', () => {
		it('does not trap keyboard focus when disabled', async () => {
			render(ToolbarPartsHarness, { scenario: 'input-after', disabled: true });
			const input = page.getByTestId('input');

			await userEvent.keyboard('{Tab}');
			await expect.element(page.getByTestId('button1')).toHaveFocus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.element(input).toHaveFocus();
			await expect.element(input).toHaveAttribute('aria-disabled', 'true');
			await expect.element(input).not.toHaveAttribute('disabled');

			await userEvent.keyboard('{Tab}');
			await expect.element(page.getByTestId('after')).toHaveFocus();
			await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
			await expect.element(input).toHaveFocus();
		});

		it('does not block vertical roving focus when disabled', async () => {
			render(ToolbarPartsHarness, { scenario: 'input', orientation: 'vertical', disabled: true });
			const input = page.getByTestId('input');

			await userEvent.keyboard('{Tab}');
			await expect.element(page.getByTestId('button1')).toHaveFocus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(input).toHaveFocus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(page.getByTestId('button2')).toHaveFocus();
			await userEvent.keyboard('{ArrowUp}');
			await expect.element(input).toHaveFocus();
			await userEvent.keyboard('{ArrowUp}');
			await expect.element(page.getByTestId('button1')).toHaveFocus();
		});
	});

	describe('rendering NumberField', () => {
		it('renders NumberField.Input', async () => {
			render(ToolbarPartsHarness, { scenario: 'number' });
			await expect
				.element(page.getByRole('textbox'))
				.toHaveAttribute('aria-roledescription', 'Number field');
		});

		it('handles interactions', async () => {
			const onValueChange = vi.fn();
			render(ToolbarPartsHarness, { scenario: 'number', onValueChange });
			const input = page.getByRole('textbox');

			await userEvent.keyboard('{Tab}');
			await expect.element(input).toHaveAttribute('tabindex', '0');
			await expect.element(input).toHaveFocus();

			await userEvent.keyboard('{ArrowUp}');
			await userEvent.keyboard('{ArrowDown}');
			expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([6, 5]);
		});

		it('disabled state', async () => {
			const onValueChange = vi.fn();
			render(ToolbarPartsHarness, { scenario: 'number', disabled: true, onValueChange });
			const input = page.getByRole('textbox');

			await expect.element(input).not.toHaveAttribute('disabled');
			await expect.element(input).toHaveAttribute('data-disabled');
			await expect.element(input).toHaveAttribute('aria-disabled', 'true');

			await userEvent.keyboard('{Tab}');
			await expect.element(input).toHaveAttribute('tabindex', '0');
			await expect.element(input).toHaveFocus();

			await userEvent.keyboard('{ArrowUp}');
			await userEvent.keyboard('{ArrowDown}');
			expect(onValueChange).toHaveBeenCalledTimes(0);
		});
	});
});
