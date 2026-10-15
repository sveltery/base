// The expected focus and scroll positions are what @base-ui/react 1.9.0 reports for the same
// menubar and keys. Its Menubar renders a CompositeRoot (menubar/Menubar.tsx:78), which scrolls the
// highlighted item into view (internals/composite/root/useCompositeRoot.ts:106).
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenubarScrollHarness from '../../tests/menubar/MenubarScrollHarness.svelte';

describe('Menubar scroll into view', () => {
	const menubar = () => page.getByTestId('menubar').element() as HTMLElement;

	async function scrollAfter(key: string) {
		await userEvent.keyboard(key);
		return [document.activeElement?.textContent?.trim(), menubar().scrollLeft];
	}

	it('keeps the scroll padding clear of the highlighted trigger', async () => {
		render(MenubarScrollHarness, { style: 'scroll-padding: 0 20px;' });
		await userEvent.keyboard('{Tab}');

		expect(await scrollAfter('{ArrowRight}')).toEqual(['1', 20]);
		expect(await scrollAfter('{ArrowRight}')).toEqual(['2', 70]);
		expect(await scrollAfter('{End}')).toEqual(['9', 400]);
		expect(await scrollAfter('{ArrowLeft}')).toEqual(['8', 380]);
	});
});
