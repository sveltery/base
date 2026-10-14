import NavigationMenuArrow from './NavigationMenuArrow.svelte';
import NavigationMenuBackdrop from './NavigationMenuBackdrop.svelte';
import NavigationMenuContent from './NavigationMenuContent.svelte';
import NavigationMenuIcon from './NavigationMenuIcon.svelte';
import NavigationMenuItem from './NavigationMenuItem.svelte';
import NavigationMenuLink from './NavigationMenuLink.svelte';
import NavigationMenuList from './NavigationMenuList.svelte';
import NavigationMenuPopup from './NavigationMenuPopup.svelte';
import NavigationMenuPortal from './NavigationMenuPortal.svelte';
import NavigationMenuPositioner from './NavigationMenuPositioner.svelte';
import NavigationMenuRoot from './NavigationMenuRoot.svelte';
import NavigationMenuTrigger from './NavigationMenuTrigger.svelte';
import NavigationMenuViewport from './NavigationMenuViewport.svelte';

export const NavigationMenu = {
	Root: NavigationMenuRoot as typeof NavigationMenuRoot,
	List: NavigationMenuList,
	Item: NavigationMenuItem,
	Trigger: NavigationMenuTrigger,
	Icon: NavigationMenuIcon,
	Content: NavigationMenuContent,
	Link: NavigationMenuLink,
	Portal: NavigationMenuPortal,
	Backdrop: NavigationMenuBackdrop,
	Positioner: NavigationMenuPositioner,
	Popup: NavigationMenuPopup,
	Arrow: NavigationMenuArrow,
	Viewport: NavigationMenuViewport
};

export type * from './types.js';
export * from './data-attributes.js';
