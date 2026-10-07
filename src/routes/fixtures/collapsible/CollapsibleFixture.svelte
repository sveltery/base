<script lang="ts">
	import { Collapsible, type CollapsibleRootChangeEventDetails } from '#lib';
	import type { CollapsibleCase } from './cases.js';

	let { scenario }: { scenario: CollapsibleCase } = $props();

	let owner = $state(false);
	if (scenario === 'open') owner = true;
	let calls = $state<{ open: boolean; reason: string; canceled: boolean }[]>([]);

	function changed(open: boolean, details: CollapsibleRootChangeEventDetails) {
		if (scenario === 'cancel') details.cancel();
		calls.push({ open, reason: details.reason, canceled: details.isCanceled });
	}

	function clicked(event: MouseEvent) {
		if (scenario === 'prevented') event.preventDefault();
	}
</script>

{#if scenario === 'bound'}
	<input type="checkbox" aria-label="Owner open" bind:checked={owner} />
	<Collapsible.Root bind:open={owner} onOpenChange={changed}>
		<Collapsible.Trigger id="tested-trigger" onclick={clicked}>Details</Collapsible.Trigger>
		<Collapsible.Panel data-testid="panel">Panel content</Collapsible.Panel>
	</Collapsible.Root>
{:else if scenario === 'open'}
	<Collapsible.Root bind:open={owner} onOpenChange={changed}>
		<Collapsible.Trigger id="tested-trigger" onclick={clicked}>Details</Collapsible.Trigger>
		<Collapsible.Panel class="open-panel" data-testid="panel">Panel content</Collapsible.Panel>
	</Collapsible.Root>
{:else}
	<Collapsible.Root disabled={scenario === 'disabled'} onOpenChange={changed}>
		<Collapsible.Trigger id="tested-trigger" onclick={clicked}>Details</Collapsible.Trigger>
		<Collapsible.Panel
			data-testid="panel"
			keepMounted={scenario === 'mounted' || scenario === 'search' ? true : undefined}
			hiddenUntilFound={scenario === 'search'}
		>
			Panel content
		</Collapsible.Panel>
	</Collapsible.Root>
{/if}
<output data-testid="calls">{JSON.stringify(calls)}</output>
