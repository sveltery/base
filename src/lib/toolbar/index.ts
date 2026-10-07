import ToolbarButton from './ToolbarButton.svelte';
import ToolbarGroup from './ToolbarGroup.svelte';
import ToolbarLink from './ToolbarLink.svelte';
import ToolbarRoot from './ToolbarRoot.svelte';

export const Toolbar = {
	Root: ToolbarRoot,
	Button: ToolbarButton,
	Group: ToolbarGroup,
	Link: ToolbarLink
};

export type * from './types.js';
