// Assertions follow Base UI v1.9.0 packages/react/src/preview-card/positioner/PreviewCardPositioner.test.tsx
// and packages/react/test/positionerConformanceTests.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: the cases that assert `transform: translate(...)` on the positioner, because this
// positioner always uses `top` and `left`; the offset, collision and Viewport cases assert the
// resulting rectangle instead.
import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PreviewCardMultilineHarness from '../../tests/PreviewCardMultilineHarness.svelte';
import PreviewCardPositionerHarness from '../../tests/PreviewCardPositionerHarness.svelte';
import { byId, leave, settlePositioning } from '../../tests/previewCardEvents.js';

const anchorWidth = 72;
const anchorHeight = 36;
const popupWidth = 52;
const baselineX = (anchorWidth - popupWidth) / 2;
const baselineY = anchorHeight;

afterEach(settlePositioning);

function expectWithin(actual: number, expected: number, tolerance = 2) {
	expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

function hoverAt(element: Element, clientX: number, clientY: number) {
	element.dispatchEvent(new MouseEvent('mouseenter', { clientX, clientY }));
	element.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY, bubbles: true }));
}

function offsetFromTrigger() {
	const positioner = byId('positioner')!.getBoundingClientRect();
	const trigger = byId('trigger')!.getBoundingClientRect();
	return { x: positioner.x - trigger.x, y: positioner.y - trigger.y };
}

async function placed() {
	await expect.poll(() => byId('positioner')?.style.opacity).toBe('');
}

describe.each([
	{
		prop: 'sideOffset' as const,
		numberPosition: (offset: number) => ({ x: baselineX, y: baselineY + offset }),
		offsetFunction: (data: { positioner: { width: number }; anchor: { width: number } }) =>
			data.positioner.width + data.anchor.width,
		functionPosition: { x: baselineX, y: baselineY + popupWidth + anchorWidth }
	},
	{
		prop: 'alignOffset' as const,
		numberPosition: (offset: number) => ({ x: baselineX + offset, y: baselineY }),
		offsetFunction: (data: { positioner: { width: number } }) => data.positioner.width,
		functionPosition: { x: baselineX + popupWidth, y: baselineY }
	}
])(
	'PreviewCard.Positioner prop: $prop',
	({ prop, numberPosition, offsetFunction, functionPosition }) => {
		it('offsets the positioner when a number is specified', async () => {
			render(PreviewCardPositionerHarness, { [prop]: 7 });
			await placed();

			const { x, y } = numberPosition(7);
			expect(offsetFromTrigger()).toMatchObject({ x, y });
		});

		it('offsets the positioner when a function is specified', async () => {
			render(PreviewCardPositionerHarness, { [prop]: offsetFunction });
			await placed();

			expect(offsetFromTrigger()).toMatchObject(functionPosition);
		});

		it.each([
			{
				description: 'the latest side after a flip',
				positioner: { side: 'left' as const },
				key: 'side' as const,
				direction: 'ltr' as const,
				expected: 'right'
			},
			{
				description: 'the latest align after a flip',
				positioner: { side: 'right' as const, align: 'start' as const },
				key: 'align' as const,
				direction: 'ltr' as const,
				expected: 'end'
			},
			{
				description: 'the logical side after a flip',
				positioner: { side: 'inline-start' as const },
				key: 'side' as const,
				direction: 'ltr' as const,
				expected: 'inline-end'
			},
			{
				description: 'the logical side in RTL mode',
				positioner: { side: 'inline-start' as const },
				key: 'side' as const,
				direction: 'rtl' as const,
				expected: 'inline-start'
			}
		])(
			'reads $description inside the function',
			async ({ positioner, key, direction, expected }) => {
				let value = 'none';
				const read = (data: { side: string; align: string }) => {
					value = data[key];
					return 0;
				};
				render(PreviewCardPositionerHarness, { ...positioner, direction, [prop]: read });
				await placed();

				expect(value).toBe(expected);
				expect(byId('positioner')!.getAttribute(`data-${key}`)).toBe(expected);
			}
		);
	}
);

describe('PreviewCard.Positioner collisions', () => {
	it('rests exactly at collisionPadding from the colliding edge', async () => {
		const collisionPadding = 12;
		const view = render(PreviewCardPositionerHarness, {
			open: false,
			fixedBottom: true,
			side: 'bottom',
			sideOffset: 8,
			collisionPadding,
			collisionAvoidance: { fallbackAxisSide: 'none' },
			popupStyle: 'width: 200px; height: 1000px; max-height: var(--available-height)'
		});

		await view.rerender({
			open: true,
			fixedBottom: true,
			side: 'bottom',
			sideOffset: 8,
			collisionPadding,
			collisionAvoidance: { fallbackAxisSide: 'none' },
			popupStyle: 'width: 200px; height: 1000px; max-height: var(--available-height)'
		});

		await expect.poll(() => byId('positioner')?.getAttribute('data-side')).toBe('top');
		await expect
			.poll(() => Math.round(byId('positioner')!.getBoundingClientRect().top))
			.toBe(collisionPadding);
	});
});

describe('PreviewCard.Positioner with Viewport', () => {
	function positionedBy(positioner: HTMLElement) {
		const trigger = byId('trigger')!.getBoundingClientRect();
		const rect = positioner.getBoundingClientRect();
		return { x: rect.x - trigger.x, y: rect.y - trigger.y };
	}

	it('keeps the position when a Viewport mounts and unmounts', async () => {
		const view = render(PreviewCardPositionerHarness, { viewport: false });
		await placed();
		const positioner = byId('positioner')!;
		expect(positionedBy(positioner)).toMatchObject({ x: baselineX, y: baselineY });

		await view.rerender({ viewport: true });
		await expect.poll(() => positioner.style.left).not.toBe('');
		expect(positioner.style.transform).toBe('');
		expect(positionedBy(positioner)).toMatchObject({ x: baselineX, y: baselineY });

		await view.rerender({ viewport: false });
		await expect.poll(() => positionedBy(positioner)).toMatchObject({ x: baselineX, y: baselineY });
	});
});

describe('PreviewCard.Positioner multiline inline trigger', () => {
	beforeEach(() => {
		document.documentElement.style.height = '';
	});

	afterEach(() => {
		window.scrollTo(0, 0);
		document.documentElement.style.height = '';
		document.body.style.height = '';
		document.body.style.margin = '';
	});

	function lines() {
		const rects = byId('trigger')!.getClientRects();
		expect(rects.length).toBeGreaterThan(2);
		return rects;
	}

	function center(rect: DOMRect) {
		return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
	}

	function hoverLine(rect: DOMRect) {
		const { x, y } = center(rect);
		hoverAt(byId('trigger')!, x, y);
	}

	function positionerY() {
		return byId('positioner')?.getBoundingClientRect().y ?? Number.NaN;
	}

	it('positions the popup relative to the hovered line of a multiline trigger', async () => {
		render(PreviewCardMultilineHarness, { scenario: 'uncontrolled' });
		const secondLine = lines()[1];

		hoverLine(secondLine);

		await expect.poll(() => byId('positioner')).not.toBeNull();
		await expect
			.poll(() => Math.abs(positionerY() - (secondLine.bottom + 5)))
			.toBeLessThanOrEqual(2);

		const { x } = byId('positioner')!.getBoundingClientRect();
		expect(x).toBeGreaterThanOrEqual(secondLine.left - 10);
		expect(x).toBeLessThanOrEqual(secondLine.right + 10);
	});

	describe('with delayed opening', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('uses the latest hovered line', async () => {
			render(PreviewCardMultilineHarness, { scenario: 'uncontrolled', delay: 100 });
			const [firstLine, secondLine] = lines();
			const trigger = byId('trigger')!;
			const first = center(firstLine);
			const second = center(secondLine);

			hoverAt(trigger, first.x, first.y);
			trigger.dispatchEvent(
				new MouseEvent('mousemove', { clientX: second.x, clientY: second.y, bubbles: true })
			);

			expect(byId('positioner')).toBeNull();

			await vi.advanceTimersByTimeAsync(100);
			await vi.advanceTimersByTimeAsync(100);

			expectWithin(positionerY(), secondLine.bottom + 5);
		});
	});

	it('keeps the popup aligned after page scroll', async () => {
		document.documentElement.style.height = '4000px';
		document.body.style.height = '4000px';
		document.body.style.margin = '0';
		render(PreviewCardMultilineHarness, { scenario: 'uncontrolled' });

		window.scrollTo(0, 1000);
		await expect.poll(() => window.scrollY).toBe(1000);
		const secondLine = lines()[1];

		hoverLine(secondLine);

		await expect.poll(() => byId('positioner')).not.toBeNull();
		await expect
			.poll(() => Math.abs(positionerY() - (secondLine.bottom + 5)))
			.toBeLessThanOrEqual(2);

		const { x } = byId('positioner')!.getBoundingClientRect();
		expect(x).toBeGreaterThanOrEqual(secondLine.left - 10);
		expect(x).toBeLessThanOrEqual(secondLine.right + 10);
	});

	it('stays anchored to the opened line while already open', async () => {
		let updates = 0;
		render(PreviewCardMultilineHarness, {
			scenario: 'uncontrolled',
			sideOffset: () => {
				updates += 1;
				return 5;
			}
		});
		const [firstLine, secondLine] = lines();

		hoverLine(firstLine);
		await expect
			.poll(() => Math.abs(positionerY() - (firstLine.bottom + 5)))
			.toBeLessThanOrEqual(2);
		const updatesBeforeReentry = updates;

		leave(byId('trigger')!);
		hoverLine(secondLine);

		window.dispatchEvent(new Event('resize'));
		await expect.poll(() => updates).toBeGreaterThan(updatesBeforeReentry);

		expectWithin(positionerY(), firstLine.bottom + 5);
	});

	it('re-anchors to a newly entered line while reopening during the close transition', async () => {
		const style = document.createElement('style');
		style.textContent = `
			@keyframes pc-inline-reentry { from { opacity: 1; } to { opacity: 0.01; } }
			[data-testid="popup"][data-ending-style] {
				animation: pc-inline-reentry 1000ms linear forwards;
			}
		`;
		document.head.append(style);
		try {
			render(PreviewCardMultilineHarness, { scenario: 'uncontrolled', closeDelay: 0 });
			const [firstLine, secondLine] = lines();
			const trigger = byId('trigger')!;

			hoverLine(firstLine);
			await expect
				.poll(() => Math.abs(positionerY() - (firstLine.bottom + 5)))
				.toBeLessThanOrEqual(2);

			leave(trigger);
			await expect.poll(() => byId('popup')?.hasAttribute('data-ending-style')).toBe(true);

			const second = center(secondLine);
			trigger.dispatchEvent(
				new MouseEvent('mousemove', { clientX: second.x, clientY: second.y, bubbles: true })
			);
			trigger.dispatchEvent(new MouseEvent('mouseenter', { clientX: second.x, clientY: second.y }));

			await expect
				.poll(() => Math.abs(positionerY() - (secondLine.bottom + 5)))
				.toBeLessThanOrEqual(2);
		} finally {
			style.remove();
		}
	});

	it('positions the popup relative to the side-aligned rect when open is controlled', async () => {
		render(PreviewCardMultilineHarness, { scenario: 'uncontrolled', open: true });
		const rects = byId('trigger')!.getClientRects();
		expect(rects.length).toBeGreaterThan(1);
		const target = rects[rects.length - 1];

		await expect.poll(() => byId('positioner')).not.toBeNull();
		await expect.poll(() => Math.abs(positionerY() - (target.bottom + 5))).toBeLessThanOrEqual(2);

		const { x } = byId('positioner')!.getBoundingClientRect();
		expect(x).toBeGreaterThanOrEqual(target.left - 10);
		expect(x).toBeLessThanOrEqual(target.right + 10);
	});

	it('clears hovered-line coords after close before a controlled reopen of the same trigger', async () => {
		render(PreviewCardMultilineHarness, { scenario: 'controlled-buttons' });
		const rects = lines();
		const secondLine = rects[1];

		hoverLine(secondLine);
		const positioner = () => byId('positioner')!;
		await expect
			.poll(() => Math.abs(positionerY() - (secondLine.bottom + 5)))
			.toBeLessThanOrEqual(2);

		await page.getByRole('button', { name: 'Close' }).click();
		await expect.poll(() => positioner().hasAttribute('hidden')).toBe(true);

		await page.getByRole('button', { name: 'Open' }).click();

		const target = rects[rects.length - 1];
		await expect.poll(() => positioner().hasAttribute('hidden')).toBe(false);
		await expect.poll(() => Math.abs(positionerY() - (target.bottom + 5))).toBeLessThanOrEqual(2);
	});

	it('ignores stale hovered coords when a controlled trigger switch reuses the popup', async () => {
		render(PreviewCardMultilineHarness, { scenario: 'switch' });
		const trigger1 = byId('trigger-1')!;
		const trigger2 = byId('trigger-2')!;
		mockClientRects(trigger1, [
			{ left: 180, top: 0, right: 220, bottom: 10, width: 40, height: 10 },
			{ left: 100, top: 20, right: 160, bottom: 30, width: 60, height: 10 }
		]);
		mockClientRects(trigger2, [
			{ left: 180, top: 100, right: 220, bottom: 110, width: 40, height: 10 },
			{ left: 100, top: 120, right: 160, bottom: 130, width: 60, height: 10 }
		]);

		hoverAt(trigger1, 200, 5);
		await expect.poll(() => byId('positioner')).not.toBeNull();

		await page.getByRole('button', { name: 'Switch' }).click();

		await expect.poll(() => Math.abs(positionerY() - 135)).toBeLessThanOrEqual(2);
		const { x } = byId('positioner')!.getBoundingClientRect();
		expect(x).toBeGreaterThanOrEqual(90);
		expect(x).toBeLessThanOrEqual(170);
	});

	it('uses the hovered line with a custom anchor in a clipped keepMounted portal', async () => {
		document.body.style.margin = '0';
		render(PreviewCardMultilineHarness, { scenario: 'custom-anchor' });
		const container = byId('portal-container')!;
		const trigger = byId('trigger')!;
		const positioner = byId('positioner')!;
		mockClientRects(trigger, [
			{ left: 180, top: 80, right: 220, bottom: 90, width: 40, height: 10 },
			{ left: 0, top: 100, right: 60, bottom: 110, width: 60, height: 10 }
		]);

		hoverAt(trigger, 30, 105);

		await expect.poll(() => positioner.hasAttribute('hidden')).toBe(false);
		expect(container.contains(positioner)).toBe(true);
		await expect.poll(() => positioner.getAttribute('data-side')).toBe('top');
		await expect
			.poll(() => Math.abs(positioner.getBoundingClientRect().y - 55))
			.toBeLessThanOrEqual(2);
	});

	it('positions the popup relative to the side-aligned rect when opened via focus', async () => {
		render(PreviewCardMultilineHarness, { scenario: 'focus', side: 'top' });
		const target = lines()[0];
		const expectedY = target.top - 40 - 5;

		await userEvent.keyboard('{Tab}');

		await expect.poll(() => byId('positioner')).not.toBeNull();
		await expect.poll(() => Math.abs(positionerY() - expectedY)).toBeLessThanOrEqual(2);

		const { x } = byId('positioner')!.getBoundingClientRect();
		expect(x).toBeGreaterThanOrEqual(target.left - 10);
		expect(x).toBeLessThanOrEqual(target.right + 10);
	});

	it('clears hovered-line coords when opened via focus', async () => {
		render(PreviewCardMultilineHarness, { scenario: 'focus-controlled', side: 'top' });
		const rects = lines();
		hoverLine(rects[1]);

		const expectedY = rects[0].top - 40 - 5;
		await userEvent.keyboard('{Tab}');

		await expect.poll(() => byId('positioner')?.hasAttribute('hidden')).toBe(false);
		await expect.poll(() => Math.abs(positionerY() - expectedY)).toBeLessThanOrEqual(2);
	});
});

interface RectLike {
	left: number;
	top: number;
	right: number;
	bottom: number;
	width: number;
	height: number;
}

function mockClientRects(element: Element, rects: RectLike[]) {
	const left = Math.min(...rects.map((rect) => rect.left));
	const top = Math.min(...rects.map((rect) => rect.top));
	const right = Math.max(...rects.map((rect) => rect.right));
	const bottom = Math.max(...rects.map((rect) => rect.bottom));
	const boundingRect = DOMRect.fromRect({
		x: left,
		y: top,
		width: right - left,
		height: bottom - top
	});

	Object.defineProperty(element, 'getClientRects', {
		configurable: true,
		value: () =>
			rects.map((rect) =>
				DOMRect.fromRect({ x: rect.left, y: rect.top, width: rect.width, height: rect.height })
			)
	});
	Object.defineProperty(element, 'getBoundingClientRect', {
		configurable: true,
		value: () => boundingRect
	});
}
