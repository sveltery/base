// Derived from Base UI v1.9.0 packages/react/src/internals/createBaseUIEventDetails.ts
// and packages/react/src/internals/reason-parts.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

export const REASONS = {
	none: 'none',
	triggerPress: 'trigger-press',
	triggerHover: 'trigger-hover',
	triggerFocus: 'trigger-focus',
	outsidePress: 'outside-press',
	itemPress: 'item-press',
	closePress: 'close-press',
	linkPress: 'link-press',
	clearPress: 'clear-press',
	chipRemovePress: 'chip-remove-press',
	trackPress: 'track-press',
	incrementPress: 'increment-press',
	decrementPress: 'decrement-press',
	inputChange: 'input-change',
	inputClear: 'input-clear',
	inputBlur: 'input-blur',
	inputPaste: 'input-paste',
	inputPress: 'input-press',
	focusOut: 'focus-out',
	escapeKey: 'escape-key',
	closeWatcher: 'close-watcher',
	listNavigation: 'list-navigation',
	keyboard: 'keyboard',
	pointer: 'pointer',
	drag: 'drag',
	wheel: 'wheel',
	scrub: 'scrub',
	popupClose: 'popup-close',
	cancelOpen: 'cancel-open',
	siblingOpen: 'sibling-open',
	disabled: 'disabled',
	missing: 'missing',
	initial: 'initial',
	imperativeAction: 'imperative-action',
	swipe: 'swipe',
	windowResize: 'window-resize'
} as const;

export type BaseUIChangeEventDetails<Reason extends string> = {
	reason: Reason;
	event: Event;
	cancel: () => void;
	allowPropagation: () => void;
	readonly isCanceled: boolean;
	readonly isPropagationAllowed: boolean;
	trigger: Element | undefined;
};

export function createChangeEventDetails<
	Reason extends string,
	Extra extends object = Record<string, never>
>(
	reason: Reason,
	event?: Event,
	trigger?: Element,
	custom?: Extra
): BaseUIChangeEventDetails<Reason> & Extra {
	let canceled = false;
	let allowPropagation = false;
	return {
		reason,
		event: event ?? new Event('base-ui'),
		cancel() {
			canceled = true;
		},
		allowPropagation() {
			allowPropagation = true;
		},
		get isCanceled() {
			return canceled;
		},
		get isPropagationAllowed() {
			return allowPropagation;
		},
		trigger,
		...((custom ?? {}) as Extra)
	} as BaseUIChangeEventDetails<Reason> & Extra;
}

/**
 * Details for events that report a reason and the native event, without cancel.
 * Form submit uses this. The full upstream reason-to-event map is not ported;
 * the event is the native event the caller passes.
 */
export type BaseUIGenericEventDetails<Reason extends string, Extra extends object = object> = {
	reason: Reason;
	event: Event;
} & Extra;

/** Highlight navigation uses mouse events for hover and pointer events for leaving an item. */
export type BaseUIHighlightEventDetails<
	Reason extends string,
	Extra extends object = object
> = Reason extends typeof REASONS.pointer
	? { reason: Reason; event: MouseEvent | PointerEvent } & Extra
	: BaseUIGenericEventDetails<Reason, Extra>;

export function createGenericEventDetails<Reason extends string, Extra extends object = object>(
	reason: Reason,
	event?: Event,
	custom?: Extra
): BaseUIGenericEventDetails<Reason, Extra> {
	return {
		reason,
		event: event ?? new Event('base-ui'),
		...((custom ?? {}) as Extra)
	} as BaseUIGenericEventDetails<Reason, Extra>;
}
