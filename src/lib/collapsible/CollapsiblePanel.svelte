<!--
	A panel with the collapsible contents. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/collapsible/panel/CollapsiblePanel.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { collapsibleStateAttributesMapping } from './attributes.js';
	import { useCollapsibleRootContext } from './context.svelte.js';
	import { dimensionStyle } from './motion.js';
	import PanelHost from './PanelHost.svelte';
	import type { CollapsiblePanelProps, CollapsiblePanelState, TransitionStatus } from './types.js';

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
	const keepMounted = $derived(keepMountedProp ?? false);

	const warnMessage =
		'The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.';

	function buildState(status: TransitionStatus): CollapsiblePanelState {
		return {
			open: root.open,
			disabled: root.disabled,
			transitionStatus: status
		};
	}
</script>

<PanelHost
	{hiddenUntilFound}
	{keepMounted}
	{id}
	{style}
	warnWhen={hiddenUntilFound && keepMountedProp === false}
	{warnMessage}
	{dimensionStyle}
	attributes={collapsibleStateAttributesMapping}
	{buildState}
	{elementProps}
	{render}
	{children}
/>
