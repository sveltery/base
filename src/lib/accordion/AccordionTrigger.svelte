<!--
	A button that opens and closes the corresponding panel. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/accordion/trigger/AccordionTrigger.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { triggerOpenStateMapping } from '../collapsible/attributes.js';
	import { useCollapsibleRootContext } from '../collapsible/context.svelte.js';
	import { useAccordionItemContext } from './context.svelte.js';
	import type { AccordionTriggerHostProps, AccordionTriggerProps } from './types.js';

	let {
		disabled: disabledProp,
		id,
		nativeButton = true,
		onclick,
		render,
		children,
		...elementProps
	}: AccordionTriggerProps = $props();

	const root = useCollapsibleRootContext();
	const item = useAccordionItemContext();
	const disabled = $derived(Boolean(disabledProp) || root.disabled);
	const state = $derived(item.state);
	const registeredId = $derived(id ? id : undefined);
	const button = new ButtonBehavior(() => ({
		disabled,
		native: nativeButton,
		focusableWhenDisabled: true
	}));

	$effect(() => {
		const current = registeredId;
		item.registerTrigger(current);
		return () => item.unregisterTrigger(current);
	});

	function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		onclick?.(event);
		if (event.defaultPrevented) return;
		root.handleTrigger(event);
	}

	const hostProps = $derived(
		button.props({
			id: registeredId ?? item.defaultTriggerId,
			'aria-expanded': root.open,
			...(root.open && root.panelId ? { 'aria-controls': root.panelId } : {}),
			...elementProps,
			...getStateAttributesProps(state, triggerOpenStateMapping),
			onclick: handleClick
		}) as AccordionTriggerHostProps
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
