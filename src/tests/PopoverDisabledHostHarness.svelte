<script lang="ts">
	import { Popover } from '#lib';

	let { host }: { host: 'link' | 'span' | 'iframe' } = $props();

	let opens = $state(0);
</script>

<pre data-testid="opens">{opens}</pre>
<Popover.Root
	onOpenChange={() => {
		opens += 1;
	}}
>
	<Popover.Trigger
		disabled={host !== 'iframe'}
		nativeButton={false}
		onclick={(event) => {
			if (host === 'iframe') event.preventBaseUIHandler?.();
		}}
	>
		{#snippet render(props)}
			{#if host === 'link'}
				<a {...props} href="#navigated174">Open</a>
			{:else}
				<span {...props}>Open</span>
			{/if}
		{/snippet}
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup>Content</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
