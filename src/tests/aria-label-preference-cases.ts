// Assertions follow Base UI v1.9.0 packages/react/src/checkbox/root/CheckboxRoot.test.tsx
// "prefers `aria-label` over an associated label" and its blank and dynamic cases
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AriaLabelPreferenceHarness from './AriaLabelPreferenceHarness.svelte';

export function ariaLabelPreferenceCases(control: 'checkbox' | 'switch' | 'radio') {
	const controls = () => page.getByRole(control).all();

	describe('aria-label and associated labels', () => {
		it('prefers a non-blank aria-label over an associated label', async () => {
			render(AriaLabelPreferenceHarness, { control, ariaLabel: 'Custom name' });
			const all = controls();
			expect(all).toHaveLength(control === 'radio' ? 1 : 3);

			for (const element of all) {
				await expect.element(element).not.toHaveAttribute('aria-labelledby');
				await expect.element(element).toHaveAccessibleName('Custom name');
			}
		});

		if (control !== 'checkbox') return;

		it.each(['', ' ', '\n\t '])('ignores a blank aria-label (%j)', async (ariaLabel) => {
			render(AriaLabelPreferenceHarness, { control, ariaLabel });
			const [native, field, sibling] = controls();

			await expect.element(native).toHaveAccessibleName('Native label');
			await expect.element(field).toHaveAccessibleName('Field label');
			await expect.element(sibling).toHaveAccessibleName('Sibling label');
		});

		describe.each(['native', 'field'] as const)('dynamic %s label', (labelType) => {
			it('updates the accessible name when aria-label is added, cleared, or removed', async () => {
				const view = render(AriaLabelPreferenceHarness, {
					control,
					scenario: 'dynamic',
					labelType
				});
				const element = page.getByRole(control);

				await expect.element(element).toHaveAccessibleName('Associated label');
				await view.rerender({ ariaLabel: 'Custom name' });
				await expect.element(element).toHaveAccessibleName('Custom name');
				await view.rerender({ ariaLabel: ' \n\t ' });
				await expect.element(element).toHaveAccessibleName('Associated label');
				await view.rerender({ ariaLabel: 'Custom name' });
				await expect.element(element).toHaveAccessibleName('Custom name');
				await view.rerender({ ariaLabel: undefined });
				await expect.element(element).toHaveAccessibleName('Associated label');
			});

			it('updates the accessible name when the associated label mounts and unmounts', async () => {
				const view = render(AriaLabelPreferenceHarness, {
					control,
					scenario: 'dynamic',
					labelType,
					showLabel: false
				});
				const element = page.getByRole(control);

				await expect.element(element).toHaveAccessibleName('');
				await view.rerender({ showLabel: true });
				await expect.element(element).toHaveAccessibleName('Associated label');
				await view.rerender({ showLabel: false });
				await expect.element(element).toHaveAccessibleName('');
				await expect.element(element).not.toHaveAttribute('aria-labelledby');
				await view.rerender({ ariaLabel: 'Custom name' });
				await expect.element(element).toHaveAccessibleName('Custom name');
				await view.rerender({ showLabel: true });
				await expect.element(element).toHaveAccessibleName('Custom name');
				await view.rerender({ showLabel: false });
				await expect.element(element).toHaveAccessibleName('Custom name');
				await view.rerender({ showLabel: true, ariaLabel: undefined });
				await expect.element(element).toHaveAccessibleName('Associated label');
			});
		});
	});
}
