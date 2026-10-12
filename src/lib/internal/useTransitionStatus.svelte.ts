// Derived from Base UI v1.8.0 packages/react/src/internals/useTransitionStatus.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';
import { ScopedAnimationFrame } from '@sveltery/utils';
import { useOpenChangeComplete } from './useOpenChangeComplete.svelte.js';

export type TransitionStatusValue = 'starting' | 'ending' | 'idle' | undefined;

export interface TransitionStatusOptions {
	/** Settle on `idle` between `starting` and `ending`. */
	enableIdleState?: boolean;
	/** Apply `ending` one frame after close. */
	deferEndingState?: boolean;
	/** Play `starting` for an element that mounts already open. */
	animateInitialOpen?: boolean;
}

/** Whether an element is mounted, and its `starting` / `ending` phase for CSS. */
export class TransitionStatus {
	mounted = $state(false);
	transitionStatus = $state<TransitionStatusValue>(undefined);
	private readonly readOpen: () => boolean;
	private readonly endingFrame = new ScopedAnimationFrame();
	private readonly settleFrame = new ScopedAnimationFrame();

	constructor(readOpen: () => boolean, options: TransitionStatusOptions = {}) {
		const {
			enableIdleState = false,
			deferEndingState = false,
			animateInitialOpen = false
		} = options;
		this.readOpen = readOpen;
		const initiallyOpen = untrack(readOpen);
		this.mounted = initiallyOpen && !animateInitialOpen;
		this.transitionStatus = initiallyOpen && enableIdleState ? 'idle' : undefined;

		// Upstream adjusts this state during render.
		$effect.pre(() => {
			const open = this.readOpen();
			if (open && !this.mounted) {
				this.mounted = true;
				this.transitionStatus = 'starting';
			} else if (open && enableIdleState && this.transitionStatus === 'ending') {
				// Upstream restarts from a layout effect. Svelte runs child effects first,
				// so they would see an open element that is still `ending`.
				this.transitionStatus = 'starting';
			}
			if (!open && this.mounted && this.transitionStatus !== 'ending' && !deferEndingState) {
				this.transitionStatus = 'ending';
			}
			if (!open && !this.mounted && this.transitionStatus === 'ending') {
				this.transitionStatus = undefined;
			}
		});

		if (deferEndingState) {
			$effect(() => {
				if (this.readOpen() || !this.mounted || this.transitionStatus === 'ending') return;
				this.endingFrame.request(() => (this.transitionStatus = 'ending'));
				return this.endingFrame.cancel;
			});
		}

		if (enableIdleState) {
			$effect(() => {
				if (!this.readOpen()) return;
				if (this.mounted && untrack(() => this.transitionStatus) !== 'idle') {
					this.transitionStatus = 'starting';
				}
				this.settleFrame.request(() => (this.transitionStatus = 'idle'));
				return this.settleFrame.cancel;
			});
		} else {
			$effect(() => {
				if (!this.readOpen() || this.transitionStatus === undefined) return;
				this.settleFrame.request(() => (this.transitionStatus = undefined));
				return this.settleFrame.cancel;
			});
		}
	}

	setMounted(mounted: boolean) {
		this.mounted = mounted;
		if (!mounted && this.transitionStatus === 'ending') this.transitionStatus = undefined;
	}

	/**
	 * Unmounts once the exit animations on `element` finish.
	 * Call during component init.
	 */
	unmountAfterExit(element: () => HTMLElement | null, batch = false) {
		useOpenChangeComplete(() => ({
			enabled: this.mounted && !this.readOpen(),
			open: this.readOpen(),
			element: element(),
			batch,
			onComplete: () => {
				if (!this.readOpen()) this.setMounted(false);
			}
		}));
	}
}
