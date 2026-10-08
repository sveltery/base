// Assertions follow Base UI v1.8.0 packages/react/src/csp-provider/CSPProvider.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream checks ScrollArea and Select style tags. ScrollArea covers its own tag.
// These tests assert the context values. Select has no inline style tag in this port.
// Cases under "native Svelte" have no upstream counterpart.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CSPProviderFixture from '../../routes/fixtures/csp-provider/CSPProviderFixture.svelte';

describe('<CSPProvider />', () => {
	it('defaults disableStyleElements to false outside a provider', async () => {
		render(CSPProviderFixture, { scenario: 'outside' });

		await expect.element(page.getByTestId('csp-nonce')).toHaveTextContent('undefined');
		await expect.element(page.getByTestId('csp-styles')).toHaveTextContent('false');
	});

	it('provides disableStyleElements so a descendant can skip inline style tags', async () => {
		render(CSPProviderFixture, { scenario: 'disabled' });

		await expect.element(page.getByTestId('csp-styles')).toHaveTextContent('true');
		await expect.element(page.getByTestId('csp-nonce')).toHaveTextContent('undefined');
	});

	it('provides nonce for inline style and script tags', async () => {
		render(CSPProviderFixture, { scenario: 'reactive' });
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
			render(CSPProviderFixture, { scenario: 'omitted' });

			await expect.element(page.getByTestId('csp-nonce')).toHaveTextContent('undefined');
			await expect.element(page.getByTestId('csp-styles')).toHaveTextContent('undefined');
		});

		it('lets a nested provider replace the outer configuration', async () => {
			render(CSPProviderFixture, { scenario: 'nested' });

			await expect.element(page.getByTestId('outer-nonce')).toHaveTextContent('outer-nonce');
			await expect.element(page.getByTestId('outer-styles')).toHaveTextContent('false');
			await expect.element(page.getByTestId('inner-nonce')).toHaveTextContent('undefined');
			await expect.element(page.getByTestId('inner-styles')).toHaveTextContent('true');
		});

		it('renders no host element around its children', async () => {
			const { container } = render(CSPProviderFixture, { scenario: 'nonce' });
			const probe = page.getByTestId('csp-nonce');

			await expect.element(probe).toHaveTextContent('test-nonce');
			expect(container.firstElementChild).toBe(probe.element());
		});
	});
});
