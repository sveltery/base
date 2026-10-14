<!-- A Menu part takes the props another part spreads into it, `null` included, as Svelte elements do. -->
<script lang="ts">
	import { Button, Menu, Menubar, Toolbar, Tooltip } from '#lib';
</script>

<Toolbar.Root>
	<Menu.Root>
		<Toolbar.Button>
			{#snippet render(props)}<Menu.Trigger {...props} />{/snippet}
		</Toolbar.Button>
	</Menu.Root>
</Toolbar.Root>
<Menu.Root>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet render(props)}<Menu.Trigger {...props} />{/snippet}
		</Tooltip.Trigger>
	</Tooltip.Root>
	<Menu.Trigger>
		{#snippet render(props)}<Button {...props} />{/snippet}
	</Menu.Trigger>
	<Menu.Popup>
		<Menu.Item id={null} disabled={null} />
		<Menu.LinkItem id={null} />
		<Menu.CheckboxItem id={null} disabled={null} />
		<Menu.RadioGroup id={null} disabled={null}>
			<Menu.RadioItem value="a" id={null} disabled={null} />
		</Menu.RadioGroup>
		<Menu.SubmenuRoot>
			<Menu.SubmenuTrigger id={null} disabled={null} />
		</Menu.SubmenuRoot>
		<Menu.FilterProvider>
			<Menu.Input id={null} disabled={null} />
			<Menu.Clear id={null} disabled={null} />
		</Menu.FilterProvider>
	</Menu.Popup>
</Menu.Root>
<Menubar>
	<Menu.Root>
		<Menu.Trigger>
			{#snippet render(props)}<Button {...props} />{/snippet}
		</Menu.Trigger>
	</Menu.Root>
</Menubar>
