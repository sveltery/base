import SelectArrow from './SelectArrow.svelte';
import SelectBackdrop from './SelectBackdrop.svelte';
import SelectGroup from './SelectGroup.svelte';
import SelectGroupLabel from './SelectGroupLabel.svelte';
import SelectIcon from './SelectIcon.svelte';
import SelectItem from './SelectItem.svelte';
import SelectItemIndicator from './SelectItemIndicator.svelte';
import SelectItemText from './SelectItemText.svelte';
import SelectLabel from './SelectLabel.svelte';
import SelectList from './SelectList.svelte';
import SelectPopup from './SelectPopup.svelte';
import SelectPortal from './SelectPortal.svelte';
import SelectPositioner from './SelectPositioner.svelte';
import SelectRoot from './SelectRoot.svelte';
import SelectScrollDownArrow from './SelectScrollDownArrow.svelte';
import SelectScrollUpArrow from './SelectScrollUpArrow.svelte';
import SelectSeparator from './SelectSeparator.svelte';
import SelectTrigger from './SelectTrigger.svelte';
import SelectValue from './SelectValue.svelte';

// A generic component needs `as typeof` so the emitted .d.ts can name its type.
export const Select = {
	Root: SelectRoot as typeof SelectRoot,
	Label: SelectLabel,
	Trigger: SelectTrigger,
	Value: SelectValue,
	Icon: SelectIcon,
	Portal: SelectPortal,
	Backdrop: SelectBackdrop,
	Positioner: SelectPositioner,
	Popup: SelectPopup,
	List: SelectList,
	Item: SelectItem,
	ItemIndicator: SelectItemIndicator,
	ItemText: SelectItemText,
	Arrow: SelectArrow,
	ScrollUpArrow: SelectScrollUpArrow,
	ScrollDownArrow: SelectScrollDownArrow,
	Group: SelectGroup,
	GroupLabel: SelectGroupLabel,
	Separator: SelectSeparator
};

export type * from './types.js';
