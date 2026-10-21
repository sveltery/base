import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CompositeClaimHarness from '../../tests/CompositeClaimHarness.svelte';
import CompositeRootHarness from '../../tests/CompositeRootHarness.svelte';
import CompositeScrollHarness from '../../tests/CompositeScrollHarness.svelte';

function stops(role: string) {
	return [...document.querySelectorAll(`[role="${role}"]`)].filter(
		(element) => element.getAttribute('tabindex') === '0'
	);
}

describe('composite root', () => {
	it('follows DOM order after a keyed reorder', async () => {
		render(CompositeRootHarness, { scenario: 'reorder' });
		const item = (name: string) => page.getByRole('button', { name, exact: true }).element();
		item('a').focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(item('b'));

		await userEvent.click(page.getByRole('button', { name: 'Reverse' }).element());
		item('a').focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(item('c'));
	});

	it('moves the radio tab stop when the parent changes the value', async () => {
		render(CompositeRootHarness, { scenario: 'radio-external' });
		await userEvent.click(page.getByRole('button', { name: 'Set B' }).element());
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(page.getByRole('radio', { name: 'B' }).element());
	});

	it('keeps one tab stop after every tab remounts', async () => {
		render(CompositeRootHarness, { scenario: 'tabs-remount' });
		expect(stops('tab')).toHaveLength(1);
		expect(stops('tab')[0]?.textContent).toBe('B');
		const toggle = page.getByRole('button', { name: 'Toggle tabs' }).element();
		await userEvent.click(toggle);
		expect(document.querySelectorAll('[role="tab"]')).toHaveLength(0);
		await userEvent.click(toggle);
		expect(stops('tab')).toHaveLength(1);
	});

	it('registers a tab once when disabled changes', async () => {
		render(CompositeRootHarness, { scenario: 'tabs-register' });
		const count = page.getByTestId('registrations');
		await expect.element(count).toHaveTextContent('2');
		await userEvent.click(page.getByRole('button', { name: 'Disable A' }).element());
		await expect
			.element(page.getByRole('tab', { name: 'A' }))
			.toHaveAttribute('aria-disabled', 'true');
		await expect.element(count).toHaveTextContent('2');
	});

	it('does not activate a toolbar link from Space', async () => {
		render(CompositeRootHarness, { scenario: 'toolbar-link' });
		page.getByRole('link', { name: 'Docs' }).element().focus();
		await userEvent.keyboard('{Space}');
		await expect.element(page.getByTestId('clicks')).toHaveTextContent('0');
	});

	it('makes a new enabled item the stop after the only enabled item leaves and its index is reused', async () => {
		render(CompositeClaimHarness);
		await userEvent.click(page.getByRole('button', { name: 'Leave' }));
		expect(JSON.parse(page.getByTestId('report').element().textContent ?? '{}')).toEqual({
			indexC: 2,
			indexD: 2,
			tab: 0
		});
	});

	it('keeps the tab stop on an item whose element is replaced', async () => {
		render(CompositeClaimHarness);
		await userEvent.click(page.getByRole('button', { name: 'Swap' }));
		expect(JSON.parse(page.getByTestId('report').element().textContent ?? '{}')).toEqual({
			tab: -1
		});
	});

	it('keeps the selection when a change handler flushes the value write', async () => {
		render(CompositeRootHarness, { scenario: 'radio-flush' });
		await userEvent.click(page.getByRole('radio', { name: 'A' }).element());
		await expect.element(page.getByRole('radio', { name: 'A' })).toBeChecked();
		expect(JSON.parse(page.getByTestId('flush').element().textContent ?? '[]')).toEqual(['a']);
	});
});

describe('composite root scroll into view', () => {
	const list = () => page.getByTestId('list').element() as HTMLElement;

	async function scrollAfter(key: string) {
		await userEvent.keyboard(key);
		return list().scrollLeft;
	}

	it('aligns the edge of a keyboard-highlighted tab with the scrolled list', async () => {
		render(CompositeScrollHarness, { scenario: 'tabs' });
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement?.textContent).toBe('0');

		expect(await scrollAfter('{ArrowRight}')).toBe(0);
		expect(await scrollAfter('{ArrowRight}')).toBe(50);
		expect(await scrollAfter('{End}')).toBe(400);
		expect(await scrollAfter('{ArrowLeft}')).toBe(400);
		expect(await scrollAfter('{Home}')).toBe(0);
	});

	it('scrolls toward the inline start in a right-to-left list', async () => {
		render(CompositeScrollHarness, { scenario: 'tabs', direction: 'rtl' });
		await userEvent.keyboard('{Tab}');

		expect(await scrollAfter('{ArrowLeft}')).toBe(0);
		expect(await scrollAfter('{ArrowLeft}')).toBe(-50);
		expect(await scrollAfter('{End}')).toBe(-400);
	});

	it('reveals the selected tab when the list mounts', async () => {
		render(CompositeScrollHarness, { scenario: 'tabs', value: 9 });
		await expect.poll(() => list().scrollLeft).toBe(400);
	});

	it('mounts selected tabs, radios and toggles where elements have no scrollTo', async () => {
		const scrollTo = Element.prototype.scrollTo;
		// @ts-expect-error removes a required method to stand in for jsdom
		delete Element.prototype.scrollTo;
		try {
			render(CompositeScrollHarness, { scenario: 'selected' });
			await expect
				.element(page.getByRole('tab', { name: '9' }))
				.toHaveAttribute('aria-selected', 'true');
			await expect.element(page.getByRole('radio', { name: '9' })).toBeChecked();
			await expect
				.element(page.getByRole('button', { name: '9' }))
				.toHaveAttribute('aria-pressed', 'true');
		} finally {
			Element.prototype.scrollTo = scrollTo;
		}
	});

	it('scrolls the toolbar and not the toggle group inside it', async () => {
		render(CompositeScrollHarness, { scenario: 'toolbar-toggle-group' });
		const group = page.getByTestId('group').element();
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement?.textContent).toBe('0');

		expect(await scrollAfter('{ArrowRight}')).toBe(0);
		expect(await scrollAfter('{ArrowRight}')).toBe(50);
		expect(await scrollAfter('{ArrowRight}')).toBe(100);
		expect(group.scrollLeft).toBe(0);
	});

	it('keeps the scroll padding of the list clear of the highlighted tab', async () => {
		render(CompositeScrollHarness, { scenario: 'tabs', listStyle: 'scroll-padding: 0 20px;' });
		await userEvent.keyboard('{Tab}');

		expect(await scrollAfter('{ArrowRight}')).toBe(20);
		expect(await scrollAfter('{ArrowRight}')).toBe(70);
		expect(await scrollAfter('{End}')).toBe(400);
		expect(await scrollAfter('{ArrowLeft}')).toBe(380);
	});

	it('keeps the scroll margin of the tab clear of the list edge', async () => {
		render(CompositeScrollHarness, { scenario: 'tabs', itemStyle: 'scroll-margin: 0 10px;' });
		await userEvent.keyboard('{Tab}');

		expect(await scrollAfter('{ArrowRight}')).toBe(10);
		expect(await scrollAfter('{ArrowRight}')).toBe(60);
		expect(await scrollAfter('{End}')).toBe(400);
		expect(await scrollAfter('{ArrowLeft}')).toBe(390);
	});

	it('checks the start edge first in a right-to-left list when a tab fills the room inside the padding', async () => {
		render(CompositeScrollHarness, {
			scenario: 'tabs',
			direction: 'rtl',
			listStyle: 'scroll-padding: 0 40px;'
		});
		await userEvent.keyboard('{Tab}');
		list().scrollLeft = -15;

		expect(await scrollAfter('{ArrowLeft}')).toBe(-40);
	});

	it('scrolls a vertical list on the block axis only', async () => {
		render(CompositeScrollHarness, { scenario: 'toggle-group' });
		await userEvent.keyboard('{Tab}');

		await userEvent.keyboard('{ArrowDown}{ArrowDown}');
		expect([list().scrollTop, list().scrollLeft]).toEqual([50, 0]);
		await userEvent.keyboard('{End}');
		expect(list().scrollTop).toBe(400);
	});
});

describe('composite root text fields', () => {
	it('lets arrows move the caret in a text field inside a radio group until it reaches the edge', async () => {
		render(CompositeScrollHarness, { scenario: 'radio-input' });
		const input = page.getByTestId('other').element() as HTMLInputElement;

		input.focus();
		expect([input.selectionStart, input.selectionEnd]).toEqual([0, 4]);

		input.setSelectionRange(2, 2);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(input);
		expect(input.selectionStart).toBe(3);

		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(input);
		expect(input.selectionStart).toBe(4);

		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(page.getByRole('radio', { name: 'b' }).element());
	});
});
