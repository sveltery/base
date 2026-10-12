// Derived from the fields Checkbox.Root reads in Base UI v1.8.0
// packages/react/src/checkbox-group/CheckboxGroupContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// CheckboxGroup sets this context. `parent` is present only when `allValues` is set.
import type { BaseUIChangeEventDetails, REASONS } from '@sveltery/utils';
import type { Labelable } from '../field/labelable.svelte.js';
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
	readonly disabled: boolean;
	readonly parent: CheckboxGroupParentApi | undefined;
	/** The labelable scope the group names itself from. Checkboxes in it leave the control id alone. */
	readonly labelable: Labelable | undefined;
	setValue(value: string[], details: CheckboxGroupChangeDetails): void;
}

export const [useCheckboxGroupContext, setCheckboxGroupContext] = defineOptionalContext<
	CheckboxGroupContextValue | undefined
>(undefined);
