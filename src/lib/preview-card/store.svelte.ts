// Derived from Base UI v1.9.0 packages/react/src/preview-card/store/PreviewCardStore.ts
// and the dismiss-close and instant-type rules of packages/react/src/utils/popups/popupStoreUtils.ts
// `applyPopupOpenChange` (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Open, dismiss, and deferred preventUnmountOnClose stay on the shared PopupStore.
// Trigger ownership, `payload`, and the retained values of an unmounted owning trigger live on
// the shared TriggerOwnedPopupStore.

import type { Middleware } from '@floating-ui/dom';
import type { HTMLAttributes } from 'svelte/elements';
import { createChangeEventDetails, REASONS } from '@sveltery/utils';
import { TRIGGER_FOCUS_REASON } from '@sveltery/floating-ui-svelte';
import type { PopupStore } from '../internal/popups/store.svelte.js';
import { TriggerOwnedPopupStore } from '../internal/popups/triggerOwnedStore.svelte.js';
import { CLOSE_DELAY } from './constants.js';
import { updateInlineRectCoords, type InlineRectHover } from './inline-rect.js';
import type {
	PreviewCardChangeEventDetails,
	PreviewCardChangeReason,
	PreviewCardInstant
} from './types.js';

export interface TriggerOwned {
	payload: unknown;
	closeDelay: number;
}

export interface PreviewCardStoreOptions {
	readOpen: () => boolean | undefined;
	writeOpen: (open: boolean) => void;
	floatingId: string;
	nested: boolean;
	readTriggerId: () => string | null | undefined;
	writeTriggerId: (id: string | null) => void;
	onOpenChange: () => ((open: boolean, details: PreviewCardChangeEventDetails) => void) | undefined;
	onOpenChangeComplete: () => ((open: boolean) => void) | undefined;
}

export class PreviewCardStore extends TriggerOwnedPopupStore<
	PreviewCardChangeReason,
	TriggerOwned
> {
	instantType = $state<PreviewCardInstant | undefined>(undefined);
	/** Set while a viewport is mounted so positioning can anchor size transitions. */
	adaptiveOrigin = $state.raw<Middleware | undefined>(undefined);
	/** Physical side from the positioner. Safe-polygon reads this while open. */
	placement = $state<string | null>('bottom');
	/** Viewport CSS variables. They travel with the style attribute. */
	positionerVars = $state<Record<string, string>>({});
	popupVars = $state<Record<string, string>>({});
	/** Dismiss handlers from `PreviewCardInteractions`. Empty while that part is not rendered. */
	dismissReference = $state.raw<HTMLAttributes<HTMLElement>>({});
	dismissFloating = $state.raw<HTMLAttributes<HTMLElement>>({});
	/** The hovered point of a wrapped trigger, read by the inline positioning middleware. */
	readonly inlineHover: InlineRectHover;

	constructor(options: PreviewCardStoreOptions) {
		const inlineHover: InlineRectHover = { coords: undefined };
		super({
			readOpen: options.readOpen,
			writeOpen: options.writeOpen,
			floatingId: options.floatingId,
			floatingElement: 'positioner',
			nested: options.nested,
			onOpenChange: options.onOpenChange,
			onOpenChangeComplete: () => (open) => {
				if (!open) inlineHover.coords = undefined;
				options.onOpenChangeComplete()?.(open);
			},
			readTriggerId: options.readTriggerId,
			writeTriggerId: options.writeTriggerId
		});
		this.inlineHover = inlineHover;
	}

	readPlacement() {
		return this.placement;
	}

	setPlacement(side: string | null) {
		this.placement = side;
	}

	get payload() {
		return this.owned()?.payload;
	}

	get closeDelay() {
		return this.owned()?.closeDelay ?? CLOSE_DELAY;
	}

	override setOpen(
		nextOpen: boolean,
		eventDetails:
			PreviewCardChangeEventDetails | Parameters<PopupStore<PreviewCardChangeReason>['setOpen']>[1]
	) {
		const details = eventDetails as PreviewCardChangeEventDetails;
		const reason = details.reason;
		const isHover = reason === REASONS.triggerHover;
		const isFocusOpen = nextOpen && reason === TRIGGER_FOCUS_REASON;
		const isDismissClose =
			!nextOpen && (reason === REASONS.triggerPress || reason === REASONS.escapeKey);

		super.setOpen(nextOpen, details);
		if (details.isCanceled) return;

		// Anchor to the exact point of a wrapped link that was hovered.
		const event = details.event;
		if (
			nextOpen &&
			isHover &&
			details.trigger &&
			'clientX' in event &&
			'clientY' in event &&
			this.inlineHover.coords?.element !== details.trigger
		) {
			updateInlineRectCoords(
				this.inlineHover,
				details.trigger,
				event.clientX as number,
				event.clientY as number
			);
		}

		if (isFocusOpen) this.instantType = 'focus';
		else if (isDismissClose) this.instantType = 'dismiss';
		else if (isHover) this.instantType = undefined;
	}

	notifyOpened() {
		this.notifyOpenChangeComplete(true);
	}

	closeImperative() {
		this.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}
}
