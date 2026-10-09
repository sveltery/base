// Derived from Base UI v1.8.0 packages/react/src/scroll-area/root/ScrollAreaRoot.tsx
// and packages/react/src/scroll-area/viewport/ScrollAreaViewport.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Element handles are `$state` fields. There is no React ref bag.
// Reading direction is `useDirection()`, passed into the constructor.

import { untrack } from 'svelte';
import { on } from 'svelte/events';
import { contains, getTarget } from '../internal/shadow-dom.js';
import { platform } from '../internal/platform.js';
import { useTimeout } from '../internal/timeout.svelte.js';
import { getOffset } from './dom.js';
import {
	applyOverscrollThumb,
	getHiddenState,
	normalizeOverflowEdgeThreshold,
	normalizeScrollOffset,
	pickState
} from './geometry.js';
import { MIN_THUMB_SIZE, SCROLL_TIMEOUT } from './constants.js';
import { orientationAttribute } from './attributes.js';
import { OVERFLOW_EDGE_VARS, scrollAreaThumbHeight, scrollAreaThumbWidth } from './css-vars.js';
import type {
	Coords,
	HiddenState,
	NormalizedThreshold,
	OverflowEdgeThreshold,
	OverflowEdges,
	ScrollAreaRootState,
	ScrollAxis,
	Size,
	TextDirection
} from './types.js';

const DEFAULT_COORDS: Coords = { x: 0, y: 0 };
const DEFAULT_SIZE: Size = { width: 0, height: 0 };
const DEFAULT_OVERFLOW_EDGES: OverflowEdges = {
	xStart: false,
	xEnd: false,
	yStart: false,
	yEnd: false
};
const DEFAULT_HIDDEN_STATE: HiddenState = { x: true, y: true, corner: true };

let scrollAreaOverflowVarsRegistered = false;

export class ScrollAreaModel {
	hovering = $state(false);
	scrollingX = $state(false);
	scrollingY = $state(false);
	touchModality = $state(false);
	hasMeasuredScrollbar = $state(false);
	cornerSize = $state<Size>({ ...DEFAULT_SIZE });
	thumbSize = $state<Size>({ ...DEFAULT_SIZE });
	overflowEdges = $state<OverflowEdges>({ ...DEFAULT_OVERFLOW_EDGES });
	hiddenState = $state<HiddenState>({ ...DEFAULT_HIDDEN_STATE });
	snapSuspended = $state(false);

	rootElement = $state<HTMLDivElement | null>(null);
	viewportElement = $state<HTMLDivElement | null>(null);
	scrollbarYElement = $state<HTMLDivElement | null>(null);
	scrollbarXElement = $state<HTMLDivElement | null>(null);
	thumbYElement = $state<HTMLDivElement | null>(null);
	thumbXElement = $state<HTMLDivElement | null>(null);
	cornerElement = $state<HTMLDivElement | null>(null);

	rootId = '';
	readonly readThreshold: () => OverflowEdgeThreshold | undefined;
	readonly readDirection: () => TextDirection;

	private activePointerId: number | null = null;
	private startY = 0;
	private startX = 0;
	private startScrollTop = 0;
	private startScrollLeft = 0;
	private currentOrientation: ScrollAxis = 'vertical';
	private scrollPosition: Coords = { ...DEFAULT_COORDS };
	private savedSnapType: string | null = null;
	private readonly hostStyles = new WeakMap<HTMLElement, string | null | undefined>();
	private programmaticScroll = true;
	private lastMeasured: [number, number, number, number] = [NaN, NaN, NaN, NaN];
	private readonly scrollYTimer = useTimeout();
	private readonly scrollXTimer = useTimeout();
	private readonly scrollEndTimer = useTimeout();
	private readonly animationTimer = useTimeout();

	constructor(
		readThreshold: () => OverflowEdgeThreshold | undefined,
		readDirection: () => TextDirection,
		rootId: string
	) {
		this.readThreshold = readThreshold;
		this.readDirection = readDirection;
		this.rootId = rootId;
	}

	get threshold(): NormalizedThreshold {
		return normalizeOverflowEdgeThreshold(this.readThreshold());
	}

	get rootState(): ScrollAreaRootState {
		return {
			scrolling: this.scrollingX || this.scrollingY,
			hasOverflowX: !this.hiddenState.x,
			hasOverflowY: !this.hiddenState.y,
			overflowXStart: this.overflowEdges.xStart,
			overflowXEnd: this.overflowEdges.xEnd,
			overflowYStart: this.overflowEdges.yStart,
			overflowYEnd: this.overflowEdges.yEnd,
			cornerHidden: this.hiddenState.corner
		};
	}

	dispose() {
		this.scrollYTimer.clear();
		this.scrollXTimer.clear();
		this.scrollEndTimer.clear();
		this.animationTimer.clear();
	}

	get direction(): TextDirection {
		return this.readDirection();
	}

	refreshLayout() {
		const threshold = this.threshold;
		untrack(() => this.computeThumbPosition(threshold));
	}

	registerOverflowProperties() {
		if (
			scrollAreaOverflowVarsRegistered ||
			// When `inherits: false`, specifying `inherit` on child elements doesn't work
			// in Safari. To let CSS features work correctly, this optimization must be skipped.
			platform.engine.webkit
		) {
			return;
		}

		if (typeof CSS !== 'undefined' && 'registerProperty' in CSS) {
			OVERFLOW_EDGE_VARS.forEach((name) => {
				try {
					CSS.registerProperty({
						name,
						syntax: '<length>',
						inherits: false,
						initialValue: '0px'
					});
				} catch {
					/* ignore already-registered */
				}
			});
		}

		scrollAreaOverflowVarsRegistered = true;
	}

	private startScrolling(vertical: boolean) {
		if (vertical) this.scrollingY = true;
		else this.scrollingX = true;
		const timer = vertical ? this.scrollYTimer : this.scrollXTimer;
		timer.start(SCROLL_TIMEOUT, () => {
			if (vertical) this.scrollingY = false;
			else this.scrollingX = false;
		});
	}

	handleScroll(scrollPosition: Coords) {
		const offsetX = scrollPosition.x - this.scrollPosition.x;
		const offsetY = scrollPosition.y - this.scrollPosition.y;
		this.scrollPosition = scrollPosition;

		if (offsetY !== 0) this.startScrolling(true);
		if (offsetX !== 0) this.startScrolling(false);
	}

	disableViewportSnap() {
		const viewport = this.viewportElement;
		if (viewport && this.savedSnapType === null) {
			this.savedSnapType = viewport.style.scrollSnapType;
			viewport.style.scrollSnapType = 'none';
			this.snapSuspended = true;
		}
	}

	private restoreViewportSnap() {
		if (this.savedSnapType === null) return;
		if (this.viewportElement) {
			this.viewportElement.style.scrollSnapType = this.savedSnapType;
		}
		this.savedSnapType = null;
		this.snapSuspended = false;
	}

	pointerDown(event: PointerEvent) {
		if (event.button !== 0) return;

		if (this.activePointerId !== null) {
			const activeThumb =
				this.currentOrientation === 'vertical' ? this.thumbYElement : this.thumbXElement;
			if (activeThumb?.hasPointerCapture(this.activePointerId)) return;
		}

		this.activePointerId = event.pointerId;
		this.startY = event.clientY;
		this.startX = event.clientX;
		const current = event.currentTarget;
		this.currentOrientation =
			current instanceof Element
				? ((current.getAttribute(orientationAttribute) as ScrollAxis | null) ?? 'vertical')
				: 'vertical';

		const viewport = this.viewportElement;
		if (viewport) {
			this.startScrollTop = viewport.scrollTop;
			this.startScrollLeft = viewport.scrollLeft;
			this.disableViewportSnap();
		}

		const thumb = this.currentOrientation === 'vertical' ? this.thumbYElement : this.thumbXElement;
		thumb?.setPointerCapture(event.pointerId);
	}

	pointerUp(event: PointerEvent) {
		if (event.pointerId !== this.activePointerId) return;

		this.activePointerId = null;
		if (this.currentOrientation === 'vertical') this.scrollingY = false;
		else this.scrollingX = false;
		this.restoreViewportSnap();

		const thumb = this.currentOrientation === 'vertical' ? this.thumbYElement : this.thumbXElement;
		if (thumb?.hasPointerCapture(event.pointerId)) {
			thumb.releasePointerCapture(event.pointerId);
		}
	}

	pointerMove(event: PointerEvent) {
		if (event.pointerId !== this.activePointerId) return;

		if (event.buttons % 2 === 0) {
			this.pointerUp(event);
			return;
		}

		const viewport = this.viewportElement;
		if (!viewport) return;

		const vertical = this.currentOrientation === 'vertical';
		const thumb = vertical ? this.thumbYElement : this.thumbXElement;
		const scrollbar = vertical ? this.scrollbarYElement : this.scrollbarXElement;
		if (!thumb || !scrollbar) return;

		const axis = vertical ? 'y' : 'x';
		const scrollbarOffset = getOffset(scrollbar, 'padding', axis);
		const thumbOffset = getOffset(thumb, 'margin', axis);
		const thumbSizePx = vertical ? thumb.offsetHeight : thumb.offsetWidth;
		const trackSize = vertical ? scrollbar.offsetHeight : scrollbar.offsetWidth;
		const maxThumbOffset = trackSize - thumbSizePx - scrollbarOffset - thumbOffset;
		const delta = vertical ? event.clientY - this.startY : event.clientX - this.startX;
		const scrollRatio = maxThumbOffset <= 0 ? 0 : delta / maxThumbOffset;

		const scrollableSize = vertical ? viewport.scrollHeight : viewport.scrollWidth;
		const viewportSize = vertical ? viewport.clientHeight : viewport.clientWidth;
		const startScroll = vertical ? this.startScrollTop : this.startScrollLeft;
		const nextScroll = startScroll + scrollRatio * (scrollableSize - viewportSize);

		if (vertical) viewport.scrollTop = nextScroll;
		else viewport.scrollLeft = nextScroll;
		event.preventDefault();

		this.startScrolling(vertical);
	}

	private touchModalityChange(event: PointerEvent) {
		this.touchModality = event.pointerType === 'touch';
	}

	pointerEnterOrMove(event: PointerEvent) {
		this.touchModalityChange(event);
		if (event.pointerType !== 'touch') {
			const target = event.target instanceof Element ? event.target : null;
			this.hovering = contains(this.rootElement, target);
		}
	}

	pointerDownRoot(event: PointerEvent) {
		this.touchModalityChange(event);
	}

	pointerLeave() {
		this.hovering = false;
	}

	trackPointerDown(event: PointerEvent, vertical: boolean) {
		if (event.button !== 0) return;

		const target = getTarget(event);
		const thumb = vertical ? this.thumbYElement : this.thumbXElement;
		if (thumb && contains(thumb, target instanceof Element ? target : null)) return;

		const viewport = this.viewportElement;
		if (!viewport) return;

		const scrollbar = vertical ? this.scrollbarYElement : this.scrollbarXElement;
		if (!thumb || !scrollbar) return;

		const axis = vertical ? 'y' : 'x';
		const thumbOffset = getOffset(thumb, 'margin', axis);
		const scrollbarOffset = getOffset(scrollbar, 'padding', axis);
		const thumbSizePx = vertical ? thumb.offsetHeight : thumb.offsetWidth;
		const trackRect = scrollbar.getBoundingClientRect();
		const clickPosition = vertical
			? event.clientY - trackRect.top - thumbSizePx / 2 - scrollbarOffset + thumbOffset / 2
			: event.clientX - trackRect.left - thumbSizePx / 2 - scrollbarOffset + thumbOffset / 2;

		const scrollableSize = vertical ? viewport.scrollHeight : viewport.scrollWidth;
		const viewportSize = vertical ? viewport.clientHeight : viewport.clientWidth;
		const trackSize = vertical ? scrollbar.offsetHeight : scrollbar.offsetWidth;
		const maxThumbOffset = trackSize - thumbSizePx - scrollbarOffset - thumbOffset;
		if (maxThumbOffset <= 0) return;

		const scrollRatio = clickPosition / maxThumbOffset;
		const maxScrollDistance = scrollableSize - viewportSize;

		this.disableViewportSnap();

		if (vertical) {
			viewport.scrollTop = scrollRatio * maxScrollDistance;
		} else if (this.direction === 'rtl') {
			viewport.scrollLeft = -(1 - scrollRatio) * maxScrollDistance;
		} else {
			viewport.scrollLeft = scrollRatio * maxScrollDistance;
		}

		this.handleScroll({ x: viewport.scrollLeft, y: viewport.scrollTop });
		this.pointerDown(event);
	}

	trackMouseDown(event: MouseEvent) {
		event.preventDefault();
	}

	scrollbarWheel(event: WheelEvent, vertical: boolean) {
		const viewport = this.viewportElement;
		if (!viewport || event.ctrlKey) return;

		const horizontal = !vertical;
		const delta = horizontal ? event.deltaX : event.deltaY;
		if (delta === 0) return;

		const maxScroll = horizontal
			? viewport.scrollWidth - viewport.clientWidth
			: viewport.scrollHeight - viewport.clientHeight;
		const minScroll = horizontal && this.direction === 'rtl' ? -maxScroll : 0;
		const maxScrollValue = horizontal && this.direction === 'rtl' ? 0 : maxScroll;
		const scrollValue = horizontal ? viewport.scrollLeft : viewport.scrollTop;

		if ((scrollValue <= minScroll && delta < 0) || (scrollValue >= maxScrollValue && delta > 0)) {
			return;
		}

		event.preventDefault();
		const next = Math.min(maxScrollValue, Math.max(minScroll, scrollValue + delta));
		if (horizontal) viewport.scrollLeft = next;
		else viewport.scrollTop = next;

		this.handleScroll({ x: viewport.scrollLeft, y: viewport.scrollTop });
	}

	listenWheel(element: HTMLElement, vertical: boolean) {
		return on(element, 'wheel', (event) => this.scrollbarWheel(event as WheelEvent, vertical), {
			passive: false
		});
	}

	markUserInteraction() {
		this.programmaticScroll = false;
	}

	viewportScroll() {
		const viewport = this.viewportElement;
		if (!viewport) return;

		this.computeThumbPosition();

		if (this.touchModality || !this.programmaticScroll) {
			this.handleScroll({ x: viewport.scrollLeft, y: viewport.scrollTop });
		}

		this.scrollEndTimer.start(100, () => {
			this.programmaticScroll = true;
		});
	}

	observeViewportHover() {
		if (this.viewportElement?.matches(':hover')) this.hovering = true;
	}

	observeViewportSize() {
		const viewport = this.viewportElement;
		if (typeof ResizeObserver === 'undefined' || !viewport) return;

		let hasInitialized = false;
		const resizeObserver = new ResizeObserver(() => {
			if (!hasInitialized) {
				hasInitialized = true;
				const last = this.lastMeasured;
				if (
					last[0] === viewport.clientHeight &&
					last[1] === viewport.scrollHeight &&
					last[2] === viewport.clientWidth &&
					last[3] === viewport.scrollWidth
				) {
					return;
				}
			}
			this.computeThumbPosition();
		});

		resizeObserver.observe(viewport);

		this.animationTimer.start(0, () => {
			const animations = viewport.getAnimations({ subtree: true });
			if (animations.length === 0) return;
			Promise.allSettled(animations.map((animation) => animation.finished))
				.then(() => this.computeThumbPosition())
				.catch(() => {});
		});

		return () => {
			resizeObserver.disconnect();
			this.animationTimer.clear();
		};
	}

	observeContent(element: HTMLElement, computeOnInitialResize: boolean) {
		if (typeof ResizeObserver === 'undefined') return;

		let hasInitialized = false;
		const resizeObserver = new ResizeObserver(() => {
			if (!hasInitialized) {
				hasInitialized = true;
				if (!computeOnInitialResize) return;
			}
			this.computeThumbPosition();
		});

		resizeObserver.observe(element);
		return () => resizeObserver.disconnect();
	}

	// Svelte 5.57 writes the style attribute before it runs effects. This effect
	// reads that string, and the microtask puts back the overflow lengths the
	// attribute write cleared.
	queueThumb(hidden: HiddenState, style: string | null | undefined) {
		const direction = this.direction;
		const viewport = this.viewportElement;
		const styleChanged = this.styleChanged(viewport, style);
		if (!viewport && hidden.x && hidden.y && hidden.corner && !styleChanged) return;
		queueMicrotask(() => {
			if (this.direction !== direction) return;
			this.computeThumbPosition();
		});
	}

	// Same ordering as queueThumb: the effect runs after the style attribute write.
	holdThumb(vertical: boolean, style: string | null | undefined) {
		const thumb = vertical ? this.thumbYElement : this.thumbXElement;
		if (!this.styleChanged(thumb, style)) return;
		this.computeThumbPosition();
	}

	private styleChanged(node: HTMLElement | null, style: string | null | undefined) {
		if (!node) return false;
		if (this.hostStyles.has(node) && this.hostStyles.get(node) === style) return false;
		this.hostStyles.set(node, style);
		return true;
	}

	computeThumbPosition(threshold = this.threshold) {
		const viewport = this.viewportElement;
		const scrollbarY = this.scrollbarYElement;
		const scrollbarX = this.scrollbarXElement;
		const thumbY = this.thumbYElement;
		const thumbX = this.thumbXElement;
		const corner = this.cornerElement;
		if (!viewport) return;

		const scrollableContentHeight = viewport.scrollHeight;
		const scrollableContentWidth = viewport.scrollWidth;
		const viewportHeight = viewport.clientHeight;
		const viewportWidth = viewport.clientWidth;
		const scrollTop = viewport.scrollTop;
		const scrollLeft = viewport.scrollLeft;
		const isFirstMeasurement = Number.isNaN(this.lastMeasured[0]);

		this.lastMeasured[0] = viewportHeight;
		this.lastMeasured[1] = scrollableContentHeight;
		this.lastMeasured[2] = viewportWidth;
		this.lastMeasured[3] = scrollableContentWidth;

		if (isFirstMeasurement) this.hasMeasuredScrollbar = true;
		if (scrollableContentHeight === 0 || scrollableContentWidth === 0) return;

		const nextHiddenState = getHiddenState(viewport);
		const scrollbarYHidden = nextHiddenState.y;
		const scrollbarXHidden = nextHiddenState.x;
		const ratioX = viewportWidth / scrollableContentWidth;
		const ratioY = viewportHeight / scrollableContentHeight;
		const maxScrollLeft = Math.max(0, scrollableContentWidth - viewportWidth);
		const maxScrollTop = Math.max(0, scrollableContentHeight - viewportHeight);
		const direction = this.direction;

		let scrollLeftFromStart = 0;
		let scrollLeftFromEnd = 0;
		if (!scrollbarXHidden) {
			scrollLeftFromStart = normalizeScrollOffset(
				direction === 'rtl' ? -scrollLeft : scrollLeft,
				maxScrollLeft
			);
			scrollLeftFromEnd = maxScrollLeft - scrollLeftFromStart;
		}

		const scrollTopFromStart = scrollbarYHidden
			? 0
			: normalizeScrollOffset(scrollTop, maxScrollTop);
		const scrollTopFromEnd = scrollbarYHidden ? 0 : maxScrollTop - scrollTopFromStart;
		const nextWidth = scrollbarXHidden ? 0 : viewportWidth;
		const nextHeight = scrollbarYHidden ? 0 : viewportHeight;

		let nextCornerWidth = 0;
		let nextCornerHeight = 0;
		if (!scrollbarXHidden && !scrollbarYHidden) {
			nextCornerWidth = scrollbarY?.offsetWidth || 0;
			nextCornerHeight = scrollbarX?.offsetHeight || 0;
		}

		const cornerNotYetSized = this.cornerSize.width === 0 && this.cornerSize.height === 0;
		const cornerWidthOffset = cornerNotYetSized ? nextCornerWidth : 0;
		const cornerHeightOffset = cornerNotYetSized ? nextCornerHeight : 0;

		const scrollbarXOffset = getOffset(scrollbarX, 'padding', 'x');
		const scrollbarYOffset = getOffset(scrollbarY, 'padding', 'y');
		const thumbXOffset = getOffset(thumbX, 'margin', 'x');
		const thumbYOffset = getOffset(thumbY, 'margin', 'y');

		const idealNextWidth = nextWidth - scrollbarXOffset - thumbXOffset;
		const idealNextHeight = nextHeight - scrollbarYOffset - thumbYOffset;
		const maxNextWidth = scrollbarX
			? Math.min(scrollbarX.offsetWidth - cornerWidthOffset, idealNextWidth)
			: idealNextWidth;
		const maxNextHeight = scrollbarY
			? Math.min(scrollbarY.offsetHeight - cornerHeightOffset, idealNextHeight)
			: idealNextHeight;

		const clampedNextWidth = Math.max(MIN_THUMB_SIZE, maxNextWidth * ratioX);
		const clampedNextHeight = Math.max(MIN_THUMB_SIZE, maxNextHeight * ratioY);
		this.assignSize(
			this.thumbSize,
			{ width: clampedNextWidth, height: clampedNextHeight },
			(next) => {
				this.thumbSize = next;
			}
		);

		if (scrollbarY && thumbY) {
			const maxThumbOffsetY =
				scrollbarY.offsetHeight - clampedNextHeight - scrollbarYOffset - thumbYOffset;
			const applied = applyOverscrollThumb(
				scrollTop,
				maxScrollTop,
				scrollableContentHeight,
				clampedNextHeight,
				maxThumbOffsetY
			);
			thumbY.style.transform = `translate3d(0,${applied.offset}px,0)`;
			thumbY.style.setProperty(
				scrollAreaThumbHeight,
				applied.sizeOverride ? applied.sizeOverride : ''
			);
		}

		if (scrollbarX && thumbX) {
			const maxThumbOffsetX =
				scrollbarX.offsetWidth - clampedNextWidth - scrollbarXOffset - thumbXOffset;
			const scrollFromStart = direction === 'rtl' ? -scrollLeft : scrollLeft;
			const applied = applyOverscrollThumb(
				scrollFromStart,
				maxScrollLeft,
				scrollableContentWidth,
				clampedNextWidth,
				maxThumbOffsetX
			);
			const signed = direction === 'rtl' ? -applied.offset : applied.offset;
			thumbX.style.transform = `translate3d(${signed}px,0,0)`;
			thumbX.style.setProperty(
				scrollAreaThumbWidth,
				applied.sizeOverride ? applied.sizeOverride : ''
			);
		}

		const overflowMetricsPx = [
			scrollLeftFromStart,
			scrollLeftFromEnd,
			scrollTopFromStart,
			scrollTopFromEnd
		];
		OVERFLOW_EDGE_VARS.forEach((cssVar, index) => {
			viewport.style.setProperty(cssVar, `${overflowMetricsPx[index]}px`);
		});

		if (corner) {
			this.assignSize(
				this.cornerSize,
				{ width: nextCornerWidth, height: nextCornerHeight },
				(next) => {
					this.cornerSize = next;
				}
			);
		}

		const hidden = pickState(this.hiddenState, nextHiddenState);
		if (hidden !== this.hiddenState) this.hiddenState = hidden;

		const nextOverflowEdges: OverflowEdges = {
			xStart: !scrollbarXHidden && scrollLeftFromStart > threshold.xStart,
			xEnd: !scrollbarXHidden && scrollLeftFromEnd > threshold.xEnd,
			yStart: !scrollbarYHidden && scrollTopFromStart > threshold.yStart,
			yEnd: !scrollbarYHidden && scrollTopFromEnd > threshold.yEnd
		};
		const edges = pickState(this.overflowEdges, nextOverflowEdges);
		if (edges !== this.overflowEdges) this.overflowEdges = edges;
	}

	private assignSize(prev: Size, next: Size, write: (size: Size) => void) {
		const picked = pickState(prev, next);
		if (picked !== prev) write(picked);
	}
}
