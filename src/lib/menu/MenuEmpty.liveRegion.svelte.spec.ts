// Assertions follow Base UI v1.9.0 packages/react/src/internals/useInitialLiveRegionTextMutation.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MenuEmptyHarness from '../../tests/menu/MenuEmptyHarness.svelte';

const MARKER = '\u2060';
const RESET_DELAY = 200;

function status() {
	return document.querySelector<HTMLElement>('[data-testid="status"]');
}

function textNodes(root: Node) {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	const nodes: Text[] = [];
	while (walker.nextNode()) nodes.push(walker.currentNode as Text);
	return nodes;
}

async function showEmpty(props: { trailing?: string } = {}) {
	render(MenuEmptyHarness, props);
	expect(status()).toBe(null);
	const input = page.getByRole('searchbox', { name: 'Filter actions' });
	await userEvent.type(input, 'zzz');
	await expect.poll(status).not.toBe(null);
	return status()!;
}

describe('Menu.Empty initial live-region text', () => {
	it('marks the text when the message appears after mount', async () => {
		const element = await showEmpty();
		expect(element.textContent).toBe(`No matches${MARKER}`);
		await expect.poll(() => element.textContent).toBe('No matches');
	});

	it('skips empty text nodes when finding the announcement text', async () => {
		const element = await showEmpty({ trailing: '' });
		const nodes = textNodes(element);
		expect(nodes.map((node) => node.data)).toEqual([`No matches${MARKER}`, '']);
	});

	it('does not overwrite text that changes before the reset', async () => {
		const element = await showEmpty();
		const [text] = textNodes(element).filter((node) => node.data !== '');
		text.nodeValue = 'Updated';
		await new Promise((resolve) => setTimeout(resolve, RESET_DELAY + 50));
		expect(element.textContent).toBe('Updated');
	});
});
