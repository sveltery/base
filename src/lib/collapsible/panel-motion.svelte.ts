// Derived from Base UI v1.8.0 packages/react/src/collapsible/panel/useCollapsiblePanel.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// React.Activity's resume-animation suppression is not recreated.

import { on } from 'svelte/events';
import { runOnceAnimationsFinish } from '../internal/animations-finished.js';
import { REASONS } from '../internal/event-details.js';
import type { CollapsibleRoot } from './context.svelte.js';
import {
	EMPTY_DIMENSIONS,
	getAnimationType,
	getDimensions,
	resetLayoutStyles,
	setTemporaryStyle,
	type AnimationType,
	type Dimensions
} from './motion.js';
import type { TransitionStatus } from './types.js';

export class CollapsiblePanelMotion {
	height = $state<number | undefined>(undefined);
	width = $state<number | undefined>(undefined);
	panel = $state<HTMLElement | null>(null);
	/** Last detected motion. The hidden-until-found closed style reads this. */
	animationType = $state<AnimationType | null>(null);
	forcePanelIdle = $state(false);
	/** Initially open panels skip the first keyframe so SSR does not shift layout. */
	suppressMountAnimation = $state(false);

	private lastMeasured: Dimensions = EMPTY_DIMENSIONS;
	private skipNextOpen = false;
	private pendingRestore: (() => void) | null = null;
	private layoutRestore: (() => void) | null = null;
	private readonly root: CollapsibleRoot;

	constructor(root: CollapsibleRoot) {
		this.root = root;
		this.suppressMountAnimation = root.open;

		$effect.pre(() => {
			const status = this.root.transitionStatus;
			if (!this.forcePanelIdle || status === 'starting') return;
			this.forcePanelIdle = false;
		});

		$effect(() => {
			return () => this.restorePending();
		});

		$effect(() => {
			const panel = this.panel;
			const open = this.root.open;
			const mounted = this.root.mounted;
			const transitionStatus = this.root.transitionStatus;
			if (!panel) return;

			// A beforematch open can leave a 0s duration. Restore it before detecting
			// the close, or that close is misread as no motion.
			if (!open && this.pendingRestore) this.restorePending();

			const shouldPrevent = open && this.suppressMountAnimation;
			const animationType = getAnimationType(panel, shouldPrevent);
			this.animationType = animationType;

			if (
				open &&
				transitionStatus === 'idle' &&
				this.suppressMountAnimation &&
				animationType === 'css-animation'
			) {
				this.lastMeasured = getDimensions(panel);
				return;
			}

			if (open && transitionStatus === 'starting') {
				const skip = this.skipNextOpen;
				this.skipNextOpen = false;

				if (animationType === 'none') {
					this.setDimensions(getDimensions(panel));
					this.forcePanelIdle = true;
					return;
				}

				if (animationType === 'css-transition') {
					// Measure with alignment cleared, then put it back. The style
					// attribute is rewritten from the measured size, so apply the
					// temporary reset again after that write. Do not read height
					// or width here; that subscription existed only to re-enter.
					const restoreForMeasure = resetLayoutStyles(panel);
					const measured = getDimensions(panel);
					restoreForMeasure();
					this.setDimensions(measured);
					const panelEl = panel;
					let cancelled = false;
					queueMicrotask(() => {
						if (cancelled || this.panel !== panelEl) return;
						this.layoutRestore = resetLayoutStyles(panelEl);
					});
					if (skip) {
						const restoreDuration = setTemporaryStyle(panel, 'transition-duration', '0s');
						this.setPendingRestore(restoreDuration);
						this.forcePanelIdle = true;
					}
					return () => {
						cancelled = true;
						this.layoutRestore?.();
						this.layoutRestore = null;
					};
				}

				this.setDimensions(getDimensions(panel));
				const restoreName = setTemporaryStyle(panel, 'animation-name', 'none');
				if (!skip) {
					restoreName();
					return;
				}
				const restoreDuration = setTemporaryStyle(panel, 'animation-duration', '0s');
				restoreName();
				this.setPendingRestore(restoreDuration);
				this.forcePanelIdle = true;
				return;
			}

			if (!open && mounted && (transitionStatus === 'idle' || transitionStatus === 'starting')) {
				this.suppressMountAnimation = false;
				if (animationType === 'none') {
					this.setDimensions(EMPTY_DIMENSIONS, false);
					this.root.setMounted(false);
					return;
				}
				this.setDimensions(getDimensions(panel));
				return;
			}

			if (transitionStatus !== 'ending') return;

			if (animationType === 'none') {
				this.root.setMounted(false);
				return;
			}

			const next = getDimensions(panel);
			const hasSize = (next.height ?? 0) > 0 || (next.width ?? 0) > 0;
			if (!hasSize) {
				this.root.setMounted(false);
				return;
			}

			this.setDimensions(next);
			if (animationType === 'css-animation') {
				const restoreName = setTemporaryStyle(panel, 'animation-name', 'none');
				restoreName();
			}
		});

		// After the open settles, drop the measured pixels so the panel can size with `auto`.
		$effect(() => {
			const panel = this.panel;
			const open = this.root.open;
			const mounted = this.root.mounted;
			const status = this.panelStatus;
			if (!panel || !open || !mounted || status !== 'idle') return;

			const abort = new AbortController();
			runOnceAnimationsFinish(
				panel,
				() => {
					// An animation can finish after close was requested but before this effect cleans up.
					if (!this.root.open) return;
					this.setDimensions(EMPTY_DIMENSIONS, false);
				},
				abort.signal,
				false,
				true
			);
			return () => abort.abort();
		});

		// Wait one frame so `[data-ending-style]` is committed before watching the close.
		$effect(() => {
			const panel = this.panel;
			const open = this.root.open;
			const mounted = this.root.mounted;
			const status = this.panelStatus;
			if (!panel || open || !mounted || status !== 'ending') return;

			const abort = new AbortController();
			const frame = requestAnimationFrame(() => {
				runOnceAnimationsFinish(
					panel,
					() => {
						if (this.root.open) return;
						this.root.setMounted(false);
						this.setDimensions(EMPTY_DIMENSIONS, false);
					},
					abort.signal,
					false
				);
			});
			return () => {
				cancelAnimationFrame(frame);
				abort.abort();
			};
		});

		$effect(() => {
			const panel = this.panel;
			if (!panel) return;
			return on(panel, 'beforematch', (event) => {
				const accepted = this.root.requestOpen(true, event, REASONS.none);
				if (!accepted) return;
				this.skipNextOpen = true;
			});
		});
	}

	get panelStatus(): TransitionStatus {
		return this.forcePanelIdle ? 'idle' : this.root.transitionStatus;
	}

	get shouldPreventOpenAnimation(): boolean {
		return this.root.open && this.suppressMountAnimation;
	}

	get renderedHeight(): number | undefined {
		return this.renderedDimensions.height;
	}

	get renderedWidth(): number | undefined {
		return this.renderedDimensions.width;
	}

	private get renderedDimensions(): Dimensions {
		if (
			!this.root.open &&
			this.root.mounted &&
			this.animationType === 'css-animation' &&
			this.height === undefined &&
			this.width === undefined
		) {
			return this.lastMeasured;
		}
		return { height: this.height, width: this.width };
	}

	attach = (element: HTMLElement) => {
		this.panel = element;
		return () => {
			if (this.panel === element) this.panel = null;
		};
	};

	private setDimensions(next: Dimensions, cache = true) {
		if (cache) this.lastMeasured = { height: next.height, width: next.width };
		this.height = next.height;
		this.width = next.width;
	}

	private restorePending() {
		this.pendingRestore?.();
		this.pendingRestore = null;
	}

	private setPendingRestore(restore: () => void) {
		this.restorePending();
		this.pendingRestore = () => {
			this.pendingRestore = null;
			restore();
		};
	}
}
