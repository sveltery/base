// Assertions follow Base UI v1.9.0 packages/react/test/positionerConformanceTests.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page } from 'vitest/browser';
import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PopoverPositionerHarness from '../../tests/PopoverPositionerHarness.svelte';

function positioner() {
	return page.getByTestId('positioner').element() as HTMLElement;
}

function toggleViewport() {
	(page.getByRole('button', { name: 'Toggle Viewport' }).element() as HTMLElement).click();
}

it('uses transform positioning without Viewport', async () => {
	render(PopoverPositionerHarness);
	await expect.poll(() => positioner().style.transform).toBe('translate(10px, 36px)');
});

it('updates positioning when Viewport mounts and unmounts', async () => {
	render(PopoverPositionerHarness);
	await expect.poll(() => positioner().style.transform).toBe('translate(10px, 36px)');

	toggleViewport();
	await expect.poll(() => positioner().style.transform).toBe('');
	await expect.poll(() => positioner().style.top).toBe('36px');

	toggleViewport();
	await expect.poll(() => positioner().style.transform).toBe('translate(10px, 36px)');
});
