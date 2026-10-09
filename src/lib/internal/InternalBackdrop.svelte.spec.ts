import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BackdropCutoutHarness from '../../tests/BackdropCutoutHarness.svelte';

function cutoutBox() {
	const clip = page.getByTestId('backdrop').element().style.clipPath;
	const nums = [...clip.matchAll(/([\d.]+)px/g)].map((match) => Number(match[1]));
	return { left: nums[0], top: nums[1], right: nums[4] };
}

describe('InternalBackdrop', () => {
	it('updates the cutout when the element resizes', async () => {
		render(BackdropCutoutHarness);
		const cutout = page.getByTestId('cutout').element() as HTMLElement;
		await expect.poll(() => cutoutBox().right).toBeCloseTo(cutout.getBoundingClientRect().right, 0);

		const before = cutoutBox().right;
		cutout.style.width = '90px';
		await expect.poll(() => cutoutBox().right).toBeCloseTo(cutout.getBoundingClientRect().right, 0);
		expect(cutoutBox().right).not.toBeCloseTo(before, 0);
	});

	it('updates the cutout when an ancestor scrolls', async () => {
		render(BackdropCutoutHarness);
		const cutout = page.getByTestId('cutout').element() as HTMLElement;
		const scroller = page.getByTestId('scroller').element() as HTMLElement;
		await expect.poll(() => cutoutBox().top).toBeCloseTo(cutout.getBoundingClientRect().top, 0);

		const before = cutoutBox().top;
		scroller.scrollTop = 60;
		await expect.poll(() => cutoutBox().top).toBeCloseTo(cutout.getBoundingClientRect().top, 0);
		expect(cutoutBox().top).not.toBeCloseTo(before, 0);
	});
});
