<!--
	A button that opens and closes the collapsible panel. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/collapsible/trigger/CollapsibleTrigger.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { triggerStateAttributesMapping } from './attributes.js';
	import { useCollapsibleRootContext } from './context.svelte.js';
	import type { CollapsibleTriggerHostProps, CollapsibleTriggerProps } from './types.js';

	let {
		disabled: disabledProp,
		nativeButton = true,
		onclick,
		render,
		children,
		...elementProps
	}: CollapsibleTriggerProps = $props();

	const root = useCollapsibleRootContext();
	const disabled = $derived(disabledProp ?? root.disabled);
	const state = $derived(root.state);
	const button = new ButtonBehavior(() => ({
		disabled,
		native: nativeButton
	}));

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		root.handleTrigger(event);
	}

	const hostProps = $derived(
		button.props({
			'aria-expanded': root.open,
			...(root.open && root.panelId ? { 'aria-controls': root.panelId } : {}),
			...elementProps,
			...getStateAttributesProps(state, triggerStateAttributesMapping),
			onclick: handleClick
		}) as CollapsibleTriggerHostProps
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
