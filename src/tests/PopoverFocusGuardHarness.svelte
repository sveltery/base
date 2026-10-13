<script lang="ts">
	import { Popover } from '#lib';

	let {
		tabindex,
		outside = true
	}: {
		tabindex?: number;
		outside?: boolean;
	} = $props();
</script>

<svelte:element this={'style'}>
	{`.guard-popup { transition: opacity 200ms; } .guard-popup[data-ending-style] { opacity: 0; }`}
</svelte:element>
{#if outside}<button type="button" data-testid="before">Before</button>{/if}
<Popover.Root>
	<Popover.Trigger {tabindex}>Toggle</Popover.Trigger>
	<Popover.Portal>
		<Popover.Positioner>
			<Popover.Popup data-testid="popup" class="guard-popup">
				<button type="button" data-testid="inside">Inside</button>
			</Popover.Popup>
		</Popover.Positioner>
	</Popover.Portal>
</Popover.Root>
{#if outside}<button type="button" data-testid="after">After</button>{/if}
