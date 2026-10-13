// Assertions follow Base UI v1.9.0 packages/react/src/navigation-menu/{arrow,backdrop,icon,item,list,popup,portal,positioner,viewport}/*.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: `ref` and `className` function conformance (Svelte has `bind:this` and `class`),
// and the positioner test that spies on the anchor positioning hook's arguments.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NavigationMenuMissingHarness from '../../tests/NavigationMenuMissingHarness.svelte';
import NavigationMenuPartHarness from '../../tests/NavigationMenuPartHarness.svelte';
import { byId, settlePositioning } from '../../tests/previewCardEvents.js';

const PARTS = [
	'root',
	'list',
	'item',
	'trigger',
	'icon',
	'content',
	'link',
	'portal',
	'backdrop',
	'positioner',
	'popup',
	'arrow',
	'viewport'
] as const;

const TAGS: Record<(typeof PARTS)[number], string> = {
	root: 'NAV',
	list: 'UL',
	item: 'LI',
	trigger: 'BUTTON',
	icon: 'SPAN',
	content: 'DIV',
	link: 'A',
	portal: 'DIV',
	backdrop: 'DIV',
	positioner: 'DIV',
	popup: 'NAV',
	arrow: 'DIV',
	viewport: 'DIV'
};

afterEach(settlePositioning);

function part() {
	return byId('part');
}

describe.each(PARTS)('NavigationMenu.%s host element', (name) => {
	it('renders its default element', async () => {
		render(NavigationMenuPartHarness, { part: name });
		await expect.poll(part).not.toBeNull();
		expect(part()!.tagName).toBe(TAGS[name]);
	});

	it('forwards class, attributes and attachments', async () => {
		render(NavigationMenuPartHarness, { part: name });
		await expect.poll(part).not.toBeNull();

		const element = part()!;
		expect(element.classList.contains('probe')).toBe(true);
		expect(element.getAttribute('data-probe')).toBe('probe');
		expect(element.dataset.attached).toBe('yes');
	});

	it('applies a render snippet', async () => {
		render(NavigationMenuPartHarness, { part: name, variant: 'render' });
		await expect.poll(part).not.toBeNull();

		const element = part()!;
		expect(element.tagName).toBe('DIV');
		expect(element.hasAttribute('data-replacement')).toBe(true);
		expect(element.classList.contains('probe')).toBe(true);
		expect(element.getAttribute('data-probe')).toBe('probe');
		expect(element.dataset.attached).toBe('yes');
	});
});

describe('missing context', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it.each([
		[
			'NavigationMenu.List outside NavigationMenu.Root',
			'list-without-root',
			'Base UI: NavigationMenuRootContext is missing. Navigation Menu parts must be placed within <NavigationMenu.Root>.'
		],
		[
			'NavigationMenu.Icon outside NavigationMenu.Item',
			'icon-without-item',
			'Base UI: NavigationMenuItem parts must be used within a <NavigationMenu.Item>.'
		],
		[
			'NavigationMenu.Arrow outside NavigationMenu.Positioner',
			'arrow-without-positioner',
			'Base UI: NavigationMenuPositionerContext is missing. NavigationMenuPositioner parts must be placed within <NavigationMenu.Positioner>.'
		],
		[
			'NavigationMenu.Positioner outside NavigationMenu.Portal',
			'positioner-without-portal',
			'Base UI: <NavigationMenu.Portal> is missing.'
		]
	] as const)('throws a descriptive error for %s', (_name, scenario, message) => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => render(NavigationMenuMissingHarness, { case: scenario })).toThrow(message);
	});
});
