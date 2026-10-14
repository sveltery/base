// Assertions follow Base UI v1.9.0 packages/react/src/navigation-menu/content/NavigationMenuContent.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The server-side rendering cases are in content-ssr.spec.ts.
import { tick } from 'svelte';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, onTestFinished } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NavigationMenuContentHarness from '../../tests/NavigationMenuContentHarness.svelte';
import { mockAnimations, withAnimations } from '../../tests/navigationMenuEvents.js';
import { byId, settlePositioning } from '../../tests/previewCardEvents.js';

afterEach(async () => {
	await settlePositioning();
});

function contents(testId: string) {
	return document.querySelectorAll<HTMLElement>(`[data-testid="${testId}"]`);
}

describe('NavigationMenu.Content', () => {
	it('keeps the content mounted (hidden) post-hydration when keepMounted is true', () => {
		render(NavigationMenuContentHarness, { keepMounted: true });

		expect(contents('content-1').length).toBe(1);
		expect(contents('content-1')[0].hasAttribute('hidden')).toBe(true);
	});

	it('does not keep the content mounted post-hydration when keepMounted is false', () => {
		render(NavigationMenuContentHarness, { keepMounted: false });

		expect(contents('content-1').length).toBe(0);
	});

	it('moves content into the popup and keeps it there when switching triggers', async () => {
		render(NavigationMenuContentHarness, { keepMounted: true, twoItems: true });
		const list = byId('list')!;

		byId('trigger-1')!.click();
		await tick();

		await expect.poll(() => byId('viewport')).not.toBeNull();
		const viewport = byId('viewport')!;
		const content1 = byId('content-1')!;
		expect(viewport.contains(content1)).toBe(true);
		expect(list.contains(content1)).toBe(false);

		byId('trigger-2')!.click();
		await tick();

		await expect.poll(() => byId('content-2')).not.toBeNull();
		expect(viewport.contains(byId('content-1'))).toBe(true);
		expect(viewport.contains(byId('content-2'))).toBe(true);
	});

	it('unmounts content rendered through a multi-node snippet without removing other viewport children', async () => {
		render(NavigationMenuContentHarness, {
			twoItems: true,
			multiNode: true,
			keepSecondMounted: true
		});

		byId('trigger-1')!.click();
		await expect.poll(() => byId('content-1')).not.toBeNull();
		const viewport = byId('viewport')!;
		expect(viewport.contains(byId('content-1'))).toBe(true);
		// The kept-mounted second content follows the moved element in the viewport.
		expect(byId('content-1')!.nextElementSibling).toBe(byId('content-2'));

		byId('trigger-2')!.click();
		await expect.poll(() => byId('content-1')).toBeNull();

		expect(byId('content-1-sibling')).toBeNull();
		expect(viewport.contains(byId('content-2'))).toBe(true);
	});

	it('lays exiting content over the entering content and makes it inert unless it holds focus', async () => {
		const restore = withAnimations();
		onTestFinished(restore);
		render(NavigationMenuContentHarness, { twoItems: true });

		byId('trigger-1')!.click();
		await expect.poll(() => byId('content-1')).not.toBeNull();
		const content1 = byId('content-1')!;
		const animations = mockAnimations(content1);
		const exit = animations.start();

		byId('trigger-2')!.click();
		await expect.poll(() => byId('content-2')).not.toBeNull();

		expect(content1.hasAttribute('data-ending-style')).toBe(true);
		expect(content1.hasAttribute('inert')).toBe(true);
		const { position, top, left } = content1.style;
		expect({ position, top, left }).toEqual({ position: 'absolute', top: '0px', left: '0px' });
		expect(byId('content-2')!.hasAttribute('inert')).toBe(false);
		expect(byId('content-2')!.getAttribute('style')).toBeNull();

		await animations.finish(exit);
		await expect.poll(() => byId('content-1')).toBeNull();

		byId('trigger-1')!.click();
		await expect.poll(() => byId('content-1')).not.toBeNull();
		const focused = byId('content-1')!;
		const focusedAnimations = mockAnimations(focused);
		const focusedExit = focusedAnimations.start();
		focused.querySelector('a')!.focus();

		byId('trigger-2')!.click();
		await expect.poll(() => focused.hasAttribute('data-ending-style')).toBe(true);
		expect(focused.hasAttribute('inert')).toBe(false);

		await focusedAnimations.finish(focusedExit);
	});

	it('keeps content mounted inside the popup when closed if the portal is kept mounted', async () => {
		render(NavigationMenuContentHarness, { keepMounted: true, keepMountedPortal: true });

		await userEvent.click(byId('trigger-1')!);
		await tick();

		const viewport = byId('viewport')!;
		await expect.poll(() => viewport.contains(byId('content-1'))).toBe(true);

		await userEvent.keyboard('{Escape}');

		await expect.poll(() => byId('content-1')!.hasAttribute('hidden')).toBe(true);
		expect(viewport.contains(byId('content-1'))).toBe(true);
	});
});
