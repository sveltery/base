// Derived from the fields Checkbox.Root reads in Base UI v1.9.0
// packages/react/src/checkbox-group/CheckboxGroupContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// CheckboxGroup sets this context. `parent` is present only when `allValues` is set.
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { Labelable } from '../internal/labelable-provider.svelte.js';
import { defineOptionalContext } from '../internal/context.js';

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
	toggle(details: CheckboxGroupChangeDetails): void;
	toggleChild(value: string, nextChecked: boolean, details: CheckboxGroupChangeDetails): void;
	registerChildId(value: string, id: string): () => void;
	setDisabled(value: string, disabled: boolean): void;
	clearDisabled(value: string): void;
}

export interface CheckboxGroupContextValue {
	readonly value: readonly string[];
	/** The value a form reset returns to. */
	readonly defaultValue: readonly string[] | undefined;
	readonly disabled: boolean;
	readonly parent: CheckboxGroupParentApi | undefined;
	/** The labelable scope the group names itself from. Checkboxes in it leave the control id alone. */
	readonly labelable: Labelable;
	/** The named inputs of the child checkboxes, in registration order, with the value each one submits. */
	readonly inputs: ReadonlyMap<HTMLInputElement, string | undefined>;
	registerInput(input: HTMLInputElement, value: string | undefined): () => void;
	setValue(value: string[], details: CheckboxGroupChangeDetails): void;
}

export const [useCheckboxGroupContext, setCheckboxGroupContext] = defineOptionalContext<
	CheckboxGroupContextValue | undefined
>(undefined);
