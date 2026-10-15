<!--
	A menubar narrower than its triggers, for the composite root's scroll into view.
-->
<script lang="ts">
	import { Menu, Menubar } from '#lib';

	let { style = '' }: { style?: string } = $props();

	const items = Array.from({ length: 10 }, (_, index) => index);
</script>

<Menubar
	data-testid="menubar"
	style="display: flex; position: relative; width: 100px; overflow: auto; {style}"
>
	{#each items as index (index)}
		<Menu.Root>
			<Menu.Trigger
				style="flex: none; width: 50px; height: 50px; margin: 0; padding: 0; border: 0;"
			>
				{index}
			</Menu.Trigger>
		</Menu.Root>
	{/each}
</Menubar>
