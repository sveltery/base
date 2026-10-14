// A handle trigger inside another menu's popup opens its own detached menu. The expected open
// states and reasons are what @base-ui/react 1.9.0 reports for the same tree and events, where
// packages/react/src/menu/trigger/MenuTrigger.tsx:67-68 prefers the handle's store and :92-105
// forwards the trigger's floating parent node to the menu it opens.
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Harness from '../../tests/menu/MenuHandleTriggerInPopupHarness.svelte';
import { clickElement } from '../../tests/menu/mouse.js';

function get(id: string) {
	const element = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`no ${id}`);
	return element;
}
const isOpen = (id: string) =>
	document.querySelector(`[data-testid="${id}"]`)?.hasAttribute('data-open') ?? false;

async function settle() {
	for (let i = 0; i < 3; i++) {
		await new Promise(requestAnimationFrame);
		await tick();
	}
}

describe('a handle trigger inside another menu', () => {
	it("opens the handle's menu, not the menu it sits in", async () => {
		const log: string[] = [];
		render(Harness, { log, scenario: 'menu' });
		clickElement(get('file-trigger'));
		await expect.poll(() => isOpen('file')).toBe(true);
		clickElement(get('more-trigger'));
		await expect.poll(() => isOpen('more')).toBe(true);
		await settle();
		expect({ file: isOpen('file'), log }).toEqual({
			file: true,
			log: ['file:open:trigger-press', 'more:open:trigger-press']
		});

		clickElement(get('more-item'));
		await expect.poll(() => isOpen('more')).toBe(false);
		expect({ file: isOpen('file'), log }).toEqual({
			file: false,
			log: [
				'file:open:trigger-press',
				'more:open:trigger-press',
				'file:close:outside-press',
				'more:close:item-press'
			]
		});
	});

	it('opens beside a menubar menu as its child, not as a sibling', async () => {
		const log: string[] = [];
		render(Harness, { log, scenario: 'menubar' });
		clickElement(get('file-trigger'));
		await expect.poll(() => isOpen('file')).toBe(true);
		clickElement(get('more-trigger'));
		await expect.poll(() => isOpen('more')).toBe(true);
		await settle();
		expect({ file: isOpen('file'), log }).toEqual({
			file: true,
			log: ['file:open:trigger-press', 'more:open:trigger-focus', 'more:open:trigger-press']
		});

		clickElement(get('more-item'));
		await expect.poll(() => isOpen('more')).toBe(false);
		expect({ file: isOpen('file'), close: log.slice(3) }).toEqual({
			file: false,
			// Upstream closes the menubar menu with `item-press`. Here the press reaches its outside-press
			// check, as that menu's dismiss reads the floating tree it was created in.
			close: ['file:close:outside-press', 'more:close:item-press']
		});
	});
});
