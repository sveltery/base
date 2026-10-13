// Derived from Base UI v1.9.0 packages/utils/src/useScrollLock.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { BROWSER } from 'esm-env';
import { isOverflowElement } from '@floating-ui/utils/dom';
import { on } from 'svelte/events';
import { ownerDocument, AnimationFrame, ownerWindow, platform, Timeout } from '@sveltery/utils';

let originalHtmlStyles: Partial<CSSStyleDeclaration> = {};
let originalBodyStyles: Partial<CSSStyleDeclaration> = {};
let originalHtmlScrollBehavior = '';

function getViewportScroller(html: HTMLElement, body: HTMLElement) {
	return isOverflowElement(html) ? html : body;
}

function isPageScrollLocked(win: Window, html: HTMLElement, body: HTMLElement) {
	return /hidden|clip/.test(win.getComputedStyle(getViewportScroller(html, body)).overflowY);
}

function hasInsetScrollbars(referenceElement: Element | null) {
	if (!BROWSER) return false;
	const doc = ownerDocument(referenceElement);
	const win = ownerWindow(doc);
	return win.innerWidth - doc.documentElement.clientWidth > 0;
}

function supportsStableScrollbarGutter(referenceElement: Element | null) {
	const supported = typeof CSS !== 'undefined' && CSS.supports?.('scrollbar-gutter', 'stable');
	if (!supported || !BROWSER) return false;

	const doc = ownerDocument(referenceElement);
	const html = doc.documentElement;
	const body = doc.body;
	const scrollContainer = getViewportScroller(html, body);
	const originalOverflowY = scrollContainer.style.overflowY;
	const originalGutter = html.style.scrollbarGutter;

	html.style.scrollbarGutter = 'stable';
	scrollContainer.style.overflowY = 'scroll';
	const before = scrollContainer.offsetWidth;
	scrollContainer.style.overflowY = 'hidden';
	const after = scrollContainer.offsetWidth;
	scrollContainer.style.overflowY = originalOverflowY;
	html.style.scrollbarGutter = originalGutter;
	return before === after;
}

function preventScrollOverlayScrollbars(referenceElement: Element | null) {
	const doc = ownerDocument(referenceElement);
	const elementToLock = getViewportScroller(doc.documentElement, doc.body);
	const original = {
		overflowY: elementToLock.style.overflowY,
		overflowX: elementToLock.style.overflowX
	};
	elementToLock.style.overflowY = 'hidden';
	elementToLock.style.overflowX = 'hidden';
	return () => {
		elementToLock.style.overflowY = original.overflowY;
		elementToLock.style.overflowX = original.overflowX;
	};
}

function preventScrollInsetScrollbars(referenceElement: Element | null) {
	const doc = ownerDocument(referenceElement);
	const html = doc.documentElement;
	const body = doc.body;
	const win = ownerWindow(html);
	let scrollTop = 0;
	let scrollLeft = 0;
	let updateGutterOnly = false;
	// eslint-disable-next-line sveltery/no-unscoped-timer -- runs from the lock timer, outside any component; the restore cancels it
	const resizeFrame = new AnimationFrame();

	if (platform.engine.webkit && (win.visualViewport?.scale ?? 1) !== 1) return () => {};

	function lockScroll() {
		const htmlStyles = win.getComputedStyle(html);
		const bodyStyles = win.getComputedStyle(body);
		const htmlScrollbarGutterValue = htmlStyles.scrollbarGutter || '';
		const hasBothEdges = htmlScrollbarGutterValue.includes('both-edges');
		const scrollbarGutterValue = hasBothEdges ? 'stable both-edges' : 'stable';

		scrollTop = html.scrollTop;
		scrollLeft = html.scrollLeft;
		originalHtmlStyles = {
			scrollbarGutter: html.style.scrollbarGutter,
			overflowY: html.style.overflowY,
			overflowX: html.style.overflowX
		};
		originalHtmlScrollBehavior = html.style.scrollBehavior;
		originalBodyStyles = {
			position: body.style.position,
			height: body.style.height,
			width: body.style.width,
			boxSizing: body.style.boxSizing,
			overflowY: body.style.overflowY,
			overflowX: body.style.overflowX,
			scrollBehavior: body.style.scrollBehavior
		};

		const isScrollableY = html.scrollHeight > html.clientHeight;
		const isScrollableX = html.scrollWidth > html.clientWidth;
		const hasConstantOverflowY =
			htmlStyles.overflowY === 'scroll' || bodyStyles.overflowY === 'scroll';
		const hasConstantOverflowX =
			htmlStyles.overflowX === 'scroll' || bodyStyles.overflowX === 'scroll';
		const scrollbarWidth = Math.max(0, win.innerWidth - body.clientWidth);
		const scrollbarHeight = Math.max(0, win.innerHeight - body.clientHeight);
		const marginY = parseFloat(bodyStyles.marginTop) + parseFloat(bodyStyles.marginBottom);
		const marginX = parseFloat(bodyStyles.marginLeft) + parseFloat(bodyStyles.marginRight);
		const elementToLock = getViewportScroller(html, body);
		updateGutterOnly = supportsStableScrollbarGutter(referenceElement);

		if (updateGutterOnly) {
			html.style.scrollbarGutter = scrollbarGutterValue;
			elementToLock.style.overflowY = 'hidden';
			elementToLock.style.overflowX = 'hidden';
			return;
		}

		html.style.scrollbarGutter = scrollbarGutterValue;
		html.style.overflowY = isScrollableY || hasConstantOverflowY ? 'scroll' : 'hidden';
		html.style.overflowX = isScrollableX || hasConstantOverflowX ? 'scroll' : 'hidden';
		body.style.position = 'relative';
		body.style.height =
			marginY || scrollbarHeight ? `calc(100dvh - ${marginY + scrollbarHeight}px)` : '100dvh';
		body.style.width =
			marginX || scrollbarWidth ? `calc(100vw - ${marginX + scrollbarWidth}px)` : '100vw';
		body.style.boxSizing = 'border-box';
		body.style.overflowY = 'hidden';
		body.style.overflowX = 'hidden';
		body.style.scrollBehavior = 'unset';
		body.scrollTop = scrollTop;
		body.scrollLeft = scrollLeft;
		html.setAttribute('data-base-ui-scroll-locked', '');
		html.style.scrollBehavior = 'unset';
	}

	function cleanup() {
		Object.assign(html.style, originalHtmlStyles);
		Object.assign(body.style, originalBodyStyles);
		if (!updateGutterOnly) {
			html.scrollTop = scrollTop;
			html.scrollLeft = scrollLeft;
			html.removeAttribute('data-base-ui-scroll-locked');
			html.style.scrollBehavior = originalHtmlScrollBehavior;
		}
	}

	lockScroll();
	const unsubscribeResize = on(win, 'resize', () => {
		cleanup();
		resizeFrame.request(lockScroll);
	});

	return () => {
		resizeFrame.cancel();
		cleanup();
		unsubscribeResize();
	};
}

class ScrollLocker {
	lockCount = 0;
	restore: (() => void) | null = null;
	// eslint-disable-next-line sveltery/no-unscoped-timer -- module singleton, not owned by a component
	timeoutLock = new Timeout();
	// eslint-disable-next-line sveltery/no-unscoped-timer -- module singleton, not owned by a component
	timeoutUnlock = new Timeout();

	acquire(referenceElement: Element | null) {
		this.lockCount += 1;
		if (this.lockCount === 1 && this.restore === null) {
			this.timeoutLock.start(0, () => this.lock(referenceElement));
		}
		return this.release;
	}

	release = () => {
		this.lockCount -= 1;
		if (this.lockCount === 0 && this.restore) this.timeoutUnlock.start(0, this.unlock);
	};

	private unlock = () => {
		if (this.lockCount === 0 && this.restore) {
			this.restore();
			this.restore = null;
		}
	};

	private lock(referenceElement: Element | null) {
		if (this.lockCount === 0 || this.restore !== null) return;
		const doc = ownerDocument(referenceElement);
		const html = doc.documentElement;
		const body = doc.body;
		const win = ownerWindow(html);

		if (isPageScrollLocked(win, html, body)) {
			const observer = new win.MutationObserver(() => {
				if (isPageScrollLocked(win, html, body)) return;
				observer.disconnect();
				this.restore = null;
				this.lock(referenceElement);
			});
			observer.observe(html, { attributes: true });
			observer.observe(body, { attributes: true });
			this.restore = () => observer.disconnect();
			return;
		}

		const hasOverlayScrollbars = platform.os.ios || !hasInsetScrollbars(referenceElement);
		this.restore = hasOverlayScrollbars
			? preventScrollOverlayScrollbars(referenceElement)
			: preventScrollInsetScrollbars(referenceElement);
	}
}

const SCROLL_LOCKER = new ScrollLocker();

export function useScrollLock(
	params: () => { enabled: boolean; referenceElement: Element | null }
) {
	$effect(() => {
		const { enabled, referenceElement } = params();
		if (!enabled) return;
		return SCROLL_LOCKER.acquire(referenceElement);
	});
}
