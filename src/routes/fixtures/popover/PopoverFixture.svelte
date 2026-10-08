<script lang="ts">
	import { Popover, type PopoverChangeEventDetails } from '#lib';
	import type { PopoverCase } from './cases.js';

	let { scenario }: { scenario: PopoverCase } = $props();

	let owner = $state(scenario === 'open');
	let calls = $state<{ open: boolean; reason: string; canceled: boolean }[]>([]);
	const handle = Popover.createHandle();
	const bound = $derived(scenario === 'bound' || scenario === 'open');

	function changed(open: boolean, details: PopoverChangeEventDetails) {
		if (scenario === 'cancel') details.cancel();
		calls.push({ open, reason: details.reason, canceled: details.isCanceled });
		if (bound && !details.isCanceled) owner = open;
	}

	function clicked(event: MouseEvent) {
		if (scenario === 'prevented') event.preventDefault();
	}
</script>

<button type="button">Outside</button>
<pre data-testid="calls">{JSON.stringify(calls)}</pre>

{#snippet popup()}
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup>
				<Popover.Title>Title</Popover.Title>
				Content
				<button type="button">Inside</button>
				{#if scenario === 'close' || scenario === 'modal'}
					<Popover.Close>Close</Popover.Close>
				{/if}
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
{/snippet}

{#if scenario === 'detached'}
	<Popover.Trigger {handle} id="detached-trigger" onclick={clicked}>Open</Popover.Trigger>
	<Popover.Root {handle} onOpenChange={changed}>
		{@render popup()}
	</Popover.Root>
{:else if bound}
	<Popover.Root bind:open={owner} modal={scenario === 'modal'} onOpenChange={changed}>
		<Popover.Trigger onclick={clicked}>Open</Popover.Trigger>
		{@render popup()}
	</Popover.Root>
{:else}
	<Popover.Root modal={scenario === 'modal'} onOpenChange={changed}>
		<Popover.Trigger
			onclick={clicked}
			disabled={scenario === 'disabled'}
			openOnHover={scenario === 'hover'}
			delay={0}
		>
			Open
		</Popover.Trigger>
		{@render popup()}
	</Popover.Root>
{/if}
