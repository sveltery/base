// Derived from Base UI v1.8.0 packages/react/src/toggle-group/ToggleGroupContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { getContext, hasContext, setContext } from 'svelte';
import type { ToggleGroupChangeEventDetails } from './types.js';
import { RovingFocus, type RovingOrientation } from './roving-focus.svelte.js';

const TOGGLE_GROUP_CONTEXT = Symbol('toggle-group');

export class ToggleGroupContext {
	/** Pressed toggle values. Empty when the parent omitted `value`. */
	readValues: () => readonly string[] = () => [];
	readDisabled: () => boolean = () => false;
	readMultiple: () => boolean = () => false;
	readOnValueChange: () => (value: string[], eventDetails: ToggleGroupChangeEventDetails) => void =
		() => () => {};
	/**
	 * True when the parent passed `value` on the first render.
	 * A later click that fills the array does not count: upstream only warns
	 * when `value` or `defaultValue` was set.
	 */
	readonly valueProvided: boolean;
	readonly roving = new RovingFocus();
	commit: (next: string[]) => void = () => {};

	constructor(valueProvided: boolean) {
		this.valueProvided = valueProvided;
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

	get onValueChange() {
		return this.readOnValueChange();
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

		this.onValueChange(next, eventDetails);
		if (eventDetails.isCanceled) return;
		this.commit(next);
	}
}

export function setToggleGroupContext(context: ToggleGroupContext) {
	setContext(TOGGLE_GROUP_CONTEXT, context);
}

export function useToggleGroupContext(): ToggleGroupContext | undefined {
	if (!hasContext(TOGGLE_GROUP_CONTEXT)) return undefined;
	return getContext<ToggleGroupContext>(TOGGLE_GROUP_CONTEXT);
}

export type { RovingOrientation };
