<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Select, Toolbar } from '#lib';

	let { onToolbarKeyDown }: { onToolbarKeyDown?: (event: KeyboardEvent) => void } = $props();
</script>

{#snippet toolbarButton(
	props: HTMLAttributes<HTMLElement>,
	_state: unknown,
	children: Snippet | undefined
)}
	<Toolbar.Button {...props}>{@render children?.()}</Toolbar.Button>
{/snippet}

<Toolbar.Root onkeydown={onToolbarKeyDown}>
	<Select.Root defaultValue="a">
		<Select.Trigger data-testid="trigger" render={toolbarButton}>
			<Select.Value />
		</Select.Trigger>
		<Select.Positioner>
			<Select.Popup>
				<Select.Item value="a">a</Select.Item>
				<Select.Item value="b">b</Select.Item>
			</Select.Popup>
		</Select.Positioner>
	</Select.Root>
	<Toolbar.Button data-testid="next">Next</Toolbar.Button>
</Toolbar.Root>
