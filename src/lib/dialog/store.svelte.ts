// Derived from Base UI v1.8.0 packages/react/src/dialog/store/DialogStore.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Extends the landed PopupStore. Elements are held here, not in ref bags.
// A canceled close can leave preventUnmountingOnClose true. That matches Dialog.

import type { ControllableValue } from '../internal/controllable-value.svelte.js';
import type { BaseUIChangeEventDetails } from '../internal/event-details.js';
import { PopupStore, type PopupChangeEventDetails } from '../internal/popups/store.svelte.js';
import { closeInteraction } from './open-method.js';
import type { DialogChangeEventReason, InteractionType } from './types.js';

export class DialogStore<Payload> extends PopupStore<DialogChangeEventReason> {
	readModal: () => boolean | 'trap-focus' = () => true;
	readDisablePointerDismissal: () => boolean = () => false;
	readRole: () => 'dialog' | 'alertdialog' = () => 'dialog';
	/** Popup sets this so a custom final focus does not also return to the trigger. */
	readSuppressReturnFocus: () => boolean = () => false;
	resolveFinalFocus: (interaction: InteractionType) => HTMLElement | false | undefined = () =>
		undefined;
	publishTriggerId: ((id: string | null) => void) | undefined;
	payload = $state<Payload | undefined>(undefined);
	openMethod = $state<InteractionType | null>(null);
	pointerType = $state<InteractionType | null>(null);
	nestedOpenDialogCount = $state(0);
	nestedOpenDrawerCount = $state(0);
	titleElementId = $state<string | undefined>(undefined);
	descriptionElementId = $state<string | undefined>(undefined);
	viewportElement = $state<HTMLElement | null>(null);
	backdropElement = $state<HTMLElement | null>(null);
	internalBackdropElement = $state<HTMLElement | null>(null);
	outsidePressEnabled = true;
	dismissOnKeyDown: ((event: KeyboardEvent) => void) | undefined;
	clickReference:
		| {
				onpointerdown?: (event: PointerEvent) => void;
				onmousedown?: (event: MouseEvent) => void;
				onclick?: (event: MouseEvent) => void;
				onkeydown?: (event: KeyboardEvent) => void;
		  }
		| undefined;

	constructor(options: {
		open: ControllableValue<boolean>;
		floatingId: string;
		nested: boolean;
		onOpenChange: () =>
			| ((open: boolean, details: PopupChangeEventDetails<DialogChangeEventReason>) => void)
			| undefined;
		onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
	}) {
		super({
			open: options.open,
			floatingId: options.floatingId,
			floatingElement: 'popup',
			nested: options.nested,
			onOpenChange: options.onOpenChange,
			onOpenChangeComplete: options.onOpenChangeComplete
		});
	}

	get modal() {
		return this.readModal();
	}

	get disablePointerDismissal() {
		return this.readDisablePointerDismissal();
	}

	get role() {
		return this.readRole();
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
		const method = closeInteraction(eventDetails.event, this.pointerType);
		const wasOpen = this.open;
		super.setOpen(nextOpen, eventDetails);
		this.publishTriggerId?.(this.activeTriggerId);
		if (!wasOpen || this.open) return;
		const target = this.resolveFinalFocus(method);
		this.openMethod = null;
		if (target instanceof HTMLElement) {
			queueMicrotask(() => {
				if (target.isConnected) target.focus();
			});
		}
	}
}
