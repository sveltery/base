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

interface ReasonToEventMap {
	[REASONS.none]: Event;

	[REASONS.triggerPress]: MouseEvent | PointerEvent | TouchEvent | KeyboardEvent;
	[REASONS.triggerHover]: MouseEvent;
	[REASONS.triggerFocus]: FocusEvent;

	[REASONS.outsidePress]: MouseEvent | PointerEvent | TouchEvent;
	[REASONS.itemPress]: MouseEvent | KeyboardEvent | PointerEvent;
	[REASONS.closePress]: MouseEvent | KeyboardEvent | PointerEvent;
	[REASONS.linkPress]: MouseEvent | PointerEvent;
	[REASONS.clearPress]: PointerEvent | MouseEvent | KeyboardEvent;
	[REASONS.chipRemovePress]: PointerEvent | MouseEvent | KeyboardEvent;
	[REASONS.trackPress]: PointerEvent | MouseEvent | TouchEvent;
	[REASONS.incrementPress]: PointerEvent | MouseEvent | TouchEvent;
	[REASONS.decrementPress]: PointerEvent | MouseEvent | TouchEvent;

	[REASONS.inputChange]: InputEvent | Event;
	[REASONS.inputClear]: InputEvent | FocusEvent | Event;
	[REASONS.inputBlur]: FocusEvent;
	[REASONS.inputPaste]: ClipboardEvent;
	[REASONS.inputPress]: MouseEvent | PointerEvent | TouchEvent | KeyboardEvent;

	[REASONS.focusOut]: FocusEvent | KeyboardEvent;
	[REASONS.escapeKey]: KeyboardEvent;
	[REASONS.closeWatcher]: Event;
	[REASONS.listNavigation]: KeyboardEvent;
	[REASONS.keyboard]: KeyboardEvent;

	[REASONS.pointer]: PointerEvent;
	[REASONS.drag]: PointerEvent | TouchEvent;
	[REASONS.swipe]: PointerEvent | TouchEvent;
	[REASONS.wheel]: WheelEvent;
	[REASONS.scrub]: PointerEvent;

	[REASONS.cancelOpen]: MouseEvent;
	[REASONS.siblingOpen]: Event;
	[REASONS.disabled]: Event;
	[REASONS.missing]: Event;
	[REASONS.initial]: Event;
	[REASONS.imperativeAction]: Event;

	[REASONS.windowResize]: UIEvent;
}

/** Maps a change `reason` string to the corresponding native event type. */
export type ReasonToEvent<Reason extends string> = Reason extends keyof ReasonToEventMap
	? ReasonToEventMap[Reason]
	: Event;

type BaseUIChangeEventDetail<Reason extends string> = {
	reason: Reason;
	event: ReasonToEvent<Reason>;
	cancel: () => void;
	allowPropagation: () => void;
	readonly isCanceled: boolean;
	readonly isPropagationAllowed: boolean;
	trigger: Element | undefined;
};

/** One member per reason, so checking `reason` narrows `event`. */
export type BaseUIChangeEventDetails<Reason extends string> = Reason extends string
	? BaseUIChangeEventDetail<Reason>
	: never;

export function createChangeEventDetails<
	Reason extends string,
	Extra extends object = Record<string, never>
>(
	reason: Reason,
	event?: ReasonToEvent<Reason>,
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

/** Details for events that report a reason and the native event, without cancel. */
export type BaseUIGenericEventDetails<
	Reason extends string,
	Extra extends object = object
> = Reason extends string ? { reason: Reason; event: ReasonToEvent<Reason> } & Extra : never;

/** Highlight navigation uses mouse events for hover and pointer events for leaving an item. */
export type BaseUIHighlightEventDetails<
	Reason extends string,
	Extra extends object = object
> = Reason extends typeof REASONS.pointer
	? { reason: Reason; event: MouseEvent | PointerEvent } & Extra
	: BaseUIGenericEventDetails<Reason, Extra>;

export function createGenericEventDetails<Reason extends string, Extra extends object = object>(
	reason: Reason,
	event?: ReasonToEvent<Reason>,
	custom?: Extra
): BaseUIGenericEventDetails<Reason, Extra> {
	return {
		reason,
		event: event ?? new Event('base-ui'),
		...((custom ?? {}) as Extra)
	} as BaseUIGenericEventDetails<Reason, Extra>;
}
