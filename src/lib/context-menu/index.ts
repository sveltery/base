import type { Component } from 'svelte';
import MenuArrow from '../menu/MenuArrow.svelte';
import MenuBackdrop from '../menu/MenuBackdrop.svelte';
import MenuCheckboxItem from '../menu/MenuCheckboxItem.svelte';
import MenuCheckboxItemIndicator from '../menu/MenuCheckboxItemIndicator.svelte';
import MenuGroup from '../menu/MenuGroup.svelte';
import MenuGroupLabel from '../menu/MenuGroupLabel.svelte';
import MenuItem from '../menu/MenuItem.svelte';
import MenuLinkItem from '../menu/MenuLinkItem.svelte';
import MenuPopup from '../menu/MenuPopup.svelte';
import MenuPortal from '../menu/MenuPortal.svelte';
import MenuPositioner from '../menu/MenuPositioner.svelte';
import MenuRadioGroup from '../menu/MenuRadioGroup.svelte';
import MenuRadioItem from '../menu/MenuRadioItem.svelte';
import MenuRadioItemIndicator from '../menu/MenuRadioItemIndicator.svelte';
import MenuSubmenuRoot from '../menu/MenuSubmenuRoot.svelte';
import MenuSubmenuTrigger from '../menu/MenuSubmenuTrigger.svelte';
import Separator from '../separator/Separator.svelte';
import ContextMenuRoot from './ContextMenuRoot.svelte';
import ContextMenuTrigger from './ContextMenuTrigger.svelte';
import type { ContextMenuPositionerProps } from './types.js';

// Upstream `ContextMenu.Positioner` is `Menu.Positioner` with context-menu prop docs.
export const ContextMenu = {
	Root: ContextMenuRoot,
	Trigger: ContextMenuTrigger,
	Backdrop: MenuBackdrop,
	Portal: MenuPortal,
	Positioner: MenuPositioner as Component<ContextMenuPositionerProps>,
	Popup: MenuPopup,
	Arrow: MenuArrow,
	Group: MenuGroup,
	GroupLabel: MenuGroupLabel,
	Item: MenuItem,
	CheckboxItem: MenuCheckboxItem,
	CheckboxItemIndicator: MenuCheckboxItemIndicator,
	LinkItem: MenuLinkItem,
	RadioGroup: MenuRadioGroup,
	RadioItem: MenuRadioItem,
	RadioItemIndicator: MenuRadioItemIndicator,
	SubmenuRoot: MenuSubmenuRoot,
	SubmenuTrigger: MenuSubmenuTrigger,
	Separator
};

export * from './data-attributes.js';
export type * from './types.js';
