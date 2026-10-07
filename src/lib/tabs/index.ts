import TabsIndicator from './TabsIndicator.svelte';
import TabsList from './TabsList.svelte';
import TabsPanel from './TabsPanel.svelte';
import TabsRoot from './TabsRoot.svelte';
import TabsTab from './TabsTab.svelte';

export const Tabs = {
	Root: TabsRoot,
	List: TabsList,
	Tab: TabsTab,
	Panel: TabsPanel,
	Indicator: TabsIndicator
};

export type * from './types.js';
