// Assertions follow Base UI v1.8.0 packages/react/src/csp-provider/CSPProvider.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream checks ScrollArea and Select style tags. Those components do not read this
// provider yet, so these tests assert the context values those checks depend on.
// Cases under "native Svelte" have no upstream counterpart.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CSPProviderHarness from '../../tests/CSPProviderHarness.svelte';

describe('<CSPProvider />', () => {
	it('defaults disableStyleElements to false outside a provider', async () => {
		render(CSPProviderHarness, { scenario: 'outside' });

		await expect.element(page.getByTestId('csp-nonce')).toHaveTextContent('undefined');
		await expect.element(page.getByTestId('csp-styles')).toHaveTextContent('false');
	});

	it('provides disableStyleElements so a descendant can skip inline style tags', async () => {
		render(CSPProviderHarness, { scenario: 'disabled' });

		await expect.element(page.getByTestId('csp-styles')).toHaveTextContent('true');
		await expect.element(page.getByTestId('csp-nonce')).toHaveTextContent('undefined');
	});

	it('provides nonce for inline style and script tags', async () => {
		render(CSPProviderHarness, { scenario: 'reactive' });
		const nonce = page.getByTestId('csp-nonce');
		const styles = page.getByTestId('csp-styles');

		await expect.element(nonce).toHaveTextContent('test-nonce');
		await expect.element(styles).toHaveTextContent('false');

		await page.getByRole('button', { name: 'Update CSP' }).click();

		await expect.element(nonce).toHaveTextContent('next-nonce');
		await expect.element(styles).toHaveTextContent('true');
	});

	describe('native Svelte', () => {
		it('leaves an omitted disableStyleElements prop undefined', async () => {
			render(CSPProviderHarness, { scenario: 'omitted' });

			await expect.element(page.getByTestId('csp-nonce')).toHaveTextContent('undefined');
			await expect.element(page.getByTestId('csp-styles')).toHaveTextContent('undefined');
		});

		it('lets a nested provider replace the outer configuration', async () => {
			render(CSPProviderHarness, { scenario: 'nested' });

			await expect.element(page.getByTestId('outer-nonce')).toHaveTextContent('outer-nonce');
			await expect.element(page.getByTestId('outer-styles')).toHaveTextContent('false');
			await expect.element(page.getByTestId('inner-nonce')).toHaveTextContent('undefined');
			await expect.element(page.getByTestId('inner-styles')).toHaveTextContent('true');
		});

		it('renders no host element around its children', async () => {
			const { container } = render(CSPProviderHarness, { scenario: 'nonce' });
			const probe = page.getByTestId('csp-nonce');

			await expect.element(probe).toHaveTextContent('test-nonce');
			expect(container.firstElementChild).toBe(probe.element());
		});
	});
});
