// Assertions follow the "[data-focused]" cases Base UI v1.9.0 added in 5cc9fbd53 to
// field/control/FieldControl.test.tsx and the checkbox, switch, radio, radio-group,
// number-field, otp-field and slider root tests
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FieldFocusHarness from '../../tests/FieldFocusHarness.svelte';

const root = () => page.getByTestId('root');

function focus(testId: string) {
	(page.getByTestId(testId).element() as HTMLElement).focus();
	return tick();
}

describe('Field focused state', () => {
	describe('Field.Control', () => {
		it('is removed when the focused control becomes disabled', async () => {
			const view = render(FieldFocusHarness, { control: 'input' });
			await focus('first');
			await expect.element(root()).toHaveAttribute('data-focused', '');
			await expect.element(page.getByTestId('first')).toHaveAttribute('data-focused', '');

			await view.rerender({ firstDisabled: true });

			await expect.element(root()).not.toHaveAttribute('data-focused');
			await expect.element(page.getByTestId('first')).not.toHaveAttribute('data-focused');
			await expect.element(page.getByTestId('label')).not.toHaveAttribute('data-focused');
		});

		it('is removed when the field root becomes disabled', async () => {
			const view = render(FieldFocusHarness, { control: 'input' });
			await focus('first');
			await expect.element(root()).toHaveAttribute('data-focused', '');

			await view.rerender({ rootDisabled: true });

			await expect.element(root()).not.toHaveAttribute('data-focused');
		});

		it('can be re-acquired after the control is re-enabled', async () => {
			const view = render(FieldFocusHarness, { control: 'input' });
			await focus('first');
			await expect.element(root()).toHaveAttribute('data-focused', '');

			await view.rerender({ firstDisabled: true });
			await expect.element(root()).not.toHaveAttribute('data-focused');

			await view.rerender({ firstDisabled: false });
			expect(root().element()).not.toHaveAttribute('data-focused');

			await focus('first');
			await expect.element(root()).toHaveAttribute('data-focused', '');
		});

		it('is removed when the focused control unmounts', async () => {
			const view = render(FieldFocusHarness, { control: 'input' });
			await focus('first');
			await expect.element(root()).toHaveAttribute('data-focused', '');

			await view.rerender({ firstMounted: false });

			await expect.element(root()).not.toHaveAttribute('data-focused');
			await expect.element(page.getByTestId('label')).not.toHaveAttribute('data-focused');
		});
	});

	describe.each(['checkbox', 'switch', 'number', 'otp', 'radio-group'] as const)(
		'%s without a blur event',
		(control) => {
			async function focusFirst() {
				const target =
					control === 'otp'
						? page.getByRole('textbox').first()
						: control === 'radio-group'
							? page.getByTestId('first-radio')
							: page.getByTestId('first');
				(target.element() as HTMLElement).focus();
				await tick();
			}

			it('is removed when the focused control becomes disabled', async () => {
				const view = render(FieldFocusHarness, { control });
				await focusFirst();
				await expect.element(root()).toHaveAttribute('data-focused', '');

				await view.rerender({ firstDisabled: true });

				await expect.element(root()).not.toHaveAttribute('data-focused');
				if (control !== 'radio-group') {
					await expect.element(page.getByTestId('first')).not.toHaveAttribute('data-focused');
				}
			});

			it('is removed when the focused control unmounts', async () => {
				const view = render(FieldFocusHarness, { control });
				await focusFirst();
				await expect.element(root()).toHaveAttribute('data-focused', '');

				await view.rerender({ firstMounted: false });

				await expect.element(root()).not.toHaveAttribute('data-focused');
			});
		}
	);

	describe('OTP slots', () => {
		it('is kept when a previously focused slot unmounts after focus moves to a sibling', async () => {
			const view = render(FieldFocusHarness, { control: 'otp-slots', shrink: true });
			const [first, second] = page.getByRole('textbox').elements() as HTMLInputElement[];
			first.focus();
			second.focus();
			await tick();
			await expect.element(root()).toHaveAttribute('data-focused', '');

			await view.rerender({ firstMounted: false });

			expect(document.activeElement).toBe(second);
			expect(root().element()).toHaveAttribute('data-focused', '');
			expect(page.getByTestId('otp').element()).toHaveAttribute('data-focused', '');
		});

		it('is removed when the focused slot unmounts but its field remains', async () => {
			const view = render(FieldFocusHarness, { control: 'otp-slots' });
			(page.getByRole('textbox').first().element() as HTMLInputElement).focus();
			await expect.element(root()).toHaveAttribute('data-focused', '');
			await expect.element(page.getByTestId('otp')).toHaveAttribute('data-focused', '');

			await view.rerender({ firstMounted: false });

			await expect.element(root()).not.toHaveAttribute('data-focused');
			await expect.element(page.getByTestId('otp')).not.toHaveAttribute('data-focused');
		});
	});

	describe('Slider thumbs', () => {
		it('is removed when the focused thumb becomes disabled', async () => {
			const view = render(FieldFocusHarness, { control: 'slider' });
			(page.getByRole('slider').element() as HTMLElement).focus();
			await expect.element(root()).toHaveAttribute('data-focused', '');

			await view.rerender({ firstDisabled: true });

			await expect.element(root()).not.toHaveAttribute('data-focused');
		});

		it('is removed when the focused thumb unmounts', async () => {
			const view = render(FieldFocusHarness, { control: 'slider' });
			(page.getByRole('slider').element() as HTMLElement).focus();
			await expect.element(root()).toHaveAttribute('data-focused', '');

			await view.rerender({ firstMounted: false });

			await expect.element(root()).not.toHaveAttribute('data-focused');
		});

		it('is kept when focus moved to a sibling before the first thumb is disabled', async () => {
			const view = render(FieldFocusHarness, { control: 'slider', range: true });
			const [first, second] = page.getByRole('slider').elements() as HTMLElement[];
			first.focus();
			second.focus();
			await expect.element(root()).toHaveAttribute('data-focused', '');

			await view.rerender({ firstDisabled: true });

			expect(root().element()).toHaveAttribute('data-focused', '');
		});

		it('is kept when a sibling thumb is disabled or unmounted', async () => {
			const view = render(FieldFocusHarness, { control: 'slider', range: true });
			(page.getByRole('slider').elements()[1] as HTMLElement).focus();
			await expect.element(root()).toHaveAttribute('data-focused', '');

			await view.rerender({ firstDisabled: true });
			expect(root().element()).toHaveAttribute('data-focused', '');

			await view.rerender({ firstMounted: false });
			expect(root().element()).toHaveAttribute('data-focused', '');
		});
	});

	describe('Radio without a group', () => {
		it('does not acquire the focused state when a disabled radio is focused', async () => {
			render(FieldFocusHarness, { control: 'radio', firstDisabled: true });
			await focus('first-radio');

			expect(document.activeElement).toBe(page.getByTestId('first-radio').element());
			expect(root().element()).not.toHaveAttribute('data-focused');
		});

		it('acquires the focused state when a read-only radio is focused', async () => {
			render(FieldFocusHarness, { control: 'radio', readOnly: true });
			await focus('first-radio');

			await expect.element(root()).toHaveAttribute('data-focused', '');
		});

		it('releases the focused state on blur', async () => {
			render(FieldFocusHarness, { control: 'radio' });
			await focus('first-radio');
			await expect.element(root()).toHaveAttribute('data-focused', '');

			await focus('outside');

			await expect.element(root()).not.toHaveAttribute('data-focused');
		});
	});

	describe('radios in a group', () => {
		it('keeps the focused state between radios and releases it when focus leaves the group', async () => {
			render(FieldFocusHarness, { control: 'radios' });
			await focus('first-radio');
			await focus('second-radio');
			expect(root().element()).toHaveAttribute('data-focused', '');
			expect(root().element()).not.toHaveAttribute('data-touched');

			await focus('outside');

			await expect.element(root()).not.toHaveAttribute('data-focused');
			await expect.element(root()).toHaveAttribute('data-touched', '');
		});

		it('is kept when a previously focused radio unmounts after focus moves to a sibling', async () => {
			const view = render(FieldFocusHarness, { control: 'radios' });
			await focus('first-radio');
			await focus('second-radio');
			await expect.element(root()).toHaveAttribute('data-focused', '');

			await view.rerender({ firstMounted: false });

			expect(document.activeElement).toBe(page.getByTestId('second-radio').element());
			expect(root().element()).toHaveAttribute('data-focused', '');
		});

		it('is removed when the focused radio unmounts but its group remains', async () => {
			const view = render(FieldFocusHarness, { control: 'radios' });
			await focus('first-radio');
			await expect.element(root()).toHaveAttribute('data-focused', '');

			await view.rerender({ firstMounted: false });

			await expect.element(root()).not.toHaveAttribute('data-focused');
		});

		it('is not acquired when focus lands on a disabled radio', async () => {
			render(FieldFocusHarness, { control: 'radios', firstDisabled: true });
			await focus('first-radio');

			expect(document.activeElement).toBe(page.getByTestId('first-radio').element());
			expect(root().element()).not.toHaveAttribute('data-focused');
		});

		it('is not reacquired when a radio disabled while focused is refocused', async () => {
			const view = render(FieldFocusHarness, { control: 'radios' });
			const first = page.getByTestId('first-radio').element() as HTMLElement;
			await focus('first-radio');
			await expect.element(root()).toHaveAttribute('data-focused', '');

			await view.rerender({ firstDisabled: true });
			await expect.element(root()).not.toHaveAttribute('data-focused');

			first.blur();
			first.focus();
			await tick();

			expect(document.activeElement).toBe(first);
			expect(root().element()).not.toHaveAttribute('data-focused');
		});

		it('is reacquired when a radio that kept focus while disabled is re-enabled', async () => {
			const view = render(FieldFocusHarness, { control: 'radios' });
			const first = page.getByTestId('first-radio').element();
			await focus('first-radio');

			await view.rerender({ firstDisabled: true });
			expect(document.activeElement).toBe(first);
			await expect.element(root()).not.toHaveAttribute('data-focused');

			await view.rerender({ firstDisabled: false });
			await expect.element(root()).toHaveAttribute('data-focused', '');
		});

		it('is not acquired when a radio inherits disabled from Field.Item', async () => {
			render(FieldFocusHarness, { control: 'radio-items', itemDisabled: true });
			await focus('first-radio');

			expect(root().element()).not.toHaveAttribute('data-focused');
		});

		it('is reacquired when an arrow key moves focus from a disabled radio to an enabled sibling', async () => {
			const view = render(FieldFocusHarness, { control: 'radios' });
			await focus('first-radio');
			await expect.element(root()).toHaveAttribute('data-focused', '');

			await view.rerender({ firstDisabled: true });
			await expect.element(root()).not.toHaveAttribute('data-focused');

			await userEvent.keyboard('{ArrowDown}');

			await expect.element(page.getByTestId('second-radio')).toHaveFocus();
			await expect.element(root()).toHaveAttribute('data-focused', '');
		});
	});
});
