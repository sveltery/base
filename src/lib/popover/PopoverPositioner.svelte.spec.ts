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

function trigger() {
	return page.getByRole('button', { name: 'Trigger' });
}

it('anchors to the only trigger when bind:open opens it after the trigger mounted', async () => {
	const view = render(PopoverPositionerHarness, { open: false, offset: 100 });
	await expect.element(trigger()).toBeInTheDocument();

	await view.rerender({ open: true });
	await expect.poll(() => positioner().style.transform).toBe('translate(110px, 136px)');
	await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
});

it('anchors to the only trigger when bind:open opens it after the trigger that last opened it remounted', async () => {
	const view = render(PopoverPositionerHarness, { open: false, offset: 100 });
	await trigger().click();
	await expect.poll(() => positioner().style.transform).toBe('translate(110px, 136px)');
	await trigger().click();
	await expect.element(page.getByTestId('positioner')).not.toBeInTheDocument();

	await view.rerender({ triggerKey: 1 });
	await expect.element(trigger()).toHaveAttribute('aria-expanded', 'false');
	await view.rerender({ open: true });
	await expect.poll(() => positioner().style.transform).toBe('translate(110px, 136px)');
	await expect.element(trigger()).toHaveAttribute('aria-expanded', 'true');
});
