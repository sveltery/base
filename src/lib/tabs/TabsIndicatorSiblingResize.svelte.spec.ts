import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TabsHarness from '../../tests/TabsHarness.svelte';

describe('probe', () => {
	it('moves the indicator when a tab before the active one resizes (list width fixed)', async () => {
		render(TabsHarness, { passValue: true, value: 1, showIndicator: true });
		const indicator = page.getByTestId('indicator');
		const list = page.getByRole('tablist').element() as HTMLElement;
		list.style.width = '600px';
		list.style.display = 'flex';
		const read = () => indicator.element().style.getPropertyValue('--active-tab-left');
		await expect.poll(read).not.toBe('');
		await new Promise((r) => setTimeout(r, 100));
		const before = read();
		const first = page.getByRole('tab', { name: 'One' }).element() as HTMLElement;
		const active = page.getByRole('tab', { name: 'Two' }).element() as HTMLElement;
		const leftBefore = active.getBoundingClientRect().left;
		first.style.width = '200px';
		await new Promise((r) => setTimeout(r, 50));
		expect(active.getBoundingClientRect().left).not.toBeCloseTo(leftBefore, 0);
		await expect.poll(read, { timeout: 1000 }).not.toBe(before);
	});
});
