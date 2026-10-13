// Derived from Base UI v1.8.0 packages/react/src/utils/popups/useTriggerFocusGuards.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Closing writes state with flushSync so the popup leaves the tab order before focus moves.

import { flushSync } from 'svelte';
import type { Attachment } from 'svelte/attachments';
import { createChangeEventDetails, REASONS } from '@sveltery/utils';
import {
	getTabbableCandidates,
	getTabbableNearElement,
	isOutsideEvent,
	type FloatingRootStore
} from '@sveltery/floating-ui-svelte';

export class TriggerFocusGuards {
	#beforeContentFocusGuard: HTMLElement | null = null;

	constructor(
		private readonly store: FloatingRootStore,
		private readonly triggerElement: () => HTMLElement | null
	) {}

	readonly preFocusGuardProps = {
		onfocus: (event: FocusEvent) => this.#closeAndFocus(event, -1)
	};

	readonly beforeContentFocusGuardProps = {
		attach: ((node) => {
			this.#beforeContentFocusGuard = node;
			return () => {
				if (this.#beforeContentFocusGuard === node) this.#beforeContentFocusGuard = null;
			};
		}) satisfies Attachment<HTMLElement>
	};

	readonly focusTargetProps = {
		onfocus: (event: FocusEvent) => this.#handleFocusTargetFocus(event),
		attach: ((node) => {
			this.store.triggerFocusTarget = node;
			return () => {
				if (this.store.triggerFocusTarget === node) this.store.triggerFocusTarget = null;
			};
		}) satisfies Attachment<HTMLElement>
	};

	#openedByHover() {
		if (!('openChangeReason' in this.store)) return false;
		return (
			(this.store as { openChangeReason?: string | null }).openChangeReason === REASONS.triggerHover
		);
	}

	#handleFocusTargetFocus(event: FocusEvent) {
		const positioner = this.store.positionerElement;
		if (positioner && isOutsideEvent(event, positioner)) {
			// A hover open leaves focus on this guard. Tab must not enter the popup.
			if (this.#openedByHover()) return;
			// Tab from the open trigger lands here from outside the positioner.
			// Upstream focuses the leading guard, whose next tabbable is the first control.
			const floating = this.store.floatingElement;
			const inside = floating ? getTabbableCandidates(floating)[0] : null;
			if (inside) {
				inside.focus();
				return;
			}
			// The harness binds this guard. A popup with no tabbable control has neither,
			// so Tab closes onto the control after the trigger.
			if (this.#beforeContentFocusGuard) {
				this.#beforeContentFocusGuard.focus();
				return;
			}
		}
		this.#closeAndFocus(event, 1);
	}

	#closeAndFocus(event: FocusEvent, direction: 1 | -1) {
		const guard = event.currentTarget as HTMLElement;
		const positioner = this.store.positionerElement;
		flushSync(() => {
			this.store.setOpen(false, createChangeEventDetails(REASONS.focusOut, event, guard));
		});
		// The close can change the tab order. Resolve it after the flush, from the trigger when
		// the guard unmounted, even when the trigger's tabindex is -1.
		getTabbableNearElement(
			guard.isConnected ? guard : this.triggerElement(),
			direction,
			positioner
		)?.focus();
	}
}
