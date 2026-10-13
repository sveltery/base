<script lang="ts">
	import { Combobox } from '#lib';

	type Scenario = 'textarea-reference' | 'div-trigger' | 'toggle-trigger';

	let {
		scenario,
		showTrigger = true,
		root = {}
	}: {
		scenario: Scenario;
		showTrigger?: boolean;
		root?: Record<string, unknown>;
	} = $props();
</script>

{#if scenario === 'textarea-reference'}
	<Combobox.Root {...root}>
		<Combobox.Trigger>Open</Combobox.Trigger>
		<textarea aria-label="notes"></textarea>
	</Combobox.Root>
{:else if scenario === 'div-trigger'}
	<Combobox.Root {...root}>
		<Combobox.Trigger disabled nativeButton={false} data-testid="trigger">
			{#snippet render(props)}<div {...props}></div>{/snippet}
		</Combobox.Trigger>
	</Combobox.Root>
{:else if scenario === 'toggle-trigger'}
	<Combobox.Root {...root}>
		{#if showTrigger}<Combobox.Trigger data-testid="trigger" />{/if}
		<Combobox.Portal>
			<Combobox.Positioner>
				<Combobox.Popup><Combobox.Input /></Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	</Combobox.Root>
{/if}
