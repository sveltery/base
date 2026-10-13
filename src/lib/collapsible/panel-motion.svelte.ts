// Derived from Base UI v1.8.0 packages/react/src/collapsible/panel/useCollapsiblePanel.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// React.Activity's resume-animation suppression is not recreated.

import { flushSync, getAbortSignal } from 'svelte';
import { on } from 'svelte/events';
import { ScopedAnimationFrame, REASONS } from '@sveltery/utils';
import { runOnceAnimationsFinish } from '../internal/animations-finished.js';
import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
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
	private readonly endingFrame = new ScopedAnimationFrame();
	private readonly revealFrame = new ScopedAnimationFrame();
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
	/** Zeroes the open motion after a beforematch reveal, until the panel closes. */
	private skipDuration = $state<'transition-duration' | 'animation-duration' | null>(null);
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
			const panel = this.panel;
			const open = this.root.open;
			const mounted = this.root.mounted;
			const transitionStatus = this.root.transitionStatus;
			if (!open) {
				// A render function can remove the panel on close. Clear the one-shot mount
				// suppression even without an element, so the next open animates.
				this.suppressMountAnimation = false;
				this.skipDuration = null;
			}
			if (!panel) return;

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
					const signal = getAbortSignal();
					queueMicrotask(() => {
						if (signal.aborted || this.panel !== panelEl) return;
						this.layoutRestore = resetLayoutStyles(panelEl);
					});
					if (skip) {
						this.skipDuration = 'transition-duration';
						this.forcePanelIdle = true;
					}
					return () => {
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
				this.skipDuration = 'animation-duration';
				restoreName();
				this.forcePanelIdle = true;
				return;
			}

			if (!open && mounted && (transitionStatus === 'idle' || transitionStatus === 'starting')) {
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
		useOpenChangeComplete(() => ({
			enabled: this.root.open && this.root.mounted && this.panelStatus === 'idle',
			open: true,
			element: this.panel,
			onComplete: () => {
				// An animation can finish after close was requested but before this effect cleans up.
				if (this.root.open) this.setDimensions(EMPTY_DIMENSIONS, false);
			}
		}));

		// Wait one frame so `[data-ending-style]` is committed before watching the close.
		$effect(() => {
			const panel = this.panel;
			const open = this.root.open;
			const mounted = this.root.mounted;
			const status = this.panelStatus;
			if (open || !mounted || status !== 'ending') return;
			if (!panel) {
				// A render function can drop the panel while it closes. Nothing is left to animate.
				this.root.setMounted(false);
				this.setDimensions(EMPTY_DIMENSIONS, false);
				return;
			}

			const signal = getAbortSignal();
			this.endingFrame.request(() => {
				runOnceAnimationsFinish(
					panel,
					() => {
						if (this.root.open) return;
						this.root.setMounted(false);
						this.setDimensions(EMPTY_DIMENSIONS, false);
					},
					signal,
					false
				);
			});
			return () => this.endingFrame.cancel();
		});

		$effect(() => {
			const panel = this.panel;
			if (!panel) return;
			return on(panel, 'beforematch', (event) => {
				if (this.root.requestOpen(true, event, REASONS.none)) {
					this.skipNextOpen = true;
					// The browser measures the match in this task, right after the event.
					flushSync();
				}
				if (this.root.open) return;
				// Canceled, or the owner ignored the open. The browser still removes
				// `hidden`, so put it back once it has measured.
				this.skipNextOpen = false;
				this.revealFrame.request(() => {
					if (!this.root.open) panel.setAttribute('hidden', 'until-found');
				});
			});
		});
	}

	get panelStatus(): TransitionStatus {
		return this.forcePanelIdle ? 'idle' : this.root.transitionStatus;
	}

	/** Read only while open, so the close is detected with the author's real duration. */
	get skipStyle(): string | undefined {
		return this.root.open && this.skipDuration ? `${this.skipDuration}:0s` : undefined;
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
}
