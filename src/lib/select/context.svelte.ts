// Derived from Base UI v1.9.0 packages/react/src/select/root/SelectRootContext.ts,
// positioner/SelectPositionerContext.ts, item/SelectItemContext.ts and
// group/SelectGroupContext.ts (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import { defineContext } from '../internal/context.js';
import type { Align, AnchorPositioning, Side } from '../internal/popups/index.js';
import type { SelectStore } from './store.svelte.js';

export const [useSelectRoot, setSelectRoot] = defineContext<SelectStore>(
	'Base UI: SelectRootContext is missing. Select parts must be placed within <Select.Root>.'
);

export interface SelectPositionerContext {
	readonly positioning: AnchorPositioning;
	/** `none` while the popup overlaps the trigger. */
	readonly side: Side | 'none';
	readonly align: Align;
	readonly alignItemWithTriggerActive: boolean;
	/** Falls back to regular anchoring when the aligned popup does not fit. */
	disableAlignItemWithTrigger(): void;
}

export const [useSelectPositioner, setSelectPositioner] = defineContext<SelectPositionerContext>(
	'Base UI: SelectPositionerContext is missing. SelectPositioner parts must be placed within <Select.Positioner>.'
);

export interface SelectItemContext {
	readonly selected: boolean;
	readonly index: number;
	/** Whether this item holds the selected index the popup aligns with. */
	readonly selectedByFocus: boolean;
	setText(element: HTMLElement | null): void;
}

export const [useSelectItem, setSelectItem] = defineContext<SelectItemContext>(
	'Base UI: SelectItemContext is missing. SelectItem parts must be placed within <Select.Item>.'
);

export interface SelectGroupContext {
	labelId: string | undefined;
}

export const [useSelectGroup, setSelectGroup] = defineContext<SelectGroupContext>(
	'Base UI: SelectGroupContext is missing. SelectGroup parts must be placed within <Select.Group>.'
);
