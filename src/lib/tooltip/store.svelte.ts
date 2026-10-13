// Derived from Base UI v1.9.0 packages/react/src/tooltip/store/TooltipStore.ts,
// packages/react/src/utils/popups/popupStoreUtils.ts (applyPopupOpenChange and
// useImplicitActiveTrigger) (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
// The positioner is the floating element, as upstream's `usePopupRootStore` default.
// `payload` and `closeDelay` are read from the active trigger. A trigger that unmounts while it
// owns the open tooltip leaves its last values behind, so a canceled close keeps that content.

import type { Middleware } from '@floating-ui/dom';
import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { HTMLAttributes } from 'svelte/elements';
import { createChangeEventDetails, REASONS } from '@sveltery/utils';
import { TRIGGER_FOCUS_REASON, type ReferenceElement } from '@sveltery/floating-ui-svelte';
import { PopupStore } from '../internal/popups/store.svelte.js';
import type {
	TooltipChangeEventDetails,
	TooltipChangeReason,
	TooltipInstant,
	TrackCursorAxis
} from './types.js';

export interface TooltipTriggerOwned {
	payload: unknown;
	closeDelay: number;
}

export interface TooltipRootSettings {
	disabled: boolean;
	trackCursorAxis: TrackCursorAxis;
	disableHoverablePopup: boolean;
}

export interface TooltipStoreOptions {
	readOpen: () => boolean | undefined;
	writeOpen: (open: boolean) => void;
	floatingId: string;
	nested: boolean;
	readSettings: () => TooltipRootSettings;
	readTriggerId: () => string | null | undefined;
	writeTriggerId: (id: string | null) => void;
	onOpenChange: () => ((open: boolean, details: TooltipChangeEventDetails) => void) | undefined;
	onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
}

export class TooltipStore extends PopupStore<TooltipChangeReason> {
	instantType = $state<TooltipInstant | undefined>(undefined);
	/** Mirrors the active trigger's delay-group instant phase. */
	isInstantPhase = $state(false);
	openChangeReason = $state<TooltipChangeReason | null>(null);
	/** The last pressed or mounted trigger's `closeOnClick`. The dismiss press reads it. */
	closeOnClick = $state(true);
	/** Set while a viewport is mounted so positioning can anchor size transitions. */
	adaptiveOrigin = $state.raw<Middleware | undefined>(undefined);
	positionerVars = $state<Record<string, string>>({});
	popupVars = $state<Record<string, string>>({});
	/** The cursor-following element while `trackCursorAxis` is on. */
	positionReference = $state.raw<ReferenceElement | null>(null);
	/** Dismiss and cursor-tracking handlers the root spreads onto the owning trigger. */
	rootTriggerProps = $state.raw<HTMLAttributes<HTMLElement> | undefined>(undefined);
	/** Dismiss handlers for the popup element. */
	popupProps = $state.raw<HTMLAttributes<HTMLElement> | undefined>(undefined);
	/** Physical side from the positioner. Safe-polygon reads this while open. */
	placement = $state<string | null>('top');
	/** Bumps when an open tooltip changes trigger. The viewport snapshots on this. */
	triggerSwitch = $state(0);
	switchedFrom = $state<Element | null>(null);

	private readonly readSettings: () => TooltipRootSettings;
	private readonly readTriggerId: () => string | null | undefined;
	private readonly writeTriggerIdValue: (id: string | null) => void;
	private readonly readers = new SvelteMap<string, () => TooltipTriggerOwned>();
	/** Values of the owning trigger that unmounted. Used until another trigger owns the tooltip. */
	private retired = $state.raw<{ id: string; owned: TooltipTriggerOwned } | null>(null);
	private claimedTriggerId: string | null = null;

	constructor(options: TooltipStoreOptions) {
		super({
			readOpen: () => options.readOpen() === true && !options.readSettings().disabled,
			writeOpen: options.writeOpen,
			floatingId: options.floatingId,
			floatingElement: 'positioner',
			nested: options.nested,
			onOpenChange: options.onOpenChange,
			onOpenChangeComplete: options.onOpenChangeComplete
		});
		this.readSettings = options.readSettings;
		this.readTriggerId = options.readTriggerId;
		this.writeTriggerIdValue = options.writeTriggerId;
	}

	protected override preventUnmountTiming(): 'immediate' | 'deferred' {
		return 'deferred';
	}

	override get referenceElement(): ReferenceElement | null {
		return this.positionReference ?? this.domReferenceElement;
	}

	get disabled() {
		return this.readSettings().disabled;
	}

	get trackCursorAxis() {
		return this.readSettings().trackCursorAxis;
	}

	get disableHoverablePopup() {
		return this.readSettings().disableHoverablePopup;
	}

	/** Id the trigger was registered under. Falls back to the DOM id. */
	resolvedActiveTriggerId() {
		const registered = this.triggers.idOf(this.domReferenceElement);
		if (registered) return registered;
		const written = this.readTriggerId();
		if (written) return written;
		if (this.open && this.claimedTriggerId) return this.claimedTriggerId;
		return this.domReferenceElement?.id || null;
	}

	writeTriggerId(id: string | null) {
		this.claimedTriggerId = id;
		if ((this.readTriggerId() ?? null) === id) return;
		this.writeTriggerIdValue(id);
	}

	private owned(): TooltipTriggerOwned | undefined {
		const id = this.resolvedActiveTriggerId();
		if (!id) return undefined;
		const read = this.readers.get(id);
		if (read) return read();
		return this.retired?.id === id ? this.retired.owned : undefined;
	}

	get payload() {
		return this.owned()?.payload;
	}

	get closeDelay() {
		return this.owned()?.closeDelay ?? 0;
	}

	openedBy(triggerId: string | undefined) {
		if (triggerId === undefined || !this.open) return false;
		const active = this.domReferenceElement;
		if (active && this.triggers.getById(triggerId) === active) return true;
		const resolved = this.resolvedActiveTriggerId();
		// Upstream useImplicitActiveTrigger: a tooltip opened without a trigger, such as through
		// `bind:open`, belongs to its only trigger.
		if (resolved == null)
			return this.triggerCount === 1 && this.triggers.getById(triggerId) != null;
		return resolved === triggerId;
	}

	mountedBy(triggerId: string | undefined) {
		return triggerId !== undefined && this.mounted && this.resolvedActiveTriggerId() === triggerId;
	}

	noteTrigger(id: string, element: HTMLElement, read: () => TooltipTriggerOwned) {
		this.triggers.add(id, element);
		this.readers.set(id, read);
		untrack(() => {
			if (this.retired?.id === id) this.retired = null;
			const active = this.domReferenceElement;
			const count = this.triggerCount;
			const currentId = this.readTriggerId();
			if (active === element || currentId === id || (this.open && active == null && count === 1)) {
				this.domReferenceElement = element;
				this.writeTriggerId(id);
			}
		});
	}

	forgetTrigger(id: string, element: HTMLElement) {
		const owning = untrack(() => this.domReferenceElement === element);
		const read = this.readers.get(id);
		if (owning && read) this.retired = { id, owned: untrack(read) };
		if (this.triggers.getById(id) === element) this.triggers.delete(id);
		this.readers.delete(id);
		if (!owning || !untrack(() => this.open)) return;
		// Upstream defers so a same-tick replacement trigger with the same id can register first.
		queueMicrotask(() => {
			if (!this.open || this.triggers.getById(id) || this.domReferenceElement !== element) return;
			const details = createChangeEventDetails(REASONS.none);
			this.setOpen(false, details);
			if (details.isCanceled) return;
			this.domReferenceElement = null;
			this.writeTriggerId(null);
		});
	}

	override setOpen(
		nextOpen: boolean,
		eventDetails:
			TooltipChangeEventDetails | Parameters<PopupStore<TooltipChangeReason>['setOpen']>[1]
	) {
		const details = eventDetails as TooltipChangeEventDetails;
		const reason = details.reason;
		const wasOpen = this.open;
		const previousElement = this.domReferenceElement;

		super.setOpen(nextOpen, details);
		if (details.isCanceled) return;

		this.openChangeReason = reason;
		const registered = this.triggers.idOf(this.domReferenceElement);
		this.writeTriggerId(registered ?? (this.domReferenceElement?.id || null));
		if (!nextOpen) this.claimedTriggerId = null;

		if (nextOpen && reason === TRIGGER_FOCUS_REASON) this.instantType = 'focus';
		else if (!nextOpen && (reason === REASONS.triggerPress || reason === REASONS.escapeKey))
			this.instantType = 'dismiss';
		else if (reason === REASONS.triggerHover) this.instantType = undefined;

		const nextElement = this.domReferenceElement;
		if (wasOpen && nextOpen && previousElement && nextElement && previousElement !== nextElement) {
			this.switchedFrom = previousElement;
			this.triggerSwitch += 1;
		}
	}

	/** Clears a pending hover open without a public open change. */
	cancelPendingOpen(event: MouseEvent | PointerEvent) {
		this.dispatchOpenChange(false, createChangeEventDetails(REASONS.triggerPress, event));
	}

	notifyOpened() {
		this.notifyOpenChangeComplete(true);
	}

	closeImperative() {
		this.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}
}
