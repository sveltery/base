// Derived from Base UI v1.8.0 packages/react/src/internals/createBaseUIEventDetails.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export const REASONS = {
	none: 'none',
	triggerPress: 'trigger-press',
	disabled: 'disabled',
	missing: 'missing',
	initial: 'initial',
	inputChange: 'input-change',
	inputClear: 'input-clear',
	inputBlur: 'input-blur',
	inputPaste: 'input-paste',
	keyboard: 'keyboard',
	incrementPress: 'increment-press',
	decrementPress: 'decrement-press',
	wheel: 'wheel',
	scrub: 'scrub'
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
export type BaseUIGenericEventDetails<Reason extends string> = {
	reason: Reason;
	event: Event;
};

export function createGenericEventDetails<Reason extends string>(
	reason: Reason,
	event?: Event
): BaseUIGenericEventDetails<Reason> {
	return {
		reason,
		event: event ?? new Event('base-ui')
	};
}
