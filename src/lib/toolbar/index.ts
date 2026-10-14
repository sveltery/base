import ToolbarButton from './ToolbarButton.svelte';
import ToolbarGroup from './ToolbarGroup.svelte';
import ToolbarLink from './ToolbarLink.svelte';
import ToolbarRoot from './ToolbarRoot.svelte';
import ToolbarInput from './ToolbarInput.svelte';
import ToolbarSeparator from './ToolbarSeparator.svelte';

export const Toolbar = {
	Root: ToolbarRoot,
	Button: ToolbarButton,
	Group: ToolbarGroup,
	Link: ToolbarLink,
	Input: ToolbarInput,
	Separator: ToolbarSeparator
};

export type * from './types.js';
export * from './data-attributes.js';
