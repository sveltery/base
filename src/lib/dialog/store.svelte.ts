// Derived from Base UI v1.8.0 packages/react/src/dialog/store/DialogStore.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). `onNestedDialogOpen` follows v1.9.0
// packages/react/src/dialog/root/useDialogRoot.ts (commit ad7ecda5296b0295b41a51ecb01fce6204acd099),
// as do the drawer count and `outsidePressEnabled`.
// MIT, see THIRD_PARTY_NOTICES.md.
// Extends the landed PopupStore. Elements are held here, not in ref bags.
// A canceled close can leave preventUnmountingOnClose true. That matches Dialog.
// Focus return is FloatingFocusManager after close. This store does not focus.
// How the dialog opened is the inherited `PopupStore.openMethod`. `ClickInteraction` writes it.

import { untrack } from 'svelte';
import type { BaseUIChangeEventDetails } from '@sveltery/utils';
import { BoundTriggerId } from '../internal/popups/boundTriggerId.svelte.js';
import { PopupStore, type PopupChangeEventDetails } from '../internal/popups/store.svelte.js';
import type { DialogChangeEventReason } from './types.js';

export interface DialogClickReference {
	onpointerdown?: (event: PointerEvent) => void;
	onmousedown?: (event: MouseEvent) => void;
	onclick?: (event: MouseEvent) => void;
	onkeydown?: (event: KeyboardEvent) => void;
}

export interface DialogStoreOptions {
	/** `alertdialog` for AlertDialog.Root. */
	role: 'dialog' | 'alertdialog';
	/** Drawer.Root. An open drawer counts toward its parent's `nestedOpenDrawerCount`. */
	drawer?: boolean;
	readOpen: () => boolean | undefined;
	writeOpen: (open: boolean) => void;
	floatingId: string;
	nested: boolean;
	onOpenChange: () =>
		| ((open: boolean, details: PopupChangeEventDetails<DialogChangeEventReason>) => void)
		| undefined;
	onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
	readModal: () => boolean | 'trap-focus';
	readDisablePointerDismissal: () => boolean;
	readTriggerId: () => string | null | undefined;
	writeTriggerId: (id: string | null) => void;
}

export class DialogStore<Payload = unknown> extends PopupStore<DialogChangeEventReason> {
	readonly role: 'dialog' | 'alertdialog';
	readonly drawer: boolean;
	readonly readModal: () => boolean | 'trap-focus';
	readonly readDisablePointerDismissal: () => boolean;
	readonly boundTriggerId: BoundTriggerId;
	/** `ClickInteraction` reference props. Set once from the root. Detached triggers read this. */
	click: DialogClickReference | undefined = undefined;
	payload = $state<Payload | undefined>(undefined);
	nestedOpenDialogCount = $state(0);
	nestedOpenDrawerCount = $state(0);
	/** Drawer.SwipeArea turns outside-press dismissal off while its gesture opens the drawer. */
	outsidePressEnabled = true;
	titleElementId = $state<string | undefined>(undefined);
	descriptionElementId = $state<string | undefined>(undefined);
	viewportElement = $state<HTMLElement | null>(null);
	backdropElement = $state<HTMLElement | null>(null);
	internalBackdropElement = $state<HTMLElement | null>(null);

	constructor(options: DialogStoreOptions) {
		super({
			readOpen: options.readOpen,
			writeOpen: options.writeOpen,
			floatingId: options.floatingId,
			floatingElement: 'popup',
			nested: options.nested,
			onOpenChange: options.onOpenChange,
			onOpenChangeComplete: options.onOpenChangeComplete
		});
		this.role = options.role;
		this.drawer = options.drawer ?? false;
		this.readModal = options.readModal;
		this.readDisablePointerDismissal = options.readDisablePointerDismissal;
		this.boundTriggerId = new BoundTriggerId(this, options.readTriggerId, options.writeTriggerId);
	}

	get modal() {
		return this.readModal();
	}

	get disablePointerDismissal() {
		return this.readDisablePointerDismissal();
	}

	get nestedDialogOpen() {
		return this.nestedOpenDialogCount > 0;
	}

	onNestedDialogOpen(dialogCount: number, drawerCount: number) {
		// A closed root keeps listening, so a nested root that opens meanwhile is ignored and its
		// count does not carry into the next open. Untracked: a nested root's effect calls this.
		if (untrack(() => !this.open && !this.mounted)) return;
		this.nestedOpenDialogCount = dialogCount;
		this.nestedOpenDrawerCount = drawerCount;
	}

	override setOpen(
		nextOpen: boolean,
		eventDetails: BaseUIChangeEventDetails<DialogChangeEventReason>
	) {
		super.setOpen(nextOpen, eventDetails);
		this.boundTriggerId.write(this.activeTriggerId);
	}

	protected override onUnmount() {
		this.boundTriggerId.reset();
	}
}
