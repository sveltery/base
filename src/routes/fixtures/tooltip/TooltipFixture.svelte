<script lang="ts">
	import { Tooltip, type TooltipChangeEventDetails } from '#lib';
	import type { TooltipCase } from './cases.js';

	let { scenario }: { scenario: TooltipCase } = $props();

	let open = $state(false);
	let calls = $state<{ open: boolean; reason: string; canceled: boolean }[]>([]);
	const handle = Tooltip.createHandle();

	function changed(next: boolean, details: TooltipChangeEventDetails) {
		if (scenario === 'cancel') details.cancel();
		calls.push({ open: next, reason: details.reason, canceled: details.isCanceled });
	}
</script>

<button type="button">Outside</button>
<pre data-testid="calls">{JSON.stringify(calls)}</pre>

{#snippet popup(name: string)}
	<Tooltip.Portal>
		<Tooltip.Positioner sideOffset={8} data-testid="{name}-positioner">
			<Tooltip.Popup data-testid="{name}-popup" style="padding: 8px; background: canvas">
				{name} tooltip
			</Tooltip.Popup>
		</Tooltip.Positioner>
	</Tooltip.Portal>
{/snippet}

<div style="padding: 120px 40px">
	{#if scenario === 'provider'}
		<Tooltip.Provider>
			{#each ['First', 'Second'] as name (name)}
				<Tooltip.Root onOpenChange={changed}>
					<Tooltip.Trigger>{name}</Tooltip.Trigger>
					{@render popup(name)}
				</Tooltip.Root>
			{/each}
		</Tooltip.Provider>
	{:else if scenario === 'detached'}
		<Tooltip.Trigger {handle} delay={0}>Info</Tooltip.Trigger>
		<Tooltip.Root {handle} onOpenChange={changed}>
			{@render popup('Info')}
		</Tooltip.Root>
	{:else if scenario === 'bound'}
		<button type="button" onclick={() => (open = !open)}>Toggle externally</button>
		<Tooltip.Root bind:open onOpenChange={changed}>
			<Tooltip.Trigger delay={0}>Info</Tooltip.Trigger>
			{@render popup('Info')}
		</Tooltip.Root>
		<output data-testid="bound">{open}</output>
	{:else if scenario === 'cursor'}
		<Tooltip.Root trackCursorAxis="x" onOpenChange={changed}>
			<Tooltip.Trigger delay={0} style="width: 400px; height: 40px">Info</Tooltip.Trigger>
			{@render popup('Info')}
		</Tooltip.Root>
	{:else}
		<Tooltip.Root
			disabled={scenario === 'disabled'}
			disableHoverablePopup={scenario === 'unhoverable'}
			onOpenChange={changed}
		>
			<Tooltip.Trigger
				delay={scenario === 'delay' ? undefined : 0}
				closeOnClick={scenario !== 'no-close-on-click'}
			>
				Info
			</Tooltip.Trigger>
			{@render popup('Info')}
		</Tooltip.Root>
	{/if}
</div>
