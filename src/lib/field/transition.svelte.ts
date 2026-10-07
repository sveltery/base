// Derived from Base UI v1.8.0 packages/react/src/internals/useTransitionStatus.ts
// with `enableIdleState`, `deferEndingState` and `animateInitialOpen` all false,
// which is how Field.Error and Field.Validity call it
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import type { FieldTransitionStatus } from './types.js';

/**
 * CSS hook status for a field message.
 * An element that mounts already open does not play `starting`.
 * Closing sets `ending` and stays mounted until the caller clears it.
 */
export class FieldTransition {
	mounted = $state(false);
	transitionStatus = $state<FieldTransitionStatus>(undefined);
	private readonly readOpen: () => boolean;

	constructor(readOpen: () => boolean) {
		this.readOpen = readOpen;
		const open = readOpen();
		this.mounted = open;
		this.transitionStatus = undefined;

		$effect.pre(() => {
			const nextOpen = this.readOpen();
			if (nextOpen && !this.mounted) {
				this.mounted = true;
				this.transitionStatus = 'starting';
			}
			if (!nextOpen && this.mounted && this.transitionStatus !== 'ending') {
				this.transitionStatus = 'ending';
			}
			if (!nextOpen && !this.mounted && this.transitionStatus === 'ending') {
				this.transitionStatus = undefined;
			}
		});

		$effect(() => {
			if (!this.readOpen()) return;
			const frame = requestAnimationFrame(() => {
				this.transitionStatus = undefined;
			});
			return () => cancelAnimationFrame(frame);
		});
	}

	setMounted(mounted: boolean) {
		this.mounted = mounted;
	}
}
