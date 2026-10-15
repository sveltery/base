import Separator from '../separator/Separator.svelte';
import MenuArrow from './MenuArrow.svelte';
import MenuBackdrop from './MenuBackdrop.svelte';
import MenuCheckboxItem from './MenuCheckboxItem.svelte';
import MenuCheckboxItemIndicator from './MenuCheckboxItemIndicator.svelte';
import MenuClear from './MenuClear.svelte';
import MenuEmpty from './MenuEmpty.svelte';
import MenuFilterProvider from './MenuFilterProvider.svelte';
import MenuGroup from './MenuGroup.svelte';
import MenuGroupLabel from './MenuGroupLabel.svelte';
import MenuInput from './MenuInput.svelte';
import MenuItem from './MenuItem.svelte';
import MenuLinkItem from './MenuLinkItem.svelte';
import MenuList from './MenuList.svelte';
import MenuPopup from './MenuPopup.svelte';
import MenuPortal from './MenuPortal.svelte';
import MenuPositioner from './MenuPositioner.svelte';
import MenuRadioGroup from './MenuRadioGroup.svelte';
import MenuRadioItem from './MenuRadioItem.svelte';
import MenuRadioItemIndicator from './MenuRadioItemIndicator.svelte';
import MenuRoot from './MenuRoot.svelte';
import MenuSubmenuRoot from './MenuSubmenuRoot.svelte';
import MenuSubmenuTrigger from './MenuSubmenuTrigger.svelte';
import MenuTrigger from './MenuTrigger.svelte';
import MenuViewport from './MenuViewport.svelte';
import { getFilter } from './filter.js';
import { MenuHandle, createMenuHandle } from './handle.svelte.js';

// A generic component needs `as typeof` so the emitted .d.ts can name its type.
export const Menu = {
	Root: MenuRoot as typeof MenuRoot,
	Trigger: MenuTrigger as typeof MenuTrigger,
	Portal: MenuPortal,
	Positioner: MenuPositioner,
	Popup: MenuPopup,
	Arrow: MenuArrow,
	Backdrop: MenuBackdrop,
	Viewport: MenuViewport,
	Item: MenuItem,
	LinkItem: MenuLinkItem,
	Group: MenuGroup,
	GroupLabel: MenuGroupLabel,
	RadioGroup: MenuRadioGroup,
	RadioItem: MenuRadioItem,
	RadioItemIndicator: MenuRadioItemIndicator,
	CheckboxItem: MenuCheckboxItem,
	CheckboxItemIndicator: MenuCheckboxItemIndicator,
	SubmenuRoot: MenuSubmenuRoot,
	SubmenuTrigger: MenuSubmenuTrigger,
	Separator,
	Handle: MenuHandle,
	createHandle: createMenuHandle,
	FilterProvider: MenuFilterProvider,
	Input: MenuInput,
	List: MenuList,
	Clear: MenuClear,
	Empty: MenuEmpty,
	useFilter: getFilter
};

export { MenuHandle, createMenuHandle };
export * from './data-attributes.js';
export type * from './types.js';
