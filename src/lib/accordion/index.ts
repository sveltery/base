import AccordionHeader from './AccordionHeader.svelte';
import AccordionItem from './AccordionItem.svelte';
import AccordionPanel from './AccordionPanel.svelte';
import AccordionRoot from './AccordionRoot.svelte';
import AccordionTrigger from './AccordionTrigger.svelte';

export const Accordion = {
	Root: AccordionRoot,
	Item: AccordionItem,
	Header: AccordionHeader,
	Trigger: AccordionTrigger,
	Panel: AccordionPanel
};

export type * from './types.js';
