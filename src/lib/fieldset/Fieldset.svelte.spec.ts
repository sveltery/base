// Assertions follow Base UI v1.8.0 packages/react/src/fieldset/root/FieldsetRoot.test.tsx
// and packages/react/src/fieldset/legend/FieldsetLegend.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Field, Checkbox, RadioGroup and Slider integration is not ported.
// Cases under "native Svelte" have no upstream counterpart.
// SSR association timing is covered by fieldset.e2e.ts (this project runs in a browser).
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FieldsetLegend from './FieldsetLegend.svelte';
import FieldsetAttachHarness from '../../tests/FieldsetAttachHarness.svelte';
import FieldsetHarness from '../../tests/FieldsetHarness.svelte';
import FieldsetRenderHarness from '../../tests/FieldsetRenderHarness.svelte';

describe('Fieldset', () => {
	describe('prop: disabled', () => {
		it('sets the native disabled attribute', async () => {
			render(FieldsetHarness, { scenario: 'disabled' });
			const fieldset = page.getByTestId('fieldset');

			await expect.element(fieldset).toHaveAttribute('disabled');
			await expect.element(fieldset).toHaveAttribute('data-disabled');
			await expect.element(page.getByRole('textbox', { name: 'Name' })).toBeDisabled();
			await expect.element(page.getByTestId('legend')).toHaveAttribute('data-disabled');
		});

		it('keeps nested fieldsets disabled when an ancestor fieldset is disabled', async () => {
			render(FieldsetHarness, { scenario: 'nested' });
			const inner = page.getByTestId('inner');

			await expect.element(inner).toHaveAttribute('disabled');
			await expect.element(inner).toHaveAttribute('data-disabled');
			await expect.element(page.getByTestId('control')).toBeDisabled();
		});

		it('updates nested disabled precedence in both directions', async () => {
			render(FieldsetHarness, { scenario: 'nested' });
			const inner = page.getByTestId('inner');
			const outer = page.getByTestId('outer');
			const control = page.getByTestId('control');

			await expect.element(control).toBeDisabled();
			await expect.element(inner).toHaveAttribute('data-disabled');
			await expect.element(outer).not.toHaveAttribute('data-disabled');

			await page.getByRole('button', { name: 'Disable outer' }).click();
			await page.getByRole('button', { name: 'Enable inner' }).click();

			await expect.element(control).toBeDisabled();
			await expect.element(inner).toHaveAttribute('disabled');
			await expect.element(inner).toHaveAttribute('data-disabled');
			await expect.element(outer).toHaveAttribute('data-disabled');

			await page.getByRole('button', { name: 'Enable outer' }).click();

			await expect.element(control).not.toBeDisabled();
			await expect.element(inner).not.toHaveAttribute('disabled');
			await expect.element(inner).not.toHaveAttribute('data-disabled');
			await expect.element(outer).not.toHaveAttribute('data-disabled');
		});
	});

	describe('legend association', () => {
		it('sets aria-labelledby on the fieldset automatically', async () => {
			render(FieldsetHarness, { scenario: 'legend' });
			const fieldset = page.getByTestId('fieldset');
			const legend = page.getByTestId('legend');

			await expect.element(legend).toHaveAttribute('id');
			const id = legend.element().id;
			expect(id).toMatch(/^base-ui-/);
			await expect.element(fieldset).toHaveAttribute('aria-labelledby', id);
		});

		it('sets aria-labelledby on the fieldset with a custom id', async () => {
			render(FieldsetHarness, { scenario: 'custom-id' });

			await expect
				.element(page.getByTestId('fieldset'))
				.toHaveAttribute('aria-labelledby', 'legend-id');
		});

		it('updates and clears the legend association', async () => {
			render(FieldsetHarness, { scenario: 'dynamic' });
			const fieldset = page.getByTestId('fieldset');

			await expect.element(fieldset).toHaveAttribute('aria-labelledby', 'legend-a');
			await page.getByRole('button', { name: 'Change id' }).click();
			await expect.element(fieldset).toHaveAttribute('aria-labelledby', 'legend-b');
			await page.getByRole('button', { name: 'Remove legend' }).click();
			await expect.element(fieldset).not.toHaveAttribute('aria-labelledby');
		});

		it('does not let an older legend cleanup clear a newer legend', async () => {
			render(FieldsetHarness, { scenario: 'labels' });
			const fieldset = page.getByTestId('fieldset');

			await expect.element(fieldset).toHaveAttribute('aria-labelledby', 'old-label');
			await page.getByRole('button', { name: 'Show both' }).click();
			await expect.element(fieldset).toHaveAttribute('aria-labelledby', 'new-label');
			await page.getByRole('button', { name: 'Show new' }).click();
			await expect.element(fieldset).toHaveAttribute('aria-labelledby', 'new-label');
			await expect.element(page.getByTestId('old')).not.toBeInTheDocument();
		});

		it('associates each legend with its nearest fieldset', async () => {
			render(FieldsetHarness, { scenario: 'nested-labels' });

			await expect
				.element(page.getByTestId('outer'))
				.toHaveAttribute('aria-labelledby', 'outer-legend');
			await expect
				.element(page.getByTestId('inner'))
				.toHaveAttribute('aria-labelledby', 'inner-legend');
		});

		it('throws a descriptive error when rendered outside Fieldset.Root', () => {
			expect(() => render(FieldsetLegend)).toThrow(
				'Base UI: FieldsetRootContext is missing. Fieldset parts must be placed within <Fieldset.Root>.'
			);
		});
	});

	describe('native Svelte', () => {
		it('render snippet receives props, state and the legend registration', async () => {
			render(FieldsetRenderHarness);
			const custom = page.getByTestId('custom');

			await expect.element(custom).toHaveAttribute('disabled');
			await expect.element(custom).toHaveAttribute('data-disabled');
			await expect.element(custom).toHaveAttribute('data-disabled-state', 'yes');
			await expect.element(custom).toHaveClass('from-root');
			const id = page.getByTestId('legend').element().id;
			await expect.element(custom).toHaveAttribute('aria-labelledby', id);
		});

		it('passes consumer attachments to the default fieldset', async () => {
			render(FieldsetAttachHarness);

			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
		});

		it('render snippet receives consumer attachments', async () => {
			render(FieldsetAttachHarness, { custom: true });

			await expect.element(page.getByTestId('host')).toHaveTextContent('custom-host');
			await expect.element(page.getByRole('group')).toHaveClass('custom-host');
		});
	});
});
