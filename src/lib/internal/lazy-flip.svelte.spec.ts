// Assertions follow the lazy flipping cases of Base UI v1.9.0
// packages/react/src/internals/useAnchorPositioning.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LazyFlipHarness from '../../tests/LazyFlipHarness.svelte';

async function openWide(lazyFlip: boolean | 'placement') {
	const view = render(LazyFlipHarness, { lazyFlip, width: 200 });
	await page.getByRole('button', { name: 'Open' }).click();
	const positioner = page.getByTestId('positioner');
	await expect.element(positioner).toHaveAttribute('data-positioned', '');
	await expect.element(positioner).toHaveAttribute('data-align', 'end');
	const wideStyle = positioner.element().getAttribute('style');
	await view.rerender({ lazyFlip, width: 20 });
	// The narrow popup moves whichever alignment it keeps, so a new style means it repositioned.
	await expect.poll(() => positioner.element().getAttribute('style')).not.toBe(wideStyle);
	return positioner;
}

describe('AnchorPositioning lazyFlip', () => {
	it('returns to the preferred alignment once the popup fits, without a placement lock', async () => {
		const positioner = await openWide(true);
		await expect.element(positioner).toHaveAttribute('data-align', 'start');
	});

	it("keeps the flipped alignment once the popup fits with 'placement'", async () => {
		const positioner = await openWide('placement');
		expect(positioner.element().getAttribute('data-align')).toBe('end');
	});
});
