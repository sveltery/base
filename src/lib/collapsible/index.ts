import CollapsiblePanel from './CollapsiblePanel.svelte';
import CollapsibleRoot from './CollapsibleRoot.svelte';
import CollapsibleTrigger from './CollapsibleTrigger.svelte';

export const Collapsible = {
	Root: CollapsibleRoot,
	Trigger: CollapsibleTrigger,
	Panel: CollapsiblePanel
};

export type * from './types.js';
