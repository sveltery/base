<script lang="ts">
	import { Command } from '#lib';

	let items = $state(['a', 'b', 'c']);
	let late = $state<string[]>([]);

	export function setItems(next: string[]) {
		items = next;
	}
	export function setLate(next: string[]) {
		late = next;
	}

	const portal = (node: HTMLElement) => {
		document.body.append(node);
		return () => node.remove();
	};
</script>

<Command.Root data-testid="portaled">
	<Command.Input data-testid="input" />
	<div {@attach portal}>
		<Command.List>
			{#each items as item (item)}
				<Command.Item data-testid={item}>{item}</Command.Item>
			{/each}
			<Command.Root data-testid="nested">
				<Command.Item data-testid="inner">inner</Command.Item>
			</Command.Root>
		</Command.List>
	</div>
</Command.Root>

<Command.Root>
	<Command.Input data-testid="other-input" />
	<Command.List>
		{#each late as item (item)}
			<Command.Item data-testid={item}>{item}</Command.Item>
		{/each}
	</Command.List>
</Command.Root>
