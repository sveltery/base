// Derived from Base UI v1.9.0 packages/react/src/utils/popups/useTriggerFocusGuards.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
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
		onfocus: (event: FocusEvent) => {
			this.#closeAndFocus(event, -1, this.store.positionerElement);
		}
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

	#closeAndFocus(event: FocusEvent, direction: 1 | -1, positioner: HTMLElement | null) {
		const guard = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
		flushSync(() => {
			this.store.setOpen(
				false,
				createChangeEventDetails(REASONS.focusOut, event, guard ?? undefined)
			);
		});
		// The close may change the tab order, so resolve it after the flush. A guard that
		// unmounted on close leaves the trigger as the anchor, even when its tabIndex is -1.
		const anchor = guard?.isConnected ? guard : this.triggerElement();
		getTabbableNearElement(anchor, direction, positioner)?.focus();
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
		this.#closeAndFocus(event, 1, positioner);
	}
}
