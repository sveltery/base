// Derived from Base UI v1.8.0 packages/react/src/internals/useTransitionStatus.ts
// with `enableIdleState`, `deferEndingState` and `animateInitialOpen` all false,
// which is how Field.Error and Field.Validity call it
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { useAnimationFrame } from '../internal/timeout.svelte.js';
import type { FieldTransitionStatus } from './types.js';

/**
 * CSS hook status for a field message.
 * An element that mounts already open does not play `starting`.
 * Closing sets `ending` and stays mounted until the caller clears it.
 */
export class FieldTransition {
	mounted = $state(false);
	transitionStatus = $state<FieldTransitionStatus>(undefined);
	frozen = $state<string | string[] | null>(null);
	private readonly readOpen: () => boolean;
	private readonly settleFrame = useAnimationFrame();
	private readonly readSnapshot: (() => string | string[] | null) | undefined;

	constructor(readOpen: () => boolean, readSnapshot?: () => string | string[] | null) {
		this.readOpen = readOpen;
		this.readSnapshot = readSnapshot;
		const open = readOpen();
		this.mounted = open;
		this.transitionStatus = undefined;
		if (open && readSnapshot) this.frozen = readSnapshot();

		$effect.pre(() => {
			const nextOpen = this.readOpen();
			if (nextOpen && this.readSnapshot) this.frozen = this.readSnapshot();
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
			this.settleFrame.request(() => {
				this.transitionStatus = undefined;
			});
			return () => this.settleFrame.cancel();
		});
	}

	setMounted(mounted: boolean) {
		this.mounted = mounted;
	}
}
