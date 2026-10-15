// Derived from Base UI v1.9.0 packages/react/src/combobox/index.parts.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import ComboboxArrow from './ComboboxArrow.svelte';
import ComboboxBackdrop from './ComboboxBackdrop.svelte';
import ComboboxChip from './ComboboxChip.svelte';
import ComboboxChipRemove from './ComboboxChipRemove.svelte';
import ComboboxChips from './ComboboxChips.svelte';
import ComboboxClear from './ComboboxClear.svelte';
import ComboboxCollection from './ComboboxCollection.svelte';
import ComboboxEmpty from './ComboboxEmpty.svelte';
import ComboboxGroup from './ComboboxGroup.svelte';
import ComboboxGroupLabel from './ComboboxGroupLabel.svelte';
import ComboboxIcon from './ComboboxIcon.svelte';
import ComboboxInput from './ComboboxInput.svelte';
import ComboboxInputGroup from './ComboboxInputGroup.svelte';
import ComboboxItem from './ComboboxItem.svelte';
import ComboboxItemIndicator from './ComboboxItemIndicator.svelte';
import ComboboxLabel from './ComboboxLabel.svelte';
import ComboboxList from './ComboboxList.svelte';
import ComboboxPopup from './ComboboxPopup.svelte';
import ComboboxPortal from './ComboboxPortal.svelte';
import ComboboxPositioner from './ComboboxPositioner.svelte';
import ComboboxRoot from './ComboboxRoot.svelte';
import ComboboxRow from './ComboboxRow.svelte';
import ComboboxSeparator from './ComboboxSeparator.svelte';
import ComboboxStatus from './ComboboxStatus.svelte';
import ComboboxTrigger from './ComboboxTrigger.svelte';
import ComboboxValue from './ComboboxValue.svelte';
import { createItems } from './collection.js';
import { useFilteredItems } from './context.svelte.js';
import { useFilter } from './filter.js';

// A generic component needs `as typeof` so the emitted .d.ts can name its type.
export const Combobox = {
	Root: ComboboxRoot as typeof ComboboxRoot,
	Label: ComboboxLabel,
	Value: ComboboxValue,
	Input: ComboboxInput,
	InputGroup: ComboboxInputGroup,
	Trigger: ComboboxTrigger,
	List: ComboboxList,
	Status: ComboboxStatus,
	Portal: ComboboxPortal,
	Backdrop: ComboboxBackdrop,
	Positioner: ComboboxPositioner,
	Popup: ComboboxPopup,
	Arrow: ComboboxArrow,
	Icon: ComboboxIcon,
	Group: ComboboxGroup,
	GroupLabel: ComboboxGroupLabel,
	Item: ComboboxItem,
	ItemIndicator: ComboboxItemIndicator,
	Chips: ComboboxChips,
	Chip: ComboboxChip,
	ChipRemove: ComboboxChipRemove,
	Row: ComboboxRow,
	Collection: ComboboxCollection,
	Empty: ComboboxEmpty,
	Clear: ComboboxClear,
	Separator: ComboboxSeparator,
	useFilter,
	useFilteredItems,
	createItems
};

export type * from './types.js';
export * from './data-attributes.js';
