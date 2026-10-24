// Ported from Sveltery UI tests/dom/message-scroller.test.ts, whose cases follow @shadcn/react v0.3.1
// packages/react/src/message-scroller/message-scroller.test.tsx (commit 30a58d4498f270af1c1e981a7d78a15cf5740841).
// MIT, see THIRD_PARTY_NOTICES.md.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import { resetAnimationFrameScheduler } from '@sveltery/utils';
import type {
	MessageScrollerController,
	MessageScrollerDefaultScrollPosition,
	MessageScrollerScrollOptions
} from './index.js';
import MessageScrollerHarness from '../../tests/MessageScrollerHarness.svelte';
import MessageScrollerVisibility from '../../tests/MessageScrollerVisibility.svelte';

type Message = {
	id: string;
	height?: number;
	key?: string;
	register?: false;
	scrollAnchor?: boolean;
};
type Options = {
	messages: Message[];
	autoScroll?: boolean;
	defaultScrollPosition?: MessageScrollerDefaultScrollPosition;
	scrollMargin?: number;
	preserveScrollOnPrepend?: boolean;
	contentPaddingStart?: number;
	contentPaddingEnd?: number;
	contentRole?: string;
	contentAriaBusy?: boolean;
	contentAriaRelevant?: 'additions text';
	restoreMessageId?: string;
	observeVisibility?: boolean;
	onStartClick?: (event: MouseEvent) => void;
};
type Fixture = {
	update(next: Partial<Options>): void;
	api(): MessageScrollerController;
	scrollableEffectRuns(): number;
};

const viewportHeight = 100;
const rows = (...heights: number[]): Message[] =>
	heights.map((height, index) => ({ id: `message-${index + 1}`, height }));

let instance: ReturnType<typeof mount> | undefined;
let target: HTMLElement;
const scrollTops = new WeakMap<Element, number>();
let resizeObservers: TestResizeObserver[] = [];
let intersectionObservers: TestIntersectionObserver[] = [];
const originalRect = HTMLElement.prototype.getBoundingClientRect;
const originalScrollTo = HTMLElement.prototype.scrollTo;
const originalComputedStyle = window.getComputedStyle;

class TestResizeObserver {
	#callback: ResizeObserverCallback;
	#elements = new Set<Element>();
	constructor(callback: ResizeObserverCallback) {
		this.#callback = callback;
		resizeObservers.push(this);
	}
	has(element: Element) {
		return this.#elements.has(element);
	}
	observe(element: Element) {
		this.#elements.add(element);
		requestAnimationFrame(() => this.trigger());
	}
	unobserve(element: Element) {
		this.#elements.delete(element);
	}
	disconnect() {
		this.#elements.clear();
		resizeObservers = resizeObservers.filter((observer) => observer !== this);
	}
	trigger() {
		this.#callback([], this as unknown as ResizeObserver);
	}
}

class TestIntersectionObserver {
	readonly root: Element | Document | null | undefined;
	readonly rootMargin: string | undefined;
	#callback: IntersectionObserverCallback;
	constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
		this.#callback = callback;
		this.root = options?.root;
		this.rootMargin = options?.rootMargin;
		intersectionObservers.push(this);
	}
	observe() {}
	unobserve() {}
	takeRecords() {
		return [];
	}
	disconnect() {
		intersectionObservers = intersectionObservers.filter((observer) => observer !== this);
	}
	trigger(entries: Array<Pick<IntersectionObserverEntry, 'isIntersecting' | 'target'>>) {
		this.#callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
	}
}

const height = (element: HTMLElement) => Number(element.dataset.testHeight ?? 0);
const messageElements = (content: HTMLElement) =>
	Array.from(content.children).filter(
		(child): child is HTMLElement =>
			child instanceof HTMLElement && child.dataset.testid === 'message'
	);

function contentHeight(element: HTMLElement) {
	const content =
		element.dataset.testid === 'content'
			? element
			: element.querySelector<HTMLElement>('[data-testid=content]');
	if (!content) return 0;
	const spacer = content.querySelector<HTMLElement>('[data-message-scroller-spacer]');
	const spacerHeight = spacer && !spacer.hidden ? Number.parseFloat(spacer.style.height) || 0 : 0;
	const messages = messageElements(content).reduce((total, message) => total + height(message), 0);
	return (
		Number(content.dataset.paddingStart ?? 0) +
		messages +
		Number(content.dataset.paddingEnd ?? 0) +
		spacerHeight
	);
}

const rect = (top: number, size: number) =>
	({
		top,
		bottom: top + size,
		height: size,
		left: 0,
		right: 0,
		width: 0,
		x: 0,
		y: top,
		toJSON: () => ({})
	}) as DOMRect;

function testRect(element: HTMLElement) {
	if (element.dataset.testid === 'viewport') return rect(0, element.clientHeight);
	const viewport = element
		.closest('[data-testid=scroller]')
		?.querySelector<HTMLElement>('[data-testid=viewport]');
	if (!viewport) return rect(0, 0);
	if (element.dataset.testid === 'content')
		return rect(-viewport.scrollTop, contentHeight(element));
	if (element.dataset.testid !== 'message') return rect(0, 0);
	const content = element.parentElement!;
	let offset = Number(content.dataset.paddingStart ?? 0);
	for (const message of messageElements(content)) {
		if (message === element) break;
		offset += height(message);
	}
	return rect(offset - viewport.scrollTop, height(element));
}

beforeEach(() => {
	target = document.body.appendChild(document.createElement('div'));
	resetAnimationFrameScheduler();
	resizeObservers = [];
	intersectionObservers = [];
	vi.useFakeTimers();
	let time = 0;
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
		setTimeout(() => callback((time += 16)), 16)
	);
	vi.stubGlobal('cancelAnimationFrame', (handle: number) => clearTimeout(handle));
	vi.stubGlobal('ResizeObserver', TestResizeObserver);
	vi.stubGlobal('IntersectionObserver', undefined);
	Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
		configurable: true,
		get(this: HTMLElement) {
			if (this.dataset.testHeight) return Number(this.dataset.testHeight);
			return this.dataset.testid === 'viewport' ? viewportHeight : 0;
		}
	});
	Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
		configurable: true,
		get(this: HTMLElement) {
			return scrollTops.get(this) ?? 0;
		},
		set(this: HTMLElement, value: number) {
			scrollTops.set(this, value);
		}
	});
	Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
		configurable: true,
		get(this: HTMLElement) {
			return this.dataset.testid === 'viewport' || this.dataset.testid === 'content'
				? contentHeight(this)
				: this.clientHeight;
		}
	});
	HTMLElement.prototype.scrollTo = function scrollTo(
		this: HTMLElement,
		options?: ScrollToOptions | number
	) {
		if (typeof options === 'object' && typeof options.top === 'number')
			this.scrollTop = Math.max(0, options.top);
	} as typeof HTMLElement.prototype.scrollTo;
	HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect(this: HTMLElement) {
		return testRect(this);
	};
	window.getComputedStyle = ((element: Element) => {
		const style = originalComputedStyle(element);
		if (!(element instanceof HTMLElement) || element.dataset.testid !== 'content') return style;
		const start = `${Number(element.dataset.paddingStart ?? 0)}px`;
		const end = `${Number(element.dataset.paddingEnd ?? 0)}px`;
		return {
			...style,
			gap: '0px',
			rowGap: '0px',
			paddingBlockStart: start,
			paddingTop: start,
			paddingBlockEnd: end,
			paddingBottom: end
		} as CSSStyleDeclaration;
	}) as typeof window.getComputedStyle;
});

afterEach(async () => {
	if (instance) await unmount(instance);
	instance = undefined;
	target.remove();
	HTMLElement.prototype.getBoundingClientRect = originalRect;
	HTMLElement.prototype.scrollTo = originalScrollTo;
	window.getComputedStyle = originalComputedStyle;
	for (const property of ['clientHeight', 'scrollHeight', 'scrollTop']) {
		Reflect.deleteProperty(HTMLElement.prototype, property);
	}
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

async function frames(count = 4) {
	for (let index = 0; index < count; index++) await vi.advanceTimersByTimeAsync(20);
	flushSync();
}

async function render(options: Options) {
	instance = mount(MessageScrollerHarness, { target, props: { initial: options } });
	flushSync();
	await frames();
	const fixture = instance as unknown as Fixture;
	const get = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
	const rendered = {
		api: () => fixture.api(),
		state: () => ({ ...fixture.api().scrollable }),
		scrollableEffectRuns: () => fixture.scrollableEffectRuns(),
		scroller: () => get('[data-testid=scroller]'),
		viewport: () => get('[data-testid=viewport]'),
		content: () => get('[data-testid=content]'),
		spacer: () => get('[data-message-scroller-spacer]'),
		button: () => get<HTMLButtonElement>('[data-testid=button]'),
		startButton: () => get<HTMLButtonElement>('[data-testid=start-button]'),
		message: (id: string) => get(`[data-message-id="${id}"]`),
		visibility: () => {
			const output = get('[data-testid=visibility]');
			const visible = output.textContent ?? '';
			return {
				currentAnchorId: output.dataset.currentAnchor || null,
				visibleMessageIds: visible ? visible.split(',') : []
			};
		},
		async rerender(messages: Message[], next: Partial<Options> = {}) {
			fixture.update({ ...next, messages });
			flushSync();
			await frames();
		},
		async update(next: Partial<Options>) {
			fixture.update(next);
			flushSync();
			await frames();
		},
		async scroll(scrollTop: number, intent?: Event) {
			if (intent) rendered.viewport().dispatchEvent(intent);
			rendered.viewport().scrollTop = scrollTop;
			rendered.viewport().dispatchEvent(new Event('scroll'));
			await frames();
		},
		async scrollToMessage(id: string, options?: MessageScrollerScrollOptions) {
			const handled = fixture.api().scrollToMessage(id, options);
			await frames();
			return handled;
		},
		async resize(element: Element) {
			for (const observer of resizeObservers) if (observer.has(element)) observer.trigger();
			await frames();
		}
	};
	return rendered;
}

const wheel = () => new WheelEvent('wheel', { bubbles: true });

describe('MessageScroller', () => {
	it('labels the viewport and the log and reports which edges can scroll', async () => {
		const rendered = await render({ defaultScrollPosition: 'start', messages: rows(80, 80, 80) });
		expect(rendered.viewport().getAttribute('role')).toBe('region');
		expect(rendered.viewport().getAttribute('aria-label')).toBe('Messages');
		expect(rendered.viewport().tabIndex).toBe(0);
		expect(rendered.content().getAttribute('role')).toBe('log');
		expect(rendered.content().getAttribute('aria-relevant')).toBe('additions');
		expect(rendered.scroller().dataset.scrollable).toBe('end');
		expect(rendered.viewport().dataset.scrollable).toBe('end');
		expect(rendered.state()).toEqual({ start: false, end: true });
		expect(rendered.button().dataset.active).toBe('true');
		expect(rendered.button().hasAttribute('inert')).toBe(false);
		expect(rendered.button().tabIndex).toBe(0);
		expect(rendered.button().type).toBe('button');
		expect(rendered.message('message-1').dataset.scrollAnchor).toBe('false');
	});

	it('lets the content override its live-region semantics', async () => {
		const rendered = await render({
			contentAriaBusy: true,
			contentAriaRelevant: 'additions text',
			contentRole: 'list',
			messages: rows(80)
		});
		expect(rendered.content().getAttribute('role')).toBe('list');
		expect(rendered.content().getAttribute('aria-busy')).toBe('true');
		expect(rendered.content().getAttribute('aria-relevant')).toBe('additions text');
	});

	it('renders the hidden tail spacer after the rows', async () => {
		const rendered = await render({ messages: rows(80) });
		const spacer = rendered.content().lastElementChild as HTMLElement;
		expect(spacer.hasAttribute('data-message-scroller-spacer')).toBe(true);
		expect(spacer.getAttribute('aria-hidden')).toBe('true');
		expect(spacer.hidden).toBe(true);
	});

	it('opens at the end by default and drops data-pending-scroll', async () => {
		const rendered = await render({ messages: rows(80, 80, 80) });
		expect(rendered.viewport().scrollTop).toBe(140);
		expect(rendered.state()).toEqual({ start: true, end: false });
		expect(rendered.scroller().dataset.scrollable).toBe('start');
		expect(rendered.button().dataset.active).toBe('false');
		expect(rendered.button().hasAttribute('inert')).toBe(true);
		expect(rendered.button().tabIndex).toBe(-1);
		expect(rendered.viewport().hasAttribute('data-pending-scroll')).toBe(false);
		expect(rendered.scroller().hasAttribute('data-pending-scroll')).toBe(false);
	});

	it('drops data-pending-scroll when the transcript is empty', async () => {
		const rendered = await render({ messages: [] });
		expect(rendered.viewport().hasAttribute('data-pending-scroll')).toBe(false);
		expect(rendered.scroller().hasAttribute('data-pending-scroll')).toBe(false);
		expect(rendered.scroller().hasAttribute('data-scrollable')).toBe(false);
	});

	it('opens at the end when autoScroll starts engaged without ResizeObserver', async () => {
		vi.stubGlobal('ResizeObserver', undefined);
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		expect(rendered.viewport().scrollTop).toBe(140);
		expect(rendered.state()).toEqual({ start: true, end: false });
	});

	it('opens at the start with defaultScrollPosition', async () => {
		const rendered = await render({ defaultScrollPosition: 'start', messages: rows(80, 80, 80) });
		expect(rendered.viewport().scrollTop).toBe(0);
		expect(rendered.state()).toEqual({ start: false, end: true });
	});

	it('re-applies the opening position when defaultScrollPosition changes', async () => {
		const rendered = await render({ defaultScrollPosition: 'start', messages: rows(80, 80, 80) });
		expect(rendered.viewport().scrollTop).toBe(0);
		await rendered.update({ defaultScrollPosition: 'end' });
		expect(rendered.viewport().scrollTop).toBe(140);
		expect(rendered.viewport().hasAttribute('data-pending-scroll')).toBe(false);
	});

	it('does not follow appends while resting at the end without autoScroll', async () => {
		const rendered = await render({ messages: rows(80, 80, 80) });
		await rendered.rerender(rows(80, 80, 80, 80));
		expect(rendered.viewport().scrollTop).toBe(140);
		expect(rendered.state()).toEqual({ start: true, end: true });
		expect(rendered.scroller().dataset.scrollable).toBe('start end');
	});

	it('follows appends while resting at the end with autoScroll', async () => {
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		await rendered.rerender(rows(80, 80, 80, 80));
		expect(rendered.viewport().scrollTop).toBe(220);
		expect(rendered.state()).toEqual({ start: true, end: false });
	});

	it('arms follow when autoScroll turns on at the end and stops when it turns off', async () => {
		const rendered = await render({ messages: rows(80, 80, 80) });
		await rendered.update({ autoScroll: true });
		await rendered.rerender(rows(80, 80, 80, 80));
		expect(rendered.viewport().scrollTop).toBe(220);
		await rendered.update({ autoScroll: false });
		await rendered.rerender(rows(80, 80, 80, 80, 80));
		expect(rendered.viewport().scrollTop).toBe(220);
		expect(rendered.state().end).toBe(true);
	});

	it('places bulk appended anchors near the top without autoScroll', async () => {
		const rendered = await render({ messages: rows(80, 80, 80) });
		await rendered.rerender([
			...rows(80, 80, 80),
			{ id: 'message-4', height: 80, scrollAnchor: true },
			{ id: 'message-5', height: 80 },
			{ id: 'message-6', height: 80, scrollAnchor: true },
			{ id: 'message-7', height: 80 }
		]);
		expect(rendered.viewport().scrollTop).toBe(176);
		expect(rendered.state()).toEqual({ start: true, end: true });
	});

	it('keeps following the end when several anchored turns arrive at once with autoScroll', async () => {
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		await rendered.rerender([
			...rows(80, 80, 80),
			{ id: 'message-4', height: 80, scrollAnchor: true },
			{ id: 'message-5', height: 80 },
			{ id: 'message-6', height: 80, scrollAnchor: true },
			{ id: 'message-7', height: 80 }
		]);
		expect(rendered.viewport().scrollTop).toBe(460);
		expect(rendered.state().end).toBe(false);
	});

	it('holds a newly appended anchor at the reading line while the reply streams with autoScroll', async () => {
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		await rendered.rerender([
			...rows(80, 80, 80),
			{ id: 'message-4', height: 40, scrollAnchor: true }
		]);
		expect(rendered.viewport().scrollTop).toBe(176);
		expect(rendered.message('message-4').getBoundingClientRect().top).toBe(64);
		expect(rendered.message('message-4').dataset.scrollAnchor).toBe('true');
		rendered.message('message-4').dataset.testHeight = '160';
		await rendered.resize(rendered.content());
		expect(rendered.message('message-4').getBoundingClientRect().top).toBe(64);
	});

	it('hands off from the anchor hold to following once the streamed reply fills the viewport', async () => {
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		const turn = [...rows(80, 80, 80), { id: 'message-4', height: 20, scrollAnchor: true }];
		await rendered.rerender(turn);
		expect(rendered.viewport().scrollTop).toBe(176);
		expect(rendered.message('message-4').getBoundingClientRect().top).toBe(64);
		expect(rendered.spacer().style.height).toBe('16px');

		await rendered.rerender([...turn, { id: 'message-5', height: 8 }]);
		await rendered.resize(rendered.content());
		expect(rendered.viewport().scrollTop).toBe(176);
		expect(rendered.message('message-4').getBoundingClientRect().top).toBe(64);

		rendered.message('message-5').dataset.testHeight = '60';
		await rendered.resize(rendered.content());
		expect(rendered.viewport().scrollTop).toBe(220);
		expect(rendered.state().end).toBe(false);

		rendered.message('message-5').dataset.testHeight = '100';
		await rendered.resize(rendered.content());
		expect(rendered.viewport().scrollTop).toBe(260);
		expect(rendered.state().end).toBe(false);
	});

	it('applies the default end position after messages arrive', async () => {
		const rendered = await render({ messages: [] });
		expect(rendered.viewport().scrollTop).toBe(0);
		await rendered.rerender(rows(80, 80, 80));
		expect(rendered.viewport().scrollTop).toBe(140);
		expect(rendered.state()).toEqual({ start: true, end: false });
	});

	it('follows content growth and marks the programmatic scroll with data-autoscrolling', async () => {
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		await rendered.rerender(rows(80, 80, 140));
		await rendered.resize(rendered.content());
		expect(rendered.viewport().scrollTop).toBe(200);
		expect(rendered.scroller().hasAttribute('data-autoscrolling')).toBe(true);
		expect(rendered.viewport().hasAttribute('data-autoscrolling')).toBe(true);
		await vi.advanceTimersByTimeAsync(300);
		flushSync();
		expect(rendered.scroller().hasAttribute('data-autoscrolling')).toBe(false);
	});

	it('follows a late content resize while autoScroll is engaged', async () => {
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		rendered.message('message-3').dataset.testHeight = '140';
		await rendered.resize(rendered.content());
		expect(rendered.viewport().scrollTop).toBe(200);
		expect(rendered.state()).toEqual({ start: true, end: false });
	});

	it('does not follow a viewport resize while resting at the end without autoScroll', async () => {
		const rendered = await render({ messages: rows(80, 80, 80) });
		rendered.viewport().dataset.testHeight = '60';
		await rendered.resize(rendered.viewport());
		expect(rendered.viewport().scrollTop).toBe(140);
		expect(rendered.state()).toEqual({ start: true, end: true });
	});

	it.each([
		['wheel', wheel],
		['touchmove', () => new Event('touchmove', { bubbles: true })],
		['keydown PageUp', () => new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true })]
	])('releases autoScroll after %s', async (_, intent) => {
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		await rendered.scroll(60, intent());
		await rendered.rerender(rows(80, 80, 80, 80));
		expect(rendered.viewport().scrollTop).toBe(60);
		expect(rendered.state().end).toBe(true);
	});

	it('keeps following after a key that does not scroll', async () => {
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		rendered.viewport().dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
		await rendered.rerender(rows(80, 80, 80, 80));
		expect(rendered.viewport().scrollTop).toBe(220);
		rendered
			.viewport()
			.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }));
		await rendered.rerender(rows(80, 80, 80, 80, 80));
		expect(rendered.viewport().scrollTop).toBe(220);
	});

	it('does not follow appends after user scroll intent without autoScroll', async () => {
		const rendered = await render({ messages: rows(80, 80, 80) });
		await rendered.scroll(60, wheel());
		await rendered.rerender(rows(80, 80, 80, 80));
		expect(rendered.viewport().scrollTop).toBe(60);
		expect(rendered.state().end).toBe(true);
	});

	it('releases follow on a bare scroll away, as a scrollbar drag does, so appends do not snap back', async () => {
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		await vi.advanceTimersByTimeAsync(300);
		await rendered.scroll(0);
		await rendered.rerender(rows(80, 80, 80, 80));
		expect(rendered.viewport().scrollTop).toBe(0);
	});

	it('releases follow on a bare scroll away so resizes do not snap back', async () => {
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		await vi.advanceTimersByTimeAsync(300);
		await rendered.scroll(0);
		rendered.message('message-3').dataset.testHeight = '200';
		await rendered.resize(rendered.content());
		expect(rendered.viewport().scrollTop).toBe(0);
	});

	it('keeps following and hides the gap when a commit sees growth before the coalesced resize', async () => {
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		await vi.advanceTimersByTimeAsync(300);
		rendered.message('message-3').dataset.testHeight = '160';
		rendered.viewport().dispatchEvent(new Event('scroll'));
		flushSync();
		expect(rendered.state().end).toBe(false);
		expect(rendered.button().dataset.active).toBe('false');
		await rendered.resize(rendered.content());
		expect(rendered.viewport().scrollTop).toBe(220);
		expect(rendered.state().end).toBe(false);
	});

	it('places an appended anchor near the top with the previous row peeking', async () => {
		const rendered = await render({ messages: rows(80, 80, 80) });
		await rendered.rerender([
			...rows(80, 80, 80),
			{ id: 'message-4', height: 40, scrollAnchor: true }
		]);
		expect(rendered.viewport().scrollTop).toBe(176);
	});

	it('anchors a replaced row when the item count stays the same', async () => {
		const rendered = await render({
			messages: [
				{ id: 'message-1', height: 80 },
				{ id: 'placeholder', height: 80 }
			]
		});
		expect(rendered.viewport().scrollTop).toBe(60);
		await rendered.rerender([
			{ id: 'message-1', height: 80 },
			{ id: 'message-2', height: 40, scrollAnchor: true }
		]);
		expect(rendered.viewport().scrollTop).toBe(16);
	});

	it('does not show the end button for overflow that is only the tail spacer', async () => {
		const rendered = await render({ messages: rows(60, 20) });
		await rendered.rerender([...rows(60, 20), { id: 'message-3', height: 20, scrollAnchor: true }]);
		expect(rendered.viewport().scrollHeight).toBe(116);
		expect(rendered.state().end).toBe(false);
		expect(rendered.button().dataset.active).toBe('false');
	});

	it('opens "last-anchor" with the last overflowing anchor near the top', async () => {
		const rendered = await render({
			defaultScrollPosition: 'last-anchor',
			messages: [
				{ id: 'message-1', height: 100 },
				{ id: 'message-2', height: 40, scrollAnchor: true },
				{ id: 'message-3', height: 160 }
			]
		});
		expect(rendered.viewport().scrollTop).toBe(36);
		expect(rendered.message('message-2').getBoundingClientRect().top).toBe(64);
		expect(rendered.state()).toEqual({ start: true, end: true });
	});

	it('falls back to the end for "last-anchor" without an anchor', async () => {
		const rendered = await render({
			defaultScrollPosition: 'last-anchor',
			messages: rows(80, 80, 80)
		});
		expect(rendered.viewport().scrollTop).toBe(140);
		expect(rendered.state()).toEqual({ start: true, end: false });
	});

	it('falls back to the end for "last-anchor" when the last turn fits', async () => {
		const rendered = await render({
			defaultScrollPosition: 'last-anchor',
			messages: [
				{ id: 'message-1', height: 100 },
				{ id: 'message-2', height: 40, scrollAnchor: true },
				{ id: 'message-3', height: 40 }
			]
		});
		expect(rendered.viewport().scrollTop).toBe(80);
		expect(rendered.state()).toEqual({ start: true, end: false });
		expect(rendered.spacer().hidden).toBe(true);
	});

	it('applies "last-anchor" after messages arrive', async () => {
		const rendered = await render({ defaultScrollPosition: 'last-anchor', messages: [] });
		expect(rendered.viewport().scrollTop).toBe(0);
		await rendered.rerender([
			{ id: 'message-1', height: 100 },
			{ id: 'message-2', height: 40, scrollAnchor: true },
			{ id: 'message-3', height: 160 }
		]);
		expect(rendered.viewport().scrollTop).toBe(36);
		expect(rendered.message('message-2').getBoundingClientRect().top).toBe(64);
	});

	it('keys "last-anchor" on the last anchored row', async () => {
		const rendered = await render({
			defaultScrollPosition: 'last-anchor',
			messages: [
				{ id: 'message-1', height: 60, scrollAnchor: true },
				{ id: 'message-2', height: 60 },
				{ id: 'message-3', height: 40, scrollAnchor: true },
				{ id: 'message-4', height: 120 },
				{ id: 'message-5', height: 80 }
			]
		});
		expect(rendered.viewport().scrollTop).toBe(56);
		expect(rendered.message('message-3').getBoundingClientRect().top).toBe(64);
	});

	it('does not let "last-anchor" with autoScroll yank the reader to the end', async () => {
		const turn = (reply: number): Message[] => [
			{ id: 'message-1', height: 100 },
			{ id: 'message-2', height: 40, scrollAnchor: true },
			{ id: 'message-3', height: reply }
		];
		const rendered = await render({
			autoScroll: true,
			defaultScrollPosition: 'last-anchor',
			messages: turn(160)
		});
		expect(rendered.viewport().scrollTop).toBe(36);
		expect(rendered.state().end).toBe(true);
		await rendered.rerender(turn(220));
		expect(rendered.viewport().scrollTop).toBe(36);
		expect(rendered.state().end).toBe(true);
		await rendered.scroll(260, wheel());
		await rendered.rerender(turn(260));
		await rendered.resize(rendered.content());
		expect(rendered.viewport().scrollTop).toBe(300);
		expect(rendered.state().end).toBe(false);
	});

	it('scrolls to a mounted message without re-arming autoScroll', async () => {
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		expect(await rendered.scrollToMessage('message-3')).toBe(true);
		expect(rendered.viewport().scrollTop).toBe(160);
		expect(rendered.spacer().style.height).toBe('20px');
		await rendered.rerender(rows(80, 80, 80, 80));
		expect(rendered.viewport().scrollTop).toBe(160);
	});

	it('lets a gesture during a programmatic jump re-arm follow at the end', async () => {
		const rendered = await render({ autoScroll: true, messages: rows(80, 80, 80) });
		expect(await rendered.scrollToMessage('message-1')).toBe(true);
		expect(rendered.viewport().scrollTop).toBe(0);
		await rendered.scroll(140, wheel());
		await rendered.rerender(rows(80, 80, 80, 80));
		expect(rendered.viewport().scrollTop).toBe(220);
	});

	it('aligns scrollToMessage targets', async () => {
		const rendered = await render({ messages: rows(80, 80, 80, 80) });
		expect(await rendered.scrollToMessage('message-3', { align: 'start' })).toBe(true);
		expect(rendered.viewport().scrollTop).toBe(160);
		await rendered.scrollToMessage('message-3', { align: 'center' });
		expect(rendered.viewport().scrollTop).toBe(150);
		await rendered.scrollToMessage('message-3', { align: 'end' });
		expect(rendered.viewport().scrollTop).toBe(140);
		await rendered.scrollToMessage('message-1', { align: 'nearest' });
		expect(rendered.viewport().scrollTop).toBe(0);
		await rendered.scrollToMessage('message-2', { align: 'nearest' });
		expect(rendered.viewport().scrollTop).toBe(60);
	});

	it('applies scrollMargin to scrollToMessage jumps', async () => {
		const rendered = await render({ messages: rows(80, 80, 80, 80), scrollMargin: 12 });
		await rendered.scrollToMessage('message-3');
		expect(rendered.viewport().scrollTop).toBe(148);
		await rendered.scrollToMessage('message-3', { scrollMargin: 20 });
		expect(rendered.viewport().scrollTop).toBe(140);
	});

	it('keeps scrollToMessage targets inside the content padding', async () => {
		const rendered = await render({
			contentPaddingStart: 24,
			contentPaddingEnd: 24,
			messages: rows(80, 80, 80, 80),
			scrollMargin: 12
		});
		await rendered.scrollToMessage('message-3');
		expect(rendered.viewport().scrollTop).toBe(148);
		expect(rendered.message('message-3').getBoundingClientRect().top).toBe(36);
	});

	it('lets a mount-time scrollToMessage win over defaultScrollPosition', async () => {
		const rendered = await render({
			messages: rows(80, 80, 80, 80),
			restoreMessageId: 'message-2'
		});
		expect(rendered.viewport().scrollTop).toBe(80);
		expect(rendered.message('message-2').getBoundingClientRect().top).toBe(0);
		expect(rendered.viewport().hasAttribute('data-pending-scroll')).toBe(false);
	});

	it('queues a scrollToMessage target until the messages arrive', async () => {
		const rendered = await render({ messages: [], restoreMessageId: 'message-2' });
		expect(rendered.viewport().scrollTop).toBe(0);
		expect(rendered.viewport().hasAttribute('data-pending-scroll')).toBe(false);
		await rendered.rerender(rows(80, 80, 80, 80));
		expect(rendered.viewport().scrollTop).toBe(80);
		expect(rendered.message('message-2').getBoundingClientRect().top).toBe(0);
	});

	it('returns false when scrollToMessage cannot find a mounted message', async () => {
		const rendered = await render({ messages: rows(80) });
		expect(rendered.api().scrollToMessage('missing')).toBe(false);
		expect(rendered.api().scrollToMessage('message-1')).toBe(true);
	});

	it('keeps duplicate message ids identity-safe when one unmounts', async () => {
		const rendered = await render({
			messages: [
				{ id: 'message-1', height: 80 },
				{ id: 'duplicate', key: 'a', height: 80 },
				{ id: 'duplicate', key: 'b', height: 80 }
			]
		});
		await rendered.rerender([
			{ id: 'message-1', height: 80 },
			{ id: 'duplicate', key: 'b', height: 80 }
		]);
		expect(rendered.api().scrollToMessage('duplicate')).toBe(true);
	});

	it('forgets an unmounted message', async () => {
		const rendered = await render({ messages: rows(80, 80) });
		await rendered.rerender(rows(80));
		expect(rendered.api().scrollToMessage('message-2')).toBe(false);
	});

	it('preserves the first visible message when older messages are prepended', async () => {
		const rendered = await render({ messages: rows(80, 80, 80) });
		await rendered.scroll(80);
		await rendered.rerender([{ id: 'message-0', height: 40 }, ...rows(80, 80, 80)]);
		expect(rendered.viewport().scrollTop).toBe(120);
	});

	it('leaves the position alone on prepend when preserveScrollOnPrepend is off', async () => {
		const rendered = await render({ messages: rows(80, 80, 80), preserveScrollOnPrepend: false });
		await rendered.scroll(80);
		await rendered.rerender([{ id: 'message-0', height: 40 }, ...rows(80, 80, 80)]);
		expect(rendered.viewport().scrollTop).toBe(80);
	});

	it('reports visible ids and the current anchor from layout without IntersectionObserver', async () => {
		const rendered = await render({
			defaultScrollPosition: 'start',
			messages: [
				{ id: 'message-1', height: 80, scrollAnchor: true },
				{ id: 'message-2', height: 80 },
				{ id: 'message-3', height: 80 }
			],
			observeVisibility: true
		});
		expect(rendered.visibility()).toEqual({
			currentAnchorId: 'message-1',
			visibleMessageIds: ['message-1', 'message-2']
		});
		await rendered.scroll(90);
		expect(rendered.visibility()).toEqual({
			currentAnchorId: 'message-1',
			visibleMessageIds: ['message-2', 'message-3']
		});
	});

	it('tracks visibility with IntersectionObserver rooted at the viewport below the reading line', async () => {
		vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
		const rendered = await render({
			defaultScrollPosition: 'start',
			messages: [
				{ id: 'message-1', height: 80, scrollAnchor: true },
				{ id: 'message-2', height: 80 },
				{ id: 'message-3', height: 80 }
			],
			observeVisibility: true,
			scrollMargin: 6
		});
		const [observer] = intersectionObservers;
		expect(intersectionObservers.length).toBe(1);
		expect(observer.root).toBe(rendered.viewport());
		expect(observer.rootMargin).toBe('-70px 0px 0px 0px');
		observer.trigger([
			{ isIntersecting: true, target: rendered.message('message-1') },
			{ isIntersecting: true, target: rendered.message('message-2') }
		]);
		await frames();
		expect(rendered.visibility()).toEqual({
			currentAnchorId: 'message-1',
			visibleMessageIds: ['message-1', 'message-2']
		});
		rendered.viewport().scrollTop = 90;
		observer.trigger([
			{ isIntersecting: false, target: rendered.message('message-1') },
			{ isIntersecting: true, target: rendered.message('message-2') },
			{ isIntersecting: true, target: rendered.message('message-3') }
		]);
		await frames();
		expect(rendered.visibility()).toEqual({
			currentAnchorId: 'message-1',
			visibleMessageIds: ['message-2', 'message-3']
		});
	});

	it('observes visibility only while something reads it', async () => {
		vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
		const rendered = await render({ messages: rows(80, 80) });
		expect(intersectionObservers.length).toBe(0);
		expect(rendered.api().visibility).toEqual({ currentAnchorId: null, visibleMessageIds: [] });
		await rendered.update({ observeVisibility: true });
		expect(intersectionObservers.length).toBe(1);
		await rendered.update({ observeVisibility: false });
		expect(intersectionObservers.length).toBe(0);
	});

	it('reports the anchor at the reading line as current, not the one above it', async () => {
		const rendered = await render({
			defaultScrollPosition: 'start',
			messages: [
				{ id: 'm0', height: 80, scrollAnchor: true },
				{ id: 'm1', height: 80, scrollAnchor: true },
				{ id: 'm2', height: 80 },
				{ id: 'm3', height: 80 }
			],
			observeVisibility: true
		});
		await rendered.scroll(40);
		expect(rendered.visibility().currentAnchorId).toBe('m1');
	});

	it('does not rerun scrollable readers when the published state is unchanged', async () => {
		const rendered = await render({ messages: rows(40) });
		expect(rendered.scrollableEffectRuns()).toBe(1);
		await rendered.scroll(0);
		expect(rendered.scrollableEffectRuns()).toBe(1);
	});
});

describe('MessageScroller.Button', () => {
	it('scrolls to its edge with the default smooth behavior and blurs itself', async () => {
		const calls: ScrollToOptions[] = [];
		const scrollTo = HTMLElement.prototype.scrollTo;
		HTMLElement.prototype.scrollTo = function (
			this: HTMLElement,
			options?: ScrollToOptions | number
		) {
			if (typeof options === 'object') calls.push(options);
			Reflect.apply(scrollTo, this, [options]);
		} as typeof HTMLElement.prototype.scrollTo;
		const rendered = await render({ defaultScrollPosition: 'start', messages: rows(80, 80, 80) });
		rendered.button().focus();
		rendered.button().click();
		await frames();
		expect(calls.at(-1)).toEqual({ top: 140, behavior: 'smooth' });
		expect(rendered.viewport().scrollTop).toBe(140);
		expect(document.activeElement).not.toBe(rendered.button());
		expect(rendered.button().dataset.active).toBe('false');
	});

	it('scrolls to the start, runs onclick first and lets it cancel the scroll', async () => {
		const clicks: boolean[] = [];
		const rendered = await render({
			messages: rows(80, 80, 80),
			onStartClick: (event) => clicks.push(event.defaultPrevented)
		});
		expect(rendered.startButton().dataset.active).toBe('true');
		rendered.startButton().click();
		await frames();
		expect(clicks).toEqual([false]);
		expect(rendered.viewport().scrollTop).toBe(0);

		await rendered.scroll(140);
		await rendered.update({ onStartClick: (event) => event.preventDefault() });
		rendered.startButton().click();
		await frames();
		expect(rendered.viewport().scrollTop).toBe(140);
	});

	it('ignores clicks while inactive', async () => {
		const clicks: boolean[] = [];
		const rendered = await render({
			defaultScrollPosition: 'start',
			messages: rows(80, 80, 80),
			onStartClick: (event) => clicks.push(event.defaultPrevented)
		});
		await rendered.scroll(4);
		expect(rendered.startButton().dataset.active).toBe('false');
		expect(rendered.startButton().hasAttribute('inert')).toBe(true);
		rendered.startButton().click();
		await frames();
		expect(clicks).toEqual([]);
		expect(rendered.viewport().scrollTop).toBe(4);
	});

	it('renders the default label and hands props and state to a render snippet', async () => {
		const rendered = await render({ messages: rows(80, 80, 80) });
		expect(rendered.startButton().textContent).toBe('Scroll to start');
		const custom = document.querySelector<HTMLButtonElement>('[data-testid=rendered]')!;
		expect(custom.dataset.state).toBe('end false');
		expect(custom.dataset.active).toBe('false');
		expect(custom.hasAttribute('inert')).toBe(true);
		await rendered.scroll(0);
		expect(custom.dataset.state).toBe('end true');
		custom.click();
		await frames();
		expect(rendered.viewport().scrollTop).toBe(140);
	});
});

it('throws outside a Provider', () => {
	expect(() => mount(MessageScrollerVisibility, { target })).toThrow(
		'getMessageScroller must be used within a MessageScroller.Provider.'
	);
});
