// Assertions follow Base UI v1.9.0 packages/react/src/menu/popup/MenuPopupEnterTransition.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Svelte has no `defaultOpen`: an initial `open` the menu then writes stands in for it, and a
// changed `open` prop stands in for a controlled flip.
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuEnterHarness from '../../tests/menu/MenuEnterHarness.svelte';
import { clickElement } from '../../tests/menu/mouse.js';

const trackers: (() => void)[] = [];

/** Samples `selector` every frame, since the tracked attribute may last a single frame. */
function trackSelector(selector: string) {
	let seen = false;
	let frame = 0;
	function sample() {
		if (document.querySelector(selector)) seen = true;
		frame = requestAnimationFrame(sample);
	}
	frame = requestAnimationFrame(sample);
	trackers.push(() => cancelAnimationFrame(frame));
	return { seen: () => seen };
}

function trackStartingStyle(testId: string) {
	return trackSelector(`[data-testid="${testId}"][data-starting-style]`);
}

function byTestId(id: string) {
	return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function openWithEnter() {
	page.getByRole('button', { name: 'Trigger' }).element().focus();
	await userEvent.keyboard('{Enter}');
}

describe('Menu enter transition', () => {
	afterEach(() => {
		trackers.splice(0).forEach((stop) => stop());
	});

	it('plays the enter transition for a submenu that is open when its parent opens', async () => {
		const submenu = trackStartingStyle('submenu-popup');
		render(MenuEnterHarness, { submenuOpen: true });

		await userEvent.click(page.getByRole('button', { name: 'Trigger' }));
		await expect.poll(() => byTestId('submenu-popup')).not.toBeNull();
		await expect.poll(submenu.seen).toBe(true);
	});

	it('does not play the enter transition for a menu that is open on the first render', async () => {
		const menu = trackStartingStyle('menu-popup');
		render(MenuEnterHarness, { open: true });

		await expect.poll(() => byTestId('menu-popup')).not.toBeNull();
		await wait(100);
		expect(menu.seen()).toBe(false);
	});

	it('does not play the enter transition for a submenu inside a menu that is open on the first render', async () => {
		const menu = trackStartingStyle('menu-popup');
		const submenu = trackStartingStyle('submenu-popup');
		render(MenuEnterHarness, { open: true, submenuOpen: true });

		await expect.poll(() => byTestId('submenu-popup')).not.toBeNull();
		await wait(100);
		expect(menu.seen()).toBe(false);
		expect(submenu.seen()).toBe(false);
	});

	it('does not play the enter transition for a submenu when the parent popup is kept mounted', async () => {
		// Upstream pins this limitation: the kept-mounted submenu mounts with the page, so its
		// mount cannot follow the parent's reveal.
		const submenu = trackStartingStyle('submenu-popup');
		render(MenuEnterHarness, { keepMounted: true, submenuOpen: true });

		// The open submenu of the hidden parent sits over the trigger, so the press goes to the
		// trigger itself, as user-event's does.
		clickElement(page.getByRole('button', { name: 'Trigger' }).element() as HTMLElement);
		await expect.poll(() => byTestId('menu-popup')?.hasAttribute('hidden')).toBe(false);
		await wait(100);
		expect(submenu.seen()).toBe(false);
	});

	it('plays the enter transition for a submenu opened by the user', async () => {
		const submenu = trackStartingStyle('submenu-popup');
		render(MenuEnterHarness, { open: true, leadingItem: false });

		await userEvent.click(page.getByRole('menuitem', { name: 'Submenu' }));
		await expect.poll(() => byTestId('submenu-popup')).not.toBeNull();
		await expect.poll(submenu.seen).toBe(true);
	});

	it('plays the enter transition for a submenu whose parent opened instantly', async () => {
		const submenu = trackStartingStyle('submenu-popup');
		render(MenuEnterHarness, { submenuOpen: true });

		await openWithEnter();
		await expect.poll(() => byTestId('submenu-popup')).not.toBeNull();
		await expect.poll(submenu.seen).toBe(true);
	});

	it('marks an initially open submenu as instant when its parent opened instantly', async () => {
		const submenuInstant = trackSelector('[data-testid="submenu-popup"][data-instant="click"]');
		render(MenuEnterHarness, { submenuOpen: true });

		await openWithEnter();
		await expect.poll(() => byTestId('submenu-popup')).not.toBeNull();
		expect(byTestId('menu-popup')!.getAttribute('data-instant')).toBe('click');
		// The submenu carries the inherited value during its enter frames only.
		await expect.poll(submenuInstant.seen).toBe(true);
		await expect.poll(() => byTestId('submenu-popup')!.hasAttribute('data-instant')).toBe(false);
	});

	it('clears the inherited instant type after the initial open', async () => {
		const view = render(MenuEnterHarness, { submenuOpen: true });

		await openWithEnter();
		await expect.poll(() => byTestId('submenu-popup')).not.toBeNull();
		await expect.poll(() => byTestId('submenu-popup')!.hasAttribute('data-instant')).toBe(false);

		await view.rerender({ submenuOpen: false });
		await expect.poll(() => byTestId('submenu-popup')).toBeNull();

		await view.rerender({ submenuOpen: true });
		await expect.poll(() => byTestId('submenu-popup')).not.toBeNull();
		expect(byTestId('submenu-popup')!.hasAttribute('data-instant')).toBe(false);
	});

	it('clears the inherited instant type when a controlled close interrupts the entry', async () => {
		const css = `
			[data-testid='submenu-popup'] { opacity: 1; transition: opacity 300ms linear; }
			[data-testid='submenu-popup'][data-starting-style] { opacity: 0; }
		`;
		const view = render(MenuEnterHarness, { submenuOpen: true, css });

		await openWithEnter();
		await expect.poll(() => byTestId('submenu-popup')).not.toBeNull();

		// Close before the 300ms enter transition finishes, then reopen.
		await view.rerender({ submenuOpen: false, css });
		await expect.poll(() => byTestId('submenu-popup')).toBeNull();

		await view.rerender({ submenuOpen: true, css });
		await expect.poll(() => byTestId('submenu-popup')).not.toBeNull();
		expect(byTestId('submenu-popup')!.hasAttribute('data-instant')).toBe(false);
	});

	it('clears the inherited instant type when the popup is not initially rendered', async () => {
		const view = render(MenuEnterHarness, { submenuOpen: true, showSubmenuPopup: false });

		await openWithEnter();
		await expect.poll(() => byTestId('menu-popup')?.getAttribute('data-instant')).toBe('click');
		// Give the reveal time to settle while the submenu popup is absent.
		await wait(100);

		await view.rerender({ submenuOpen: true, showSubmenuPopup: true });
		await expect.poll(() => byTestId('submenu-popup')).not.toBeNull();
		expect(byTestId('submenu-popup')!.hasAttribute('data-instant')).toBe(false);
	});

	it('does not mark a closed submenu as instant when it is later opened programmatically', async () => {
		const view = render(MenuEnterHarness, { submenuOpen: false });

		await openWithEnter();
		await expect.poll(() => byTestId('menu-popup')).not.toBeNull();
		expect(byTestId('menu-popup')!.getAttribute('data-instant')).toBe('click');

		await view.rerender({ submenuOpen: true });
		await expect.poll(() => byTestId('submenu-popup')).not.toBeNull();
		expect(byTestId('submenu-popup')!.hasAttribute('data-instant')).toBe(false);
	});
});
