// Assertions follow Base UI v1.9.0 packages/react/src/drawer/viewport/DrawerViewport.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Not ported: describeConformance, which no spec in this port runs, the portaled Combobox case
// (this port has no Combobox), and the touch event whose composed path starts at `window`
// (Svelte's event delegation walks that path, so such an event never reaches the viewport).
// The four "before descendant layout effects" cases keep their end-state assertions. Their
// effect-order checks pin React's layout versus passive effect split, which Svelte does not have.
import { tick } from 'svelte';
import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DrawerNestedProgressHarness from '../../tests/DrawerNestedProgressHarness.svelte';
import DrawerViewportHarness from '../../tests/DrawerViewportHarness.svelte';
import {
	byTestId,
	fireTouch,
	firePointer,
	frame,
	pointAt,
	type TouchPoint
} from '../../tests/drawer-gestures.js';

const cleanups: Array<() => void> = [];
afterEach(() => {
	while (cleanups.length > 0) cleanups.pop()!();
	document.getSelection()?.removeAllRanges();
});

function hitTest(...args: Parameters<typeof pointAt>) {
	cleanups.push(pointAt(...args));
}

const backdrop = () => byTestId('backdrop');
const popup = () => byTestId('popup');
const viewport = () => byTestId('viewport');

type Size =
	'scrollHeight' | 'clientHeight' | 'scrollWidth' | 'clientWidth' | 'offsetHeight' | 'offsetWidth';

function fakeSize(element: Element, sizes: Partial<Record<Size, number>>) {
	for (const [name, value] of Object.entries(sizes)) {
		Object.defineProperty(element, name, { value, configurable: true });
	}
}

async function mount(
	props: Record<string, unknown> = {},
	root: ParentNode = document,
	part = 'viewport'
) {
	const screen = render(DrawerViewportHarness, props);
	await expect.poll(() => root.querySelector(`[data-testid="${part}"]`)).not.toBeNull();
	await frame();
	return screen;
}

function touchStart(target: Element, x: number, y: number) {
	fireTouch(target, 'touchstart', [{ x, y }]);
}

/** Mirrors `fireEvent.touchMove`: `false` when a listener prevented the move. */
function touchMove(target: Element, x: number, y: number, cancelable = true) {
	return !fireTouch(target, 'touchmove', [{ x, y }], { cancelable }).defaultPrevented;
}

function touchMoveWith(target: Element, points: TouchPoint[]) {
	return !fireTouch(target, 'touchmove', points).defaultPrevented;
}

function touchEnd(target: Element, x: number, y: number) {
	fireTouch(target, 'touchend', [{ x, y }]);
}

function mouse(
	target: Element,
	type: 'down' | 'move' | 'up' | 'cancel',
	x: number,
	y: number,
	init: PointerEventInit & { time?: number } = {}
) {
	firePointer(target, `pointer${type}`, { clientX: x, clientY: y, ...init });
}

function select(node: Node, start: number, end: number) {
	const range = document.createRange();
	range.setStart(node, start);
	range.setEnd(node, end);
	const selection = document.getSelection()!;
	selection.removeAllRanges();
	selection.addRange(range);
	return selection;
}

const verticalScroll =
	'<div data-testid="scroll" style="overflow-y: auto; max-height: 40px"><div style="height: 120px">Scrollable content</div></div>';
const horizontalScroll =
	'<div data-testid="scroll" style="overflow-x: auto; max-width: 40px"><div style="width: 120px; height: 40px">Scrollable content</div></div>';
const svgScroll =
	'<div data-testid="scroll" style="overflow-y: auto; max-height: 40px"><svg width="20" height="20"><rect data-testid="rect" width="20" height="20"></rect></svg><div style="height: 120px"></div></div>';
const button = '<button type="button" data-testid="button">Action</button>';

function fakeVerticalScroll(scrollTop: number) {
	const scroll = byTestId('scroll');
	fakeSize(scroll, { scrollHeight: 120, clientHeight: 40 });
	scroll.scrollTop = scrollTop;
	return scroll;
}

function fakeHorizontalScroll(scrollLeft: number) {
	const scroll = byTestId('scroll');
	fakeSize(scroll, { scrollWidth: 120, clientWidth: 40 });
	scroll.scrollLeft = scrollLeft;
	return scroll;
}

const swipeClose = expect.objectContaining({ reason: 'swipe' });

describe('Drawer.Viewport', () => {
	it('registers the non-passive document touchmove listener only while open', async () => {
		const active = new Set<EventListenerOrEventListenerObject>();
		const add = vi.spyOn(document, 'addEventListener').mockImplementation(function (
			this: Document,
			type: string,
			listener: EventListenerOrEventListenerObject,
			options?: boolean | AddEventListenerOptions
		) {
			if (type === 'touchmove' && typeof options === 'object' && options.passive === false) {
				active.add(listener);
			}
			return EventTarget.prototype.addEventListener.call(this, type, listener, options);
		});
		const remove = vi.spyOn(document, 'removeEventListener').mockImplementation(function (
			this: Document,
			type: string,
			listener: EventListenerOrEventListenerObject,
			options?: boolean | EventListenerOptions
		) {
			if (type === 'touchmove') active.delete(listener);
			return EventTarget.prototype.removeEventListener.call(this, type, listener, options);
		});
		cleanups.push(() => {
			add.mockRestore();
			remove.mockRestore();
		});

		const screen = await mount({ open: false, keepMounted: true, backdrop: false });
		expect(active.size).toBe(0);

		await screen.rerender({ open: true });
		await frame();
		expect(active.size).toBe(1);

		await screen.rerender({ open: false });
		await frame();
		expect(active.size).toBe(0);
	});

	it('clears text selection on swipe start', async () => {
		await mount({ content: true, html: '<span data-testid="text">Selectable</span>' });
		const selection = select(byTestId('text').firstChild!, 0, 5);
		expect(selection.isCollapsed).toBe(false);

		hitTest(popup());
		mouse(viewport(), 'down', 0, 0);

		expect(selection.rangeCount).toBe(0);
	});

	it('preserves text selection outside the popup when a swipe starts', async () => {
		await mount({ outsideText: 'Outside selection' });
		const selection = select(byTestId('outside').firstChild!, 0, 7);

		hitTest(popup());
		mouse(viewport(), 'down', 0, 0);

		expect(selection.rangeCount).toBe(1);
		expect(selection.toString()).toBe('Outside');
	});

	it('does not clear text selection on touch swipe start', async () => {
		await mount({ content: true, html: '<span data-testid="text">Selectable</span>' });
		const selection = select(byTestId('text').firstChild!, 0, 5);
		expect(selection.isCollapsed).toBe(false);

		hitTest(popup());
		touchStart(viewport(), 0, 0);

		expect(selection.rangeCount).toBe(1);
	});

	it('starts touch swipes from interactive elements', async () => {
		await mount({ html: button });
		const target = byTestId('button');

		hitTest(target);
		touchStart(target, 0, 0);
		await tick();

		expect(backdrop()).toHaveAttribute('data-swiping', '');
	});

	it('uses shadow-root hit testing for touch swipe targets', async () => {
		const host = document.body.appendChild(document.createElement('div'));
		const shadowRoot = host.attachShadow({ mode: 'open' });
		cleanups.push(() => host.remove());
		await mount(
			{
				container: shadowRoot,
				html: '<div data-testid="target">Target</div><div data-base-ui-swipe-ignore data-testid="ignored">Ignore</div>'
			},
			shadowRoot
		);
		const target = byTestId('target', shadowRoot);
		const ignored = byTestId('ignored', shadowRoot);
		const shadowBackdrop = byTestId('backdrop', shadowRoot);

		// An in-popup element from the document hit test would start the swipe if the shadow root
		// were not consulted, so this pins the shadow-root lookup.
		hitTest(target);
		hitTest(ignored, shadowRoot);
		touchStart(ignored, 0, 0);
		await tick();
		expect(shadowBackdrop).not.toHaveAttribute('data-swiping');

		touchEnd(ignored, 0, 0);
		shadowRoot.elementFromPoint = () => target;
		touchStart(target, 0, 0);
		await tick();
		expect(shadowBackdrop).toHaveAttribute('data-swiping', '');
	});

	it('starts a swipe inside a shadow root using real hit testing', async () => {
		const host = document.body.appendChild(document.createElement('div'));
		const shadowRoot = host.attachShadow({ mode: 'open' });
		cleanups.push(() => host.remove());
		await mount(
			{
				container: shadowRoot,
				swipeDirection: 'down',
				html: 'Content',
				popupStyle: 'position: fixed; top: 0; left: 0; width: 200px; height: 200px'
			},
			shadowRoot
		);
		const shadowPopup = byTestId('popup', shadowRoot);

		touchStart(shadowPopup, 100, 100);
		touchMove(shadowPopup, 100, 125);

		await expect.element(byTestId('backdrop', shadowRoot)).toHaveAttribute('data-swiping', '');
		touchEnd(shadowPopup, 100, 125);
	});

	it('clears the backdrop data-swiping attribute when the drawer unmounts mid-swipe', async () => {
		const screen = await mount({ html: button });
		const target = byTestId('button');
		const mountedBackdrop = backdrop();

		hitTest(target);
		touchStart(target, 0, 0);
		await tick();
		expect(mountedBackdrop).toHaveAttribute('data-swiping', '');

		screen.unmount();

		// The detached node keeps its attributes, so this pins the cleanup.
		expect(mountedBackdrop).not.toHaveAttribute('data-swiping');
	});

	it('uses the event target for non-keyboard touch scroll arbitration', async () => {
		await mount({
			swipeDirection: 'down',
			html: `<div data-testid="scroll" style="overflow-y: auto; max-height: 40px">${button}<div style="height: 120px"></div></div><div data-testid="other-scroll" style="overflow-y: auto; max-height: 40px"><div style="height: 120px"></div></div>`
		});
		const target = byTestId('button');
		fakeVerticalScroll(0);
		const otherScroll = byTestId('other-scroll');
		fakeSize(otherScroll, { scrollHeight: 160, clientHeight: 40 });
		otherScroll.scrollTop = 40;

		let hitTestCount = 0;
		hitTest(() => {
			hitTestCount += 1;
			return hitTestCount === 1 ? otherScroll : target;
		});
		touchStart(target, 0, 0);
		touchMove(target, 0, 40);
		await tick();

		expect(backdrop()).toHaveAttribute('data-swiping', '');
	});

	it('scrolls instead of swiping when a touch drag starts on an SVG inside scrolled content', async () => {
		await mount({ swipeDirection: 'down', html: svgScroll });
		fakeVerticalScroll(40);
		const rect = byTestId('rect');

		hitTest(rect);
		touchStart(rect, 0, 0);
		const prevented = !touchMove(rect, 0, 40);
		await tick();

		expect(prevented).toBe(false);
		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('does not start a mouse drag swipe from an SVG inside scrollable content', async () => {
		await mount({ swipeDirection: 'down', html: svgScroll });
		fakeSize(byTestId('scroll'), { scrollHeight: 160, clientHeight: 40 });
		const rect = byTestId('rect');

		hitTest(rect);
		mouse(rect, 'down', 0, 0);
		mouse(viewport(), 'move', 0, 40);
		await tick();

		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('dismisses with a touch swipe down that starts on an SVG inside a top-edge scroll container', async () => {
		const onOpenChange = vi.fn();
		await mount({ swipeDirection: 'down', html: svgScroll, onOpenChange });
		fakeSize(byTestId('scroll'), { scrollHeight: 160, clientHeight: 40 });
		fakeSize(popup(), { offsetHeight: 200 });
		const rect = byTestId('rect');

		hitTest(rect);
		touchStart(rect, 0, 0);
		touchMove(rect, 0, 140);
		expect(backdrop()).toHaveAttribute('data-swiping', '');
		touchEnd(rect, 0, 140);
		await tick();

		expect(onOpenChange).toHaveBeenCalledWith(false, swipeClose);
	});

	it('allows clicks on non-interactive elements without data-base-ui-swipe-ignore', async () => {
		const onOpenChange = vi.fn();
		const onClick = vi.fn();
		await mount({ content: true, html: '<div data-testid="target">Action</div>', onOpenChange });
		const target = byTestId('target');
		target.addEventListener('click', onClick);

		hitTest(target);
		touchStart(target, 0, 0);
		firePointer(target, 'pointerdown', { pointerType: 'touch' });
		touchEnd(target, 0, 0);
		target.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
		await tick();

		expect(onClick).toHaveBeenCalledTimes(1);
		expect(onOpenChange).not.toHaveBeenCalled();
		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('does not start touch swipes from elements with data-base-ui-swipe-ignore', async () => {
		const onOpenChange = vi.fn();
		await mount({
			content: true,
			html: '<div data-testid="target" data-base-ui-swipe-ignore>Action</div>',
			onOpenChange
		});
		const target = byTestId('target');

		hitTest(target);
		touchStart(target, 0, 0);
		touchMove(target, 0, 40);
		touchEnd(target, 0, 40);
		await tick();

		expect(backdrop()).not.toHaveAttribute('data-swiping');
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	describe('data-base-ui-swipe-ignore axis values', () => {
		type Point = { x: number; y: number };

		function swipe(target: HTMLElement, points: Point[]) {
			hitTest(target);
			touchStart(target, 100, 100);
			return points.map((point) => touchMove(target, point.x, point.y));
		}

		const carousel = (axis: string) =>
			`<div data-testid="target" data-base-ui-swipe-ignore="${axis}">Carousel</div>`;

		it.each([
			['down', 'y', { x: 100, y: 140 }],
			['right', 'x', { x: 140, y: 100 }]
		] as const)(
			'ignores %s touch swipes from elements with the drawer axis value "%s"',
			async (swipeDirection, axis, end) => {
				const onOpenChange = vi.fn();
				await mount({ swipeDirection, html: carousel(axis), onOpenChange });
				const target = byTestId('target');

				expect(swipe(target, [end])).toEqual([true]);
				expect(backdrop()).not.toHaveAttribute('data-swiping');
				touchEnd(target, end.x, end.y);
				await tick();

				expect(onOpenChange).not.toHaveBeenCalled();
			}
		);

		it.each([
			['down', 'x', { x: 103, y: 101 }, { x: 140, y: 104 }],
			['right', 'y', { x: 101, y: 103 }, { x: 104, y: 140 }]
		] as const)(
			'hands cross-axis drags in %s drawers to elements with the value "%s"',
			async (swipeDirection, axis, ambiguous, crossAxis) => {
				const onOpenChange = vi.fn();
				await mount({ swipeDirection, html: carousel(axis), onOpenChange });
				const target = byTestId('target');
				const onTargetTouchMove = vi.fn();
				target.addEventListener('touchmove', onTargetTouchMove);

				expect(swipe(target, [ambiguous, crossAxis])).toEqual([true, true]);
				expect(onTargetTouchMove).toHaveBeenCalledTimes(2);
				expect(popup().style.getPropertyValue('--drawer-swipe-movement-x')).toBe('0px');
				expect(popup().style.getPropertyValue('--drawer-swipe-movement-y')).toBe('0px');
				touchEnd(target, crossAxis.x, crossAxis.y);
				await tick();

				expect(onOpenChange).not.toHaveBeenCalled();
			}
		);

		it.each(['marked', 'scrollable'] as const)(
			'does not swipe or settle snap points while a %s cross-axis target handles the drag',
			async (kind) => {
				const onSnapPointChange = vi.fn();
				await mount({
					snapPoints: [200, 360],
					onSnapPointChange,
					html:
						kind === 'marked'
							? carousel('x')
							: '<div data-testid="target" style="overflow-x: auto">Carousel</div>'
				});
				const target = byTestId('target');
				if (kind === 'scrollable') fakeSize(target, { scrollWidth: 400, clientWidth: 100 });

				const crossAxis = { x: 140, y: 104 };
				expect(swipe(target, [{ x: 103, y: 101 }, crossAxis])).toEqual([true, true]);
				expect(backdrop()).not.toHaveAttribute('data-swiping');
				expect(popup()).not.toHaveAttribute('data-swiping');
				touchEnd(target, crossAxis.x, crossAxis.y);
				await tick();

				expect(onSnapPointChange).not.toHaveBeenCalled();
			}
		);

		it.each([
			[
				'down',
				'x',
				[
					{ x: 101, y: 103 },
					{ x: 102, y: 140 },
					{ x: 102, y: 200 }
				]
			],
			[
				'right',
				'y',
				[
					{ x: 103, y: 101 },
					{ x: 140, y: 102 },
					{ x: 200, y: 102 }
				]
			]
		] as const)(
			'still swipes %s drawers from elements with the cross-axis value "%s"',
			async (swipeDirection, axis, points) => {
				const onOpenChange = vi.fn();
				await mount({ swipeDirection, html: carousel(axis), onOpenChange });
				const target = byTestId('target');

				expect(swipe(target, [...points])).toEqual([true, false, false]);
				touchEnd(target, points[2].x, points[2].y);
				await tick();

				expect(onOpenChange).toHaveBeenCalledTimes(1);
				expect(onOpenChange.mock.calls[0][0]).toBe(false);
				expect(onOpenChange.mock.calls[0][1].reason).toBe('swipe');
			}
		);

		it('keeps an ancestor that ignores all directions in effect over a nested axis value', async () => {
			const onOpenChange = vi.fn();
			await mount({
				swipeDirection: 'down',
				html: `<div data-base-ui-swipe-ignore>${carousel('x')}</div>`,
				onOpenChange
			});
			const target = byTestId('target');
			const end = { x: 100, y: 140 };

			expect(swipe(target, [end])).toEqual([true]);
			touchEnd(target, end.x, end.y);
			await tick();

			expect(onOpenChange).not.toHaveBeenCalled();
		});
	});

	// React portals bubble synthetic events to the drawer. A node outside the drawer's DOM tree does
	// not reach Svelte handlers at all, so this pins only the document listener.
	it('does not prevent native touch scrolling in portaled descendants', async () => {
		await mount({ content: true, html: 'Content' });
		const portaled = document.body.appendChild(document.createElement('div'));
		portaled.dataset.testid = 'portaled-popup';
		cleanups.push(() => portaled.remove());

		hitTest(portaled);
		touchStart(portaled, 0, 0);
		const touchMoveEvent = fireTouch(portaled, 'touchmove', [{ x: 0, y: 40 }]);

		expect(touchMoveEvent.defaultPrevented).toBe(false);
	});

	it('still allows touch swipes from elements with legacy data-swipe-ignore', async () => {
		const onOpenChange = vi.fn();
		await mount({
			swipeDirection: 'down',
			html: '<div data-testid="target" data-swipe-ignore>Action</div>',
			onOpenChange
		});
		const target = byTestId('target');

		hitTest(target);
		touchStart(target, 0, 0);
		touchMove(target, 0, 40);
		await tick();
		expect(backdrop()).toHaveAttribute('data-swiping', '');

		touchEnd(target, 0, 80);
		await tick();
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('does not start non-touch swipes from Drawer.Content', async () => {
		await mount({ content: true, html: '<div data-testid="target">Action</div>' });
		const target = byTestId('target');

		hitTest(target);
		mouse(target, 'down', 0, 0);
		await tick();

		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('does not jump when touch starts outside the popup and then enters it', async () => {
		await mount({ swipeDirection: 'down', content: true, html: 'Content' });
		fakeSize(popup(), { offsetHeight: 200 });

		hitTest((_x, y) => (y < 100 ? viewport() : popup()));
		touchStart(viewport(), 0, 0);
		touchMove(viewport(), 0, 120);
		await tick();

		expect(backdrop()).toHaveAttribute('data-swiping', '');
		expect(Number.parseFloat(popup().style.getPropertyValue('--drawer-swipe-movement-y'))).toBe(0);
	});

	it('dismisses when touch starts outside the popup, then continues swiping down inside it', async () => {
		const onOpenChange = vi.fn();
		await mount({ swipeDirection: 'down', content: true, html: 'Content', onOpenChange });
		fakeSize(popup(), { offsetHeight: 200 });

		hitTest((_x, y) => (y < 100 ? viewport() : popup()));
		touchStart(viewport(), 0, 0);
		touchMove(viewport(), 0, 120);
		touchMove(viewport(), 0, 170);
		touchEnd(viewport(), 0, 170);
		await tick();

		expect(onOpenChange).toHaveBeenCalledWith(false, swipeClose);
	});

	it('treats pen interactions on Drawer.Content as non-touch swipes', async () => {
		await mount({ swipeDirection: 'down', content: true, html: button });
		const target = byTestId('button');

		hitTest(target);
		mouse(target, 'down', 0, 0, { pointerType: 'pen' });
		touchStart(target, 0, 0);
		await tick();
		expect(backdrop()).not.toHaveAttribute('data-swiping');

		expect(touchMove(target, 0, 10)).toBe(true);
	});

	it('does not mark nested drawers as swiping until movement passes the threshold', async () => {
		await mount(
			{
				swipeDirection: 'down',
				backdrop: false,
				child: { html: '<button type="button" data-testid="child-button">Action</button>' }
			},
			document,
			'child-popup'
		);
		const parentPopup = byTestId('parent-popup');
		const childPopup = byTestId('child-popup');
		const target = byTestId('child-button');
		fakeSize(childPopup, { offsetHeight: 200 });

		hitTest(childPopup);
		touchStart(target, 0, 0);
		await tick();

		expect(byTestId('parent-viewport')).not.toHaveAttribute('data-nested-dialog-open');
		expect(byTestId('child-viewport')).not.toHaveAttribute('data-nested-dialog-open');
		expect(parentPopup).not.toHaveAttribute('data-nested-drawer-swiping');

		touchMove(target, 0, 5);
		touchMove(target, 0, 20);
		await tick();

		expect(parentPopup).toHaveAttribute('data-nested-drawer-swiping', '');
	});

	it('clears nested swiping when a nested drawer swipe is reversed before release', async () => {
		await mount(
			{
				swipeDirection: 'down',
				backdrop: false,
				child: { html: '<button type="button" data-testid="child-button">Action</button>' }
			},
			document,
			'child-popup'
		);
		const parentPopup = byTestId('parent-popup');
		const childPopup = byTestId('child-popup');
		const target = byTestId('child-button');
		fakeSize(childPopup, { offsetHeight: 200 });

		hitTest(childPopup);
		touchStart(target, 0, 0);
		await tick();
		touchMove(target, 0, 5);
		touchMove(target, 0, 20);
		await tick();
		expect(parentPopup).toHaveAttribute('data-nested-drawer-swiping', '');

		touchMove(target, 0, 0);
		await tick();

		expect(parentPopup).not.toHaveAttribute('data-nested-drawer-swiping');
		expect(parentPopup.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
	});

	it('prevents touchmove at scroll top when swiping down on scrollable content', async () => {
		await mount({ swipeDirection: 'down', backdrop: false, html: verticalScroll });
		const scroll = fakeVerticalScroll(0);
		const onTouchMove = vi.fn();
		scroll.addEventListener('touchmove', onTouchMove);

		touchStart(scroll, 0, 0);
		const prevented = touchMove(scroll, 0, 10);

		expect(prevented).toBe(false);
		expect(onTouchMove).not.toHaveBeenCalled();
	});

	it('prevents touchmove at scroll bottom when swiping up on scrollable content', async () => {
		await mount({ swipeDirection: 'up', html: verticalScroll });
		const scroll = fakeVerticalScroll(80);

		hitTest(scroll);
		touchStart(scroll, 0, 20);
		const event = fireTouch(scroll, 'touchmove', [{ x: 0, y: 10 }]);
		await tick();

		expect(event.defaultPrevented).toBe(true);
		expect(backdrop()).toHaveAttribute('data-swiping');
	});

	it('prevents touchmove when a scrollable ancestor wraps the popup at the top', async () => {
		await mount({
			swipeDirection: 'down',
			scrollWrap: true,
			content: true,
			html: '<span data-testid="item">Scrollable content</span>'
		});
		fakeVerticalScroll(0);
		const item = byTestId('item');

		hitTest(item);
		touchStart(item, 0, 0);
		const event = fireTouch(item, 'touchmove', [{ x: 0, y: 10 }]);
		await tick();

		expect(event.defaultPrevented).toBe(true);
		expect(backdrop()).toHaveAttribute('data-swiping');
	});

	it('starts a swipe away from the page scroll edge when the body is a scroll container', async () => {
		const html = document.documentElement;
		const body = document.body;
		const previousHtmlStyle = html.style.cssText;
		const previousBodyStyle = body.style.cssText;
		// A common reset that turns `body` into a real scroll container.
		html.style.cssText = 'height: 100%; overflow-y: auto';
		body.style.cssText = 'height: 100%; overflow-y: auto';
		const spacer = body.appendChild(document.createElement('div'));
		spacer.style.height = '5000px';
		cleanups.push(() => {
			spacer.remove();
			html.style.cssText = previousHtmlStyle;
			body.style.cssText = previousBodyStyle;
		});

		await mount({
			modal: false,
			swipeDirection: 'down',
			snapPoints: [300, 100],
			viewportStyle: 'position: fixed; inset: 0; pointer-events: none',
			popupStyle:
				'position: absolute; left: 0; right: 0; bottom: 0; height: 300px; pointer-events: auto; transform: translateY(calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y)))',
			html: '<div data-testid="drag" style="height: 100px">Drag</div>'
		});
		const drag = byTestId('drag');
		await expect
			.poll(() => popup().style.getPropertyValue('--drawer-snap-point-offset'))
			.toBe('0px');

		expect(body.scrollTop).toBe(0);
		expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);

		const rect = drag.getBoundingClientRect();
		const x = rect.left + 20;
		const y = rect.top + 80;
		touchStart(drag, x, y);
		touchMove(drag, x, y - 30);

		await expect.element(backdrop()).toHaveAttribute('data-swiping', '');
		touchEnd(drag, x, y - 30);
	});

	it('prevents touchmove when there is no scroll container', async () => {
		await mount({ swipeDirection: 'down', content: true, html: 'Content' });

		hitTest(popup());
		touchStart(popup(), 0, 0);
		const event = fireTouch(popup(), 'touchmove', [{ x: 0, y: 10 }]);
		await tick();

		expect(event.defaultPrevented).toBe(true);
		expect(backdrop()).toHaveAttribute('data-swiping');
	});

	it('does not block touchmove on native range inputs', async () => {
		await mount({ swipeDirection: 'down', html: '<input type="range" data-testid="range" />' });
		const range = byTestId('range');

		touchStart(range, 0, 0);
		const dispatched = touchMove(range, 20, 0);
		await tick();

		expect(dispatched).toBe(true);
		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('does not block touchmove on slider thumb range inputs', async () => {
		await mount({ swipeDirection: 'down', html: '', slider: true });
		const sliderInput = page.getByRole('slider').element();

		touchStart(sliderInput, 0, 0);
		const dispatched = touchMove(sliderInput, 20, 0);
		await tick();

		expect(dispatched).toBe(true);
		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it.each([
		['input', '<input data-testid="field" value="Selectable text" />'],
		['textarea', '<textarea data-testid="field">Selectable text</textarea>']
	])('does not start swiping when adjusting %s selection handles', async (_kind, markup) => {
		await mount({ swipeDirection: 'down', html: markup });
		const field = byTestId('field') as HTMLInputElement | HTMLTextAreaElement;
		field.focus();
		field.setSelectionRange(0, 5);

		hitTest(popup());
		touchStart(popup(), 0, 0);
		expect(backdrop()).not.toHaveAttribute('data-swiping');
		const dispatched = touchMove(popup(), 0, 10);
		await tick();

		expect(dispatched).toBe(true);
		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it.each([
		['contenteditable', '<div contenteditable="true" data-testid="text">Selectable text</div>'],
		['regular text', '<span data-testid="text">Selectable text</span>']
	])('does not start swiping when adjusting %s selection handles', async (kind, markup) => {
		await mount({ swipeDirection: 'down', html: markup });
		const text = byTestId('text');
		if (kind === 'contenteditable') text.focus();
		select(text.firstChild!, 0, 5);

		hitTest(popup());
		touchStart(popup(), 0, 0);
		expect(backdrop()).not.toHaveAttribute('data-swiping');
		const dispatched = touchMove(popup(), 0, 10);
		await tick();

		expect(dispatched).toBe(true);
		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('allows touchmove when scrolling down from scroll top', async () => {
		await mount({ swipeDirection: 'down', backdrop: false, html: verticalScroll });
		const scroll = fakeVerticalScroll(0);
		const onTouchMove = vi.fn();
		scroll.addEventListener('touchmove', onTouchMove);

		touchStart(scroll, 0, 0);
		const prevented = touchMove(scroll, 0, -10);

		expect(prevented).toBe(true);
		expect(onTouchMove).toHaveBeenCalledTimes(1);
	});

	it('does not start an opposite-direction swipe from scroll bottom for down drawers with snap points', async () => {
		await mount({ swipeDirection: 'down', snapPoints: ['100px', 1], html: verticalScroll });
		const scroll = fakeVerticalScroll(80);

		touchStart(scroll, 0, 40);
		const moveAllowed = touchMove(scroll, 0, 20);
		await tick();

		expect(moveAllowed).toBe(true);
		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('keeps damped snap-point styles when a duplicate-coordinate pointermove arrives', async () => {
		await mount({ snapPoints: ['100px', 1] });

		hitTest(popup());
		mouse(viewport(), 'down', 0, 100);
		await tick();
		// The first move only re-anchors the drag origin.
		mouse(viewport(), 'move', 0, 100);
		mouse(viewport(), 'move', 0, 0);
		await tick();

		expect(popup().style.transform).toBe('');
		const damped = popup().style.getPropertyValue('--drawer-swipe-movement-y');
		expect(damped).toBe('-10px');

		// A cursor pinned at a screen edge repeats its coordinates.
		mouse(viewport(), 'move', 0, 0);
		await tick();
		expect(popup().style.transform).toBe('');
		expect(popup().style.getPropertyValue('--drawer-swipe-movement-y')).toBe(damped);

		// Only vertical directions are enabled, so horizontal jitter leaves the offset unchanged.
		mouse(viewport(), 'move', 5, 0);
		await tick();
		expect(popup().style.transform).toBe('');
		expect(popup().style.getPropertyValue('--drawer-swipe-movement-y')).toBe(damped);
	});

	it('does not start an opposite-direction swipe from scroll right edge for right drawers', async () => {
		await mount({ swipeDirection: 'right', html: horizontalScroll });
		const scroll = fakeHorizontalScroll(80);

		touchStart(scroll, 40, 0);
		const moveAllowed = touchMove(scroll, 20, 0);
		await tick();

		expect(moveAllowed).toBe(true);
		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('starts swipe-to-dismiss after a scrollable container reaches the dismiss edge', async () => {
		await mount({ swipeDirection: 'down', html: verticalScroll });
		const scroll = fakeVerticalScroll(30);

		hitTest(scroll);
		touchStart(scroll, 0, 30);
		expect(touchMove(scroll, 0, 40)).toBe(true);
		expect(backdrop()).not.toHaveAttribute('data-swiping');

		scroll.scrollTop = 0;
		expect(touchMove(scroll, 0, 50)).toBe(false);
		await tick();

		expect(backdrop()).toHaveAttribute('data-swiping', '');
	});

	it.each([
		['top-edge', 'down', 'vertical', 0, { x: 0, y: 0 }, { x: 0, y: 140 }],
		['bottom-edge', 'up', 'vertical', 80, { x: 0, y: 140 }, { x: 0, y: 0 }],
		['left-edge horizontal', 'right', 'horizontal', 0, { x: 0, y: 0 }, { x: 140, y: 0 }],
		['right-edge horizontal', 'left', 'horizontal', 80, { x: 140, y: 0 }, { x: 0, y: 0 }]
	] as const)(
		'dismisses from a %s scroll container with a touch swipe %s',
		async (_edge, swipeDirection, axis, offset, start, end) => {
			const onOpenChange = vi.fn();
			await mount({
				swipeDirection,
				html: axis === 'vertical' ? verticalScroll : horizontalScroll,
				onOpenChange
			});
			const scroll =
				axis === 'vertical' ? fakeVerticalScroll(offset) : fakeHorizontalScroll(offset);
			fakeSize(popup(), axis === 'vertical' ? { offsetHeight: 200 } : { offsetWidth: 200 });

			hitTest(scroll);
			touchStart(scroll, start.x, start.y);
			touchMove(scroll, end.x, end.y);
			expect(backdrop()).toHaveAttribute('data-swiping', '');
			touchEnd(scroll, end.x, end.y);
			await tick();

			expect(onOpenChange).toHaveBeenCalledWith(false, swipeClose);
		}
	);

	it.each(['HTML scroller', 'SVG scroller', 'axis ignore marker'] as const)(
		'expands a collapsed sheet when the first move from a %s leaves the popup',
		async (kind) => {
			const onSnapPointChange = vi.fn();
			const inner =
				kind === 'SVG scroller'
					? '<svg><rect data-testid="target" width="120" height="40"></rect></svg>'
					: '<div data-testid="target">Swipe here</div>';
			const scroller =
				kind === 'axis ignore marker'
					? `<div data-testid="scroll" data-base-ui-swipe-ignore="x">${inner}</div>`
					: `<div data-testid="scroll" style="overflow-x: auto">${inner}</div>`;
			await mount({
				holdOpen: false,
				swipeDirection: 'down',
				snapPoints: ['100px', '200px'],
				defaultSnapPoint: '100px',
				onSnapPointChange,
				viewportStyle: 'height: 400px',
				popupStyle: 'height: 200px',
				html: scroller
			});
			const target = byTestId('target');
			if (kind !== 'axis ignore marker') {
				fakeSize(byTestId('scroll'), { scrollWidth: 120, clientWidth: 40 });
			}
			await expect
				.poll(() => popup().style.getPropertyValue('--drawer-snap-point-offset'))
				.toBe('100px');

			// The popup starts at y=300. Touch events keep their original target after leaving it.
			hitTest((_x, y) => (y >= 300 ? target : viewport()));
			touchStart(target, 100, 305);
			expect(backdrop()).not.toHaveAttribute('data-swiping');
			touchMove(target, 100, 275);
			expect(backdrop()).toHaveAttribute('data-swiping');
			touchMove(target, 100, 125);
			expect(
				Number.parseFloat(popup().style.getPropertyValue('--drawer-swipe-movement-y'))
			).toBeLessThan(0);
			touchEnd(target, 100, 125);
			await tick();

			expect(onSnapPointChange).toHaveBeenCalledWith('200px', swipeClose);

			// The next touch starts and stays outside, so it must not inherit the eligibility.
			onSnapPointChange.mockClear();
			touchStart(viewport(), 100, 275);
			touchMove(viewport(), 100, 125);
			expect(backdrop()).not.toHaveAttribute('data-swiping');
			touchEnd(viewport(), 100, 125);
			await tick();
			expect(onSnapPointChange).not.toHaveBeenCalled();
		}
	);

	it('allows horizontal swipe dismiss from a vertical scroll container', async () => {
		await mount({ swipeDirection: 'right', html: verticalScroll });
		const scroll = fakeVerticalScroll(20);

		hitTest(scroll);
		touchStart(scroll, 0, 20);
		touchMove(scroll, 20, 20);
		await tick();

		expect(backdrop()).toHaveAttribute('data-swiping', '');
	});

	it('does not prevent a sub-slop first touchmove over cross-axis scrollable content', async () => {
		await mount({ swipeDirection: 'right', html: verticalScroll });
		const scroll = byTestId('scroll');
		fakeSize(scroll, { scrollHeight: 120, clientHeight: 40 });

		hitTest(scroll);
		touchStart(scroll, 100, 100);
		// Preventing the first cancelable touchmove on iOS cancels native scrolling for the gesture.
		expect(touchMove(scroll, 100, 97)).toBe(true);
		expect(touchMove(scroll, 100, 60)).toBe(true);
		touchEnd(scroll, 100, 60);
	});

	it('claims the gesture once the drawer axis passes the slop over cross-axis scrollable content', async () => {
		await mount({ swipeDirection: 'right', html: verticalScroll });
		const scroll = byTestId('scroll');
		fakeSize(scroll, { scrollHeight: 120, clientHeight: 40 });

		hitTest(scroll);
		touchStart(scroll, 100, 100);
		expect(touchMove(scroll, 103, 101)).toBe(true);
		expect(touchMove(scroll, 112, 101)).toBe(false);
		touchEnd(scroll, 112, 101);
	});

	it('yields the gesture when the browser commits to a native cross-axis scroll', async () => {
		await mount({ swipeDirection: 'right', html: verticalScroll });
		const scroll = byTestId('scroll');
		fakeSize(scroll, { scrollHeight: 120, clientHeight: 40 });

		hitTest(scroll);
		touchStart(scroll, 100, 100);
		touchMove(scroll, 100, 97);
		// A non-cancelable move below the slop means the browser committed to a native scroll.
		touchMove(scroll, 100, 96, false);

		expect(touchMove(scroll, 140, 96)).toBe(true);
		touchEnd(scroll, 140, 96);
	});

	it('keeps tracking the finger when a claimed drag returns inside the slop', async () => {
		await mount({ swipeDirection: 'right', html: verticalScroll });
		const scroll = byTestId('scroll');
		fakeSize(scroll, { scrollHeight: 120, clientHeight: 40 });

		hitTest(scroll);
		touchStart(scroll, 100, 100);
		touchMove(scroll, 120, 100);
		touchMove(scroll, 150, 100);
		expect(popup().style.getPropertyValue('--drawer-swipe-movement-x')).toBe('30px');

		expect(touchMove(scroll, 103, 100)).toBe(false);
		expect(
			Number.parseFloat(popup().style.getPropertyValue('--drawer-swipe-movement-x'))
		).toBeLessThan(0);
		touchEnd(scroll, 103, 100);
	});

	it('keeps driving a claimed drag through a non-cancelable touchmove', async () => {
		await mount({ swipeDirection: 'right', html: verticalScroll });
		const scroll = byTestId('scroll');
		fakeSize(scroll, { scrollHeight: 120, clientHeight: 40 });

		hitTest(scroll);
		touchStart(scroll, 100, 100);
		touchMove(scroll, 150, 100);
		touchMove(scroll, 200, 100);
		expect(popup().style.getPropertyValue('--drawer-swipe-movement-x')).toBe('50px');

		touchMove(scroll, 250, 100, false);
		await tick();
		expect(popup().style.getPropertyValue('--drawer-swipe-movement-x')).toBe('100px');

		expect(touchMove(scroll, 300, 100)).toBe(false);
		expect(popup().style.getPropertyValue('--drawer-swipe-movement-x')).toBe('150px');
		touchEnd(scroll, 300, 100);
	});

	it('does not lock vertical swipe after minor cross-axis jitter in down drawers', async () => {
		await mount({
			swipeDirection: 'down',
			html: '<div data-testid="scroll" style="overflow-x: auto; width: 40px"><div style="width: 120px; height: 40px">Scrollable content</div></div>'
		});
		const scroll = fakeHorizontalScroll(0);

		hitTest(scroll);
		touchStart(scroll, 0, 0);
		touchMove(scroll, 4, 3);
		touchMove(scroll, 4, 28);
		await tick();

		expect(backdrop()).toHaveAttribute('data-swiping', '');
	});

	it('does not hijack cross-axis gestures from mixed-axis scroll containers', async () => {
		await mount({
			swipeDirection: 'down',
			html: '<div data-testid="scroll" style="overflow: auto; width: 40px; height: 40px"><div style="width: 120px; height: 120px">Scrollable content</div></div>'
		});
		const scroll = byTestId('scroll');
		fakeSize(scroll, { scrollHeight: 120, clientHeight: 40, scrollWidth: 120, clientWidth: 40 });
		scroll.scrollTop = 0;
		scroll.scrollLeft = 40;

		hitTest(scroll);
		touchStart(scroll, 40, 0);
		touchMove(scroll, 10, 20);
		await tick();

		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it.each([
		['vertical', 'right'],
		['vertical', 'left'],
		['horizontal', 'down'],
		['horizontal', 'up']
	] as const)(
		'does not block %s scrolling in %s drawers when only that overflow exists',
		async (axis, swipeDirection) => {
			await mount({
				swipeDirection,
				html:
					axis === 'vertical'
						? '<div data-testid="scroll" style="overflow-y: auto; height: 40px"><div style="height: 120px">Scrollable content</div></div>'
						: '<div data-testid="scroll" style="overflow-x: auto; width: 40px"><div style="width: 120px; height: 40px">Scrollable content</div></div>'
			});
			const scroll = byTestId('scroll');

			if (axis === 'vertical') touchStart(scroll, 0, 20);
			else touchStart(scroll, 20, 0);
			const dispatched = touchMove(scroll, 0, 0);
			await tick();

			expect(dispatched).toBe(true);
			expect(backdrop()).not.toHaveAttribute('data-swiping');
		}
	);

	it('toggles data-swiping on the backdrop while swiping', async () => {
		await mount();

		hitTest(popup());
		mouse(viewport(), 'down', 0, 0);
		await tick();
		mouse(viewport(), 'move', 0, 8);
		await tick();
		expect(backdrop()).toHaveAttribute('data-swiping', '');

		mouse(viewport(), 'up', 0, 8);
		await tick();
		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('cancels pointer drags and ignores compatibility touch pointer cancellation', async () => {
		await mount();

		hitTest(popup());
		mouse(viewport(), 'down', 0, 0);
		mouse(viewport(), 'move', 0, 20);
		expect(backdrop()).toHaveAttribute('data-swiping', '');

		mouse(viewport(), 'cancel', 0, 20);
		expect(backdrop()).not.toHaveAttribute('data-swiping');

		firePointer(viewport(), 'pointerdown', { pointerId: 2, pointerType: 'touch' });
		firePointer(viewport(), 'pointercancel', { pointerId: 2, pointerType: 'touch' });
		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('ignores touchstart when there is no active touch', async () => {
		await mount();

		fireTouch(viewport(), 'touchstart', []);

		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('uses regular horizontal dismissal when snap points are configured', async () => {
		const onOpenChange = vi.fn();
		await mount({
			swipeDirection: 'left',
			snapPoints: ['100px', '200px'],
			backdrop: false,
			onOpenChange
		});
		fakeSize(popup(), { offsetWidth: 200 });

		hitTest(popup());
		mouse(viewport(), 'down', 180, 10);
		mouse(viewport(), 'move', 179, 10);
		mouse(viewport(), 'move', 40, 10);
		mouse(viewport(), 'up', 40, 10);
		await tick();

		expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
	});

	it('starts the exit transition with the release strength when onOpenChange moves focus', async () => {
		const style = document.createElement('style');
		style.textContent =
			'[data-testid="popup"][data-ending-style] { transform: translateY(300px); }';
		document.head.append(style);
		cleanups.push(() => style.remove());
		const focusTarget = document.createElement('button');
		document.body.append(focusTarget);
		cleanups.push(() => focusTarget.remove());
		await mount({
			holdOpen: false,
			swipeDirection: 'down',
			popupStyle:
				'height: 300px; transition: transform calc(var(--drawer-swipe-strength) * 1000ms) linear',
			onOpenChange: () => focusTarget.focus()
		});

		hitTest(popup());
		mouse(viewport(), 'down', 100, 100, { time: 1000 });
		mouse(viewport(), 'move', 100, 125, { time: 1025 });
		mouse(viewport(), 'move', 100, 150, { time: 1050 });
		mouse(viewport(), 'up', 100, 150, { time: 1050 });
		await tick();

		const durations = popup()
			.getAnimations()
			.map((animation) => Math.round(Number(animation.effect?.getComputedTiming().duration)));
		expect(durations).toEqual([727]);
	});

	describe('snap point gestures', () => {
		const sheet = { viewportStyle: 'height: 400px', popupStyle: 'height: 300px', backdrop: false };

		// Cumulative |deltaX| stays above |deltaY| on every move, so no direction is attributed,
		// while the last samples carry fast downward velocity.
		function horizontalFlick(target: Element) {
			mouse(target, 'down', 100, 10, { time: 1000 });
			mouse(target, 'move', 120, 12, { time: 1050 });
			mouse(target, 'move', 200, 20, { time: 1100 });
			mouse(target, 'move', 240, 55, { time: 1120 });
			mouse(target, 'up', 240, 55, { time: 1130 });
		}

		// A slow diagonal drag that never attributes a direction and ends nearer the closed position
		// than any snap point.
		function slowDiagonalDrag(target: Element) {
			mouse(target, 'down', 100, 100, { time: 1000 });
			mouse(target, 'move', 200, 120, { time: 1100 });
			mouse(target, 'move', 300, 170, { time: 1400 });
			mouse(target, 'move', 400, 190, { time: 1900 });
			mouse(target, 'up', 400, 190, { time: 1950 });
		}

		it('does not dismiss from a fast swipe that was never attributed to the snap point axis', async () => {
			const onOpenChange = vi.fn();
			const onSnapPointChange = vi.fn();
			// The taller point comes first, so the settle target is not simply the first snap point.
			await mount({
				...sheet,
				swipeDirection: 'down',
				snapPoints: ['200px', '100px'],
				onOpenChange,
				onSnapPointChange
			});

			hitTest(popup());
			horizontalFlick(viewport());
			await tick();

			expect(onOpenChange).not.toHaveBeenCalled();
			expect(onSnapPointChange).not.toHaveBeenCalledWith(null, expect.anything());
			expect(onSnapPointChange).toHaveBeenCalledWith('100px', expect.anything());
			expect(popup()).not.toHaveAttribute('data-ending-style');
			expect(popup()).not.toHaveAttribute('data-swipe-dismiss');
		});

		it('measures the release from the snap point the popup rests at', async () => {
			const onOpenChange = vi.fn();
			// The 300px popup rests 200px down at the 100px snap point, so 50px of travel remains.
			await mount({
				...sheet,
				swipeDirection: 'down',
				snapPoints: ['100px', 1],
				snapPoint: '100px',
				onOpenChange
			});

			hitTest(popup());
			mouse(viewport(), 'down', 100, 100, { time: 1000 });
			mouse(viewport(), 'move', 100, 125, { time: 1025 });
			mouse(viewport(), 'move', 100, 150, { time: 1050 });
			mouse(viewport(), 'up', 100, 150, { time: 1050 });
			await tick();

			expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
			expect(popup().style.getPropertyValue('--drawer-swipe-strength')).toBe('0.1');
		});

		it('keeps the inline popup transition after a snap point drag settles', async () => {
			await mount({
				...sheet,
				popupStyle: 'height: 300px; transition: transform 450ms',
				swipeDirection: 'down',
				snapPoints: ['100px', 1],
				snapPoint: 1
			});

			hitTest(popup());
			mouse(viewport(), 'down', 100, 100, { time: 1000 });
			mouse(viewport(), 'move', 100, 110, { time: 1500 });
			mouse(viewport(), 'move', 100, 120, { time: 2000 });
			await tick();
			expect(popup()).toHaveAttribute('data-swiping');
			expect(popup().style.transition).toBe('none');
			mouse(viewport(), 'up', 100, 120, { time: 2500 });
			await tick();

			expect(popup().style.transition).toBe('transform 450ms');
		});

		it('navigates snap points from a drag that was never attributed to the swipe axis', async () => {
			const onOpenChange = vi.fn();
			const onSnapPointChange = vi.fn();
			await mount({
				...sheet,
				swipeDirection: 'down',
				snapPoints: ['100px', '200px'],
				onOpenChange,
				onSnapPointChange
			});

			hitTest(popup());
			mouse(viewport(), 'down', 300, 300);
			mouse(viewport(), 'move', 280, 290);
			mouse(viewport(), 'move', 200, 220);
			mouse(viewport(), 'move', 140, 150);
			mouse(viewport(), 'up', 140, 150);
			await tick();

			expect(onSnapPointChange).toHaveBeenCalledWith('200px', expect.anything());
			expect(onOpenChange).not.toHaveBeenCalled();
			expect(popup()).not.toHaveAttribute('data-ending-style');
		});

		it('clears nested swipe state after an unattributed snap point gesture', async () => {
			await mount(
				{
					swipeDirection: 'down',
					backdrop: false,
					child: { snapPoints: ['100px', '200px'], ...sheet }
				},
				document,
				'child-popup'
			);
			const parentPopup = byTestId('parent-popup');
			const childViewport = byTestId('child-viewport');

			hitTest(byTestId('child-popup'));
			mouse(childViewport, 'down', 100, 10);
			mouse(childViewport, 'move', 120, 12);
			mouse(childViewport, 'move', 200, 30);
			await tick();

			expect(parentPopup).toHaveAttribute('data-nested-drawer-swiping', '');
			expect(parentPopup.style.getPropertyValue('--drawer-swipe-progress')).not.toBe('0');

			mouse(childViewport, 'up', 200, 30);
			await tick();

			expect(parentPopup.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
			expect(parentPopup).not.toHaveAttribute('data-nested-drawer-swiping');
		});

		it('clears nested swipe state after an attributed drag settles on a snap point', async () => {
			await mount(
				{
					swipeDirection: 'down',
					backdrop: false,
					child: { snapPoints: ['100px', '200px'], ...sheet }
				},
				document,
				'child-popup'
			);
			const parentPopup = byTestId('parent-popup');
			const childPopup = byTestId('child-popup');
			const childViewport = byTestId('child-viewport');

			// A straight-down drag ending in a slight upward reversal, so the release resolves through
			// the slow fallback velocity and settles back on the snap point.
			hitTest(childPopup);
			mouse(childViewport, 'down', 100, 10, { time: 1000 });
			mouse(childViewport, 'move', 100, 24, { time: 1050 });
			mouse(childViewport, 'move', 100, 48, { time: 1150 });
			await tick();

			expect(parentPopup).toHaveAttribute('data-nested-drawer-swiping', '');
			expect(parentPopup.style.getPropertyValue('--drawer-swipe-progress')).not.toBe('0');

			mouse(childViewport, 'move', 100, 44, { time: 1250 });
			mouse(childViewport, 'up', 100, 44, { time: 1600 });
			await tick();

			expect(childPopup).not.toHaveAttribute('data-ending-style');
			expect(childPopup).not.toHaveAttribute('data-swipe-dismiss');
			expect(parentPopup.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
			expect(parentPopup).not.toHaveAttribute('data-nested-drawer-swiping');
		});

		it('does not dismiss from an unattributed fast swipe with snapToSequentialPoints', async () => {
			const onOpenChange = vi.fn();
			const onSnapPointChange = vi.fn();
			await mount({
				...sheet,
				swipeDirection: 'down',
				snapPoints: ['100px', '200px'],
				snapToSequentialPoints: true,
				onOpenChange,
				onSnapPointChange
			});

			hitTest(popup());
			horizontalFlick(viewport());
			await tick();

			expect(onOpenChange).not.toHaveBeenCalled();
			expect(onSnapPointChange).not.toHaveBeenCalledWith(null, expect.anything());
			expect(onSnapPointChange).toHaveBeenCalledWith('100px', expect.anything());
			expect(popup()).not.toHaveAttribute('data-ending-style');
			expect(popup()).not.toHaveAttribute('data-swipe-dismiss');
		});

		it('does not start swipe dismissal when closing the snap point is canceled', async () => {
			const onOpenChange = vi.fn();
			const onSnapPointChange = vi.fn(
				(next: unknown, details: { cancel(): void }) => next === null && details.cancel()
			);
			await mount({
				...sheet,
				swipeDirection: 'down',
				snapPoints: ['100px', '200px'],
				defaultSnapPoint: '100px',
				snapToSequentialPoints: true,
				onOpenChange,
				onSnapPointChange
			});
			const releaseAttributes: string[] = [];
			const observer = new MutationObserver((records) => {
				for (const record of records) {
					if (record.attributeName) releaseAttributes.push(record.attributeName);
				}
			});
			observer.observe(popup(), {
				attributeFilter: ['data-ending-style', 'data-swipe-dismiss'],
				attributes: true
			});
			cleanups.push(() => observer.disconnect());

			hitTest(popup());
			mouse(viewport(), 'down', 100, 10, { time: 1000 });
			mouse(viewport(), 'move', 100, 30, { time: 1050 });
			mouse(viewport(), 'move', 100, 80, { time: 1100 });
			mouse(viewport(), 'up', 100, 100, { time: 1120 });
			await tick();
			releaseAttributes.push(...observer.takeRecords().map((record) => record.attributeName!));

			expect(onSnapPointChange).toHaveBeenCalledWith(null, expect.anything());
			expect(onOpenChange).not.toHaveBeenCalled();
			expect(releaseAttributes).toEqual([]);
			expect(popup()).not.toHaveAttribute('data-ending-style');
			expect(popup()).not.toHaveAttribute('data-swipe-dismiss');
		});

		it.each([false, true])(
			'settles on the nearest snap point when an unattributed drag ends past the last snap point (snapToSequentialPoints: %s)',
			async (snapToSequentialPoints) => {
				const onOpenChange = vi.fn();
				const onSnapPointChange = vi.fn();
				await mount({
					...sheet,
					swipeDirection: 'down',
					snapPoints: ['200px', '100px'],
					defaultSnapPoint: '100px',
					snapToSequentialPoints,
					onOpenChange,
					onSnapPointChange
				});

				hitTest(popup());
				slowDiagonalDrag(viewport());
				await tick();

				expect(onOpenChange).not.toHaveBeenCalled();
				expect(onSnapPointChange).not.toHaveBeenCalledWith(null, expect.anything());
				expect(onSnapPointChange).toHaveBeenCalledWith('100px', expect.anything());
				expect(popup()).not.toHaveAttribute('data-ending-style');
			}
		);

		it('keeps the resting snap point progress when a press never starts a swipe', async () => {
			await mount({
				...sheet,
				backdrop: true,
				swipeDirection: 'down',
				snapPoints: ['100px', '200px'],
				content: true
			});
			const content = byTestId('content');
			await expect
				.poll(() => backdrop().style.getPropertyValue('--drawer-swipe-progress'))
				.toBe('1');

			// A press inside Drawer.Content never starts a swipe but still reaches the release handler.
			hitTest(content);
			mouse(content, 'down', 100, 100);
			mouse(content, 'up', 100, 100);
			await tick();

			expect(backdrop().style.getPropertyValue('--drawer-swipe-progress')).toBe('1');
		});

		it('does not resolve snap points before the popup has a measurable height', async () => {
			const onOpenChange = vi.fn();
			await mount({
				swipeDirection: 'down',
				snapPoints: ['100px', '200px'],
				popupStyle: 'height: 0; overflow: hidden',
				backdrop: false,
				onOpenChange
			});
			expect(popup().offsetHeight).toBe(0);

			hitTest(popup());
			mouse(viewport(), 'down', 0, 0);
			mouse(viewport(), 'move', 0, 1);
			mouse(viewport(), 'move', 0, 40);
			mouse(viewport(), 'up', 0, 40);
			await tick();

			expect(onOpenChange).not.toHaveBeenCalled();
		});

		it('falls back to regular dismissal when all snap points are invalid', async () => {
			const onOpenChange = vi.fn();
			await mount({
				snapPoints: ['50%'],
				popupStyle: 'height: 200px',
				backdrop: false,
				onOpenChange
			});

			hitTest(popup());
			mouse(viewport(), 'down', 0, 0);
			mouse(viewport(), 'move', 0, 1);
			mouse(viewport(), 'move', 0, 140);
			mouse(viewport(), 'up', 0, 140);
			await tick();

			expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
		});
	});

	it('ends swipe drag when the primary mouse button is released mid-gesture', async () => {
		await mount();

		hitTest(popup());
		mouse(viewport(), 'down', 0, 0);
		await tick();
		mouse(viewport(), 'move', 0, 8);
		await tick();
		expect(backdrop()).toHaveAttribute('data-swiping', '');

		// A right-click interruption: the primary button is no longer pressed.
		mouse(viewport(), 'move', 0, 12, { buttons: 2 });
		await tick();
		expect(backdrop()).not.toHaveAttribute('data-swiping');

		mouse(viewport(), 'move', 0, 30, { buttons: 0 });
		await tick();
		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('ignores swipe input until a popup is mounted', async () => {
		const onOpenChange = vi.fn();
		await mount({ showPopup: false, backdrop: false, onOpenChange });

		hitTest(viewport());
		mouse(viewport(), 'down', 0, 0);
		mouse(viewport(), 'move', 0, 100);
		mouse(viewport(), 'up', 0, 100);
		await tick();

		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('cleans up when the popup unmounts during an active swipe', async () => {
		const onOpenChange = vi.fn();
		const screen = await mount({
			swipeDirection: 'down',
			snapPoints: ['100px', '200px'],
			onOpenChange
		});

		hitTest(popup());
		mouse(viewport(), 'down', 0, 0);
		mouse(viewport(), 'move', 0, 20);
		expect(backdrop()).toHaveAttribute('data-swiping', '');

		await screen.rerender({ showPopup: false });
		mouse(viewport(), 'move', 0, 30);
		expect(backdrop()).toHaveAttribute('data-swiping', '');

		mouse(viewport(), 'up', 0, 30);
		await tick();

		expect(backdrop()).not.toHaveAttribute('data-swiping');
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('does not start pointer swipes while a closed drawer remains mounted', async () => {
		const onOpenChange = vi.fn();
		await mount({ holdOpen: false, preventUnmountOnClose: true, close: true, onOpenChange });

		hitTest(popup());
		(page.getByRole('button', { name: 'Close' }).element() as HTMLElement).click();
		await expect.element(popup()).toHaveAttribute('data-closed', '');
		onOpenChange.mockClear();

		mouse(viewport(), 'down', 0, 0);
		mouse(viewport(), 'move', 0, 100);

		expect(backdrop()).not.toHaveAttribute('data-swiping');
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('clears a selection whose endpoints are popup elements', async () => {
		await mount();
		const removeAllRanges = vi.fn();
		const selection = vi.spyOn(document, 'getSelection').mockReturnValue({
			anchorNode: popup(),
			focusNode: popup(),
			isCollapsed: false,
			removeAllRanges
		} as unknown as Selection);
		cleanups.push(() => selection.mockRestore());

		hitTest(popup());
		mouse(viewport(), 'down', 0, 0);

		expect(removeAllRanges).toHaveBeenCalledTimes(1);
	});

	it('preserves an expanded touch selection whose focus endpoint is in the popup', async () => {
		await mount({ outsideText: 'Outside' });
		const selection = vi.spyOn(document, 'getSelection').mockReturnValue({
			anchorNode: byTestId('outside'),
			focusNode: popup(),
			isCollapsed: false,
			containsNode: () => false
		} as unknown as Selection);
		cleanups.push(() => selection.mockRestore());

		hitTest(popup());
		touchStart(popup(), 0, 100);
		touchMove(popup(), 0, 140);

		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('ignores compatibility touch pointer gestures with real displacement', async () => {
		const onOpenChange = vi.fn();
		await mount({ onOpenChange });

		hitTest(popup());
		const events = [
			['pointerdown', 0, 1],
			['pointermove', 1, 1],
			['pointermove', 100, 1],
			['pointerup', 100, 0],
			['pointercancel', 100, 0]
		] as const;
		for (const [type, clientY, buttons] of events) {
			firePointer(viewport(), type, { pointerType: 'touch', clientX: 0, clientY, buttons });
		}
		await tick();

		expect(backdrop()).not.toHaveAttribute('data-swiping');
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it('publishes and clears swipe progress through Drawer.Provider', async () => {
		await mount({ provider: true, backdrop: false, popupStyle: 'height: 100px' });
		const indent = byTestId('indent');

		hitTest(popup());
		mouse(viewport(), 'down', 0, 0);
		mouse(viewport(), 'move', 0, 1);
		mouse(viewport(), 'move', 0, 40);
		await tick();
		expect(Number.parseFloat(indent.style.getPropertyValue('--drawer-swipe-progress'))).toBeCloseTo(
			0.39
		);
		expect(indent.style.getPropertyValue('--drawer-height')).toBe('100px');

		mouse(viewport(), 'move', 0, 0);
		await tick();
		expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
		expect(indent.style.getPropertyValue('--drawer-height')).toBe('');
	});

	it('publishes resting snap progress when the snap point changes', async () => {
		const screen = await mount({
			modal: false,
			snapPoints: ['100px', '200px'],
			snapPoint: '100px',
			viewportStyle: 'height: 200px',
			popupStyle: 'height: 200px'
		});

		await screen.rerender({ snapPoint: '200px' });

		await expect.poll(() => backdrop().style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
	});

	it('clears kept-mounted swipe state on reopen', async () => {
		const screen = await mount({ open: false, modal: false, keepMounted: true, backdrop: false });
		popup().style.setProperty('--drawer-swipe-movement-y', '50px');
		popup().setAttribute('data-swipe-dismiss', '');

		await screen.rerender({ open: true });
		await tick();

		expect(popup().style.getPropertyValue('--drawer-swipe-movement-y')).toBe('0px');
		expect(popup()).not.toHaveAttribute('data-swipe-dismiss');
	});

	it('clears nested progress when the child closes', async () => {
		const screen = render(DrawerNestedProgressHarness, { childOpen: true });
		await page.getByRole('button', { name: 'Set nested progress' }).click();
		const parentPopup = byTestId('parent-popup');
		expect(parentPopup.style.getPropertyValue('--drawer-swipe-progress')).toBe('0.5');

		await screen.rerender({ childOpen: false });
		await tick();

		expect(parentPopup.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
	});

	it('clears provider and backdrop swipe state on teardown', async () => {
		const screen = await mount({ provider: true, modal: false });
		await page.getByRole('button', { name: 'Set visual state' }).click();
		const indent = byTestId('indent');
		const mountedBackdrop = backdrop();
		mountedBackdrop.setAttribute('data-swiping', '');
		expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('0.5');
		expect(indent.style.getPropertyValue('--drawer-height')).toBe('120px');

		await screen.rerender({ showViewport: false });
		await tick();

		expect(indent.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');
		expect(indent.style.getPropertyValue('--drawer-height')).toBe('');
		expect(mountedBackdrop).not.toHaveAttribute('data-swiping');
	});

	it('leaves pinch-zoom touchmove to the browser', async () => {
		await mount();

		touchStart(popup(), 0, 100);
		const dispatched = touchMoveWith(popup(), [
			{ x: 0, y: 80 },
			{ x: 20, y: 80, id: 2 }
		]);
		await tick();

		expect(dispatched).toBe(true);
		expect(backdrop()).not.toHaveAttribute('data-swiping');
	});

	it('prevents page scrolling for a non-overflowing touch scroll container', async () => {
		await mount({
			backdrop: false,
			html: '<div data-testid="scroll" style="overflow-y: auto">Content</div>'
		});
		const scroll = byTestId('scroll');
		fakeSize(scroll, { clientHeight: 100, scrollHeight: 200 });
		touchStart(scroll, 0, 100);
		fakeSize(scroll, { scrollHeight: 100 });

		const event = fireTouch(scroll, 'touchmove', [{ x: 0, y: 80 }]);
		expect(event.defaultPrevented).toBe(true);

		expect(touchMove(scroll, 0, 60, false)).toBe(true);
	});

	it('keeps a claimed scroll-edge swipe moving through non-cancelable events', async () => {
		await mount({
			backdrop: false,
			html: '<div data-testid="scroll" style="height: 100px; overflow-y: auto"><div style="height: 300px"></div></div>'
		});
		// React portals bubble to the wrapper. The Svelte portal's nearest ancestor is the body.
		const onParentTouchMove = vi.fn();
		document.body.addEventListener('touchmove', onParentTouchMove);
		cleanups.push(() => document.body.removeEventListener('touchmove', onParentTouchMove));
		const scroll = byTestId('scroll');
		fakeSize(scroll, { clientHeight: 100, scrollHeight: 300 });
		scroll.scrollTop = 0;

		touchStart(scroll, 0, 100);
		touchMove(scroll, 0, 120);
		onParentTouchMove.mockClear();

		expect(touchMove(scroll, 0, 130, false)).toBe(true);
		expect(onParentTouchMove).not.toHaveBeenCalled();

		expect(touchMove(scroll, 0, 140)).toBe(false);
	});

	it('does not claim a stationary touch in overflowing content', async () => {
		await mount({
			backdrop: false,
			html: '<div data-testid="scroll" style="height: 100px; overflow-y: auto"><div style="height: 300px"></div></div>'
		});
		const scroll = byTestId('scroll');
		fakeSize(scroll, { clientHeight: 100, scrollHeight: 300 });

		touchStart(scroll, 0, 100);
		const event = fireTouch(scroll, 'touchmove', [{ x: 0, y: 100 }]);

		expect(event.defaultPrevented).toBe(false);
	});
});
