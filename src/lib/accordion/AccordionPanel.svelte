<!--
	A collapsible panel with the accordion item contents. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/accordion/panel/AccordionPanel.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Measurement and exit timing come from CollapsiblePanelMotion.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { startingStyle } from '../collapsible/attributes.js';
	import { useCollapsibleRootContext } from '../collapsible/context.svelte.js';
	import { joinStyles } from '../collapsible/motion.js';
	import { CollapsiblePanelMotion } from '../collapsible/panel-motion.svelte.js';
	import { devWarn } from '../collapsible/warn.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { accordionDimensionStyle, accordionStateAttributesMapping } from './attributes.js';
	import { useAccordionItemContext, useAccordionRootContext } from './context.svelte.js';
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
	const motion = new CollapsiblePanelMotion(root);
	const attachmentKey = createAttachmentKey();

	const hiddenUntilFound = $derived(hiddenUntilFoundProp ?? accordion.hiddenUntilFound);
	const keepMounted = $derived(keepMountedProp ?? accordion.keepMounted);
	const registeredId = $derived(id ? id : undefined);
	const panelId = $derived(registeredId ?? root.defaultPanelId);

	$effect(() => {
		if (keepMountedProp === false && hiddenUntilFound) {
			devWarn(
				'The `keepMounted={false}` prop on an `Accordion.Panel` is ignored when `hiddenUntilFound` is enabled on the panel or root, since the panel must remain mounted while closed.'
			);
		}
	});

	$effect(() => {
		const current = registeredId;
		root.registerPanel(current);
		return () => root.unregisterPanel(current);
	});

	$effect(() => {
		const element = motion.panel;
		if (!element || !hiddenUntilFound) return;
		if (hidden) element.setAttribute('hidden', 'until-found');
		else element.removeAttribute('hidden');
	});

	const hidden = $derived(!root.open && !root.mounted);
	const shouldRender = $derived(keepMounted || hiddenUntilFound || root.mounted || root.open);
	const shouldPersistHiddenTransitionStyles = $derived(
		hiddenUntilFound && hidden && motion.animationType !== 'css-animation'
	);

	const state: AccordionPanelState = $derived({
		...item.state,
		transitionStatus: motion.panelStatus
	});

	const hostProps: HTMLAttributes<HTMLDivElement> & { hidden?: boolean | 'until-found' } =
		$derived.by(() => {
			const hiddenValue: boolean | 'until-found' | undefined =
				hiddenUntilFound && hidden ? 'until-found' : hidden ? true : undefined;
			const props: HTMLAttributes<HTMLDivElement> & { hidden?: boolean | 'until-found' } = {
				id: panelId,
				role: 'region',
				...(item.triggerId ? { 'aria-labelledby': item.triggerId } : {}),
				...elementProps,
				...getStateAttributesProps(state, accordionStateAttributesMapping),
				...(shouldPersistHiddenTransitionStyles ? { [startingStyle]: '' } : {}),
				hidden: hiddenValue,
				[attachmentKey]: motion.attach
			};
			const css = joinStyles(
				accordionDimensionStyle(motion.renderedHeight, motion.renderedWidth),
				style ?? undefined,
				motion.shouldPreventOpenAnimation ? 'animation-name:none' : undefined
			);
			if (css !== undefined) props.style = css;
			return props;
		});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if shouldRender}
	{#if render}
		{@render render(hostProps, state, content)}
	{:else}
		<div {...hostProps}>{@render content()}</div>
	{/if}
{/if}
