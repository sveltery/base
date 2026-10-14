// Assertions follow Base UI v1.9.0 packages/react/src/navigation-menu/trigger/NavigationMenuTrigger.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `ref` and render-prop conformance (NavigationMenuParts.svelte.spec.ts covers the host).
// Upstream hovers with `pointerEventsCheck: 0` because the safe polygon locks the list.
// `force` skips the same Playwright hit-target check here.
import { tick } from 'svelte';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NavigationMenuTriggerHarness from '../../tests/NavigationMenuTriggerHarness.svelte';
import { hover, isVisible, observeValue, resetHover } from '../../tests/navigationMenuEvents.js';
import { byId, settlePositioning } from '../../tests/previewCardEvents.js';

afterEach(async () => {
	vi.restoreAllMocks();
	resetHover();
	await settlePositioning();
});

function cssPx(element: HTMLElement, name: string) {
	return parseInt(getComputedStyle(element).getPropertyValue(name), 10);
}

function widthCalls(spy: { mock: { calls: unknown[][] } }, name: string, from = 0) {
	return spy.mock.calls
		.slice(from)
		.filter((call) => call[0] === name)
		.map((call) => call[1]);
}

describe('NavigationMenu.Trigger', () => {
	it('applies the data-disabled style hook only when disabled', async () => {
		render(NavigationMenuTriggerHarness, { variant: 'disabled' });
		const trigger = byId('trigger')!;
		expect(trigger.getAttribute('data-disabled')).toBe('');

		byId('enable')!.click();
		await tick();
		expect(trigger.hasAttribute('data-disabled')).toBe(false);
	});

	it('opens a vertical menu with the mirrored arrow key in RTL mode', async () => {
		render(NavigationMenuTriggerHarness, { variant: 'rtl' });
		byId('trigger')!.focus();

		await userEvent.keyboard('{ArrowLeft}');

		await expect.poll(() => isVisible(byId('link'))).toBe(true);
	});

	it.each([
		['ArrowDown', '{ArrowDown}'],
		['Enter', '{Enter}'],
		['Space', ' ']
	])('keeps focus on the trigger when opened with %s', async (_keyName, key) => {
		render(NavigationMenuTriggerHarness, { variant: 'single' });
		const trigger = byId('trigger')!;
		trigger.focus();

		await userEvent.keyboard(key);

		await expect.poll(() => isVisible(byId('link'))).toBe(true);
		await new Promise(requestAnimationFrame);

		expect(document.activeElement).toBe(trigger);
	});

	it('handles focus and positioner height', async () => {
		render(NavigationMenuTriggerHarness, { variant: 'focus' });
		const overview = byId('overview')!;
		const handbook = byId('handbook')!;
		overview.focus();

		await userEvent.keyboard('{ArrowDown}');

		await expect.poll(() => byId('positioner')).not.toBeNull();
		const positioner = byId('positioner')!;
		await expect
			.poll(() => Math.abs(cssPx(positioner, '--positioner-height') - 18))
			.toBeLessThanOrEqual(1);
		expect(document.activeElement).toBe(overview);

		await userEvent.tab();
		await expect.poll(() => document.activeElement).toBe(byId('overview-link'));

		await userEvent.tab({ shift: true });
		await expect.poll(() => document.activeElement).toBe(overview);

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement).toBe(handbook);

		await userEvent.keyboard('{ArrowDown}');
		await expect
			.poll(() => Math.abs(cssPx(positioner, '--positioner-height') - 36))
			.toBeLessThanOrEqual(1);
		expect(document.activeElement).toBe(handbook);

		await userEvent.tab();
		await expect.poll(() => document.activeElement).toBe(byId('handbook-link'));

		await userEvent.tab({ shift: true });
		await expect.poll(() => document.activeElement).toBe(handbook);

		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => document.activeElement).toBe(overview);

		await userEvent.keyboard('{ArrowDown}');
		await expect
			.poll(() => Math.abs(cssPx(positioner, '--positioner-height') - 18))
			.toBeLessThanOrEqual(1);
		expect(document.activeElement).toBe(overview);
	});

	it('handles positioner width correctly', async () => {
		render(NavigationMenuTriggerHarness, { variant: 'width' });
		const withContent = byId('with-content')!;
		const noContent = byId('no-content')!;

		hover(withContent);
		hover(noContent);
		hover(withContent);

		await expect.poll(() => isVisible(byId('link'))).toBe(true);
		const positioner = byId('positioner')!;

		await expect
			.poll(() => Math.abs(cssPx(positioner, '--positioner-width') - 183))
			.toBeLessThanOrEqual(1);
	});

	it('repositions the positioner when switching triggers via hover', async () => {
		render(NavigationMenuTriggerHarness, { variant: 'reposition' });

		hover(byId('overview')!);
		await expect.poll(() => isVisible(byId('overview-link'))).toBe(true);

		const positioner = byId('positioner')!;
		const firstLeft = positioner.getBoundingClientRect().left;

		hover(byId('handbook')!);
		await expect.poll(() => isVisible(byId('handbook-link'))).toBe(true);

		await expect
			.poll(() => Math.abs(positioner.getBoundingClientRect().left - firstLeft))
			.toBeGreaterThan(20);
	});

	it('does not let a previously hovered trigger reapply popup sizes after a later switch', async () => {
		render(NavigationMenuTriggerHarness, { variant: 'rapid' });

		hover(byId('product')!);

		await expect.poll(() => byId('popup-root')).not.toBeNull();
		const popupRoot = byId('popup-root')!;
		const setProperty = vi.spyOn(popupRoot.style, 'setProperty');

		expect(
			await observeValue(() => popupRoot.style.getPropertyValue('--popup-width'), '700px')
		).toBe('700px');

		const before = setProperty.mock.calls.length;
		hover(byId('solutions')!);

		await expect.poll(() => isVisible(byId('solutions-panel'))).toBe(true);
		await expect.poll(() => widthCalls(setProperty, '--popup-width', before)).toContain('500px');
		await expect.poll(() => popupRoot.style.getPropertyValue('--popup-width')).toBe('auto');

		const afterSwitch = widthCalls(setProperty, '--popup-width', before);
		expect(afterSwitch.slice(afterSwitch.indexOf('500px') + 1)).not.toContain('700px');
	});

	it('does not let interrupted mutation resizing reapply popup sizes after a later switch', async () => {
		render(NavigationMenuTriggerHarness, { variant: 'rapid' });

		hover(byId('product')!);

		await expect.poll(() => byId('popup-root')).not.toBeNull();
		const popupRoot = byId('popup-root')!;
		const positioner = popupRoot.parentElement as HTMLElement;
		const setProperty = vi.spyOn(positioner.style, 'setProperty');

		expect(
			await observeValue(() => popupRoot.style.getPropertyValue('--popup-width'), '700px')
		).toBe('700px');

		let popupWidth = 700;
		let popupHeight = 420;
		Object.defineProperty(popupRoot, 'offsetWidth', {
			configurable: true,
			get: () => popupWidth
		});
		Object.defineProperty(popupRoot, 'offsetHeight', {
			configurable: true,
			get: () => popupHeight
		});
		popupRoot.style.setProperty('--popup-width', '700px');
		popupRoot.style.setProperty('--popup-height', '420px');

		popupWidth = 760;
		popupHeight = 460;
		byId('expand')!.click();

		await expect.poll(() => widthCalls(setProperty, '--positioner-width')).toContain('760px');

		popupWidth = 500;
		popupHeight = 320;
		const before = setProperty.mock.calls.length;

		hover(byId('solutions')!);

		await expect.poll(() => isVisible(byId('solutions-panel'))).toBe(true);
		await expect
			.poll(() => widthCalls(setProperty, '--positioner-width', before))
			.toContain('500px');
		await expect.poll(() => positioner.style.getPropertyValue('--positioner-width')).toBe('500px');

		const afterSwitch = widthCalls(setProperty, '--positioner-width', before);
		expect(afterSwitch.slice(afterSwitch.indexOf('500px') + 1)).not.toContain('760px');
	});

	it('releases the pointer-events lock on the list when the open trigger unmounts', async () => {
		render(NavigationMenuTriggerHarness, { variant: 'drops' });
		const list = byId('list')!;

		hover(byId('trigger-a')!);
		await expect.poll(() => isVisible(byId('link-a'))).toBe(true);
		await expect.poll(() => list.style.pointerEvents).toBe('none');

		byId('navigate')!.click();

		await expect.poll(() => list.style.pointerEvents).toBe('');
	});

	it('releases the pointer-events lock when the pointer sweeps across a trigger without the menu opening', async () => {
		render(NavigationMenuTriggerHarness, { variant: 'sweep' });
		const list = byId('list')!;

		hover(byId('trigger-a')!);
		hover(document.body);

		await expect.poll(() => list.style.pointerEvents).toBe('');
		expect(byId('link-a')).toBeNull();
	});
});
