// Derived from the fields Radio.Root reads in Base UI v1.9.0
// packages/react/src/radio-group/RadioGroupContext.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// RadioGroup sets this context. A test harness can set it without roving focus.
import type { RadioRootChangeEventDetails } from './types.js';
import type { Labelable } from '../internal/labelable-provider.svelte.js';
import { defineOptionalContext } from '../internal/context.js';

/**
 * Roving tabindex owned by RadioGroup.
 * Arrow keys are handled on the group. Each radio claims a render-order index
 * for SSR, then registers its host. A selected radio is the tab stop. With
 * nothing selected, the first rendered radio is the stop until registration.
 */
export interface RadioGroupRovingFocus {
	claim(): number;
	register(element: HTMLElement, read?: () => { value?: unknown; disabled?: boolean }): () => void;
	highlight(element: HTMLElement): void;
	tabIndex(
		node: HTMLElement | null,
		renderIndex: number,
		meta: { disabled?: boolean; selected?: boolean; hasSelection?: boolean }
	): 0 | -1;
}

export interface RadioGroupContextValue {
	readonly disabled: boolean | undefined;
	readonly readOnly: boolean | undefined;
	readonly required: boolean | undefined;
	readonly form: string | undefined;
	readonly name: string | undefined;
	/**
	 * The selected value. Compare it to a radio's `value` with `===`.
	 * Store it with `$state.raw` so Svelte does not proxy the reference.
	 */
	readonly checkedValue: unknown;
	/** The value a form reset returns to. */
	readonly defaultValue?: unknown;
	readonly touched: boolean;
	/** The labelable scope the group names itself from. Radios in it leave the control id alone. */
	readonly labelable?: Labelable;
	/** Present when the real RadioGroup owns keyboard navigation. */
	readonly roving?: RadioGroupRovingFocus;
	setCheckedValue: (value: unknown, eventDetails: RadioRootChangeEventDetails) => void;
	setTouched: (touched: boolean) => void;
	/**
	 * Checking one named native radio unchecks its siblings, so a change the group
	 * did not take resyncs every radio's input, not only the clicked one.
	 */
	registerInputSync?: (sync: () => void) => () => void;
	syncInputs?: () => void;
}

export const [useRadioGroupContext, setRadioGroupContext] = defineOptionalContext<
	RadioGroupContextValue | undefined
>(undefined);
