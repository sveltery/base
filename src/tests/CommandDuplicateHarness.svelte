<script lang="ts">
	import { Command } from '#lib';

	let { onValueChange }: { onValueChange?: (value: string) => void } = $props();

	let value = $state('');

	export function setValue(next: string) {
		value = next;
	}
	export function bound() {
		return { value, search: '' };
	}
</script>

<Command.Root bind:value {onValueChange}>
	<Command.Input data-testid="input" />
	<Command.List>
		<Command.Group heading="A">
			<Command.Item data-testid="apple1">Apple</Command.Item>
			<Command.Item data-testid="pear">Pear</Command.Item>
		</Command.Group>
		<Command.Group heading="B">
			<Command.Item data-testid="apple2">Apple</Command.Item>
			<Command.Item data-testid="plum">Plum</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Root>
