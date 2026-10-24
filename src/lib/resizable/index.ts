import ResizableGroup from './ResizableGroup.svelte';
import ResizablePanel from './ResizablePanel.svelte';
import ResizableSeparator from './ResizableSeparator.svelte';

export const Resizable = {
	Group: ResizableGroup,
	Panel: ResizablePanel,
	Separator: ResizableSeparator
};

export { useDefaultLayout, type UseDefaultLayoutOptions } from './useDefaultLayout.svelte.js';
export { isCoarsePointer } from './engine/global/utils/isCoarsePointer.js';
export type * from './types.js';
export * from './data-attributes.js';
