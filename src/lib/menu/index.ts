import Separator from '../separator/Separator.svelte';
import MenuArrow from './MenuArrow.svelte';
import MenuBackdrop from './MenuBackdrop.svelte';
import MenuCheckboxItem from './MenuCheckboxItem.svelte';
import MenuCheckboxItemIndicator from './MenuCheckboxItemIndicator.svelte';
import MenuGroup from './MenuGroup.svelte';
import MenuGroupLabel from './MenuGroupLabel.svelte';
import MenuItem from './MenuItem.svelte';
import MenuLinkItem from './MenuLinkItem.svelte';
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
	createHandle: createMenuHandle
};

export { MenuHandle, createMenuHandle };
export type * from './types.js';
