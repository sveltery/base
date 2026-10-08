<!--
	A collapsible panel with the accordion item contents. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/accordion/panel/AccordionPanel.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Measurement and exit timing come from CollapsiblePanelMotion.
-->
<script lang="ts">
	import { accordionDimensionStyle, accordionPanelAttributesMapping } from './attributes.js';
	import { useAccordionItemContext, useAccordionRootContext } from './context.svelte.js';
	import PanelHost from '../collapsible/PanelHost.svelte';
	import type { TransitionStatus } from '../collapsible/types.js';
	import type { AccordionPanelProps, AccordionPanelState } from './types.js';

	let {
		hiddenUntilFound: hiddenUntilFoundProp,
		keepMounted: keepMountedProp,
		id,
		style,
		render,
		children,
		...elementProps
	}: AccordionPanelProps = $props();

	const accordion = useAccordionRootContext();
	const item = useAccordionItemContext();
	const hiddenUntilFound = $derived(hiddenUntilFoundProp ?? accordion.hiddenUntilFound);
	const keepMounted = $derived(keepMountedProp ?? accordion.keepMounted);

	const warnMessage =
		'The `keepMounted={false}` prop on an `Accordion.Panel` is ignored when `hiddenUntilFound` is enabled on the panel or root, since the panel must remain mounted while closed.';

	function buildState(status: TransitionStatus): AccordionPanelState {
		return {
			...item.state,
			transitionStatus: status
		};
	}
</script>

<PanelHost
	{hiddenUntilFound}
	{keepMounted}
	{id}
	{style}
	warnWhen={keepMountedProp === false && hiddenUntilFound}
	{warnMessage}
	dimensionStyle={accordionDimensionStyle}
	attributes={accordionPanelAttributesMapping}
	{buildState}
	extra={{
		role: 'region',
		...(item.triggerId ? { 'aria-labelledby': item.triggerId } : {})
	}}
	{elementProps}
	{render}
	{children}
/>
