// What a menu root keeps when its trigger forwards data. The expected states and reasons are what
// @base-ui/react 1.9.0 reports for the same tree and events, where
// packages/react/src/menu/root/MenuRoot.tsx:283-300 re-applies a context menu root's own parent and
// ids, and gives any root its own ids while no trigger is active.
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ContextMenuWithMenuTriggerHarness from '../../tests/context-menu/ContextMenuWithMenuTriggerHarness.svelte';
import MenubarStaleTriggerHarness from '../../tests/menubar/MenubarStaleTriggerHarness.svelte';
import { clickElement } from '../../tests/menu/mouse.js';
import { Menu } from '#lib';

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

describe('trigger data forwarding', () => {
	it('keeps a context menu its own root when a menu trigger opens it', async () => {
		const log: string[] = [];
		render(ContextMenuWithMenuTriggerHarness, { log });
		clickElement(get('button'));
		await expect.poll(() => isOpen('ctx')).toBe(true);
		await new Promise((resolve) => setTimeout(resolve, 50));
		clickElement(get('blank'));
		await settle();
		expect({ ctx: isOpen('ctx'), log }).toEqual({
			ctx: true,
			log: ['ctx:open:trigger-press']
		});
	});

	it('gives a menu its own parent node once no trigger is active', async () => {
		const log: string[] = [];
		const file = Menu.createHandle();
		const more = Menu.createHandle();
		const ctl = $state({ show: true });
		render(MenubarStaleTriggerHarness, { log, file, more, ctl });
		clickElement(get('file-trigger'));
		await expect.poll(() => isOpen('file')).toBe(true);
		clickElement(get('more-trigger'));
		await expect.poll(() => isOpen('more')).toBe(true);
		more.close();
		await settle();
		file.close();
		await settle();
		ctl.show = false;
		await settle();

		const before = log.length;
		more.open(null);
		await expect.poll(() => isOpen('more')).toBe(true);
		file.open('file-trigger');
		await expect.poll(() => isOpen('file')).toBe(true);
		file.close();
		await expect.poll(() => isOpen('file')).toBe(false);
		await settle();
		expect({ more: isOpen('more'), log: log.slice(before) }).toEqual({
			more: true,
			log: [
				'more:open:imperative-action',
				'file:open:imperative-action',
				'file:close:imperative-action'
			]
		});
	});
});
