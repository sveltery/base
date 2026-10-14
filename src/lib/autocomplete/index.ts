// Derived from Base UI v1.9.0 packages/react/src/autocomplete/index.parts.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import ComboboxArrow from '../combobox/ComboboxArrow.svelte';
import ComboboxBackdrop from '../combobox/ComboboxBackdrop.svelte';
import ComboboxClear from '../combobox/ComboboxClear.svelte';
import ComboboxCollection from '../combobox/ComboboxCollection.svelte';
import ComboboxEmpty from '../combobox/ComboboxEmpty.svelte';
import ComboboxGroup from '../combobox/ComboboxGroup.svelte';
import ComboboxGroupLabel from '../combobox/ComboboxGroupLabel.svelte';
import ComboboxIcon from '../combobox/ComboboxIcon.svelte';
import ComboboxInput from '../combobox/ComboboxInput.svelte';
import ComboboxList from '../combobox/ComboboxList.svelte';
import ComboboxPopup from '../combobox/ComboboxPopup.svelte';
import ComboboxPortal from '../combobox/ComboboxPortal.svelte';
import ComboboxPositioner from '../combobox/ComboboxPositioner.svelte';
import ComboboxRow from '../combobox/ComboboxRow.svelte';
import ComboboxStatus from '../combobox/ComboboxStatus.svelte';
import { useFilteredItems } from '../combobox/context.svelte.js';
import { useFilter } from '../combobox/filter.js';
import AutocompleteInputGroup from './AutocompleteInputGroup.svelte';
import AutocompleteItem from './AutocompleteItem.svelte';
import AutocompleteRoot from './AutocompleteRoot.svelte';
import AutocompleteSeparator from './AutocompleteSeparator.svelte';
import AutocompleteTrigger from './AutocompleteTrigger.svelte';
import AutocompleteValue from './AutocompleteValue.svelte';

// A generic component needs `as typeof` so the emitted .d.ts can name its type.
export const Autocomplete = {
	Root: AutocompleteRoot as typeof AutocompleteRoot,
	Value: AutocompleteValue,
	Trigger: AutocompleteTrigger,
	Input: ComboboxInput,
	InputGroup: AutocompleteInputGroup,
	Icon: ComboboxIcon,
	Clear: ComboboxClear,
	List: ComboboxList,
	Status: ComboboxStatus,
	Portal: ComboboxPortal,
	Backdrop: ComboboxBackdrop,
	Positioner: ComboboxPositioner,
	Popup: ComboboxPopup,
	Arrow: ComboboxArrow,
	Group: ComboboxGroup,
	GroupLabel: ComboboxGroupLabel,
	Item: AutocompleteItem,
	Row: ComboboxRow,
	Collection: ComboboxCollection,
	Empty: ComboboxEmpty,
	Separator: AutocompleteSeparator,
	useFilter,
	useFilteredItems
};

export type * from './types.js';
export * from './data-attributes.js';
