// Assertions follow Base UI v1.8.0 packages/react/src/separator/Separator.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Cases under "native Svelte" have no upstream counterpart.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Separator from './Separator.svelte';
import SeparatorAttachHarness from '../../tests/SeparatorAttachHarness.svelte';
import SeparatorOrientationHarness from '../../tests/SeparatorOrientationHarness.svelte';

describe('Separator', () => {
	// Playwright treats a zero-height box as hidden. The upstream testing-library
	// check passes for a full-width block; the 1px block size lets that assertion run.
	it('renders a div with the separator role', async () => {
		render(Separator, { style: 'height: 1px' });
		const separator = page.getByRole('separator');

		await expect.element(separator).toBeVisible();
		expect((separator.element() as HTMLElement).tagName).toBe('DIV');
		await expect.element(separator).toHaveAttribute('aria-orientation', 'horizontal');
		await expect.element(separator).toHaveAttribute('data-orientation', 'horizontal');
		await expect.element(separator).not.toHaveAttribute('orientation');
	});

	describe('prop: orientation', () => {
		(['horizontal', 'vertical'] as const).forEach((orientation) => {
			it(orientation, async () => {
				render(Separator, { orientation });

				await expect
					.element(page.getByRole('separator'))
					.toHaveAttribute('aria-orientation', orientation);
				await expect
					.element(page.getByRole('separator'))
					.toHaveAttribute('data-orientation', orientation);
			});
		});
	});

	describe('native Svelte', () => {
		it('renders children and follows orientation changes', async () => {
			render(SeparatorOrientationHarness);
			const separator = page.getByRole('separator');

			await expect.element(separator).toHaveTextContent('Section');
			await expect.element(separator).toHaveAttribute('aria-orientation', 'horizontal');
			await expect.element(separator).toHaveAttribute('data-orientation', 'horizontal');

			await page.getByRole('button', { name: 'Flip orientation' }).click();

			await expect.element(separator).toHaveAttribute('aria-orientation', 'vertical');
			await expect.element(separator).toHaveAttribute('data-orientation', 'vertical');
			await expect.element(separator).toHaveTextContent('Section');
		});

		it('lets later element props override role and orientation attributes', async () => {
			render(Separator, {
				role: 'presentation',
				'aria-orientation': 'vertical',
				'data-orientation': 'overridden',
				'data-testid': 'overridden-separator'
			});
			const separator = page.getByTestId('overridden-separator');

			await expect.element(separator).toHaveAttribute('role', 'presentation');
			await expect.element(separator).toHaveAttribute('aria-orientation', 'vertical');
			await expect.element(separator).toHaveAttribute('data-orientation', 'overridden');
		});

		it('passes consumer attachments to the default div', async () => {
			render(SeparatorAttachHarness);

			await expect.element(page.getByTestId('host')).toHaveTextContent('default-host');
		});

		it('render snippet receives props, state and consumer attachments', async () => {
			render(SeparatorAttachHarness, { custom: true });
			const host = page.getByRole('separator');

			await expect.element(host).toHaveAttribute('data-state', 'vertical');
			await expect.element(host).toHaveAttribute('aria-orientation', 'vertical');
			await expect.element(host).toHaveAttribute('data-orientation', 'vertical');
			await expect.element(page.getByTestId('host')).toHaveTextContent('custom-host');
		});
	});
});
