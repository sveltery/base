<script lang="ts">
	import { Popover } from '#lib';

	let { host }: { host: 'link' | 'span' } = $props();
</script>

<Popover.Root>
	<Popover.Trigger disabled nativeButton={false}>
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
