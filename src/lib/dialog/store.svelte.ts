// Derived from Base UI v1.8.0 packages/react/src/dialog/store/DialogStore.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Extends the landed PopupStore. Elements are held here, not in ref bags.
// A canceled close can leave preventUnmountingOnClose true. That matches Dialog.
// Focus return is FloatingFocusManager after close. This store does not focus.

import type { ControllableValue } from '../internal/controllable-value.svelte.js';
import type { BaseUIChangeEventDetails } from '../internal/event-details.js';
import { PopupStore, type PopupChangeEventDetails } from '../internal/popups/store.svelte.js';
import { closeInteraction } from './open-method.js';
import type { DialogChangeEventReason, InteractionType } from './types.js';

export interface DialogClickReference {
	onpointerdown?: (event: PointerEvent) => void;
	onmousedown?: (event: MouseEvent) => void;
	onclick?: (event: MouseEvent) => void;
	onkeydown?: (event: KeyboardEvent) => void;
}

export class DialogStore<Payload> extends PopupStore<DialogChangeEventReason> {
	readonly readModal: () => boolean | 'trap-focus';
	readonly readDisablePointerDismissal: () => boolean;
	readonly publishTriggerId: ((id: string | null) => void) | undefined;
	readonly readClickReference: () => DialogClickReference | undefined;
	payload = $state<Payload | undefined>(undefined);
	openMethod = $state<InteractionType | null>(null);
	closeMethod: InteractionType = '';
	pointerType = $state<InteractionType | null>(null);
	nestedOpenDialogCount = $state(0);
	nestedOpenDrawerCount = $state(0);
	titleElementId = $state<string | undefined>(undefined);
	descriptionElementId = $state<string | undefined>(undefined);
	viewportElement = $state<HTMLElement | null>(null);
	backdropElement = $state<HTMLElement | null>(null);
	internalBackdropElement = $state<HTMLElement | null>(null);

	constructor(options: {
		open: ControllableValue<boolean>;
		floatingId: string;
		nested: boolean;
		onOpenChange: () =>
			| ((open: boolean, details: PopupChangeEventDetails<DialogChangeEventReason>) => void)
			| undefined;
		onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
		readModal: () => boolean | 'trap-focus';
		readDisablePointerDismissal: () => boolean;
		publishTriggerId?: (id: string | null) => void;
		readClickReference: () => DialogClickReference | undefined;
	}) {
		super({
			open: options.open,
			floatingId: options.floatingId,
			floatingElement: 'popup',
			nested: options.nested,
			onOpenChange: options.onOpenChange,
			onOpenChangeComplete: options.onOpenChangeComplete
		});
		this.readModal = options.readModal;
		this.readDisablePointerDismissal = options.readDisablePointerDismissal;
		this.publishTriggerId = options.publishTriggerId;
		this.readClickReference = options.readClickReference;
	}

	get modal() {
		return this.readModal();
	}

	get disablePointerDismissal() {
		return this.readDisablePointerDismissal();
	}

	get role(): 'dialog' {
		return 'dialog';
	}

	get nestedDialogOpen() {
		return this.nestedOpenDialogCount > 0;
	}

	onNestedDialogOpen(dialogCount: number, drawerCount: number) {
		this.nestedOpenDialogCount = dialogCount;
		this.nestedOpenDrawerCount = drawerCount;
	}

	override setOpen(
		nextOpen: boolean,
		eventDetails: BaseUIChangeEventDetails<DialogChangeEventReason>
	) {
		if (this.open && !nextOpen) {
			this.closeMethod = closeInteraction(eventDetails.event, this.pointerType);
		}
		super.setOpen(nextOpen, eventDetails);
		this.publishTriggerId?.(this.activeTriggerId);
		if (!this.open) this.openMethod = null;
	}
}
