<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Popover, type PopoverTriggerHostProps } from '#lib';

	function hostProps(props: PopoverTriggerHostProps): HTMLAttributes<HTMLElement> {
		return props as HTMLAttributes<HTMLElement>;
	}

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
				<a {...hostProps(props)} href="#navigated174">Open</a>
			{:else}
				<span {...hostProps(props)}>Open</span>
			{/if}
		{/snippet}
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup>Content</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
