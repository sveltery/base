// Derived from Base UI v1.8.0 packages/react/src/internals/useTransitionStatus.ts
// with enableIdleState and deferEndingState false, the popup argument set
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Collapsible, Field, Tabs, Checkbox, and Radio keep their own copies.

import { useAnimationFrame } from './timeout.svelte.js';

export type PopupTransitionStatus = 'starting' | 'ending' | undefined;

export class PopupTransition {
	mounted = $state(false);
	transitionStatus = $state<PopupTransitionStatus>(undefined);
	private readonly readOpen: () => boolean;
	private readonly frame = useAnimationFrame();

	constructor(readOpen: () => boolean, animateInitialOpen = false) {
		this.readOpen = readOpen;
		const open = readOpen();
		this.mounted = open && !animateInitialOpen;

		$effect.pre(() => {
			const openNow = this.readOpen();
			if (openNow) {
				if (!this.mounted) {
					this.mounted = true;
					this.transitionStatus = 'starting';
				}
				return;
			}
			if (this.mounted && this.transitionStatus !== 'ending') {
				this.transitionStatus = 'ending';
				return;
			}
			if (!this.mounted && this.transitionStatus === 'ending') this.transitionStatus = undefined;
		});

		$effect(() => {
			if (!this.readOpen()) return;
			this.frame.request(() => {
				if (this.readOpen() && this.transitionStatus === 'starting')
					this.transitionStatus = undefined;
			});
			return () => this.frame.cancel();
		});
	}

	setMounted(mounted: boolean) {
		this.mounted = mounted;
		if (!mounted && this.transitionStatus === 'ending') this.transitionStatus = undefined;
	}
}
