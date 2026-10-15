// Derived from Base UI v1.9.0 packages/react/src/utils/popups/popupStoreUtils.ts
// (`useImplicitActiveTrigger` with `closeOnActiveTriggerUnmount`, `useTriggerDataForwarding`,
// and the `openedWithoutTrigger` reads) and packages/react/src/internals/useUnmountAfterClose.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Trigger ownership for hover popups whose triggers each own values such as a payload.
// Each trigger registers a reader, so the active trigger's values are read where they are
// used. Upstream copies them into store state instead.

import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { createChangeEventDetails, REASONS, type BaseUIChangeEventDetails } from '@sveltery/utils';
import { BoundTriggerId } from './boundTriggerId.svelte.js';
import { PopupStore, type CloseTriggerFill, type PopupStoreOptions } from './store.svelte.js';

export interface TriggerOwnedPopupStoreOptions<
	Reason extends string
> extends PopupStoreOptions<Reason> {
	readTriggerId: () => string | null | undefined;
	writeTriggerId: (id: string | null) => void;
}

export abstract class TriggerOwnedPopupStore<
	Reason extends string,
	Owned extends object
> extends PopupStore<Reason> {
	protected override readonly closeTriggerFill: CloseTriggerFill = 'never';
	/** Bumps when an open popup changes trigger. The viewport snapshots on this. */
	triggerSwitch = $state(0);
	switchedFrom = $state<Element | null>(null);
	private readonly boundTriggerId: BoundTriggerId;
	private readonly readers = new SvelteMap<string, () => Owned>();
	/** Values of the owning trigger that unmounted. Kept until the popup finishes closing. */
	private retained = $state.raw<{ id: string; owned: Owned } | null>(null);
	/** The active id once it matched a registered trigger. Tells a lost trigger from a pending one. */
	private resolvedTriggerId: string | null = null;
	private destroyed = false;

	constructor(options: TriggerOwnedPopupStoreOptions<Reason>) {
		super({
			...options,
			onOpenChangeComplete: () => (open) => {
				if (!open) this.retained = null;
				options.onOpenChangeComplete()?.(open);
			}
		});
		this.boundTriggerId = new BoundTriggerId(this, options.readTriggerId, options.writeTriggerId);

		$effect(() => {
			const open = this.open;
			// Registration changes and an element swapped under one id must rerun this.
			void this.triggers.size;
			const activeId = this.boundTriggerId.read();
			if (activeId) void this.triggers.getById(activeId);
			void this.domReferenceElement;
			untrack(() => this.reconcileActiveTrigger(open));
		});

		$effect(() => {
			this.destroyed = false;
			return () => {
				this.destroyed = true;
			};
		});
	}

	protected override preventUnmountTiming(): 'immediate' | 'deferred' {
		return 'deferred';
	}

	/** Id the trigger was registered under. Falls back to the DOM id. */
	resolvedActiveTriggerId() {
		const registered = this.triggers.idOf(this.domReferenceElement);
		if (registered) return registered;
		return this.boundTriggerId.active || this.domReferenceElement?.id || null;
	}

	/** Values of the active trigger, or of the owning trigger that unmounted. */
	protected owned(): Owned | undefined {
		const id = this.resolvedActiveTriggerId();
		const read = id ? this.readers.get(id) : undefined;
		if (read) return read();
		const kept = this.retained;
		return kept && (id == null || kept.id === id) ? kept.owned : undefined;
	}

	/** Upstream `isOpenedByTrigger`: a strict match of the active trigger id. */
	openedBy(triggerId: string | undefined) {
		return triggerId !== undefined && this.open && this.resolvedActiveTriggerId() === triggerId;
	}

	mountedBy(triggerId: string | undefined) {
		return triggerId !== undefined && this.mounted && this.resolvedActiveTriggerId() === triggerId;
	}

	/** Upstream `applyTriggerData`, run when a trigger registers. */
	noteTrigger(id: string, element: HTMLElement, read: () => Owned) {
		this.triggers.add(id, element);
		this.readers.set(id, read);
		// Open, the active element, and the trigger count must not re-run the
		// trigger's registration effect. Only the trigger id stays tracked there.
		untrack(() => {
			if (this.retained?.id === id) this.retained = null;
			const activeId = this.boundTriggerId.active;
			if (activeId === id || this.domReferenceElement === element) {
				this.domReferenceElement = element;
				this.boundTriggerId.write(id);
				return;
			}
			if (
				activeId == null &&
				this.domReferenceElement == null &&
				this.open &&
				!this.openedWithoutTrigger
			) {
				this.domReferenceElement = element;
				this.boundTriggerId.write(id);
			}
		});
	}

	forgetTrigger(id: string, element: HTMLElement) {
		const read = this.readers.get(id);
		untrack(() => {
			if (read && this.mounted && this.resolvedActiveTriggerId() === id) {
				this.retained = { id, owned: { ...read() } };
			}
		});
		if (this.triggers.getById(id) === element) this.triggers.delete(id);
		this.readers.delete(id);
	}

	override setOpen(nextOpen: boolean, eventDetails: BaseUIChangeEventDetails<Reason>) {
		const wasOpen = this.open;
		const previousElement = this.domReferenceElement;

		super.setOpen(nextOpen, eventDetails);
		if (eventDetails.isCanceled) return;

		const registered = this.triggers.idOf(this.domReferenceElement);
		this.boundTriggerId.write(registered ?? (this.domReferenceElement?.id || null), nextOpen);

		const nextElement = this.domReferenceElement;
		if (wasOpen && nextOpen && previousElement && nextElement && previousElement !== nextElement) {
			this.switchedFrom = previousElement;
			this.triggerSwitch += 1;
		}
	}

	/** Drop a prevented unmount. The shared close completion then removes the popup. */
	override forceUnmount() {
		this.preventUnmountingOnClose = false;
	}

	protected override onUnmount() {
		this.boundTriggerId.reset();
	}

	/**
	 * Upstream `useImplicitActiveTrigger`. Keeps the active trigger element in step with the
	 * registry while the popup is open. A popup opened without a handle claims its only trigger.
	 * A bound id that resolves to another element moves the anchor. An active trigger that
	 * unregisters after it resolved closes the popup, once a same-tick replacement had its chance.
	 */
	private reconcileActiveTrigger(open: boolean) {
		if (!open) {
			this.resolvedTriggerId = null;
			return;
		}

		const activeId = this.boundTriggerId.active;
		if (activeId) {
			const registered = this.triggers.getById(activeId);
			if (registered) {
				this.resolvedTriggerId = activeId;
				if (registered !== this.domReferenceElement) this.domReferenceElement = registered;
				return;
			}
			const renamed = this.triggers.idOf(this.domReferenceElement);
			if (renamed) {
				this.resolvedTriggerId = renamed;
				this.boundTriggerId.write(renamed);
				return;
			}
			if (this.resolvedTriggerId === activeId) this.closeForLostTrigger(activeId);
			else this.resolvedTriggerId = null;
			return;
		}

		this.resolvedTriggerId = null;
		if (this.openedWithoutTrigger || this.triggers.size !== 1) return;
		const [only] = this.triggers.elements();
		const id = this.triggers.idOf(only);
		if (!id) return;
		this.resolvedTriggerId = id;
		this.domReferenceElement = only;
		this.boundTriggerId.write(id);
	}

	private closeForLostTrigger(lostId: string) {
		queueMicrotask(() => {
			if (this.destroyed || !this.open || this.boundTriggerId.active !== lostId) return;
			if (this.triggers.getById(lostId)) return;
			// Every hover popup's reasons include `none`, the reason upstream closes with here.
			const details = createChangeEventDetails(REASONS.none as Reason);
			this.setOpen(false, details);
			// A canceled close keeps the previous trigger as the owner of the popup that stays open.
			if (details.isCanceled) return;
			this.domReferenceElement = null;
			this.boundTriggerId.write(null);
		});
	}
}
