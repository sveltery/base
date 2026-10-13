// Derived from Base UI v1.9.0 packages/react/src/utils/useSwipeDismiss.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Handlers take native events. A touchmove fed in from a capture listener names its boundary
// element, because its `currentTarget` is the document.

import { untrack } from 'svelte';
import { closest, contains, getTarget, ownerDocument, ownerWindow } from '@sveltery/utils';
import { clamp } from './clamp.js';
import { getElementAtPoint } from './getElementAtPoint.js';
import { getElementTransform } from './getElementTransform.js';
import {
	findScrollableAncestor,
	findScrollableTouchTarget,
	type ScrollAxis
} from './scrollable.js';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export type SwipeEvent = PointerEvent | TouchEvent;

export interface SwipeProgressDetails {
	deltaX: number;
	deltaY: number;
	direction: SwipeDirection | undefined;
}

export interface SwipeReleaseDetails {
	event: SwipeEvent;
	direction: SwipeDirection | undefined;
	deltaX: number;
	deltaY: number;
	velocityX: number;
	velocityY: number;
	releaseVelocityX: number;
	releaseVelocityY: number;
}

export interface SwipeDismissOptions {
	enabled: boolean;
	directions: SwipeDirection[];
	element: HTMLElement | null;
	movementCssVars: { x: string; y: string };
	/**
	 * The distance the pointer must travel before a release dismisses.
	 * @default 40
	 */
	swipeThreshold?:
		number | ((details: { element: HTMLElement; direction: SwipeDirection }) => number);
	/** Swiping begins only once this returns true. Checked on start and on later moves. */
	canStart?: (
		position: { x: number; y: number },
		details: { nativeEvent: SwipeEvent; direction: SwipeDirection | undefined }
	) => boolean;
	/** Do not start inside a scrollable element. @default false */
	ignoreScrollableAncestors?: boolean;
	/** `false` lets touch swipes start on interactive elements. @default true */
	ignoreSelectorWhenTouch?: boolean;
	/** Write the drag transform and movement variables to the element. @default true */
	trackDrag?: boolean;
	onSwipeStart?: (event: SwipeEvent) => void;
	onProgress?: (progress: number, details?: SwipeProgressDetails) => void;
	onCancel?: (event: SwipeEvent) => void;
	onSwipingChange?: (swiping: boolean) => void;
	/** Returning `true` or `false` overrides the default dismissal decision. */
	onRelease?: (details: SwipeReleaseDetails) => boolean | void;
	onDismiss?: (event: SwipeEvent, details: { direction: SwipeDirection }) => void;
}

interface Point {
	x: number;
	y: number;
}

const DEFAULT_SWIPE_THRESHOLD = 40;
const REVERSE_CANCEL_THRESHOLD = 10;
const MIN_VELOCITY_DURATION_MS = 50;
// Under one frame at 240 Hz, so it only damps near-simultaneous samples.
const MIN_RELEASE_VELOCITY_DURATION_MS = 4;
const MAX_RELEASE_VELOCITY_AGE_MS = 80;
const MIN_VELOCITY_SAMPLE_DISTANCE = 1;
const IGNORE_SELECTOR = 'button,a,input,select,textarea,label,[role="button"]';

export function getDisplacement(direction: SwipeDirection, deltaX: number, deltaY: number) {
	switch (direction) {
		case 'up':
			return -deltaY;
		case 'down':
			return deltaY;
		case 'left':
			return -deltaX;
		case 'right':
			return deltaX;
	}
}

function getValidTimeStamp(timeStamp: number): number | null {
	return Number.isFinite(timeStamp) && timeStamp > 0 ? timeStamp : null;
}

function getDragTransform(dragOffset: Point, scale: number): string {
	return `translate3d(${dragOffset.x}px,${dragOffset.y}px,0) scale(${scale})`;
}

function isTouchEvent(event: SwipeEvent): event is TouchEvent {
	return 'touches' in event;
}

function isTouchLike(event: SwipeEvent) {
	return isTouchEvent(event) || event.pointerType === 'touch';
}

function getPrimaryPosition(event: SwipeEvent): Point | null {
	if (isTouchEvent(event)) {
		const touch = event.touches[0];
		return touch ? { x: touch.clientX, y: touch.clientY } : null;
	}
	return { x: event.clientX, y: event.clientY };
}

function changePointerCapture(
	element: HTMLElement,
	pointerId: number,
	method: 'setPointerCapture' | 'releasePointerCapture'
) {
	try {
		element[method](pointerId);
	} catch (error) {
		if (error instanceof DOMException && error.name === 'NotFoundError') return;
		throw error;
	}
}

export class SwipeDismiss {
	swiping = $state(false);
	swipeDirection = $state<SwipeDirection | undefined>(undefined);
	dragDismissed = $state(false);

	private dragStart: Point = { x: 0, y: 0 };
	private dragOffset: Point = { x: 0, y: 0 };
	private lastMove: Point | null = null;
	private initialTransform = { x: 0, y: 0, scale: 1 };
	private intendedDirection: SwipeDirection | undefined = undefined;
	private maxDisplacement = 0;
	private cancelled = false;
	private cancelBaseline: Point = { x: 0, y: 0 };
	private firstMove = false;
	private pending = false;
	private pendingStart: Point | null = null;
	private fromScrollable = false;
	private sawPrimaryButtons = false;
	private elementSize = { width: 0, height: 0 };
	private progress = 0;
	private threshold = DEFAULT_SWIPE_THRESHOLD;
	private thresholdFunction:
		((details: { element: HTMLElement; direction: SwipeDirection }) => number) | null = null;
	private startTime: number | null = null;
	private lastSample: { x: number; y: number; time: number } | null = null;
	private hasStationarySample = false;
	private lastVelocity: Point = { x: 0, y: 0 };
	private lastProgressDetails: SwipeProgressDetails | null = null;
	private isSwiping = false;
	private styleSnapshot: [string, string] | null = null;

	constructor(private readonly options: () => SwipeDismissOptions) {}

	private get opts() {
		return untrack(this.options);
	}

	private get primaryDirection() {
		const { directions } = this.opts;
		return directions.length === 1 ? directions[0] : undefined;
	}

	private get defaultThreshold() {
		const value = this.opts.swipeThreshold;
		return Math.max(0, typeof value === 'number' ? value : DEFAULT_SWIPE_THRESHOLD);
	}

	private get allowed() {
		const { directions } = this.opts;
		const left = directions.includes('left');
		const right = directions.includes('right');
		const up = directions.includes('up');
		const down = directions.includes('down');
		return { left, right, up, down, horizontal: left || right, vertical: up || down };
	}

	// Consumers pass directions on a single axis.
	private get scrollAxis(): ScrollAxis {
		return this.allowed.horizontal ? 'horizontal' : 'vertical';
	}

	private setSwiping(next: boolean) {
		if (this.isSwiping === next) return;
		this.isSwiping = next;
		this.swiping = next;
		this.opts.onSwipingChange?.(next);
	}

	private resolveThreshold(direction: SwipeDirection | undefined) {
		const element = this.opts.element;
		if (!direction || !element || !this.thresholdFunction) return;
		this.threshold = Math.max(0, this.thresholdFunction({ element, direction }));
	}

	private updateProgress(progress: number, details?: SwipeProgressDetails) {
		const next = Number.isFinite(progress) ? clamp(progress, 0, 1) : 0;
		const progressChanged = next !== this.progress;
		let detailsChanged = false;
		if (details) {
			const last = this.lastProgressDetails;
			detailsChanged =
				!last ||
				last.deltaX !== details.deltaX ||
				last.deltaY !== details.deltaY ||
				last.direction !== details.direction;
		}
		if (!progressChanged && !detailsChanged) return;

		this.progress = next;
		if (details) this.lastProgressDetails = details;
		else if (progressChanged) this.lastProgressDetails = null;
		this.opts.onProgress?.(next, details);
	}

	private syncDragStyles(swiping: boolean) {
		const { element, trackDrag = true, movementCssVars } = this.opts;
		if (!trackDrag || !element) {
			if (!swiping) this.styleSnapshot = null;
			return;
		}

		const style = element.style;
		if (swiping) {
			if (!this.styleSnapshot) this.styleSnapshot = [style.transition, style.transform];
			style.transition = 'none';
		} else if (this.styleSnapshot) {
			[style.transition, style.transform] = this.styleSnapshot;
			this.styleSnapshot = null;
		}

		const deltaX = this.dragOffset.x - this.initialTransform.x;
		const deltaY = this.dragOffset.y - this.initialTransform.y;
		if (swiping) style.transform = getDragTransform(this.dragOffset, this.initialTransform.scale);
		style.setProperty(movementCssVars.x, `${deltaX}px`);
		style.setProperty(movementCssVars.y, `${deltaY}px`);
	}

	private recordSample(offset: Point, timeStamp: number | null) {
		if (timeStamp === null) return;
		const last = this.lastSample;
		if (last && timeStamp > last.time) {
			// Some Android devices emit one stationary move just before release. Keep the last moving
			// sample. Repeated stationary moves still clear the velocity.
			const stationary =
				Math.abs(offset.x - last.x) < MIN_VELOCITY_SAMPLE_DISTANCE &&
				Math.abs(offset.y - last.y) < MIN_VELOCITY_SAMPLE_DISTANCE;
			const skip = stationary && !this.hasStationarySample;
			this.hasStationarySample = stationary;
			if (skip) return;

			const duration = Math.max(timeStamp - last.time, MIN_RELEASE_VELOCITY_DURATION_MS);
			this.lastVelocity = { x: (offset.x - last.x) / duration, y: (offset.y - last.y) / duration };
		}
		this.lastSample = { x: offset.x, y: offset.y, time: timeStamp };
	}

	reset = () => {
		untrack(() => {
			this.swipeDirection = undefined;
			this.setSwiping(false);
			this.dragDismissed = false;
			this.updateProgress(0);

			this.threshold = this.defaultThreshold;
			this.thresholdFunction = null;
			this.dragStart = { x: 0, y: 0 };
			this.dragOffset = { x: 0, y: 0 };
			this.initialTransform = { x: 0, y: 0, scale: 1 };
			this.intendedDirection = undefined;
			this.maxDisplacement = 0;
			this.cancelled = false;
			this.cancelBaseline = { x: 0, y: 0 };
			this.firstMove = false;
			this.lastMove = null;
			this.pending = false;
			this.pendingStart = null;
			this.fromScrollable = false;
			this.sawPrimaryButtons = false;
			this.elementSize = { width: 0, height: 0 };
			this.startTime = null;
			this.lastSample = null;
			this.hasStationarySample = false;
			this.lastVelocity = { x: 0, y: 0 };
			this.lastProgressDetails = null;
			this.syncDragStyles(false);
		});
	};

	private targetAtPoint(position: Point, event: Event) {
		const root = this.opts.element?.getRootNode();
		return (getElementAtPoint(root, position.x, position.y) ?? getTarget(event)) as Element | null;
	}

	// The swiped element is positioned against the viewport, so the page scroller must not gate the
	// gesture (`html, body { height: 100%; overflow: auto }` makes `body` a real scroll container).
	private gestureScrollTarget(target: EventTarget | null, root: HTMLElement) {
		const scrollTarget = findScrollableTouchTarget(target, root, this.scrollAxis);
		const doc = ownerDocument(scrollTarget);
		return scrollTarget === doc.body || scrollTarget === doc.documentElement ? null : scrollTarget;
	}

	private startAt(
		event: SwipeEvent,
		position: Point,
		startOptions?: { ignoreScrollableTarget?: boolean; ignoreScrollableAncestors?: boolean }
	) {
		const opts = this.opts;
		this.fromScrollable = false;
		const touchLike = isTouchLike(event);
		const target = this.targetAtPoint(position, event);
		const body = ownerDocument(opts.element).body;

		const scrollableTarget = touchLike && body ? this.gestureScrollTarget(target, body) : null;
		const ignoreScrollableTarget = startOptions?.ignoreScrollableTarget ?? false;
		if (scrollableTarget && !ignoreScrollableTarget) return false;
		this.fromScrollable = Boolean(scrollableTarget && ignoreScrollableTarget);

		const interactive = closest(target, IGNORE_SELECTOR);
		if (interactive && (!touchLike || (opts.ignoreSelectorWhenTouch ?? true))) return false;

		const element = opts.element;
		if (opts.ignoreScrollableAncestors && element && target) {
			const ignoreAncestors = startOptions?.ignoreScrollableAncestors ?? false;
			if (!ignoreAncestors && findScrollableAncestor(target, element, this.scrollAxis) != null) {
				return false;
			}
		}

		this.cancelled = false;
		this.intendedDirection = undefined;
		this.maxDisplacement = 0;
		this.dragStart = position;
		this.startTime = getValidTimeStamp(event.timeStamp);
		this.lastSample = null;
		this.hasStationarySample = false;
		this.lastVelocity = { x: 0, y: 0 };
		this.cancelBaseline = position;
		this.lastMove = position;
		this.threshold = this.defaultThreshold;
		this.thresholdFunction = typeof opts.swipeThreshold === 'function' ? opts.swipeThreshold : null;

		if (element) {
			this.elementSize = { width: element.offsetWidth, height: element.offsetHeight };
			this.resolveThreshold(this.primaryDirection);
			const transform = getElementTransform(ownerWindow(element).getComputedStyle(element));
			this.initialTransform = transform;
			this.dragOffset = { x: transform.x, y: transform.y };
			this.recordSample({ x: transform.x, y: transform.y }, this.startTime);
			if (!isTouchEvent(event)) changePointerCapture(element, event.pointerId, 'setPointerCapture');
		}

		opts.onSwipeStart?.(event);
		this.setSwiping(true);
		this.firstMove = true;
		this.updateProgress(0);
		this.syncDragStyles(true);
		return true;
	}

	private resetPending() {
		this.clearPendingStart();
		this.fromScrollable = false;
		this.lastMove = null;
	}

	private clearPendingStart() {
		this.pending = false;
		this.pendingStart = null;
	}

	private cancelInteraction(event: PointerEvent) {
		this.resetPending();
		if (!this.isSwiping) return;

		this.setSwiping(false);
		this.dragOffset = { x: this.initialTransform.x, y: this.initialTransform.y };
		this.swipeDirection = undefined;
		this.sawPrimaryButtons = false;
		this.syncDragStyles(false);

		const element = this.opts.element;
		if (element) changePointerCapture(element, event.pointerId, 'releasePointerCapture');

		this.updateProgress(0, { deltaX: 0, deltaY: 0, direction: undefined });
		this.opts.onCancel?.(event);
	}

	private dampDelta(deltaX: number, deltaY: number) {
		const { left, right, up, down, horizontal, vertical } = this.allowed;
		const exponent = (value: number) => Math.sign(value) * Math.abs(value) ** 0.5;
		const dampAxis = (delta: number, allowNegative: boolean, allowPositive: boolean) =>
			(!allowNegative && delta < 0) || (!allowPositive && delta > 0) ? exponent(delta) : delta;
		return {
			x: horizontal ? dampAxis(deltaX, left, right) : exponent(deltaX),
			y: vertical ? dampAxis(deltaY, up, down) : exponent(deltaY)
		};
	}

	// Swiping toward the axis start edge (down or right) is allowed when scrolled to the start,
	// toward the end edge (up or left) when scrolled to the end.
	private canSwipeFromScrollEdge(scrollTarget: HTMLElement, deltaX: number, deltaY: number) {
		const { left, right, up, down, horizontal, vertical } = this.allowed;
		const canSwipeOnAxis = (
			delta: number,
			offset: number,
			max: number,
			towardStart: boolean,
			towardEnd: boolean
		) =>
			(delta > 0 && offset <= 0 && towardStart) ||
			(delta < 0 && offset >= Math.max(0, max) && towardEnd);

		if (vertical && deltaY !== 0) {
			return canSwipeOnAxis(
				deltaY,
				scrollTarget.scrollTop,
				scrollTarget.scrollHeight - scrollTarget.clientHeight,
				down,
				up
			);
		}
		if (horizontal && deltaX !== 0) {
			return canSwipeOnAxis(
				deltaX,
				scrollTarget.scrollLeft,
				scrollTarget.scrollWidth - scrollTarget.clientWidth,
				right,
				left
			);
		}
		return null;
	}

	start = (event: SwipeEvent) => {
		const opts = this.opts;
		if (!opts.enabled || event.defaultPrevented) return;
		if (!isTouchEvent(event) && event.button !== 0) return;

		const position = getPrimaryPosition(event);
		if (!position) return;

		this.pending = true;
		this.pendingStart = position;
		this.fromScrollable = false;
		this.sawPrimaryButtons = !isTouchEvent(event);

		const allowed = opts.canStart
			? opts.canStart(position, { nativeEvent: event, direction: this.primaryDirection })
			: true;
		if (!allowed) return;
		if (this.startAt(event, position)) this.clearPendingStart();
	};

	private moveCore(event: SwipeEvent, boundary: HTMLElement, position: Point, movement: Point) {
		if (!this.opts.enabled || !this.isSwiping) return;

		const target = getTarget(event);
		if (isTouchLike(event) && !this.fromScrollable) {
			if (this.gestureScrollTarget(target, boundary)) return;
		}

		// Prevents text selection in Safari.
		if (!isTouchEvent(event)) event.preventDefault();

		if (this.firstMove) {
			this.firstMove = false;
			// Absorb the gap between the press and the first move (iOS sends its first touchmove already
			// offset) so a tracked element does not jump. Untracked swipes keep the press position: a
			// quick flick on a low-refresh display can land its whole travel in this one move.
			if (this.opts.trackDrag ?? true) {
				this.dragStart = position;
				const moveTime = getValidTimeStamp(event.timeStamp);
				if (moveTime !== null) this.startTime = moveTime;
				this.lastSample = null;
				this.hasStationarySample = false;
			}
		}

		const baseline = this.cancelBaseline;
		if (
			(movement.y < 0 && position.y > baseline.y) ||
			(movement.y > 0 && position.y < baseline.y)
		) {
			this.cancelBaseline = { x: baseline.x, y: position.y };
		}
		if (
			(movement.x < 0 && position.x > baseline.x) ||
			(movement.x > 0 && position.x < baseline.x)
		) {
			this.cancelBaseline = { x: position.x, y: this.cancelBaseline.y };
		}

		const deltaX = position.x - this.dragStart.x;
		const deltaY = position.y - this.dragStart.y;
		const cancelDeltaX = position.x - this.cancelBaseline.x;
		const cancelDeltaY = position.y - this.cancelBaseline.y;
		const allowed = this.allowed;

		if (!this.intendedDirection) {
			let candidate: SwipeDirection;
			if (Math.abs(deltaX) >= Math.abs(deltaY)) candidate = deltaX > 0 ? 'right' : 'left';
			else candidate = deltaY > 0 ? 'down' : 'up';
			if (allowed[candidate]) {
				this.intendedDirection = candidate;
				this.maxDisplacement = getDisplacement(candidate, deltaX, deltaY);
				this.swipeDirection = candidate;
				this.resolveThreshold(candidate);
			}
		} else {
			const direction = this.intendedDirection;
			const displacement = getDisplacement(direction, cancelDeltaX, cancelDeltaY);
			if (displacement > this.threshold) {
				this.cancelled = false;
				this.swipeDirection = direction;
			} else if (
				!(allowed.left && allowed.right) &&
				!(allowed.up && allowed.down) &&
				this.maxDisplacement - displacement >= REVERSE_CANCEL_THRESHOLD
			) {
				// A change of mind.
				this.cancelled = true;
			}
		}

		const damped = this.dampDelta(deltaX, deltaY);
		let nextX = this.initialTransform.x;
		let nextY = this.initialTransform.y;
		if (allowed.horizontal) nextX += damped.x;
		if (allowed.vertical) nextY += damped.y;

		// Rewrite drag styles only when the offset changed. The consumer's `onProgress` overwrites the
		// raw styles with damped ones, but an unchanged delta skips `onProgress`, so rewriting here
		// would leave the raw position on screen.
		const offsetChanged = nextX !== this.dragOffset.x || nextY !== this.dragOffset.y;
		this.dragOffset = { x: nextX, y: nextY };
		if (offsetChanged) this.syncDragStyles(true);
		this.recordSample({ x: nextX, y: nextY }, getValidTimeStamp(event.timeStamp));

		const dragDeltaX = nextX - this.initialTransform.x;
		const dragDeltaY = nextY - this.initialTransform.y;
		const details: SwipeProgressDetails = {
			deltaX: dragDeltaX,
			deltaY: dragDeltaY,
			direction: this.intendedDirection
		};

		let progress = 0;
		const progressDirection = this.primaryDirection ?? this.intendedDirection;
		if (progressDirection) {
			const size =
				progressDirection === 'left' || progressDirection === 'right'
					? this.elementSize.width
					: this.elementSize.height;
			const scale = this.initialTransform.scale || 1;
			const displacement = getDisplacement(progressDirection, dragDeltaX, dragDeltaY);
			if (size > 0 && scale > 0 && displacement > 0) progress = displacement / (size * scale);
		}
		this.updateProgress(progress, details);
	}

	end = (event: SwipeEvent) => {
		const opts = this.opts;
		if (!opts.enabled) return;

		const offset = this.dragOffset;
		const initial = this.initialTransform;
		const deltaX = offset.x - initial.x;
		const deltaY = offset.y - initial.y;
		const details: SwipeProgressDetails = { deltaX, deltaY, direction: this.intendedDirection };

		if (!this.isSwiping) {
			this.resetPending();
			this.updateProgress(0, details);
			return;
		}

		this.setSwiping(false);
		this.resetPending();
		this.sawPrimaryButtons = false;

		const element = opts.element;
		if (element && !isTouchEvent(event)) {
			changePointerCapture(element, event.pointerId, 'releasePointerCapture');
		}

		const startTime = this.startTime;
		const endTime = getValidTimeStamp(event.timeStamp);
		const duration =
			startTime !== null && endTime !== null && endTime > startTime ? endTime - startTime : 0;
		const velocityDuration = duration > 0 ? Math.max(duration, MIN_VELOCITY_DURATION_MS) : 0;
		const velocityX = velocityDuration > 0 ? deltaX / velocityDuration : 0;
		const velocityY = velocityDuration > 0 ? deltaY / velocityDuration : 0;
		let releaseVelocityX = this.lastVelocity.x;
		let releaseVelocityY = this.lastVelocity.y;
		const last = this.lastSample;
		if (last && endTime !== null && endTime >= last.time) {
			const age = endTime - last.time;
			if (age <= MAX_RELEASE_VELOCITY_AGE_MS) {
				const sampleDuration = Math.max(age, MIN_RELEASE_VELOCITY_DURATION_MS);
				const fromLastX = offset.x - last.x;
				const fromLastY = offset.y - last.y;
				if (Math.abs(fromLastX) >= MIN_VELOCITY_SAMPLE_DISTANCE) {
					releaseVelocityX = fromLastX / sampleDuration;
				}
				if (Math.abs(fromLastY) >= MIN_VELOCITY_SAMPLE_DISTANCE) {
					releaseVelocityY = fromLastY / sampleDuration;
				}
			} else {
				releaseVelocityX = 0;
				releaseVelocityY = 0;
			}
		}

		const decision = opts.onRelease?.({
			event,
			direction: this.intendedDirection,
			deltaX,
			deltaY,
			velocityX,
			velocityY,
			releaseVelocityX,
			releaseVelocityY
		});
		const hasDecision = typeof decision === 'boolean';

		if (this.cancelled && !hasDecision) {
			this.dragOffset = { x: initial.x, y: initial.y };
			this.swipeDirection = undefined;
			this.syncDragStyles(false);
			this.updateProgress(0, details);
			return;
		}

		let shouldClose = false;
		let dismissDirection: SwipeDirection | undefined;
		if (hasDecision) {
			shouldClose = decision;
			dismissDirection = this.intendedDirection ?? this.primaryDirection;
		} else {
			for (const direction of opts.directions) {
				if (getDisplacement(direction, deltaX, deltaY) > this.threshold) {
					shouldClose = true;
					dismissDirection = direction;
					break;
				}
			}
		}

		if (shouldClose && dismissDirection) {
			this.swipeDirection = dismissDirection;
			this.dragDismissed = true;
			this.syncDragStyles(false);
			opts.onDismiss?.(event, { direction: dismissDirection });
		} else {
			this.dragOffset = { x: initial.x, y: initial.y };
			this.swipeDirection = undefined;
			this.syncDragStyles(false);
			this.updateProgress(0, details);
		}
	};

	/**
	 * `boundary` is the element the gesture belongs to. A touchmove from a document capture
	 * listener passes the element it was claimed for.
	 */
	move = (event: SwipeEvent, boundary = event.currentTarget as HTMLElement) => {
		const position = getPrimaryPosition(event);
		if (!position) return;

		let endAfterMove = false;
		if (!isTouchEvent(event)) {
			const primary = event.buttons % 2 === 1;
			if (primary) this.sawPrimaryButtons = true;

			// A non-primary button took over, such as a right click during a drag.
			if (event.buttons !== 0 && !primary) {
				this.cancelInteraction(event);
				return;
			}

			// A `buttons: 0` move means the primary button was already released even if no pointerup
			// reached us. Fast trackpad flicks send it just before pointerup. Treat it as the release.
			if (event.buttons === 0 && this.sawPrimaryButtons) {
				if (!this.isSwiping) {
					this.end(event);
					return;
				}
				// The release move can carry the threshold-crossing displacement, so let it update the
				// offset and velocity first.
				endAfterMove = true;
			}
		}

		if (!this.isSwiping && this.pending) {
			if (!isTouchLike(event) && event.defaultPrevented) {
				this.resetPending();
				return;
			}

			const opts = this.opts;
			const allowed = opts.canStart
				? opts.canStart(position, { nativeEvent: event, direction: this.primaryDirection })
				: true;

			if (allowed) {
				const pendingStart = this.pendingStart;
				let ignoreScrollableOnStart = false;
				const element = opts.element;
				if (isTouchLike(event) && pendingStart && element) {
					const target = this.targetAtPoint(position, event);
					const body = ownerDocument(element).body;
					const scrollTarget = body ? this.gestureScrollTarget(target, body) : null;
					if (
						scrollTarget &&
						(contains(element, scrollTarget) || contains(scrollTarget, element))
					) {
						const fromEdge = this.canSwipeFromScrollEdge(
							scrollTarget,
							position.x - pendingStart.x,
							position.y - pendingStart.y
						);
						if (fromEdge === false) return;
						if (fromEdge === true) ignoreScrollableOnStart = true;
					}
				}

				const started = this.startAt(event, position, {
					ignoreScrollableTarget: ignoreScrollableOnStart,
					ignoreScrollableAncestors: ignoreScrollableOnStart
				});
				if (started) {
					this.clearPendingStart();
					if (pendingStart && ignoreScrollableOnStart) {
						// Keep the travel between touchstart and the activating move so quick flicks from a
						// scroll edge can dismiss.
						this.dragStart = pendingStart;
						this.cancelBaseline = pendingStart;
						this.lastMove = pendingStart;
						this.firstMove = false;
					} else {
						this.fromScrollable = false;
					}
				}
			}
		}

		const previous = this.lastMove;
		const movement =
			previous === null
				? { x: 0, y: 0 }
				: { x: position.x - previous.x, y: position.y - previous.y };
		this.lastMove = position;
		this.moveCore(event, boundary, position, movement);

		if (endAfterMove) this.end(event);
	};

	getDragStyles = (): Record<string, string | undefined> => {
		// `isSwiping`, not the reactive `swiping`, matches what `syncDragStyles` wrote.
		const swiping = this.isSwiping;
		const { movementCssVars } = this.opts;
		const deltaX = this.dragOffset.x - this.initialTransform.x;
		const deltaY = this.dragOffset.y - this.initialTransform.y;

		if (!swiping && deltaX === 0 && deltaY === 0 && !this.dragDismissed) {
			return { [movementCssVars.x]: '0px', [movementCssVars.y]: '0px' };
		}

		return {
			transition: swiping ? 'none' : undefined,
			// While swiping, freeze the element at its current visual transform.
			transform: swiping
				? getDragTransform(this.dragOffset, this.initialTransform.scale)
				: undefined,
			[movementCssVars.x]: `${deltaX}px`,
			[movementCssVars.y]: `${deltaY}px`
		};
	};
}
