<script lang="ts">
	import { Collapsible, type CollapsibleRootChangeEventDetails } from '#lib';

	let {
		css,
		panelClass,
		panelStyle = undefined
	}: { css: string; panelClass: string; panelStyle?: string } = $props();

	let open = $state(false);
	let reason = '';

	function onOpenChange(_next: boolean, details: CollapsibleRootChangeEventDetails) {
		reason = details.reason;
	}

	// Opts out of find-in-page reveals while still honoring the trigger.
	function setOpen(next: boolean) {
		if (reason !== 'none') open = next;
	}
</script>

<svelte:element this={"style"}>{css}</svelte:element>

<Collapsible.Root bind:open={() => open, setOpen} {onOpenChange}>
	<Collapsible.Trigger>Trigger</Collapsible.Trigger>
	<Collapsible.Panel hiddenUntilFound class={panelClass} style={panelStyle} data-testid="panel">
		This is panel content
	</Collapsible.Panel>
</Collapsible.Root>
