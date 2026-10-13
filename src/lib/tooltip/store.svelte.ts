// Derived from Base UI v1.9.0 packages/react/src/tooltip/store/TooltipStore.ts and the
// instant-type rules of packages/react/src/utils/popups/popupStoreUtils.ts `applyPopupOpenChange`
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The positioner is the floating element, as upstream's `usePopupRootStore` default.
// Trigger ownership, `payload`, and the retained values of an unmounted owning trigger live on
// the shared TriggerOwnedPopupStore.

import type { Middleware } from '@floating-ui/dom';
import { SvelteSet } from 'svelte/reactivity';
import type { HTMLAttributes } from 'svelte/elements';
import { createChangeEventDetails, REASONS } from '@sveltery/utils';
import { TRIGGER_FOCUS_REASON, type ReferenceElement } from '@sveltery/floating-ui-svelte';
import type { PopupStore } from '../internal/popups/store.svelte.js';
import { TriggerOwnedPopupStore } from '../internal/popups/triggerOwnedStore.svelte.js';
import type {
	TooltipChangeEventDetails,
	TooltipChangeReason,
	TooltipInstant,
	TrackCursorAxis
} from './types.js';

export interface TooltipTriggerOwned {
	payload: unknown;
	closeDelay: number;
	closeOnClick: boolean;
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

export class TooltipStore extends TriggerOwnedPopupStore<TooltipChangeReason, TooltipTriggerOwned> {
	instantType = $state<TooltipInstant | undefined>(undefined);
	openChangeReason = $state<TooltipChangeReason | null>(null);
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

	private readonly readSettings: () => TooltipRootSettings;
	private readonly instantPhases = new SvelteSet<() => boolean>();
	private placementReader = $state.raw<(() => string | null) | null>(null);
	/** `closeOnClick` of a trigger pressed since the tooltip last opened. */
	private pressedCloseOnClick = $state<boolean | null>(null);

	constructor(options: TooltipStoreOptions) {
		super({
			readOpen: () => options.readOpen() === true && !options.readSettings().disabled,
			writeOpen: options.writeOpen,
			floatingId: options.floatingId,
			floatingElement: 'positioner',
			nested: options.nested,
			onOpenChange: options.onOpenChange,
			onOpenChangeComplete: options.onOpenChangeComplete,
			readTriggerId: options.readTriggerId,
			writeTriggerId: options.writeTriggerId
		});
		this.readSettings = options.readSettings;
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

	get payload() {
		return this.owned()?.payload;
	}

	get closeDelay() {
		return this.owned()?.closeDelay ?? 0;
	}

	/** Read by the trigger press dismissal: the pressed trigger, else the active one. */
	get closeOnClick() {
		return this.pressedCloseOnClick ?? this.owned()?.closeOnClick ?? true;
	}

	pressTrigger(closeOnClick: boolean) {
		this.pressedCloseOnClick = closeOnClick;
	}

	/** Physical side from the positioner. Safe-polygon reads this while open. */
	get placement() {
		return this.placementReader?.() ?? 'top';
	}

	trackPlacement(read: () => string | null) {
		this.placementReader = read;
		return () => {
			if (this.placementReader === read) this.placementReader = null;
		};
	}

	/** True while a trigger's delay-group member hands the group over. */
	get isInstantPhase() {
		for (const read of this.instantPhases) if (read()) return true;
		return false;
	}

	trackInstantPhase(read: () => boolean) {
		this.instantPhases.add(read);
		return () => {
			this.instantPhases.delete(read);
		};
	}

	override setOpen(
		nextOpen: boolean,
		eventDetails:
			TooltipChangeEventDetails | Parameters<PopupStore<TooltipChangeReason>['setOpen']>[1]
	) {
		const details = eventDetails as TooltipChangeEventDetails;
		const reason = details.reason;

		super.setOpen(nextOpen, details);
		if (details.isCanceled) return;

		this.openChangeReason = reason;
		if (nextOpen) this.pressedCloseOnClick = null;

		if (nextOpen && reason === TRIGGER_FOCUS_REASON) this.instantType = 'focus';
		else if (!nextOpen && (reason === REASONS.triggerPress || reason === REASONS.escapeKey))
			this.instantType = 'dismiss';
		else if (reason === REASONS.triggerHover) this.instantType = undefined;
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
