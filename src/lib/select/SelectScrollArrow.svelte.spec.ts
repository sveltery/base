// Assertions follow Base UI v1.9.0 packages/react/src/select/scroll-arrow/SelectScrollArrow.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { createAttachmentKey } from 'svelte/attachments';
import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { scrollGeometry } from '../../tests/select-events.js';
import SelectScrollArrowHarness from '../../tests/SelectScrollArrowHarness.svelte';

const DEFAULT_ITEM_OFFSETS = [0, 40, 80, 120, 160, 200, 240, 280, 320, 360];

function itemGeometry(offsets: number[], height: number) {
	return (index: number) => ({
		[createAttachmentKey()]: (node: HTMLElement) => {
			Object.defineProperty(node, 'offsetTop', { value: offsets[index], configurable: true });
			Object.defineProperty(node, 'offsetHeight', { value: height, configurable: true });
		}
	});
}

/** Collapses the arrows so their height does not shift the visible edge the target uses. */
async function collapseArrows() {
	await expect.element(page.getByTestId('down')).toBeInTheDocument();
	const downArrow = page.getByTestId('down').element() as HTMLElement;
	const upArrow = page.getByTestId('up').query() as HTMLElement | null;
	for (const arrow of [downArrow, upArrow]) {
		if (arrow) Object.defineProperty(arrow, 'offsetHeight', { value: 0, configurable: true });
	}
	vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
	return { downArrow, upArrow: upArrow! };
}

function hoverArrow(arrow: HTMLElement, direction: 'up' | 'down') {
	arrow.dispatchEvent(
		new MouseEvent('mousemove', {
			bubbles: true,
			movementX: 0,
			movementY: direction === 'down' ? 1 : -1
		})
	);
}

async function renderScrollableSelect(options: {
	initialScrollTop: number;
	scrollHeight?: number;
	clientHeight?: number;
	itemOffsets?: number[];
	itemHeight?: number;
}) {
	const {
		initialScrollTop,
		scrollHeight = 400,
		clientHeight = 200,
		itemOffsets = DEFAULT_ITEM_OFFSETS,
		itemHeight = 40
	} = options;
	let scrollTop = initialScrollTop;
	let scrollWrites = 0;

	render(SelectScrollArrowHarness, {
		scroller: scrollGeometry({
			scrollTop: {
				get: () => scrollTop,
				set: (next) => {
					scrollWrites += 1;
					scrollTop = next;
				}
			},
			scrollHeight,
			clientHeight
		}),
		items: itemOffsets.map((_, index) => `item-${index}`),
		itemProps: itemGeometry(itemOffsets, itemHeight)
	});

	return {
		...(await collapseArrows()),
		getScrollTop: () => scrollTop,
		getScrollWrites: () => scrollWrites
	};
}

async function renderPopupScroller(options: { initialScrollTop: number; withItems: boolean }) {
	let scrollTop = options.initialScrollTop;

	render(SelectScrollArrowHarness, {
		list: false,
		scroller: scrollGeometry({
			scrollTop: { get: () => scrollTop, set: (next) => (scrollTop = next) },
			scrollHeight: 400,
			clientHeight: 200
		}),
		items: options.withItems ? DEFAULT_ITEM_OFFSETS.map((_, index) => `item-${index}`) : [],
		itemProps: itemGeometry(DEFAULT_ITEM_OFFSETS, 40)
	});

	return { ...(await collapseArrows()), getScrollTop: () => scrollTop };
}

describe('Select.ScrollArrow', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it.each([
		{
			name: 'down arrow snaps hover scrolling to the true bottom when the remaining space is fractional',
			direction: 'down' as const,
			initialScrollTop: 19.5,
			scrollHeight: 100.5,
			clientHeight: 60,
			itemOffsets: [0, 40, 80],
			itemHeight: 20,
			expected: 40.5
		},
		{
			name: 'down arrow keeps advancing when the next item bottom is fractionally within the visible bottom',
			direction: 'down' as const,
			initialScrollTop: 71.81818389892578,
			scrollHeight: 598,
			clientHeight: 440,
			itemOffsets: [32, 64, 96, 128, 160, 192, 224, 256, 336, 368, 400, 432, 448, 480, 512, 544],
			itemHeight: 32,
			expected: 104
		},
		{
			name: 'down arrow scrolls to the bottom when trailing content extends past the last item',
			direction: 'down' as const,
			initialScrollTop: 390,
			scrollHeight: 600,
			clientHeight: 200,
			itemOffsets: DEFAULT_ITEM_OFFSETS,
			itemHeight: 40,
			expected: 400
		},
		{
			name: 'up arrow keeps advancing when the previous item top is fractionally within the visible top',
			direction: 'up' as const,
			initialScrollTop: 72.18181610107422,
			scrollHeight: 598,
			clientHeight: 440,
			itemOffsets: [32, 71.5, 110, 142],
			itemHeight: 32,
			expected: 32
		},
		{
			name: 'up arrow scrolls to the very top when no earlier item remains to land on',
			direction: 'up' as const,
			initialScrollTop: 100,
			scrollHeight: 600,
			clientHeight: 200,
			itemOffsets: [300, 340, 380],
			itemHeight: 40,
			expected: 0
		}
	])('$name', async ({ direction, expected, ...geometry }) => {
		const { downArrow, upArrow, getScrollTop } = await renderScrollableSelect(geometry);

		hoverArrow(direction === 'down' ? downArrow : upArrow, direction);
		vi.advanceTimersByTime(40);

		expect(getScrollTop()).toBe(expected);
	});

	it('does not start auto-scrolling for a mouse move that did not move the pointer', async () => {
		const { downArrow, getScrollTop } = await renderScrollableSelect({ initialScrollTop: 0 });

		downArrow.dispatchEvent(
			new MouseEvent('mousemove', { bubbles: true, movementX: 0, movementY: 0 })
		);
		vi.advanceTimersByTime(400);

		expect(getScrollTop()).toBe(0);
	});

	it('does not let continuous pointer movement postpone the scheduled scroll', async () => {
		const { downArrow, getScrollTop } = await renderScrollableSelect({ initialScrollTop: 0 });

		downArrow.dispatchEvent(
			new MouseEvent('mousemove', { bubbles: true, movementX: 0, movementY: 1 })
		);
		vi.advanceTimersByTime(30);
		downArrow.dispatchEvent(
			new MouseEvent('mousemove', { bubbles: true, movementX: 1, movementY: 1 })
		);
		vi.advanceTimersByTime(15);

		expect(getScrollTop()).toBe(40);
	});

	it('stops auto-scrolling once the pointer leaves the arrow', async () => {
		const { downArrow, getScrollTop } = await renderScrollableSelect({ initialScrollTop: 0 });

		hoverArrow(downArrow, 'down');
		vi.advanceTimersByTime(40);
		expect(getScrollTop()).toBe(40);

		downArrow.dispatchEvent(new MouseEvent('mouseleave'));
		vi.advanceTimersByTime(400);

		expect(getScrollTop()).toBe(40);
	});

	it('snaps a sub-pixel offset to the exact top edge and then stops scrolling', async () => {
		const { upArrow, getScrollTop, getScrollWrites } = await renderScrollableSelect({
			initialScrollTop: 0.4
		});

		hoverArrow(upArrow, 'up');
		vi.advanceTimersByTime(40);
		expect(getScrollTop()).toBe(0);
		const writesAtEdge = getScrollWrites();

		vi.advanceTimersByTime(400);

		expect(getScrollTop()).toBe(0);
		expect(getScrollWrites()).toBe(writesAtEdge);
	});

	it('scrolls the popup itself when no Select.List is rendered', async () => {
		const { downArrow, getScrollTop } = await renderPopupScroller({
			initialScrollTop: 0,
			withItems: true
		});

		hoverArrow(downArrow, 'down');
		vi.advanceTimersByTime(40);

		expect(getScrollTop()).toBe(40);
	});

	it.each(['up' as const, 'down' as const])(
		'reflects scrollability on the %s arrow when the popup has no registered items',
		async (direction) => {
			const { downArrow, upArrow } = await renderPopupScroller({
				initialScrollTop: 100,
				withItems: false
			});
			const arrow = direction === 'down' ? downArrow : upArrow;

			hoverArrow(arrow, direction);
			vi.advanceTimersByTime(40);
			vi.useRealTimers();

			await expect.element(arrow).toHaveAttribute('data-visible');
		}
	);

	it('hides the arrow when an item-less popup is already scrolled to its edge', async () => {
		const { downArrow } = await renderPopupScroller({ initialScrollTop: 200, withItems: false });

		hoverArrow(downArrow, 'down');
		vi.advanceTimersByTime(40);
		vi.useRealTimers();

		await expect.element(downArrow).not.toHaveAttribute('data-visible');
	});

	it('ignores pointer interaction when the arrow has no scrollable popup', async () => {
		render(SelectScrollArrowHarness, { popup: false });
		const { downArrow } = await collapseArrows();

		hoverArrow(downArrow, 'down');

		expect(() => vi.advanceTimersByTime(400)).not.toThrow();
	});
});
