<script lang="ts">
	import { PreviewCard, type PreviewCardChangeEventDetails } from '#lib';
	import type { PreviewCardCase } from './cases.js';

	let { scenario }: { scenario: PreviewCardCase } = $props();

	let owner = $state(false);
	let calls = $state<{ open: boolean; reason: string; canceled: boolean }[]>([]);
	const handle = PreviewCard.createHandle<string>();
	const bound = $derived(scenario === 'bound');
	const delay = $derived(scenario === 'standalone' ? 200 : 0);
	const closeDelay = $derived(
		scenario === 'standalone'
			? 200
			: scenario === 'close-delay'
				? 500
				: scenario === 'safe'
					? 300
					: 0
	);

	function changed(open: boolean, details: PreviewCardChangeEventDetails) {
		if (scenario === 'cancel') details.cancel();
		calls.push({ open, reason: details.reason, canceled: details.isCanceled });
		if (bound && !details.isCanceled) owner = open;
	}
</script>

<button type="button">Outside</button>
<button type="button" data-testid="show" onclick={() => (owner = true)}>Show</button>
<pre data-testid="calls">{JSON.stringify(calls)}</pre>
<pre data-testid="owner">{String(owner)}</pre>

{#snippet popup(payload: string | undefined)}
	<PreviewCard.Portal>
		<PreviewCard.Positioner sideOffset={8}>
			<PreviewCard.Popup data-testid="popup">Content {payload ?? ''}</PreviewCard.Popup>
		</PreviewCard.Positioner>
	</PreviewCard.Portal>
{/snippet}

<div style="margin: 120px 0 0 40px">
	{#if scenario === 'detached'}
		<PreviewCard.Trigger {handle} id="trigger" href="#" {delay} {closeDelay}
			>Link</PreviewCard.Trigger
		>
		<PreviewCard.Root {handle} onOpenChange={changed}>
			{#snippet children({ payload })}
				{@render popup(payload as string | undefined)}
			{/snippet}
		</PreviewCard.Root>
	{:else if scenario === 'payload'}
		<PreviewCard.Root onOpenChange={changed}>
			{#snippet children({ payload })}
				<PreviewCard.Trigger id="first" href="#" payload="one" {delay} {closeDelay}>
					First
				</PreviewCard.Trigger>
				<PreviewCard.Trigger id="second" href="#" payload="two" {delay} {closeDelay}>
					Second
				</PreviewCard.Trigger>
				{@render popup(payload as string | undefined)}
			{/snippet}
		</PreviewCard.Root>
	{:else if bound}
		<PreviewCard.Root bind:open={owner} onOpenChange={changed}>
			{#snippet children({ payload })}
				<PreviewCard.Trigger id="trigger" href="#" {delay} {closeDelay}>Link</PreviewCard.Trigger>
				{@render popup(payload as string | undefined)}
			{/snippet}
		</PreviewCard.Root>
	{:else}
		<PreviewCard.Root onOpenChange={changed}>
			{#snippet children({ payload })}
				<PreviewCard.Trigger id="trigger" href="#" {delay} {closeDelay}>Link</PreviewCard.Trigger>
				{@render popup(payload as string | undefined)}
			{/snippet}
		</PreviewCard.Root>
	{/if}
</div>
