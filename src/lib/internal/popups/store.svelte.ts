// Derived from Base UI v1.8.0 packages/react/src/utils/popups/store.ts
// and packages/react/src/dialog/store/DialogStore.ts setOpen
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). `openedWithoutTrigger` and clearing
// `preventUnmountingOnClose` on open follow v1.9.0
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Immediate preventUnmountOnClose writes the flag before cancellation is checked.
// A canceled close can leave preventUnmountingOnClose true. That matches Dialog.

import { untrack } from 'svelte';
import type { BaseUIChangeEventDetails } from '@sveltery/utils';
import { FloatingRootStore } from '@sveltery/floating-ui-svelte';
import { useOpenChangeComplete } from '../useOpenChangeComplete.svelte.js';
import { TransitionStatus, type TransitionStatusValue } from '../useTransitionStatus.svelte.js';
import { attachPreventUnmountOnClose, createPopupOpenState } from './popupStoreUtils.js';

export type PopupChangeEventDetails<Reason extends string> = BaseUIChangeEventDetails<Reason> & {
	preventUnmountOnClose: () => void;
};

export interface PopupStoreOptions<Reason extends string> {
	readOpen: () => boolean | undefined;
	writeOpen: (open: boolean) => void;
	floatingId: string;
	floatingElement: 'popup' | 'positioner';
	nested?: boolean;
	onOpenChange: () =>
		((open: boolean, details: PopupChangeEventDetails<Reason>) => void) | undefined;
	onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
	animateInitialOpen?: boolean;
}

export class PopupStore<Reason extends string> extends FloatingRootStore {
	preventUnmountingOnClose = $state(false);
	/** Opened by a request that named no trigger, such as `openWithPayload()`. */
	openedWithoutTrigger = $state(false);
	private readonly readOpen: PopupStoreOptions<Reason>['readOpen'];
	private readonly writeOpen: PopupStoreOptions<Reason>['writeOpen'];
	private readonly readOnOpenChange: PopupStoreOptions<Reason>['onOpenChange'];
	private readonly readOnOpenChangeComplete: PopupStoreOptions<Reason>['onOpenChangeComplete'];
	private readonly transition: TransitionStatus;

	constructor(options: PopupStoreOptions<Reason>) {
		super({
			nested: options.nested ?? false,
			floatingId: options.floatingId,
			floatingElementKind: options.floatingElement
		});
		this.readOpen = options.readOpen;
		this.writeOpen = options.writeOpen;
		this.readOnOpenChange = options.onOpenChange;
		this.readOnOpenChangeComplete = options.onOpenChangeComplete;
		this.transition = new TransitionStatus(() => this.open, {
			animateInitialOpen: options.animateInitialOpen
		});

		// Cleared once the popup is closed, not on a close request a controlled root may decline.
		$effect.pre(() => {
			if (!this.open) this.openedWithoutTrigger = false;
		});

		// Any open starts a new close cycle, also one through `bind:open` that skips `setOpen`.
		// Upstream `useUnmountAfterClose` clears the flag when `open` changes only, so an opt-out
		// recorded on a canceled close while open stays.
		$effect.pre(() => {
			if (this.open && untrack(() => this.preventUnmountingOnClose)) {
				this.preventUnmountingOnClose = false;
			}
		});

		useOpenChangeComplete(() => ({
			enabled: this.mounted && !this.open && !this.preventUnmountingOnClose,
			open: this.open,
			element: this.popupElement,
			onComplete: () => {
				if (this.open || this.preventUnmountingOnClose) return;
				this.finishClose();
			}
		}));
	}

	get open() {
		return this.readOpen() === true;
	}

	get triggerCount() {
		return this.triggers.size;
	}

	get mounted() {
		return this.transition.mounted;
	}

	override get transitionStatus(): TransitionStatusValue {
		return this.transition.transitionStatus;
	}

	/** Id of `domReferenceElement`. Not a second copy of the trigger. */
	get activeTriggerId() {
		return this.domReferenceElement?.id ?? null;
	}

	get activeTriggerElement() {
		return this.domReferenceElement;
	}

	override isOpen() {
		return this.open;
	}

	protected beforeOpenChange(nextOpen: boolean, details: PopupChangeEventDetails<Reason>) {
		if (!nextOpen && details.trigger == null && this.activeTriggerId != null) {
			details.trigger = this.activeTriggerElement ?? undefined;
		}
	}

	/** Dialog writes the flag immediately. Popover overrides this with `deferred`. */
	protected preventUnmountTiming(): 'immediate' | 'deferred' {
		return 'immediate';
	}

	override setOpen(nextOpen: boolean, eventDetails: BaseUIChangeEventDetails<Reason>) {
		const details = eventDetails as PopupChangeEventDetails<Reason>;
		const timing = this.preventUnmountTiming();
		const readPrevent = timing === 'deferred' ? attachPreventUnmountOnClose(details) : () => false;
		if (timing === 'immediate') {
			details.preventUnmountOnClose = () => {
				this.preventUnmountingOnClose = true;
			};
		}

		this.beforeOpenChange(nextOpen, details);
		const previousReference = this.domReferenceElement;
		const next = createPopupOpenState(
			{
				open: this.open,
				preventUnmountingOnClose: this.preventUnmountingOnClose,
				activeTriggerId: this.activeTriggerId,
				activeTriggerElement: this.activeTriggerElement,
				openedWithoutTrigger: this.openedWithoutTrigger
			},
			nextOpen,
			details.trigger
		);
		this.domReferenceElement = next.activeTriggerElement;
		// `handle.open()` can run inside a consumer effect. Its callback must not subscribe it.
		untrack(() => this.readOnOpenChange()?.(nextOpen, details));
		if (details.isCanceled) {
			this.domReferenceElement = previousReference;
			return;
		}
		this.openedWithoutTrigger = next.openedWithoutTrigger;

		if (!nextOpen) this.openMethod = null;
		this.dispatchOpenChange(nextOpen, details);
		if (nextOpen) this.preventUnmountingOnClose = false;
		else if (timing === 'deferred' && readPrevent()) this.preventUnmountingOnClose = true;
		this.writeOpen(nextOpen);
	}

	private finishClose() {
		this.transition.setMounted(false);
		this.domReferenceElement = null;
		this.preventUnmountingOnClose = false;
		this.emitOpenChangeComplete(false);
	}

	/** Dialog calls this when the open animation finishes. Close completion stays in `finishClose`. */
	notifyOpenChangeComplete(open: boolean) {
		this.emitOpenChangeComplete(open);
	}

	/**
	 * `useOpenChangeComplete` calls this from an effect. The consumer callback
	 * can write `$state`. Tracking that write makes the effect run again.
	 */
	private emitOpenChangeComplete(open: boolean) {
		untrack(() => this.readOnOpenChangeComplete()?.(open));
	}

	/**
	 * Drops a popup that `preventUnmountOnClose` kept mounted.
	 * Same cleanup as a finished close animation.
	 */
	forceUnmount() {
		this.finishClose();
	}
}
