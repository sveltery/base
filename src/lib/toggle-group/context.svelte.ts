// Derived from Base UI v1.9.0 packages/react/src/toggle-group/ToggleGroupContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import type { CompositeRoot } from '../internal/composite-root.svelte.js';
import type { ToggleGroupChangeEventDetails } from './types.js';
import { defineOptionalContext } from '../internal/context.js';

export type RovingOrientation = 'horizontal' | 'vertical';

export class ToggleGroupContext {
	/**
	 * True when the parent passed `value` on the first render.
	 * A later click that fills the array does not count: upstream only warns
	 * when `value` or `defaultValue` was set.
	 */
	readonly valueProvided: boolean;
	readonly roving: CompositeRoot;
	commit: (next: string[]) => void = () => {};

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

		this.readOnValueChange()(next, eventDetails);
		if (eventDetails.isCanceled) return;
		this.commit(next);
	}
}

export const [useToggleGroupContext, setToggleGroupContext] = defineOptionalContext<
	ToggleGroupContext | undefined
>(undefined);
