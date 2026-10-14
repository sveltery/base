// Assertions follow Base UI v1.9.0 packages/react/src/combobox/status/ComboboxStatus.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `describeConformance` (React only). The reset-delay cases wait out the real delay
// instead of ticking fake timers.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ComboboxPartsHarness from '../../tests/ComboboxPartsHarness.svelte';

const MARKER = '⁠';
const RESET_DELAY = 200;
const status = () => page.getByTestId('status');

function renderStatus(extra: Record<string, unknown> = {}, open = true) {
	return render(ComboboxPartsHarness, {
		scenario: 'live-region',
		part: 'status',
		root: { open },
		...extra
	});
}

describe('Combobox.Status', () => {
	it('renders only while the popup is open', async () => {
		renderStatus({ text: 'Searching…' }, false);
		await expect.element(page.getByTestId('input')).toBeInTheDocument();
		expect(status().elements()).toHaveLength(0);

		await userEvent.click(page.getByTestId('input'));

		await expect.element(status()).toBeInTheDocument();
	});

	describe('a11y', () => {
		it('removes the initial text mutation after the reset delay', async () => {
			renderStatus({ text: 'Searching…' });
			await expect.element(status()).toBeInTheDocument();

			expect(page.getByRole('status').element()).toBe(status().element());
			expect(status().element().textContent).toBe(`Searching…${MARKER}`);

			await new Promise((resolve) => setTimeout(resolve, RESET_DELAY + 50));

			expect(status().element().textContent).toBe('Searching…');
		});

		it('updates content immediately after the live region has mounted', async () => {
			const view = renderStatus();
			await expect.element(status()).toBeInTheDocument();
			expect(page.getByRole('status').element()).toBe(status().element());
			expect(status().element().textContent?.trim()).toBe('');

			await view.rerender({ text: 'Searching…' });

			await expect.element(status()).toHaveTextContent('Searching…');
			expect(status().element().textContent).toBe('Searching…');
		});

		it('keeps a custom render element', async () => {
			renderStatus({ text: 'Searching…', custom: true });
			const custom = page.getByTestId('custom');
			await expect.element(custom).toBeInTheDocument();

			expect(custom.element().tagName).toBe('P');
			expect(page.getByRole('status').element()).toBe(custom.element());
			expect(custom.element().textContent).toBe(`Searching…${MARKER}`);

			await new Promise((resolve) => setTimeout(resolve, RESET_DELAY + 50));

			expect(custom.element().textContent).toBe('Searching…');
		});

		it('restores the text when unmounting during the reset delay', async () => {
			const view = renderStatus({ text: 'Searching…' });
			await expect.element(status()).toBeInTheDocument();
			const element = status().element();
			expect(element.textContent).toBe(`Searching…${MARKER}`);

			view.unmount();

			expect(element.textContent).toBe('Searching…');
		});
	});
});
