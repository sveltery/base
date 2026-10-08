<!--
	A collapsible panel with the accordion item contents. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/accordion/panel/AccordionPanel.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Measurement and exit timing come from CollapsiblePanelMotion.
-->
<script lang="ts">
	import { accordionDimensionStyle, accordionStateAttributesMapping } from './attributes.js';
	import { useAccordionItemContext, useAccordionRootContext } from './context.svelte.js';
	import { useCollapsibleRootContext } from '../collapsible/context.svelte.js';
	import { PanelShell } from '../collapsible/panel-shell.svelte.js';
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
	const root = useCollapsibleRootContext();
	const item = useAccordionItemContext();
	const hiddenUntilFound = $derived(hiddenUntilFoundProp ?? accordion.hiddenUntilFound);
	const shell = new PanelShell<AccordionPanelState>({
		root,
		hiddenUntilFound: () => hiddenUntilFound,
		keepMounted: () => keepMountedProp ?? accordion.keepMounted,
		registeredId: () => (id ? id : undefined),
		style: () => style,
		elementProps: () => elementProps,
		warnWhen: () => keepMountedProp === false && hiddenUntilFound,
		warnMessage:
			'The `keepMounted={false}` prop on an `Accordion.Panel` is ignored when `hiddenUntilFound` is enabled on the panel or root, since the panel must remain mounted while closed.',
		dimension: (motion) => accordionDimensionStyle(motion.renderedHeight, motion.renderedWidth),
		state: (motion) => ({
			...item.state,
			transitionStatus: motion.panelStatus
		}),
		attributes: accordionStateAttributesMapping,
		extraProps: () => ({
			role: 'region',
			...(item.triggerId ? { 'aria-labelledby': item.triggerId } : {})
		})
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if shell.shouldRender && render}
	{@render render(shell.hostProps, shell.state, content)}
{:else if shell.shouldRender}
	<div {...shell.hostProps}>{@render content()}</div>
{/if}
