<!--
	A panel with the collapsible contents. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/collapsible/panel/CollapsiblePanel.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { collapsibleStateAttributesMapping } from './attributes.js';
	import { useCollapsibleRootContext } from './context.svelte.js';
	import { dimensionStyle } from './motion.js';
	import { PanelShell } from './panel-shell.svelte.js';
	import type { CollapsiblePanelProps, CollapsiblePanelState } from './types.js';

	let {
		hiddenUntilFound = false,
		keepMounted: keepMountedProp,
		id,
		style,
		render,
		children,
		...elementProps
	}: CollapsiblePanelProps = $props();

	const root = useCollapsibleRootContext();
	const shell = new PanelShell<CollapsiblePanelState>({
		root,
		hiddenUntilFound: () => hiddenUntilFound,
		keepMounted: () => keepMountedProp ?? false,
		registeredId: () => (id ? id : undefined),
		style: () => style,
		elementProps: () => elementProps,
		warnWhen: () => hiddenUntilFound && keepMountedProp === false,
		warnMessage:
			'The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.',
		dimension: (motion) => dimensionStyle(motion.renderedHeight, motion.renderedWidth),
		state: (motion) => ({
			open: root.open,
			disabled: root.disabled,
			transitionStatus: motion.panelStatus
		}),
		attributes: collapsibleStateAttributesMapping,
		extraProps: () => ({})
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if shell.shouldRender}
	{#if render}
		{@render render(shell.hostProps, shell.state, content)}
	{:else}
		<div {...shell.hostProps}>{@render content()}</div>
	{/if}
{/if}
