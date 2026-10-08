// Derived from Base UI v1.8.0 packages/react/src/utils/popups/store.ts
// and packages/react/src/dialog/store/DialogStore.ts setOpen
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Immediate preventUnmountOnClose writes the flag before cancellation is checked.
// A canceled close can leave preventUnmountingOnClose true. That matches Dialog.

import type { ControllableValue } from '../controllable-value.svelte.js';
import type { BaseUIChangeEventDetails } from '../event-details.js';
import { FloatingRootStore } from '../floating-ui-react/components/FloatingRootStore.svelte.js';
import { useOpenChangeComplete } from '../useOpenChangeComplete.svelte.js';
import { PopupTransition, type PopupTransitionStatus } from '../useTransitionStatus.svelte.js';
import { attachPreventUnmountOnClose, createPopupOpenState } from './popupStoreUtils.js';
import { PopupTriggerMap } from './popupTriggerMap.js';
import type { OpenInteractionType } from './useOpenInteractionType.js';

export type PopupChangeEventDetails<Reason extends string> = BaseUIChangeEventDetails<Reason> & {
	preventUnmountOnClose: () => void;
};

export interface PopupStoreOptions<Reason extends string> {
	open: ControllableValue<boolean>;
	floatingId: string;
	floatingElement: 'popup' | 'positioner';
	nested?: boolean;
	onOpenChange: () =>
		((open: boolean, details: PopupChangeEventDetails<Reason>) => void) | undefined;
	onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
	animateInitialOpen?: boolean;
}

export class PopupStore<Reason extends string> extends FloatingRootStore {
	readonly triggers = new PopupTriggerMap();
	triggerCount = $state(0);
	preventUnmountingOnClose = $state(false);
	/** How `useClick` opened this popup. Cleared in `setOpen(false)`. */
	openMethod = $state<OpenInteractionType | null>(null);
	private readonly openValue: ControllableValue<boolean>;
	private readonly readOnOpenChange: PopupStoreOptions<Reason>['onOpenChange'];
	private readonly readOnOpenChangeComplete: PopupStoreOptions<Reason>['onOpenChangeComplete'];
	private readonly transition: PopupTransition;

	constructor(options: PopupStoreOptions<Reason>) {
		super({
			nested: options.nested ?? false,
			floatingId: options.floatingId,
			floatingElementKind: options.floatingElement
		});
		this.openValue = options.open;
		this.readOnOpenChange = options.onOpenChange;
		this.readOnOpenChangeComplete = options.onOpenChangeComplete;
		this.transition = new PopupTransition(() => this.open, options.animateInitialOpen ?? false);

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
		return this.openValue.value === true;
	}

	get mounted() {
		return this.transition.mounted;
	}

	get transitionStatus(): PopupTransitionStatus {
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
				activeTriggerElement: this.activeTriggerElement
			},
			nextOpen,
			details.trigger
		);
		this.domReferenceElement = next.activeTriggerElement;
		this.readOnOpenChange()?.(nextOpen, details);
		if (details.isCanceled) {
			this.domReferenceElement = previousReference;
			return;
		}

		if (!nextOpen) this.openMethod = null;
		this.dispatchOpenChange(nextOpen, details);
		if (nextOpen) this.preventUnmountingOnClose = false;
		else if (timing === 'deferred' && readPrevent()) this.preventUnmountingOnClose = true;
		this.openValue.set(nextOpen);
	}

	private finishClose() {
		this.transition.setMounted(false);
		this.domReferenceElement = null;
		this.preventUnmountingOnClose = false;
		this.readOnOpenChangeComplete()?.(false);
	}
}
