// Derived from Base UI v1.9.0 packages/react/src/drawer/root/DrawerRoot.tsx,
// root/DrawerRootContext.ts, and root/useDrawerSnapPoints.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// One instance per Drawer.Root. Popup and Viewport share its snap point measurement.
// Construct it during component init: it registers the viewport measurement effect.

import { untrack } from 'svelte';
import {
	createChangeEventDetails,
	ownerDocument,
	REASONS,
	type BaseUIChangeEventDetails
} from '@sveltery/utils';
import { clamp } from '../internal/clamp.js';
import { defineContext } from '../internal/context.js';
import type { DialogStore } from '../dialog/store.svelte.js';
import type { DialogChangeEventReason } from '../dialog/types.js';
import type { SwipeDirection } from '../internal/useSwipeDismiss.svelte.js';
import {
	resolveActiveSnapPoint,
	resolveSnapPoints,
	type DrawerSnapPoint,
	type ResolvedDrawerSnapPoint
} from './snap-points.js';
import type { DrawerChangeEventReason, DrawerSnapPointChangeEventDetails } from './types.js';

export interface DrawerRootStateOptions {
	readSwipeDirection: () => SwipeDirection;
	readSnapPoints: () => DrawerSnapPoint[] | undefined;
	readSnapPoint: () => DrawerSnapPoint | null | undefined;
	writeSnapPoint: (snapPoint: DrawerSnapPoint | null) => void;
	readDefaultSnapPoint: () => DrawerSnapPoint | null | undefined;
	readSnapToSequentialPoints: () => boolean;
	onSnapPointChange: () =>
		| ((snapPoint: DrawerSnapPoint | null, details: DrawerSnapPointChangeEventDetails) => void)
		| undefined;
}

export class DrawerRootState {
	popupHeight = $state(0);
	/** The measured height of the frontmost open drawer in this nested stack. */
	frontmostHeight = $state(0);
	/** A nested drawer is open or animating out. */
	hasNestedDrawer = $state(false);
	nestedSwiping = $state(false);
	nestedSwipeProgress = $state(0);
	/** Drawer.SwipeArea is writing the popup's swipe movement while it opens the drawer. */
	swipeAreaActive = $state(false);
	private nestedDrawerOpen = false;
	private viewportHeight = $state(0);
	private rootFontSize = $state(16);

	readonly resolvedDefaultSnapPoint = $derived.by(() => {
		const value = this.options.readDefaultSnapPoint();
		return value !== undefined ? value : (this.snapPoints?.[0] ?? null);
	});

	/**
	 * A value outside `snapPoints` resolves to the closest snap point, or to closed when it does not
	 * parse. Svelte cannot tell a bound value from an internal one, so this follows Base UI's
	 * controlled behavior.
	 */
	readonly activeSnapPoint = $derived.by((): DrawerSnapPoint | null => {
		const value = this.options.readSnapPoint();
		return value === undefined ? this.resolvedDefaultSnapPoint : value;
	});

	readonly resolvedSnapPoints: ResolvedDrawerSnapPoint[] = $derived(
		resolveSnapPoints(this.snapPoints, this.viewportHeight, this.popupHeight, this.rootFontSize)
	);

	readonly activeSnapPointOffset = $derived(
		resolveActiveSnapPoint(
			this.activeSnapPoint,
			this.resolvedSnapPoints,
			this.viewportHeight,
			this.popupHeight,
			this.rootFontSize
		)?.offset ?? null
	);

	/** Offsets of the two most open snap points, which bound the backdrop's resting progress. */
	readonly snapPointRange = $derived.by(() => {
		const points = this.snapPoints;
		const direction = this.swipeDirection;
		if (
			!points ||
			points.length < 2 ||
			this.resolvedSnapPoints.length < 2 ||
			(direction !== 'down' && direction !== 'up')
		) {
			return null;
		}
		const offsets = this.resolvedSnapPoints.map((point) => point.offset).sort((a, b) => a - b);
		return { minOffset: offsets[0], range: offsets[1] - offsets[0] };
	});

	readonly snapPointProgress = $derived.by(() => {
		const range = this.snapPointRange;
		const offset = this.activeSnapPointOffset;
		if (!range || offset === null) return null;
		return clamp((offset - range.minOffset) / range.range, 0, 1);
	});

	constructor(
		readonly store: DialogStore<unknown>,
		readonly parent: DrawerRootState | undefined,
		private readonly options: DrawerRootStateOptions
	) {
		$effect(() => {
			const viewport = store.viewportElement;
			const measure = () => {
				const html = ownerDocument(viewport).documentElement;
				this.viewportHeight = viewport ? viewport.offsetHeight : html.clientHeight;
				const fontSize = parseFloat(getComputedStyle(html).fontSize);
				if (Number.isFinite(fontSize)) this.rootFontSize = fontSize;
			};
			measure();
			if (!viewport || typeof ResizeObserver !== 'function') return;
			const observer = new ResizeObserver(measure);
			observer.observe(viewport);
			return () => observer.disconnect();
		});
	}

	get swipeDirection() {
		return this.options.readSwipeDirection();
	}

	get snapPoints() {
		return this.options.readSnapPoints();
	}

	get snapToSequentialPoints() {
		return this.options.readSnapToSequentialPoints();
	}

	get hasSnapPoints() {
		return (this.snapPoints?.length ?? 0) > 0;
	}

	/** Dialog's store takes Dialog's reasons. A drawer adds `swipe` and `close-watcher`. */
	setOpen(open: boolean, details: BaseUIChangeEventDetails<DrawerChangeEventReason>) {
		this.store.setOpen(open, details as BaseUIChangeEventDetails<DialogChangeEventReason>);
	}

	setActiveSnapPoint = (
		snapPoint: DrawerSnapPoint | null,
		details: DrawerSnapPointChangeEventDetails = createChangeEventDetails(REASONS.none)
	) => {
		untrack(() => this.options.onSnapPointChange()?.(snapPoint, details));
		if (details.isCanceled) return;
		this.options.writeSnapPoint(snapPoint);
	};

	onPopupHeightChange(height: number) {
		this.popupHeight = height;
		if (!this.nestedDrawerOpen && height > 0) this.frontmostHeight = height;
	}

	onNestedFrontmostHeightChange(height: number) {
		if (height > 0) {
			this.nestedDrawerOpen = true;
			this.frontmostHeight = height;
			return;
		}
		this.nestedDrawerOpen = false;
		const own = untrack(() => this.popupHeight);
		if (own > 0) this.frontmostHeight = own;
	}

	onNestedDrawerPresenceChange(present: boolean) {
		this.hasNestedDrawer = present;
	}

	onNestedSwipeProgressChange(progress: number) {
		this.nestedSwipeProgress = Number.isFinite(progress) ? progress : 0;
		this.parent?.onNestedSwipeProgressChange(progress);
	}

	onNestedSwipingChange(swiping: boolean) {
		this.nestedSwiping = swiping;
		this.parent?.onNestedSwipingChange(swiping);
	}
}

export const [useDrawerRootState, setDrawerRootState, findDrawerRootState] =
	defineContext<DrawerRootState>(
		'Base UI: DrawerRootContext is missing. Drawer parts must be placed within <Drawer.Root>.'
	);
