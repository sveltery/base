// Assertions follow Base UI v1.9.0
// packages/react/src/drawer/virtual-keyboard-provider/DrawerVirtualKeyboardProvider.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The visual viewport, window height, and element geometry are stubbed as upstream does, so the
// keyboard is simulated in desktop Chromium.
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DrawerKeyboardHarness from '../../tests/DrawerKeyboardHarness.svelte';
import { byTestId, firePointer, fireTouch, frame, pointAt } from '../../tests/drawer-gestures.js';

const cleanups: Array<() => void> = [];
afterEach(() => {
	while (cleanups.length > 0) cleanups.pop()!();
});

// Chromium defines these window properties on the instance, so the original descriptor exists.
function overrideOn<T extends object>(
	target: T,
	key: keyof T & string,
	descriptor: PropertyDescriptor
) {
	const original = Object.getOwnPropertyDescriptor(target, key)!;
	Object.defineProperty(target, key, { configurable: true, ...descriptor });
	cleanups.push(() => Object.defineProperty(target, key, original));
}

function mockVisualViewport(height: number) {
	const listeners = new Map<string, Set<EventListener>>();
	const visualViewport = {
		height,
		offsetTop: 0,
		scale: 1,
		addEventListener(type: string, listener: EventListener) {
			if (!listeners.has(type)) listeners.set(type, new Set());
			listeners.get(type)!.add(listener);
		},
		removeEventListener(type: string, listener: EventListener) {
			listeners.get(type)?.delete(listener);
		}
	};
	overrideOn(window, 'visualViewport', { value: visualViewport });
	const emit = (type: string) => {
		for (const listener of listeners.get(type) ?? []) listener(new Event(type));
	};
	return {
		resize(nextHeight: number) {
			visualViewport.height = nextHeight;
			emit('resize');
		},
		setScale(nextScale: number) {
			visualViewport.scale = nextScale;
			emit('resize');
		},
		scroll(nextOffsetTop: number, nextHeight?: number) {
			visualViewport.offsetTop = nextOffsetTop;
			if (nextHeight !== undefined) visualViewport.height = nextHeight;
			emit('scroll');
		}
	};
}

function mockWindowInnerHeight(innerHeight: number) {
	overrideOn(window, 'innerHeight', { value: innerHeight });
}

/** The keyboard covers the bottom 300px of an 800px window once `resize(500)` runs. */
function mockKeyboard(height = 800) {
	mockWindowInnerHeight(800);
	return mockVisualViewport(height);
}

function hitTest(...args: Parameters<typeof pointAt>) {
	cleanups.push(pointAt(...args));
}

function spyFocus(element: HTMLElement) {
	const spy = vi.spyOn(element, 'focus');
	cleanups.push(() => spy.mockRestore());
	return spy;
}

function recordClicks(element: HTMLElement) {
	const clicks: MouseEvent[] = [];
	element.addEventListener('click', (event) => clicks.push(event));
	return clicks;
}

async function flushAnimationFrames(count: number) {
	for (let index = 0; index < count; index += 1) await frame();
}

async function mount(props: Record<string, unknown> = {}, root: ParentNode = document) {
	const screen = render(DrawerKeyboardHarness, props);
	await expect.poll(() => root.querySelector('[data-testid="viewport"]')).not.toBeNull();
	await frame();
	return screen;
}

const scrollRect = () => new DOMRect(0, 300, 320, 420);

function stubScroller(scroll: HTMLElement, scrollHeight: number) {
	Object.defineProperties(scroll, {
		clientHeight: { configurable: true, value: 420 },
		scrollHeight: { configurable: true, value: scrollHeight }
	});
	scroll.getBoundingClientRect = scrollRect;
}

/** The field sits 650px down the content, so its rect follows the scroller's position. */
function stubScrolledField(field: HTMLElement, scroll: HTMLElement) {
	field.getBoundingClientRect = () => new DOMRect(0, 650 - scroll.scrollTop, 320, 40);
}

// Applies the provider's scroll synchronously instead of animating it.
function instantScrollTo(scroll: HTMLElement) {
	scroll.scrollTo = ((options?: ScrollToOptions | number) => {
		if (typeof options === 'object' && options?.top !== undefined) scroll.scrollTop = options.top;
	}) as typeof scroll.scrollTo;
}

function centeredIn(field: HTMLElement, scroll: HTMLElement, keyboardViewportHeight: number) {
	const fieldRect = field.getBoundingClientRect();
	const fieldCenter = (fieldRect.top + fieldRect.bottom) / 2;
	return fieldCenter - (scroll.getBoundingClientRect().top + keyboardViewportHeight) / 2;
}

function tap(target: Element, x = 0, y = 0) {
	fireTouch(target, 'touchstart', [{ x, y }]);
	return fireTouch(target, 'touchend', [{ x, y }]);
}

function useFakeTimers() {
	vi.useFakeTimers({
		toFake: [
			'setTimeout',
			'clearTimeout',
			'setInterval',
			'clearInterval',
			'requestAnimationFrame',
			'cancelAnimationFrame'
		]
	});
	cleanups.push(() => vi.useRealTimers());
}

/** A 40px field `top` px down the content of `scroll`. */
function stubFieldAt(field: HTMLElement, top: number, scroll: HTMLElement) {
	field.getBoundingClientRect = () => new DOMRect(0, top - scroll.scrollTop, 320, 40);
}

const twoFields =
	'<input data-testid="first" type="text" /><div style="height: 900px"></div><input data-testid="second" type="text" />';

const tallContent = '<div style="height: 900px"></div><input data-testid="input" type="text" />';
const anchoredContentStyle =
	'height: 420px; overflow-y: auto; overflow-anchor: auto; padding-bottom: 20px';
const contentStyle = 'height: 420px; overflow-y: auto; padding-bottom: 20px';

describe('Drawer.VirtualKeyboardProvider', () => {
	it('compensates for keyboard overlap without adding extra spacing and centers the focused input', async () => {
		const visualViewport = mockKeyboard();
		await mount({ contentStyle: anchoredContentStyle, html: tallContent });
		const scroll = byTestId('scroll');
		const input = byTestId('input');
		stubScroller(scroll, 1200);
		stubScrolledField(input, scroll);
		instantScrollTo(scroll);

		input.focus();
		scroll.scrollTop = 0;
		visualViewport.resize(500);

		await expect.poll(() => scroll.style.paddingBottom).toBe('240px');
		await expect.poll(() => scroll.style.scrollPaddingBottom).not.toBe('');
		await expect.poll(() => scroll.style.overflowAnchor).toBe('none');
		await expect.poll(() => centeredIn(input, scroll, 500)).toBeCloseTo(0, 0);

		input.blur();

		await expect.poll(() => scroll.style.paddingBottom).toBe('20px');
		await expect.poll(() => scroll.style.scrollPaddingBottom).toBe('');
		await expect.poll(() => scroll.style.overflowAnchor).toBe('auto');
	});

	it('tops the scroll container padding up to the visibility margin below the overlap', async () => {
		const visualViewport = mockKeyboard();
		await mount({
			contentStyle: 'height: 420px; overflow-y: auto; padding-bottom: 0',
			html: tallContent
		});
		const scroll = byTestId('scroll');
		const input = byTestId('input');
		stubScroller(scroll, 1200);

		input.focus();
		visualViewport.resize(500);

		// 220px of overlap plus the 16px margin the container's own padding does not cover.
		await expect.poll(() => scroll.style.paddingBottom).toBe('236px');

		input.blur();

		await expect.poll(() => scroll.style.paddingBottom).toBe('0px');
	});

	it('adds scroll slack to a light-DOM scroller for an input inside a shadow root', async () => {
		const visualViewport = mockKeyboard();
		await mount({
			contentStyle: anchoredContentStyle,
			html: '<div style="height: 900px"></div><div data-testid="host"></div>'
		});
		const scroll = byTestId('scroll');
		const input = document.createElement('input');
		input.type = 'text';
		byTestId('host').attachShadow({ mode: 'open' }).append(input);
		stubScroller(scroll, 1200);
		stubScrolledField(input, scroll);
		instantScrollTo(scroll);

		input.focus();
		scroll.scrollTop = 0;
		visualViewport.resize(500);

		await expect.poll(() => Number.parseFloat(scroll.style.paddingBottom)).toBeGreaterThan(20);
		await expect.poll(() => scroll.style.overflowAnchor).toBe('none');
		await expect.poll(() => centeredIn(input, scroll, 500)).toBeCloseTo(0, 0);
	});

	it.each([
		['a potential scroll ancestor for textareas', '', 420, 88],
		['the scroll container, not an overflowing textarea', `line\n`.repeat(40), 800, 600]
	])('adds keyboard scroll slack to %s', async (_case, value, scrollHeight, textareaHeight) => {
		const visualViewport = mockKeyboard();
		await mount({
			html: `<div data-testid="scroll" style="height: 420px; overflow-y: auto; padding-bottom: 20px"><div style="height: 300px"></div><textarea data-testid="textarea">${value}</textarea></div>`
		});
		const scroll = byTestId('scroll');
		const textarea = byTestId('textarea');
		stubScroller(scroll, scrollHeight);
		// An overflowing textarea scrolls itself, which cannot lift its box above the keyboard.
		Object.defineProperties(textarea, {
			clientHeight: { configurable: true, value: 88 },
			scrollHeight: { configurable: true, value: textareaHeight }
		});
		textarea.getBoundingClientRect = () => new DOMRect(0, 650, 320, 40);

		textarea.focus();
		visualViewport.resize(500);

		await expect.poll(() => Number.parseFloat(scroll.style.paddingBottom)).toBeGreaterThan(20);
		expect(textarea.style.paddingBottom).toBe('');
	});

	it('sets the keyboard inset CSS variable for a focused input without a scroll target', async () => {
		const visualViewport = mockKeyboard();
		await mount({ html: '<div><input data-testid="input" type="text" /></div>' });
		const viewport = byTestId('viewport');
		const input = byTestId('input');

		input.focus();
		visualViewport.resize(500);

		await expect
			.poll(() => viewport.style.getPropertyValue('--drawer-keyboard-inset'))
			.toBe('300px');
		await expect
			.poll(() => getComputedStyle(byTestId('popup')).getPropertyValue('--drawer-keyboard-inset'))
			.toBe('300px');

		input.blur();

		await expect.poll(() => viewport.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
	});

	it('captures focusin targets through a shadow root', async () => {
		const visualViewport = mockKeyboard();
		await mount({ html: '<div data-testid="host"></div>' });
		const input = document.createElement('input');
		input.type = 'text';
		byTestId('host').attachShadow({ mode: 'open' }).append(input);

		input.focus();
		visualViewport.resize(500);

		await expect
			.poll(() => byTestId('viewport').style.getPropertyValue('--drawer-keyboard-inset'))
			.toBe('300px');
	});

	it('keeps the keyboard inset when focus moves directly to another keyboard input', async () => {
		const visualViewport = mockKeyboard();
		await mount({
			html: '<div><input data-testid="input-a" type="text" /><input data-testid="input-b" type="text" /></div>'
		});
		const viewport = byTestId('viewport');
		const inputA = byTestId('input-a');

		inputA.focus();
		visualViewport.resize(500);
		await expect
			.poll(() => viewport.style.getPropertyValue('--drawer-keyboard-inset'))
			.toBe('300px');

		// A focusout with no following focusin: clearing on every focusout would leave nothing to
		// restore the inset.
		inputA.dispatchEvent(
			new FocusEvent('focusout', { bubbles: true, relatedTarget: byTestId('input-b') })
		);
		await flushAnimationFrames(2);

		expect(viewport.style.getPropertyValue('--drawer-keyboard-inset')).toBe('300px');
	});

	it('does not add keyboard scroll slack by default', async () => {
		const visualViewport = mockKeyboard();
		await mount({ keyboard: false, contentStyle, html: tallContent });
		const scroll = byTestId('scroll');

		byTestId('input').focus();
		scroll.scrollTop = 0;
		visualViewport.resize(500);
		await flushAnimationFrames(2);

		expect(scroll.style.paddingBottom).toBe('20px');
		expect(scroll.style.scrollPaddingBottom).toBe('');
		expect(scroll.scrollTop).toBe(0);
	});

	it('restores keyboard scroll slack when the drawer closes', async () => {
		const visualViewport = mockKeyboard();
		const screen = await mount({ contentStyle: anchoredContentStyle, html: tallContent });
		const scroll = byTestId('scroll');
		const input = byTestId('input');
		stubScroller(scroll, 1200);
		input.getBoundingClientRect = () => new DOMRect(0, 650, 320, 40);

		input.focus();
		visualViewport.resize(500);
		await expect.poll(() => Number.parseFloat(scroll.style.paddingBottom)).toBeGreaterThan(20);
		await expect.poll(() => scroll.style.overflowAnchor).toBe('none');

		await screen.rerender({ open: false });

		await expect.poll(() => scroll.style.paddingBottom).toBe('20px');
		await expect.poll(() => scroll.style.scrollPaddingBottom).toBe('');
		await expect.poll(() => scroll.style.overflowAnchor).toBe('auto');
	});

	it.each([false, true])(
		'releases keyboard inset and scroll slack after focus leaves the field (pointerdown: %s)',
		async (pointerDown) => {
			const visualViewport = mockKeyboard();
			await mount({
				contentStyle,
				html: '<input data-testid="input" type="text" /><div style="height: 900px"></div><button data-testid="item" type="button"></button>'
			});
			const viewport = byTestId('viewport');
			const scroll = byTestId('scroll');
			const item = byTestId('item');
			scroll.getBoundingClientRect = scrollRect;

			byTestId('input').focus();
			visualViewport.resize(500);
			await expect.poll(() => Number.parseFloat(scroll.style.paddingBottom)).toBeGreaterThan(20);

			// Scroll into the slack, where removing it would clamp the scroll position.
			scroll.scrollTop = scroll.scrollHeight;
			const scrollTop = scroll.scrollTop;
			const paddingBottom = scroll.style.paddingBottom;
			const inset = viewport.style.getPropertyValue('--drawer-keyboard-inset');

			// A tap's mousedown moves focus, and its mouseup and click are hit-tested at the same point
			// in the same task, so nothing under the finger may move synchronously.
			if (pointerDown) {
				window.addEventListener('pointerdown', () => item.focus(), { capture: true, once: true });
				firePointer(item, 'pointerdown', { time: 1 });
			} else {
				item.focus();
			}

			expect(scroll.style.paddingBottom).toBe(paddingBottom);
			expect(scroll.scrollTop).toBe(scrollTop);
			expect(viewport.style.getPropertyValue('--drawer-keyboard-inset')).toBe(inset);

			await flushAnimationFrames(1);

			expect(scroll.style.paddingBottom).toBe('20px');
			expect(viewport.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
		}
	);

	it('activates an item on the first tap while the keyboard is open', async () => {
		const visualViewport = mockKeyboard();
		await mount({
			popupStyle: 'position: fixed; left: 0; top: calc(360px - var(--drawer-keyboard-inset, 0px))',
			html: '<input data-testid="input" type="text" /><button data-testid="item" type="button" style="display: block; width: 200px; height: 40px">Select item</button>'
		});
		const viewport = byTestId('viewport');
		const item = byTestId('item');
		const onClick = vi.fn();
		item.addEventListener('click', onClick);

		byTestId('input').focus();
		visualViewport.resize(500);
		await expect
			.poll(() => viewport.style.getPropertyValue('--drawer-keyboard-inset'))
			.toBe('300px');

		const itemRect = item.getBoundingClientRect();
		const x = itemRect.left + itemRect.width / 2;
		const y = itemRect.top + itemRect.height / 2;

		// A synchronous inset reset on focus loss would move the item before mouseup and click land.
		item.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		item.focus();
		const target = document.elementFromPoint(x, y)!;
		target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
		target.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));

		expect(onClick).toHaveBeenCalledTimes(1);
		await expect.poll(() => viewport.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
	});

	it('does not add keyboard scroll slack while pinch-zoomed', async () => {
		const visualViewport = mockKeyboard();
		await mount({ contentStyle, html: tallContent });
		const scroll = byTestId('scroll');

		byTestId('input').focus();
		scroll.scrollTop = 0;
		visualViewport.setScale(1.5);
		visualViewport.resize(500);
		await flushAnimationFrames(2);

		expect(scroll.style.paddingBottom).toBe('20px');
		expect(scroll.style.scrollPaddingBottom).toBe('');
		expect(scroll.scrollTop).toBe(0);
	});

	it('focuses an unfocused keyboard input on touchend without page scroll', async () => {
		await mount({
			backdrop: true,
			html: '<input data-testid="input" style="opacity: 0.5; transform: scale(1); transition: opacity 1s" type="text" />'
		});
		const backdrop = byTestId('backdrop');
		const input = byTestId('input');
		const focus = spyFocus(input);
		const clicks = recordClicks(input);
		hitTest(input);

		fireTouch(input, 'touchstart', [{ x: 12, y: 34 }]);
		await expect.element(backdrop).toHaveAttribute('data-swiping', '');

		const touchEnd = fireTouch(input, 'touchend', [{ x: 12, y: 34 }]);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(true);
		expect(focus).toHaveBeenCalledWith({ preventScroll: true });
		// Preventing touchend suppresses the native compatibility click, so the provider redispatches.
		expect(clicks).toHaveLength(1);
		expect(clicks[0].clientX).toBe(12);
		expect(clicks[0].clientY).toBe(34);
		expect(clicks[0].detail).toBe(1);
		expect(input.style.opacity).toBe('0.5');
		expect(input.style.transform).toBe('scale(1)');
		expect(input.style.transition).toBe('opacity 1s');
		await expect.element(backdrop).not.toHaveAttribute('data-swiping');
	});

	it('preserves native taps on picker inputs', async () => {
		await mount({ html: '<input data-testid="input" type="date" />' });
		const input = byTestId('input');
		const focus = spyFocus(input);
		hitTest(input);

		const touchEnd = tap(input);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(false);
		expect(focus).not.toHaveBeenCalled();
	});

	it('preserves native taps that lift over a neighboring interactive element', async () => {
		await mount({
			html: '<input data-testid="input" type="text" /><button data-testid="button" type="button">Action</button>'
		});
		const input = byTestId('input');
		const focus = spyFocus(input);
		const clicks = recordClicks(input);
		// The finger lifts over the button, but `touchend.target` stays on the touchstart input.
		hitTest(byTestId('button'));

		fireTouch(input, 'touchstart', [{ x: 0, y: 0 }]);
		const touchEnd = fireTouch(input, 'touchend', [{ x: 5, y: 5 }]);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(false);
		expect(focus).not.toHaveBeenCalled();
		expect(clicks).toHaveLength(0);
	});

	it('resolves the lift point through the shadow root when the drawer renders in one', async () => {
		const host = document.body.appendChild(document.createElement('div'));
		const shadowRoot = host.attachShadow({ mode: 'open' });
		cleanups.push(() => host.remove());
		await mount(
			{
				container: shadowRoot,
				html: '<input data-testid="input" type="text" /><button data-testid="button" type="button">Action</button>'
			},
			shadowRoot
		);
		const input = byTestId('input', shadowRoot);
		const focus = spyFocus(input);
		// A document hit test retargets shadow content to the host. Only the shadow root sees the
		// button under the lift point.
		hitTest(host);
		hitTest(byTestId('button', shadowRoot), shadowRoot);

		fireTouch(input, 'touchstart', [{ x: 0, y: 0 }]);
		const touchEnd = fireTouch(input, 'touchend', [{ x: 5, y: 5 }]);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(false);
		expect(focus).not.toHaveBeenCalled();
	});

	it.each([
		['inputs', '<input data-testid="input" type="text" disabled />', 'input'],
		['textareas', '<textarea data-testid="input" disabled></textarea>', 'input'],
		[
			'a disabled labelled control',
			'<label data-testid="label" for="note">Note</label><input data-testid="input" id="note" type="text" disabled />',
			'label'
		]
	])('preserves native taps on disabled %s', async (_case, html, tapped) => {
		await mount({ html });
		const input = byTestId('input');
		const target = byTestId(tapped);
		const focus = spyFocus(input);
		const clicks = recordClicks(target);
		hitTest(target);

		const touchEnd = tap(target, 24, 48);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(false);
		expect(focus).not.toHaveBeenCalled();
		expect(clicks).toHaveLength(0);
	});

	it('focuses a keyboard input with data-base-ui-swipe-ignore without starting drawer swipe', async () => {
		await mount({
			backdrop: true,
			html: '<input data-testid="input" data-base-ui-swipe-ignore type="text" />'
		});
		const backdrop = byTestId('backdrop');
		const input = byTestId('input');
		const focus = spyFocus(input);
		hitTest(input);

		fireTouch(input, 'touchstart', [{ x: 0, y: 0 }]);
		await tick();
		expect(backdrop).not.toHaveAttribute('data-swiping');

		const touchEnd = fireTouch(input, 'touchend', [{ x: 0, y: 0 }]);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(true);
		expect(focus).toHaveBeenCalledWith({ preventScroll: true });
		expect(backdrop).not.toHaveAttribute('data-swiping');
	});

	it('does not focus a keyboard input on touchend without touchstart', async () => {
		await mount({ html: '<input data-testid="input" type="text" />' });
		const input = byTestId('input');
		const focus = spyFocus(input);
		hitTest(input);

		const touchEnd = fireTouch(input, 'touchend', [{ x: 0, y: 0 }]);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(false);
		expect(focus).not.toHaveBeenCalled();
	});

	it('does not focus a keyboard input after touchcancel', async () => {
		await mount({ html: '<input data-testid="input" type="text" />' });
		const input = byTestId('input');
		const focus = spyFocus(input);
		hitTest(input);

		fireTouch(input, 'touchstart', [{ x: 0, y: 0 }]);
		fireTouch(input, 'touchcancel', [{ x: 0, y: 0 }]);
		await tick();
		const touchEnd = fireTouch(input, 'touchend', [{ x: 0, y: 0 }]);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(false);
		expect(focus).not.toHaveBeenCalled();
	});

	it('does not focus a keyboard input while a nested drawer is open', async () => {
		await mount({
			popupTestId: 'parent-popup',
			nested: true,
			html: '<input data-testid="input" type="text" />'
		});
		const input = byTestId('input');
		const focus = spyFocus(input);
		hitTest(input);
		await expect.element(byTestId('parent-popup')).toHaveAttribute('data-nested-drawer-open', '');

		const touchEnd = tap(input);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(false);
		expect(focus).not.toHaveBeenCalled();
	});

	it('preserves native taps on an already-focused keyboard input', async () => {
		mockKeyboard(500);
		await mount({ html: '<input data-testid="input" type="text" />' });
		const input = byTestId('input');
		input.focus();
		await tick();
		const focus = spyFocus(input);
		hitTest(input);

		const touchEnd = tap(input);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(false);
		expect(focus).not.toHaveBeenCalled();
	});

	it('refocuses an already-focused keyboard input when the keyboard viewport is closed', async () => {
		mockKeyboard();
		await mount({ html: '<input data-testid="input" type="text" />' });
		const input = byTestId('input');
		input.focus();
		await tick();
		const focus = spyFocus(input);
		const blur = vi.spyOn(input, 'blur');
		cleanups.push(() => blur.mockRestore());
		hitTest(input);

		const touchEnd = tap(input);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(true);
		expect(blur).toHaveBeenCalledTimes(1);
		expect(focus).toHaveBeenCalledWith({ preventScroll: true });
	});

	it('overrides the incoming field geometry when focus moves without a tap while the keyboard is open', async () => {
		const visualViewport = mockKeyboard();
		await mount({
			html: '<input data-testid="first" type="text" /><input data-testid="second" type="text" />'
		});
		const first = byTestId('first');
		const second = byTestId('second');
		first.focus();
		visualViewport.resize(500);
		await tick();

		// The provider's capture-phase focusout listener runs before this bubble-phase one.
		let transformDuringFocusChange: string | null = null;
		const onFocusOut = () => {
			transformDuringFocusChange = second.style.transform;
		};
		document.addEventListener('focusout', onFocusOut);
		cleanups.push(() => document.removeEventListener('focusout', onFocusOut));
		const blur = vi.spyOn(second, 'blur');
		cleanups.push(() => blur.mockRestore());
		const focus = spyFocus(second);
		const onFocus = vi.fn();
		second.addEventListener('focus', onFocus);
		let optionsDuringFocusIn: FocusOptions | undefined;
		second.addEventListener('focusin', () => {
			optionsDuringFocusIn = focus.mock.lastCall?.[0];
		});

		// The iOS keyboard's next-field arrow: focus moves with no touch events.
		second.focus();
		await tick();

		expect(transformDuringFocusChange).toContain('translateY');
		expect(second.style.transform).toBe('');
		expect(second.style.opacity).toBe('');
		expect(blur).not.toHaveBeenCalled();
		// iOS 27 records the native focus request between focus and focusin.
		expect(optionsDuringFocusIn).toEqual({ preventScroll: true });
		expect(focus).toHaveBeenCalledTimes(2);
		expect(onFocus).toHaveBeenCalledTimes(1);
		expect(document.activeElement).toBe(second);
	});

	it('centers a field focused without a tap inside the scrollable body', async () => {
		const visualViewport = mockKeyboard();
		await mount({ contentStyle, html: twoFields });
		const scroll = byTestId('scroll');
		const first = byTestId('first');
		const second = byTestId('second');
		stubScroller(scroll, 1200);
		// `first` sits at the center of the visible band, so the first alignment keeps scrollTop 0.
		stubFieldAt(first, 380, scroll);
		stubFieldAt(second, 650, scroll);
		instantScrollTo(scroll);

		first.focus();
		scroll.scrollTop = 0;
		visualViewport.resize(500);
		await tick();
		second.focus();

		await expect.poll(() => centeredIn(second, scroll, 500)).toBeCloseTo(0, 0);
	});

	it('does not restart a progressing or settled reduced-motion alignment scroll', async () => {
		const visualViewport = mockKeyboard();
		const matchMedia = vi
			.spyOn(window, 'matchMedia')
			.mockImplementation(
				(query) => ({ matches: query === '(prefers-reduced-motion: reduce)' }) as MediaQueryList
			);
		cleanups.push(() => matchMedia.mockRestore());
		await mount({ contentStyle, html: twoFields });
		const scroll = byTestId('scroll');
		const first = byTestId('first');
		const second = byTestId('second');
		stubScroller(scroll, 1200);
		stubFieldAt(first, 380, scroll);
		stubFieldAt(second, 650, scroll);
		const scrollTo = vi.fn();
		scroll.scrollTo = scrollTo as unknown as typeof scroll.scrollTo;
		useFakeTimers();

		first.focus();
		visualViewport.resize(500);
		await tick();
		scrollTo.mockClear();

		second.focus();
		vi.advanceTimersToNextFrame();
		vi.advanceTimersToNextFrame();

		expect(scrollTo).toHaveBeenCalledWith({ top: 270, behavior: 'auto' });

		scroll.scrollTop = 100;
		await vi.advanceTimersByTimeAsync(150);
		expect(scrollTo).toHaveBeenCalledTimes(1);

		scroll.scrollTop = 270;
		await vi.runAllTimersAsync();

		expect(scroll.scrollTop).toBe(270);
		expect(scrollTo).toHaveBeenCalledTimes(1);
	});

	it('re-issues the alignment scroll when a delayed realign pass finds it stalled', async () => {
		const visualViewport = mockKeyboard();
		await mount({ contentStyle, html: twoFields });
		const scroll = byTestId('scroll');
		const first = byTestId('first');
		const second = byTestId('second');
		stubScroller(scroll, 1200);
		stubFieldAt(first, 380, scroll);
		stubFieldAt(second, 650, scroll);
		// A scroll that never moves stands in for a smooth scroll canceled by WebKit's native reveal.
		const scrollTo = vi.fn();
		scroll.scrollTo = scrollTo as unknown as typeof scroll.scrollTo;

		first.focus();
		visualViewport.resize(500);
		await tick();
		scrollTo.mockClear();
		second.focus();

		await expect.poll(() => scrollTo.mock.calls.length).toBeGreaterThanOrEqual(2);
		expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ top: 270 }));
	});

	it('stops pending realignment once the user starts scrolling while geometry is changing', async () => {
		const visualViewport = mockKeyboard();
		await mount({ contentStyle, html: twoFields });
		const scroll = byTestId('scroll');
		const first = byTestId('first');
		const second = byTestId('second');
		Object.defineProperties(scroll, {
			clientHeight: { configurable: true, value: 420 },
			scrollHeight: { configurable: true, value: 1200 }
		});
		let scrollBottom = 380;
		scroll.getBoundingClientRect = () => new DOMRect(0, 300, 320, scrollBottom - 300);
		stubFieldAt(first, 380, scroll);
		stubFieldAt(second, 650, scroll);
		// A stalled scroll looks like a user scroll that stopped, so a pointer going down must cancel
		// the passes instead of yanking the drawer back to center.
		const scrollTo = vi.fn();
		scroll.scrollTo = scrollTo as unknown as typeof scroll.scrollTo;
		useFakeTimers();

		first.focus();
		visualViewport.resize(500);
		await tick();
		scrollTo.mockClear();

		second.focus();
		// The first settle check sees the squeezed body before the user takes over.
		vi.advanceTimersToNextFrame();
		scroll.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		for (const bottom of [400, 440, 480, 480]) {
			scrollBottom = bottom;
			vi.advanceTimersToNextFrame();
		}
		await vi.runAllTimersAsync();

		expect(scrollTo).not.toHaveBeenCalled();
	});

	it('clears keyboard state when a tapped input redirects focus away', async () => {
		mockKeyboard(500);
		await mount({
			html: '<input data-testid="input" type="text" /><button data-testid="other" type="button"></button>'
		});
		const viewport = byTestId('viewport');
		const input = byTestId('input');
		const other = byTestId('other');
		// Runs after the provider's capture-phase focusin already recorded the input.
		input.addEventListener('focusin', () => other.focus());
		hitTest(input);
		useFakeTimers();

		tap(input, 12, 34);
		await vi.runAllTimersAsync();

		expect(document.activeElement).toBe(other);
		expect(viewport.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
	});

	it('clears keyboard state when a tapped input blurs itself', async () => {
		mockKeyboard(500);
		await mount({ contentStyle: anchoredContentStyle, html: tallContent });
		const viewport = byTestId('viewport');
		const scroll = byTestId('scroll');
		const input = byTestId('input');
		stubScroller(scroll, 1200);
		input.getBoundingClientRect = () => new DOMRect(0, 650, 320, 40);
		// A consumer that opens its own picker blurs the field on focus, so focus ends on the body
		// and no focusin follows. That focusout is the provider's only chance to drop the field.
		input.addEventListener('focusin', () => input.blur());
		hitTest(input);

		tap(input, 12, 34);
		await flushAnimationFrames(3);

		expect(document.activeElement).not.toBe(input);
		expect(viewport.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
		expect(scroll.style.paddingBottom).toBe('20px');
		expect(scroll.style.scrollPaddingBottom).toBe('');
	});

	it('defers the alignment scroll until the destination stops moving', async () => {
		const visualViewport = mockKeyboard();
		await mount({ contentStyle: 'height: 420px; overflow-y: auto', html: tallContent });
		const scroll = byTestId('scroll');
		const input = byTestId('input');
		Object.defineProperties(scroll, {
			clientHeight: { configurable: true, value: 420 },
			scrollHeight: { configurable: true, value: 1200 }
		});
		// The bottom edge moves after focus, like a footer resizing over a transition.
		let scrollBottom = 380;
		scroll.getBoundingClientRect = () => new DOMRect(0, 300, 320, scrollBottom - 300);
		stubFieldAt(input, 650, scroll);
		const scrollTo = vi.fn((options?: ScrollToOptions | number) => {
			if (typeof options === 'object' && options?.top !== undefined) scroll.scrollTop = options.top;
		});
		scroll.scrollTo = scrollTo as unknown as typeof scroll.scrollTo;
		useFakeTimers();

		visualViewport.resize(500);
		await tick();
		input.focus();
		await tick();
		vi.advanceTimersToNextFrame();
		scrollBottom = 480;
		await vi.runAllTimersAsync();

		// Squeezed: band [316, 364], center 340, field center 670, scrollTop 330. Settled: band
		// [316, 464], center 390, scrollTop 280. The squeezed destination is never scrolled to.
		expect(scroll.scrollTop).toBe(280);
		expect(scrollTo).toHaveBeenCalledTimes(1);
		expect(scrollTo).not.toHaveBeenCalledWith(expect.objectContaining({ top: 330 }));
	});

	it('eventually aligns when geometry never settles', async () => {
		mockKeyboard(500);
		await mount({
			initialFocus: false,
			html: '<div data-testid="scroll" style="height: 420px; overflow-y: auto"><input data-testid="input" type="text" /></div>'
		});
		const scroll = byTestId('scroll');
		const input = byTestId('input');
		let geometryTick = 0;
		Object.defineProperties(scroll, {
			clientHeight: { configurable: true, value: 420 },
			scrollHeight: { configurable: true, value: 1200 }
		});
		scroll.getBoundingClientRect = () => {
			geometryTick += 1;
			return new DOMRect(0, geometryTick % 2 === 0 ? 100 : 200, 320, 300);
		};
		input.getBoundingClientRect = () => new DOMRect(0, 650, 320, 40);
		const scrollTo = vi.fn();
		scroll.scrollTo = scrollTo as unknown as typeof scroll.scrollTo;
		useFakeTimers();

		input.focus();
		for (let index = 0; index < 65; index += 1) vi.advanceTimersToNextFrame();

		expect(scrollTo).toHaveBeenCalledTimes(1);
	});

	it('realigns a tapped field in the scrollable body when the keyboard is already open for a field outside it', async () => {
		const visualViewport = mockKeyboard();
		await mount({
			contentStyle: 'height: 420px; overflow-y: auto',
			html: '<div style="height: 900px"></div><textarea data-testid="textarea"></textarea>'
		});
		// The footer field sits outside Drawer.Content.
		const footer = byTestId('popup').appendChild(document.createElement('div'));
		const footerInput = footer.appendChild(document.createElement('input'));
		footerInput.type = 'text';
		const scroll = byTestId('scroll');
		const textarea = byTestId('textarea');
		Object.defineProperties(scroll, {
			clientHeight: { configurable: true, value: 420 },
			scrollHeight: { configurable: true, value: 1200 }
		});
		// Squeezed while the footer field holds focus, then expanded once focus moves into the body.
		let scrollBottom = 380;
		scroll.getBoundingClientRect = () => new DOMRect(0, 100, 320, scrollBottom - 100);
		stubFieldAt(textarea, 650, scroll);
		instantScrollTo(scroll);

		footerInput.focus();
		visualViewport.resize(500);
		await tick();
		hitTest(textarea);

		tap(textarea, 24, 300);
		await tick();
		expect(document.activeElement).toBe(textarea);

		// Squeezed band [116, 364], center 240, textarea center 670, scrollTop 430.
		await expect.poll(() => scroll.scrollTop).toBe(430);

		// Only the delayed realign passes see the expanded scroller.
		scrollBottom = 480;
		await expect
			.poll(() => {
				const scrollRect = scroll.getBoundingClientRect();
				const fieldRect = textarea.getBoundingClientRect();
				return (
					(fieldRect.top + fieldRect.bottom) / 2 -
					(scrollRect.top + Math.min(scrollRect.bottom, 500)) / 2
				);
			})
			.toBeCloseTo(0, 0);
	});

	it('does not blur and re-focus for focus changes while the keyboard is closed', async () => {
		mockKeyboard();
		await mount({
			html: '<input data-testid="first" type="text" /><input data-testid="second" type="text" />'
		});
		const second = byTestId('second');
		byTestId('first').focus();
		await tick();
		const blur = vi.spyOn(second, 'blur');
		cleanups.push(() => blur.mockRestore());
		const focus = spyFocus(second);

		second.focus();
		await tick();

		expect(blur).not.toHaveBeenCalled();
		expect(focus).toHaveBeenCalledTimes(1);
		expect(document.activeElement).toBe(second);
	});

	it.each([
		[true, [{ left: 0, top: 0, behavior: 'instant' }]],
		[false, []]
	])(
		'restores the page scroll position while the keyboard is open only for a modal drawer (modal: %s)',
		async (modal, calls) => {
			const visualViewport = mockKeyboard();
			await mount({ modal, html: '<input data-testid="input" type="text" />' });
			byTestId('input').focus();
			visualViewport.resize(500);
			await tick();
			const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
			cleanups.push(() => scrollTo.mockRestore());

			// WebKit's native reveal scroll escaping the scroll lock. The restore must be instant, as
			// the two-argument form would follow a global `scroll-behavior: smooth`.
			overrideOn(window, 'scrollY', { value: 120 });
			window.dispatchEvent(new Event('scroll'));

			expect(scrollTo.mock.calls).toEqual(calls.map((call) => [call]));
		}
	);

	it('does not treat a small visual viewport reduction as the software keyboard', async () => {
		const visualViewport = mockKeyboard();
		await mount({ contentStyle, html: tallContent });
		const scroll = byTestId('scroll');
		Object.defineProperties(scroll, {
			clientHeight: { configurable: true, value: 420 },
			scrollHeight: { configurable: true, value: 1200 }
		});

		// 50px is below the 60px keyboard threshold, so it reads as browser chrome moving.
		byTestId('input').focus();
		visualViewport.resize(750);

		await expect
			.poll(() => byTestId('viewport').style.getPropertyValue('--drawer-keyboard-inset'))
			.toBe('0px');
		expect(scroll.style.paddingBottom).toBe('20px');
		expect(scroll.style.overflowAnchor).toBe('');
	});

	it('computes the keyboard inset from a non-zero visual viewport offset', async () => {
		const visualViewport = mockKeyboard();
		await mount({ html: '<input data-testid="input" type="text" />' });

		byTestId('input').focus();
		visualViewport.scroll(40, 500);

		// 800 - (40 + 500) = 260.
		await expect
			.poll(() => byTestId('viewport').style.getPropertyValue('--drawer-keyboard-inset'))
			.toBe('260px');
	});

	it.each(['explicit', 'implicit'])(
		'preserves preventScroll after activating an %s label with no input focused',
		async (association) => {
			const field = '<input data-testid="input" id="note" type="text" />';
			await mount({
				initialFocus: false,
				html:
					association === 'explicit'
						? `<label data-testid="label" for="note"><span data-testid="label-text">Note</span></label>${field}`
						: `<label data-testid="label"><span data-testid="label-text">Note</span>${field}</label>`
			});
			const label = byTestId('label');
			const input = byTestId('input');
			const labelText = byTestId('label-text');
			expect(document.activeElement).not.toBe(input);
			const focus = spyFocus(input);
			const onFocus = vi.fn();
			const onBlur = vi.fn();
			input.addEventListener('focus', onFocus);
			input.addEventListener('blur', onBlur);
			const inputClicks: MouseEvent[] = [];
			let focusCallsDuringActivation = 0;
			input.addEventListener('click', (event) => {
				inputClicks.push(event);
				focusCallsDuringActivation = focus.mock.calls.length;
			});
			const labelClicks: MouseEvent[] = [];
			label.addEventListener('click', (event) => {
				if (event.target === labelText) labelClicks.push(event);
			});
			hitTest(labelText);

			const touchEnd = tap(labelText, 24, 48);
			await tick();

			expect(touchEnd.defaultPrevented).toBe(true);
			expect(focus).toHaveBeenCalledWith({ preventScroll: true });
			expect(labelClicks).toHaveLength(1);
			expect(labelClicks[0].clientX).toBe(24);
			expect(labelClicks[0].clientY).toBe(48);
			expect(labelClicks[0].detail).toBe(1);
			expect(labelClicks[0].defaultPrevented).toBe(false);
			expect(inputClicks).toHaveLength(1);
			// WebKit's label activation refocuses without preventScroll, so it is reapplied without a
			// new focus and blur cycle.
			expect(focusCallsDuringActivation).toBe(1);
			expect(focus).toHaveBeenCalledTimes(2);
			expect(focus).toHaveBeenLastCalledWith({ preventScroll: true });
			expect(onFocus).toHaveBeenCalledTimes(1);
			expect(onBlur).not.toHaveBeenCalled();
			expect(document.activeElement).toBe(input);
		}
	);

	it('preserves a focus change from a label click handler', async () => {
		await mount({
			initialFocus: false,
			html: '<label data-testid="label" for="note">Note</label><input data-testid="input" id="note" /><button data-testid="other" type="button">Other</button>'
		});
		const label = byTestId('label');
		const other = byTestId('other');
		label.addEventListener('click', (event) => {
			event.preventDefault();
			other.focus();
		});
		const focus = spyFocus(byTestId('input'));
		hitTest(label);

		tap(label, 24, 48);
		await tick();

		expect(document.activeElement).toBe(other);
		expect(focus).toHaveBeenCalledTimes(1);
	});

	it('focuses a contentEditable element on touchend', async () => {
		await mount({ html: '<div data-testid="editor" contenteditable="true">Edit me</div>' });
		const editor = byTestId('editor');
		const focus = spyFocus(editor);
		hitTest(editor);

		const touchEnd = tap(editor);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(true);
		expect(focus).toHaveBeenCalledWith({ preventScroll: true });
	});

	it('focuses the editing host when tapping a nested element inside a contentEditable', async () => {
		await mount({
			html: '<div data-testid="editor" contenteditable="true"><span data-testid="inner">Edit me</span></div>'
		});
		const inner = byTestId('inner');
		// Inherited-editable descendants are not focusable, so the editing host takes focus.
		hitTest(inner);

		const touchEnd = tap(inner);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(byTestId('editor'));
	});

	it('probes nearby points to resolve a keyboard input retargeted on touchend', async () => {
		await mount({
			html: '<div data-testid="wrapper" style="padding: 20px"><input data-testid="input" type="text" /></div>'
		});
		const wrapper = byTestId('wrapper');
		const input = byTestId('input');
		const focus = spyFocus(input);
		// Only the probe 16px below the tap resolves to the input.
		hitTest((_x, y) => (y === 16 ? input : wrapper));

		const touchEnd = tap(wrapper);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(true);
		expect(focus).toHaveBeenCalledWith({ preventScroll: true });
	});

	it('does not focus a keyboard input when the touch moves past the tap threshold', async () => {
		await mount({ html: '<input data-testid="input" type="text" />' });
		const input = byTestId('input');
		const focus = spyFocus(input);
		hitTest(input);

		// Past the 10px tap threshold the gesture is a scroll.
		fireTouch(input, 'touchstart', [{ x: 0, y: 0 }]);
		fireTouch(input, 'touchmove', [{ x: 0, y: 80 }]);
		const touchEnd = fireTouch(input, 'touchend', [{ x: 0, y: 80 }]);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(false);
		expect(focus).not.toHaveBeenCalled();

		fireTouch(input, 'touchstart', [{ x: 0, y: 0 }]);
		fireTouch(input, 'touchmove', [{ x: 0, y: 5 }]);
		const shortMoveTouchEnd = fireTouch(input, 'touchend', [{ x: 0, y: 5 }]);
		await tick();

		expect(shortMoveTouchEnd.defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(input);
	});

	it('restores the previous scroll slack when focus moves to a different scroll container', async () => {
		const visualViewport = mockKeyboard();
		const scroller = (index: number) =>
			`<div data-testid="scroll${index}" style="height: 200px; overflow-y: auto; padding-bottom: 10px"><div style="height: 600px"></div><input data-testid="input${index}" type="text" /></div>`;
		await mount({ html: scroller(1) + scroller(2) });
		const [scroll1, scroll2] = [byTestId('scroll1'), byTestId('scroll2')];
		const [input1, input2] = [byTestId('input1'), byTestId('input2')];
		for (const scroll of [scroll1, scroll2]) {
			Object.defineProperties(scroll, {
				clientHeight: { configurable: true, value: 200 },
				scrollHeight: { configurable: true, value: 800 }
			});
		}
		// Both containers extend below the reduced viewport bottom, so each needs slack.
		scroll1.getBoundingClientRect = () => new DOMRect(0, 520, 320, 40);
		scroll2.getBoundingClientRect = () => new DOMRect(0, 560, 320, 40);
		input1.getBoundingClientRect = () => new DOMRect(0, 540, 320, 40);
		input2.getBoundingClientRect = () => new DOMRect(0, 580, 320, 40);

		input1.focus();
		visualViewport.resize(500);
		await expect.poll(() => Number.parseFloat(scroll1.style.paddingBottom)).toBeGreaterThan(10);

		input2.focus();

		await expect.poll(() => Number.parseFloat(scroll2.style.paddingBottom)).toBeGreaterThan(10);
		expect(scroll1.style.paddingBottom).toBe('10px');
		expect(scroll1.style.overflowAnchor).toBe('');
	});

	it('does not steal a tap that lands on an interactive element near a keyboard input', async () => {
		await mount({
			html: '<input data-testid="input" type="text" /><button data-testid="clear" type="button">Clear</button>'
		});
		const input = byTestId('input');
		const clear = byTestId('clear');
		const focus = spyFocus(input);
		// Only the hit-slop probes resolve to the input. They must not steal the button's tap.
		hitTest((x, y) => (x === 0 && y === 0 ? clear : input));

		const touchEnd = tap(clear);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(false);
		expect(focus).not.toHaveBeenCalled();
	});

	it('preserves native taps on keyboard inputs while pinch-zoomed', async () => {
		const visualViewport = mockKeyboard();
		await mount({ html: '<input data-testid="input" type="text" />' });
		const input = byTestId('input');
		const focus = spyFocus(input);
		hitTest(input);
		visualViewport.setScale(1.5);

		const touchEnd = tap(input);
		await tick();

		expect(touchEnd.defaultPrevented).toBe(false);
		expect(focus).not.toHaveBeenCalled();
	});

	it('restores slack from a removed scroll container before adjusting a new one', async () => {
		const visualViewport = mockKeyboard();
		await mount({
			initialFocus: false,
			html: '<div data-testid="scroll1" style="overflow-y: auto; padding-bottom: 10px"><input data-testid="input1" type="text" /></div><div data-testid="scroll2" style="overflow-y: auto"><input data-testid="input2" type="text" /></div>'
		});
		const [scroll1, scroll2] = [byTestId('scroll1'), byTestId('scroll2')];
		const [input1, input2] = [byTestId('input1'), byTestId('input2')];
		for (const scroll of [scroll1, scroll2]) {
			Object.defineProperties(scroll, {
				clientHeight: { configurable: true, value: 200 },
				scrollHeight: { configurable: true, value: 800 }
			});
			scroll.getBoundingClientRect = () => new DOMRect(0, 300, 320, 400);
		}
		input1.getBoundingClientRect = () => new DOMRect(0, 620, 320, 40);
		input2.getBoundingClientRect = () => new DOMRect(0, 620, 320, 40);

		input1.focus();
		visualViewport.resize(500);
		await expect.poll(() => Number.parseFloat(scroll1.style.paddingBottom)).toBeGreaterThan(10);

		Object.defineProperty(scroll1, 'isConnected', { configurable: true, value: false });
		input2.focus();

		await expect.poll(() => Number.parseFloat(scroll2.style.paddingBottom)).toBeGreaterThan(0);
		expect(scroll1.style.paddingBottom).toBe('10px');
		expect(scroll1.style.overflowAnchor).toBe('');
	});

	it('clears inset and slack when the focused field is removed', async () => {
		const visualViewport = mockKeyboard();
		await mount({
			initialFocus: false,
			html: '<div data-testid="scroll" style="overflow-y: auto; padding-bottom: 10px"><input data-testid="input" type="text" /></div>'
		});
		const viewport = byTestId('viewport');
		const scroll = byTestId('scroll');
		const input = byTestId('input');
		Object.defineProperties(scroll, {
			clientHeight: { configurable: true, value: 200 },
			scrollHeight: { configurable: true, value: 800 }
		});
		scroll.getBoundingClientRect = () => new DOMRect(0, 300, 320, 400);
		input.getBoundingClientRect = () => new DOMRect(0, 620, 320, 40);

		input.focus();
		visualViewport.resize(500);
		await expect.poll(() => Number.parseFloat(scroll.style.paddingBottom)).toBeGreaterThan(10);

		const nativeContains = viewport.contains.bind(viewport);
		viewport.contains = (candidate) => (candidate === input ? false : nativeContains(candidate));
		visualViewport.resize(490);
		await flushAnimationFrames(2);

		expect(viewport.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
		expect(scroll.style.paddingBottom).toBe('10px');
	});

	it('captures an initially focused input without attempting an unnecessary page restore', async () => {
		mockKeyboard(500);
		const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
		cleanups.push(() => scrollTo.mockRestore());
		await mount({ modal: true, initialFocus: false, autofocus: true });

		expect(document.activeElement).toBe(byTestId('input'));
		await expect
			.poll(() => byTestId('viewport').style.getPropertyValue('--drawer-keyboard-inset'))
			.toBe('300px');
		expect(scrollTo).not.toHaveBeenCalled();
	});

	it('ignores a directly captured touch target while a closed drawer remains mounted', async () => {
		await mount({ closable: true, initialFocus: false, direct: true });
		const input = byTestId('input');
		hitTest(input);

		byTestId('popup').querySelector('button')!.click();
		await expect.poll(() => byTestId('popup').hasAttribute('data-closed')).toBe(true);

		fireTouch(input, 'touchstart', [{ x: 0, y: 0 }]);
		fireTouch(input, 'touchmove', []);
		fireTouch(input, 'touchend', [{ x: 0, y: 0 }]);

		expect(document.activeElement).not.toBe(input);
	});

	it('does not focus a lift-point target outside the drawer', async () => {
		const outside = document.createElement('input');
		outside.type = 'text';
		document.body.append(outside);
		cleanups.push(() => outside.remove());
		await mount({ initialFocus: false, html: '<input data-testid="inside" type="text" />' });
		const inside = byTestId('inside');
		hitTest(outside);

		tap(inside);

		expect(document.activeElement).not.toBe(inside);
		expect(document.activeElement).not.toBe(outside);
	});

	it('falls back to the touch target when point lookup misses', async () => {
		await mount({ initialFocus: false, html: '<input data-testid="input" type="text" />' });
		const input = byTestId('input');
		hitTest(null);

		const touchEnd = tap(input);

		expect(touchEnd.defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(input);
	});

	// Upstream also deletes window.PointerEvent to reach the MouseEvent fallback. Floating UI's
	// dismiss hook here assumes PointerEvent exists, so only the remaining-touch half is ported.
	it('uses the remaining touch for keyboard taps without changed touches', async () => {
		await mount({ initialFocus: false, html: '<input data-testid="input" type="text" />' });
		const input = byTestId('input');
		hitTest(null);
		const clicks = recordClicks(input);

		fireTouch(input, 'touchstart', [{ x: 10, y: 20 }]);
		const touchEnd = new Event('touchend', { bubbles: true, cancelable: true });
		Object.defineProperties(touchEnd, {
			changedTouches: { configurable: true, value: [] },
			touches: {
				configurable: true,
				value: [new Touch({ identifier: 1, target: input, clientX: 10, clientY: 20 })]
			}
		});
		input.dispatchEvent(touchEnd);

		expect(touchEnd.defaultPrevented).toBe(true);
		expect(document.activeElement).toBe(input);
		expect(clicks.map((click) => [click.constructor.name, click.clientX, click.clientY])).toEqual([
			['PointerEvent', 10, 20]
		]);
	});

	it('ignores a keyboard tap whose native target is not an element', async () => {
		await mount({ initialFocus: false, html: '<input data-testid="input" type="text" />' });
		const input = byTestId('input');
		hitTest(null);

		fireTouch(input, 'touchstart', [{ x: 10, y: 20 }]);
		const touchEnd = new TouchEvent('touchend', {
			bubbles: true,
			cancelable: true,
			changedTouches: [new Touch({ identifier: 1, target: input, clientX: 10, clientY: 20 })]
		});
		touchEnd.composedPath = () => [window];
		input.dispatchEvent(touchEnd);

		expect(touchEnd.defaultPrevented).toBe(false);
		expect(document.activeElement).not.toBe(input);
	});

	it('ignores touchend without a lift coordinate', async () => {
		await mount({ initialFocus: false, html: '<input data-testid="input" type="text" />' });
		const input = byTestId('input');

		fireTouch(input, 'touchstart', [{ x: 10, y: 20 }]);
		const touchEnd = new Event('touchend', { bubbles: true, cancelable: true });
		Object.defineProperties(touchEnd, {
			changedTouches: { configurable: true, value: [] },
			touches: { configurable: true, value: [] }
		});
		input.dispatchEvent(touchEnd);
		await tick();

		expect(document.activeElement).not.toBe(input);
	});

	it('does not align inputs when visualViewport is unavailable', async () => {
		overrideOn(window, 'visualViewport', { value: undefined });
		await mount({ initialFocus: false, html: '<input data-testid="input" type="text" />' });

		byTestId('input').focus();
		await flushAnimationFrames(2);

		expect(byTestId('viewport').style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
	});

	describe('layout viewport resized for the keyboard (Chrome on iOS)', () => {
		function mockResizableInnerHeight(initialHeight: number) {
			let innerHeight = initialHeight;
			overrideOn(window, 'innerHeight', { get: () => innerHeight });
			return {
				resize(nextHeight: number) {
					innerHeight = nextHeight;
					window.dispatchEvent(new Event('resize'));
				}
			};
		}

		// New Chrome on iOS shrinks `svh` for the keyboard before resizing the layout viewport.
		function mockSmallViewportHeight(initialHeight: number) {
			const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')!;
			let smallViewportHeight = initialHeight;
			Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
				configurable: true,
				get(this: HTMLElement) {
					return this.style.height === '100svh' ? smallViewportHeight : original.get!.call(this);
				}
			});
			cleanups.push(() => Object.defineProperty(HTMLElement.prototype, 'offsetHeight', original));
			return {
				set(nextHeight: number) {
					smallViewportHeight = nextHeight;
				}
			};
		}

		async function mountKeyboardDrawer() {
			await mount({ contentStyle, html: tallContent });
			useFakeTimers();
			return {
				viewport: byTestId('viewport'),
				scroll: byTestId('scroll'),
				input: byTestId('input')
			};
		}

		function mockScrollGeometry(scroll: HTMLElement, input: HTMLElement) {
			Object.defineProperties(scroll, {
				clientHeight: { configurable: true, value: 380 },
				scrollHeight: { configurable: true, value: 1200 }
			});
			// The shrunken viewport keeps the scroller above the keyboard.
			scroll.getBoundingClientRect = () => new DOMRect(0, 100, 320, 380);
			stubFieldAt(input, 650, scroll);
		}

		it('applies no keyboard inset or slack when the small viewport follows the keyboard', async () => {
			const innerHeight = mockResizableInnerHeight(800);
			const visualViewport = mockVisualViewport(800);
			const smallViewport = mockSmallViewportHeight(800);
			const { viewport, scroll, input } = await mountKeyboardDrawer();
			// Against the full-height layout viewport, the keyboard would overlap the scroller's bottom
			// 220px.
			scroll.getBoundingClientRect = () => new DOMRect(0, window.innerHeight - 500, 320, 420);

			input.focus();
			smallViewport.set(500);
			visualViewport.resize(500);
			vi.advanceTimersToNextFrame();
			await tick();

			expect(viewport.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
			expect(scroll.style.paddingBottom).toBe('20px');

			innerHeight.resize(650);
			vi.advanceTimersToNextFrame();
			await tick();

			expect(viewport.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
			expect(scroll.style.paddingBottom).toBe('20px');
		});

		it('aligns the focused field once the layout viewport has shrunk to the visual viewport', async () => {
			const innerHeight = mockResizableInnerHeight(800);
			const visualViewport = mockVisualViewport(800);
			const { viewport, scroll, input } = await mountKeyboardDrawer();
			mockScrollGeometry(scroll, input);
			instantScrollTo(scroll);

			// The visual viewport shrinks first. The layout viewport follows a frame later.
			input.focus();
			scroll.scrollTop = 0;
			visualViewport.resize(500);
			vi.advanceTimersToNextFrame();
			innerHeight.resize(500);
			await vi.advanceTimersByTimeAsync(200);

			const inputRect = input.getBoundingClientRect();
			expect((inputRect.top + inputRect.bottom) / 2).toBeCloseTo((100 + 480) / 2, 0);
			expect(viewport.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
			expect(scroll.style.paddingBottom).toBe('20px');
		});

		it('scrolls the focused field once the layout viewport reaches the visual viewport', async () => {
			const innerHeight = mockResizableInnerHeight(800);
			const visualViewport = mockVisualViewport(800);
			const smallViewport = mockSmallViewportHeight(800);
			const { scroll, input } = await mountKeyboardDrawer();
			mockScrollGeometry(scroll, input);
			const scrollTo = vi.spyOn(scroll, 'scrollTo').mockImplementation(() => {});

			input.focus();
			smallViewport.set(500);
			visualViewport.resize(500);
			vi.advanceTimersToNextFrame();
			// The layout viewport can pause on its way down.
			innerHeight.resize(700);
			vi.advanceTimersToNextFrame();
			innerHeight.resize(600);
			vi.advanceTimersToNextFrame();
			vi.advanceTimersToNextFrame();
			vi.advanceTimersToNextFrame();

			expect(scrollTo).not.toHaveBeenCalled();

			innerHeight.resize(500);
			vi.advanceTimersToNextFrame();
			vi.advanceTimersToNextFrame();

			expect(scrollTo).toHaveBeenCalledTimes(1);
		});

		it('waits for the layout viewport to grow to a shorter keyboard before scrolling', async () => {
			const innerHeight = mockResizableInnerHeight(800);
			const visualViewport = mockVisualViewport(800);
			const smallViewport = mockSmallViewportHeight(800);
			const { scroll, input } = await mountKeyboardDrawer();
			mockScrollGeometry(scroll, input);
			const scrollTo = vi.spyOn(scroll, 'scrollTo').mockImplementation(() => {});

			input.focus();
			smallViewport.set(500);
			visualViewport.resize(500);
			vi.advanceTimersToNextFrame();
			innerHeight.resize(500);
			await vi.advanceTimersByTimeAsync(2000);
			expect(scrollTo).toHaveBeenCalledTimes(1);
			scrollTo.mockClear();

			// The keyboard gets shorter while staying open. The layout viewport follows later.
			smallViewport.set(540);
			visualViewport.resize(540);
			vi.advanceTimersToNextFrame();
			vi.advanceTimersToNextFrame();
			vi.advanceTimersToNextFrame();

			expect(scrollTo).not.toHaveBeenCalled();

			innerHeight.resize(540);
			vi.advanceTimersToNextFrame();
			vi.advanceTimersToNextFrame();

			expect(scrollTo).toHaveBeenCalledTimes(1);
		});

		it('does not treat a plain resize of both viewports as the software keyboard', async () => {
			const innerHeight = mockResizableInnerHeight(800);
			const visualViewport = mockVisualViewport(800);
			const { viewport, scroll, input } = await mountKeyboardDrawer();
			mockScrollGeometry(scroll, input);
			const scrollTo = vi.spyOn(scroll, 'scrollTo').mockImplementation(() => {});

			input.focus();
			await vi.advanceTimersByTimeAsync(100);
			// A window resize (or rotation) moves both viewports together.
			visualViewport.resize(500);
			innerHeight.resize(500);
			await vi.advanceTimersByTimeAsync(200);

			expect(scrollTo).not.toHaveBeenCalled();
			expect(['', '0px']).toContain(viewport.style.getPropertyValue('--drawer-keyboard-inset'));
			expect(scroll.style.paddingBottom).toBe('20px');
		});

		it('clears the keyboard inset and slack once the layout viewport catches up with the visual viewport', async () => {
			const innerHeight = mockResizableInnerHeight(800);
			const visualViewport = mockVisualViewport(800);
			const { viewport, scroll, input } = await mountKeyboardDrawer();
			// The keyboard overlaps the scroller's bottom 220px.
			let scrollBottom = 720;
			scroll.getBoundingClientRect = () => new DOMRect(0, scrollBottom - 420, 320, 420);

			// Let the alignment passes finish so only the resize can re-measure.
			input.focus();
			visualViewport.resize(500);
			await vi.advanceTimersByTimeAsync(2000);

			expect(viewport.style.getPropertyValue('--drawer-keyboard-inset')).toBe('300px');
			expect(scroll.style.paddingBottom).toBe('240px');

			// The layout viewport catches up and the fixed drawer lays out inside it.
			scrollBottom = 480;
			innerHeight.resize(500);
			vi.advanceTimersToNextFrame();

			expect(viewport.style.getPropertyValue('--drawer-keyboard-inset')).toBe('0px');
			expect(scroll.style.paddingBottom).toBe('20px');
		});

		it('preserves native taps while the keyboard is open and refocuses once it closes', async () => {
			const innerHeight = mockResizableInnerHeight(800);
			const visualViewport = mockVisualViewport(800);
			const { input } = await mountKeyboardDrawer();

			input.focus();
			visualViewport.resize(500);
			vi.advanceTimersToNextFrame();
			innerHeight.resize(500);
			await vi.advanceTimersByTimeAsync(200);
			const focus = spyFocus(input);
			hitTest(input);

			// The overlap is gone, but the keyboard is still open.
			expect(tap(input).defaultPrevented).toBe(false);
			expect(focus).not.toHaveBeenCalled();

			visualViewport.resize(800);
			innerHeight.resize(800);
			await vi.advanceTimersByTimeAsync(200);

			expect(tap(input).defaultPrevented).toBe(true);
			expect(focus).toHaveBeenCalledWith({ preventScroll: true });
		});
	});
});
