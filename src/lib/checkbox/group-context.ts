// Derived from the fields Checkbox.Root reads in Base UI v1.8.0
// packages/react/src/checkbox-group/CheckboxGroupContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// CheckboxGroup sets this context. `parent` is present only when `allValues` is set.
import { getContext, setContext } from 'svelte';
import type { BaseUIChangeEventDetails, REASONS } from '../internal/event-details.js';

export type CheckboxGroupChangeDetails = BaseUIChangeEventDetails<typeof REASONS.none>;

/**
 * Parent checkbox for one group. Checkbox.Root calls these when `allValues` is set.
 * `checked` is true only when the value length equals `allValues.length`.
 */
export interface CheckboxGroupParentApi {
	readonly checked: boolean;
	readonly indeterminate: boolean;
	/** Space-separated ids of the rendered child checkboxes, or undefined when none are registered. */
	readonly controls: string | undefined;
	toggle(key: string | undefined, next: boolean, details: CheckboxGroupChangeDetails): void;
	registerChildId(value: string, id: string): () => void;
	registerDisabled(read: () => { key: string | undefined; disabled: boolean }): () => void;
}

export interface CheckboxGroupContextValue {
	readonly value: readonly string[];
	readonly disabled: boolean;
	readonly parent: CheckboxGroupParentApi | undefined;
	setValue(value: string[], details: CheckboxGroupChangeDetails): void;
	toggle(key: string | undefined, next: boolean, details: CheckboxGroupChangeDetails): void;
}

const CHECKBOX_GROUP = Symbol('checkbox-group');

export function setCheckboxGroupContext(context: CheckboxGroupContextValue) {
	setContext(CHECKBOX_GROUP, context);
}

export function useCheckboxGroupContext(): CheckboxGroupContextValue | undefined {
	return getContext<CheckboxGroupContextValue>(CHECKBOX_GROUP);
}
