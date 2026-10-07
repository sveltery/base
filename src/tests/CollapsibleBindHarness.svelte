<script lang="ts">
	import { Collapsible } from '#lib';

	let { bound = true }: { bound?: boolean } = $props();
	let open = $state(false);
</script>

<input type="checkbox" aria-label="Owner open" bind:checked={open} />
{#if bound}
	<Collapsible.Root bind:open>
		<Collapsible.Trigger>Trigger</Collapsible.Trigger>
		<Collapsible.Panel>This is panel content</Collapsible.Panel>
	</Collapsible.Root>
{:else}
	<Collapsible.Root {open}>
		<Collapsible.Trigger>Trigger</Collapsible.Trigger>
		<Collapsible.Panel>This is panel content</Collapsible.Panel>
	</Collapsible.Root>
{/if}
