// Derived from Base UI v1.9.0 packages/react/src/combobox/root/ComboboxRootContext.tsx,
// positioner/ComboboxPositionerContext.tsx, portal/ComboboxPortalContext.tsx,
// item/ComboboxItemContext.ts, group/ComboboxGroupContext.ts, row/ComboboxRowContext.ts,
// chips/ComboboxChipsContext.ts, chip/ComboboxChipContext.ts and
// collection/GroupCollectionContext.tsx (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
// The root context is the store. Upstream's derived-items, input-value and has-items
// contexts are store getters.

import { defineContext } from '../internal/context.js';
import type { ElementList } from '../internal/element-list.svelte.js';
import type { AnchorPositioning } from '../internal/popups/index.js';
import type { ComboboxStore } from './store.svelte.js';

export const [useComboboxRoot, setComboboxRoot] = defineContext<ComboboxStore>(
	'Base UI: ComboboxRootContext is missing. Combobox parts must be placed within <Combobox.Root>.'
);

export const [useComboboxPositioner, setComboboxPositioner, findComboboxPositioner] =
	defineContext<AnchorPositioning>(
		'Base UI: ComboboxPositionerContext is missing. ComboboxPositioner parts must be placed within <Combobox.Positioner>.'
	);

export interface ComboboxPortalContext {
	readonly keepMounted: boolean;
}

export const [, setComboboxPortal, findComboboxPortal] = defineContext<ComboboxPortalContext>(
	'Base UI: <Combobox.Portal> is missing.'
);

export interface ComboboxItemContext {
	readonly selected: boolean;
}

export const [useComboboxItem, setComboboxItem] = defineContext<ComboboxItemContext>(
	'Base UI: ComboboxItemContext is missing. ComboboxItem parts must be placed within <Combobox.Item>.'
);

export interface ComboboxGroupContext {
	labelId: string | undefined;
	readonly items: readonly unknown[] | undefined;
}

export const [useComboboxGroup, setComboboxGroup, findComboboxGroup] =
	defineContext<ComboboxGroupContext>(
		'Base UI: ComboboxGroupContext is missing. ComboboxGroup parts must be placed within <Combobox.Group>.'
	);

export const [, setComboboxRow, findComboboxRow] = defineContext<true>(
	'Base UI: <Combobox.Row> is missing.'
);

export interface ComboboxChipsContext {
	readonly chips: ElementList<HTMLElement>;
}

export const [, setComboboxChips, findComboboxChips] = defineContext<ComboboxChipsContext>(
	'Base UI: <Combobox.Chips> is missing.'
);

export interface ComboboxChipContext {
	readonly index: number;
}

export const [useComboboxChip, setComboboxChip] = defineContext<ComboboxChipContext>(
	'Base UI: ComboboxChipContext is missing. ComboboxChip parts must be placed within <Combobox.Chip>.'
);
