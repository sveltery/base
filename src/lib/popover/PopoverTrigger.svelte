<!--
	A button that opens the popover. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/trigger/PopoverTrigger.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { usePopoverRoot } from './context.svelte.js';
	import PopoverTriggerElement from './PopoverTriggerElement.svelte';
	import type { PopoverStore } from './store.svelte.js';
	import type { PopoverTriggerProps } from './types.js';

	let { handle, ...rest }: PopoverTriggerProps = $props();

	const root = usePopoverRoot(true);
	const store = $derived((handle ? (handle.current ?? handle.fallback) : root) as PopoverStore);
	if (!handle && !root) {
		throw new Error(
			'Base UI: <Popover.Trigger> must be either used within a <Popover.Root> component or provided with a handle.'
		);
	}
</script>

{#if store}
	{#key store}
		<PopoverTriggerElement {store} {...rest} />
	{/key}
{/if}
