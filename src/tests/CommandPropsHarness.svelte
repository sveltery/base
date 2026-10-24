<script lang="ts">
	import { Command } from '#lib';

	let {
		defaultValue,
		defaultSearch,
		prevent = false,
		onSelect
	}: {
		defaultValue?: string;
		defaultSearch?: string;
		prevent?: boolean;
		onSelect?: (value: string) => void;
	} = $props();

	const skip = (event: Event) => {
		if (prevent) event.preventDefault();
	};
</script>

<Command.Root data-testid="root" {defaultValue} onkeydown={skip}>
	<Command.Input data-testid="input" defaultValue={defaultSearch} />
	<Command.List>
		{#each ['Apple', 'Banana', 'Cherry'] as name (name)}
			<Command.Item data-testid={name.toLowerCase()} {onSelect} onclick={skip} onpointermove={skip}
				>{name}</Command.Item
			>
		{/each}
	</Command.List>
</Command.Root>
