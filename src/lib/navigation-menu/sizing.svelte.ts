// Derived from the popup sizing logic of Base UI v1.9.0
// packages/react/src/navigation-menu/trigger/NavigationMenuTrigger.tsx and the close size effect of
// packages/react/src/navigation-menu/root/NavigationMenuRoot.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream runs this logic in every trigger and shares the pending auto-size reset between them.
// One instance per root runs it here for the active item. Each scheduled step names the item it
// sizes for and does nothing once another item is active, as upstream's `isActiveItemRef` check.

import { untrack } from 'svelte';
import { on } from 'svelte/events';
import { ownerWindow, ScopedAnimationFrame } from '@sveltery/utils';
import { runOnceAnimationsFinish } from '../internal/animations-finished.js';
import { getCssDimensions } from '../internal/getCssDimensions.js';
import { POPUP_HEIGHT_VAR, POPUP_WIDTH_VAR } from './constants.js';
import type { NavigationMenuRootStore } from './root-store.svelte.js';
import {
	getPositionerFixedSize,
	setPopupSize,
	setPositionerSize,
	setSharedFixedSize,
	type SizeTargets
} from './utils.js';

type Size = { width: number; height: number };

const DEFAULT_SIZE: Size = { width: 0, height: 0 };
const STARTING_STYLE = 'data-starting-style';

function setAutoSizes(targets: SizeTargets) {
	setPopupSize(targets, 'auto', 'auto');
}

function clearFixedSizes(targets: SizeTargets) {
	setPopupSize(targets, null, null);
	setPositionerSize(targets, null, null);
}

export class NavigationMenuSizing {
	#prevSize: Size = DEFAULT_SIZE;
	/** Set by a trigger switch so the next open-state sync keeps the size that switch set. */
	#skipAutoSizeSync = false;
	#autoSizeReset: AbortController | null = null;
	readonly #mutationFrame = new ScopedAnimationFrame();
	readonly #resizeFrame = new ScopedAnimationFrame();
	readonly #sizeFrame = new ScopedAnimationFrame();

	constructor(private readonly root: NavigationMenuRootStore) {
		$effect(() => {
			if (root.open) return;
			this.#mutationFrame.cancel();
			this.#resizeFrame.cancel();
			this.#sizeFrame.cancel();
			this.#cancelAutoSizeReset();
			this.#skipAutoSizeSync = false;
		});

		$effect(() => {
			if (!root.mounted) this.#prevSize = DEFAULT_SIZE;
		});

		// A close keeps the last fixed size, so the closing transition starts from it.
		$effect(() => {
			if (root.open) return;
			const positioner = root.positionerElement;
			const popup = root.popupElement;
			if (!positioner || !popup) return;
			const size = getPositionerFixedSize(positioner);
			if (!size) return;
			untrack(() => setSharedFixedSize(this.#targets(popup, positioner), size.width, size.height));
		});

		$effect(() => {
			const popup = root.popupElement;
			if (!popup || typeof ResizeObserver !== 'function') return;
			const observer = new ResizeObserver(() => {
				this.#prevSize = { width: popup.offsetWidth, height: popup.offsetHeight };
			});
			observer.observe(popup);
			return () => observer.disconnect();
		});

		$effect(() => {
			const popup = root.popupElement;
			const positioner = root.positionerElement;
			if (!root.open || !popup || !positioner) return;
			const stop = on(ownerWindow(positioner), 'resize', () => {
				this.#resizeFrame.cancel();
				this.#resizeFrame.request(() => this.#syncCurrentSize(popup, positioner));
			});
			return () => {
				this.#resizeFrame.cancel();
				stop();
			};
		});

		$effect(() => {
			const content = root.currentContent;
			const popup = root.popupElement;
			const positioner = root.positionerElement;
			if (!root.open || !content || !popup || !positioner) return;
			if (typeof MutationObserver !== 'function') return;
			const observer = new MutationObserver(() => {
				if (root.transitionStatus === 'starting' || popup.hasAttribute(STARTING_STYLE)) {
					this.#syncCurrentSize(popup, positioner);
					return;
				}
				const { size, syncPositioner } = this.#getMutationBaseline(popup);
				if (syncPositioner) {
					this.#handleInterruptedMutationResize(root.value, popup, positioner, size);
					return;
				}
				this.resize(root.value, size);
			});
			// A kept-mounted submenu switch toggles `hidden` instead of inserting nodes.
			observer.observe(content, {
				childList: true,
				subtree: true,
				characterData: true,
				attributes: true,
				attributeFilter: ['hidden']
			});
			return () => observer.disconnect();
		});

		$effect(() => {
			const open = root.open;
			const popup = root.popupElement;
			const positioner = root.positionerElement;
			void root.transitionStatus;
			untrack(() => {
				if (!open || !popup || !positioner) return;
				if (this.#skipAutoSizeSync) {
					this.#skipAutoSizeSync = false;
					return;
				}
				this.resize(root.value, getCssDimensions(popup));
			});
		});
	}

	/** Keeps the size a trigger switch set when the open state syncs next. */
	skipNextAutoSizeSync() {
		this.#skipAutoSizeSync = true;
	}

	/**
	 * Transitions the popup from `current` to the measured size of `item`'s content, then lets it
	 * size itself once the transition ends.
	 */
	resize(item: unknown, current: Size) {
		const popup = this.root.popupElement;
		const positioner = this.root.positionerElement;
		if (!popup || !positioner) return;
		this.#cancelAutoSizeReset();
		const targets = this.#targets(popup, positioner);
		clearFixedSizes(targets);

		const { width, height } = getCssDimensions(popup);
		const measuredWidth = width || this.#prevSize.width;
		const measuredHeight = height || this.#prevSize.height;
		let { width: currentWidth, height: currentHeight } = current;

		if (currentHeight === 0 || currentWidth === 0) {
			currentWidth = measuredWidth;
			currentHeight = measuredHeight;
		}

		setPopupSize(targets, `${currentWidth}px`, `${currentHeight}px`);
		setPositionerSize(targets, `${measuredWidth}px`, `${measuredHeight}px`);

		this.#sizeFrame.request(() => {
			if (!this.#isActive(item)) return;
			setPopupSize(targets, `${measuredWidth}px`, `${measuredHeight}px`);
			this.#scheduleAutoSizeReset(item, targets);
		});
	}

	#isActive(item: unknown) {
		return this.root.open && this.root.value === item;
	}

	#targets(popup: HTMLElement, positioner: HTMLElement): SizeTargets {
		const { popupVars, positionerVars } = this.root;
		return { popup, positioner, popupVars, positionerVars };
	}

	#cancelAutoSizeReset() {
		this.#autoSizeReset?.abort();
		this.#autoSizeReset = null;
	}

	#scheduleAutoSizeReset(item: unknown, targets: SizeTargets) {
		this.#cancelAutoSizeReset();
		const abortController = new AbortController();
		this.#autoSizeReset = abortController;
		runOnceAnimationsFinish(
			targets.popup,
			() => {
				if (this.#autoSizeReset === abortController) this.#autoSizeReset = null;
				if (this.#isActive(item)) setAutoSizes(targets);
			},
			abortController.signal,
			false
		);
	}

	#handleInterruptedMutationResize(
		item: unknown,
		popup: HTMLElement,
		positioner: HTMLElement,
		current: Size
	) {
		this.#sizeFrame.cancel();
		this.#mutationFrame.cancel();
		this.#cancelAutoSizeReset();

		if (current.width === 0 || current.height === 0) return;

		const targets = this.#targets(popup, positioner);
		setSharedFixedSize(targets, current.width, current.height);

		this.#mutationFrame.request(() => {
			if (!this.#isActive(item)) return;
			this.#mutationFrame.request(() => {
				if (!this.#isActive(item)) return;
				clearFixedSizes(targets);
				const { width, height } = getCssDimensions(popup);
				const measuredWidth = width || current.width;
				const measuredHeight = height || current.height;
				setSharedFixedSize(targets, current.width, current.height);

				this.#sizeFrame.request(() => {
					if (!this.#isActive(item)) return;
					setSharedFixedSize(targets, measuredWidth, measuredHeight);
					this.#scheduleAutoSizeReset(item, targets);
				});
			});
		});
	}

	#syncCurrentSize(popup: HTMLElement, positioner: HTMLElement) {
		this.#sizeFrame.cancel();
		this.#cancelAutoSizeReset();
		const targets = this.#targets(popup, positioner);
		clearFixedSizes(targets);

		const { width, height } = getCssDimensions(popup);
		if (width === 0 || height === 0) return;

		this.#prevSize = { width, height };
		setAutoSizes(targets);
		setPositionerSize(targets, `${width}px`, `${height}px`);
	}

	#getMutationBaseline(popup: HTMLElement): { size: Size; syncPositioner: boolean } {
		const popupWidth = popup.style.getPropertyValue(POPUP_WIDTH_VAR);
		const popupHeight = popup.style.getPropertyValue(POPUP_HEIGHT_VAR);
		const isResizing =
			popupWidth !== '' && popupWidth !== 'auto' && popupHeight !== '' && popupHeight !== 'auto';

		if (!isResizing) return { size: this.#prevSize, syncPositioner: false };

		return {
			size: {
				width: popup.offsetWidth || this.#prevSize.width,
				height: popup.offsetHeight || this.#prevSize.height
			},
			syncPositioner: true
		};
	}
}
