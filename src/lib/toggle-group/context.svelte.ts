// Derived from Base UI v1.8.0 packages/react/src/toggle-group/ToggleGroupContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { getContext, hasContext, setContext } from 'svelte';
import { callPublic } from '../internal/callPublic.js';
import type { CompositeRoot } from '../internal/composite-root.svelte.js';
import type { ToggleGroupChangeEventDetails } from './types.js';

export type RovingOrientation = 'horizontal' | 'vertical';

const TOGGLE_GROUP_CONTEXT = Symbol('toggle-group');

export class ToggleGroupContext {
	/**
	 * True when the parent passed `value` or `defaultValue` on the first render.
	 * A later click that fills the array does not count: upstream only warns
	 * when `value` or `defaultValue` was set.
	 */
	readonly valueProvided: boolean;
	readonly roving: CompositeRoot;
	commit: (next: string[], details?: ToggleGroupChangeEventDetails) => void = () => {};

	constructor(
		valueProvided: boolean,
		roving: CompositeRoot,
		private readonly readValues: () => readonly string[],
		private readonly readDisabled: () => boolean,
		private readonly readMultiple: () => boolean,
		private readonly readOnValueChange: () => (
			value: string[],
			eventDetails: ToggleGroupChangeEventDetails
		) => void
	) {
		this.valueProvided = valueProvided;
		this.roving = roving;
	}

	get values() {
		return this.readValues();
	}

	get disabled() {
		return this.readDisabled();
	}

	get multiple() {
		return this.readMultiple();
	}

	setGroupValue(
		itemValue: string,
		nextPressed: boolean,
		eventDetails: ToggleGroupChangeEventDetails
	) {
		let next: string[];
		if (this.multiple) {
			next = this.values.slice();
			if (nextPressed) next.push(itemValue);
			else next.splice(this.values.indexOf(itemValue), 1);
		} else {
			next = nextPressed ? [itemValue] : [];
		}

		callPublic(this.readOnValueChange(), next, eventDetails);
		if (eventDetails.isCanceled) return;
		this.commit(next, eventDetails);
	}
}

export function setToggleGroupContext(context: ToggleGroupContext) {
	setContext(TOGGLE_GROUP_CONTEXT, context);
}

export function useToggleGroupContext(): ToggleGroupContext | undefined {
	if (!hasContext(TOGGLE_GROUP_CONTEXT)) return undefined;
	return getContext<ToggleGroupContext>(TOGGLE_GROUP_CONTEXT);
}
