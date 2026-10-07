// Assertions follow Base UI v1.8.0 packages/react/src/direction-provider/DirectionProvider.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Cases under "native Svelte" have no upstream counterpart.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DirectionProviderHarness from '../../tests/DirectionProviderHarness.svelte';

describe('<DirectionProvider />', () => {
	it('defaults useDirection to ltr outside a provider', async () => {
		render(DirectionProviderHarness, { scenario: 'outside' });

		await expect.element(page.getByTestId('direction')).toHaveTextContent('ltr');
	});

	it('provides the configured direction to descendants', async () => {
		render(DirectionProviderHarness, { scenario: 'reactive' });
		const probe = page.getByTestId('direction');

		await expect.element(probe).toHaveTextContent('rtl');

		await page.getByRole('button', { name: 'Flip direction' }).click();

		await expect.element(probe).toHaveTextContent('ltr');
	});

	describe('native Svelte', () => {
		it('defaults an omitted direction prop to ltr', async () => {
			render(DirectionProviderHarness, { scenario: 'omitted' });

			await expect.element(page.getByTestId('direction')).toHaveTextContent('ltr');
		});

		it('lets a nested provider replace the outer direction', async () => {
			render(DirectionProviderHarness, { scenario: 'nested' });

			await expect.element(page.getByTestId('outer')).toHaveTextContent('rtl');
			await expect.element(page.getByTestId('inner')).toHaveTextContent('ltr');
		});

		it('renders no host element around its children', async () => {
			const { container } = render(DirectionProviderHarness, { scenario: 'rtl' });
			const probe = page.getByTestId('direction');

			await expect.element(probe).toHaveTextContent('rtl');
			expect(container.firstElementChild).toBe(probe.element());
		});
	});
});
