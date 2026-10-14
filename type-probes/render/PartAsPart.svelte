<!-- A part rendered as another part on the same element takes its props as they are. -->
<script lang="ts">
	import { Button, Dialog, Popover, Select, Switch, Toggle, Toolbar, Tooltip } from '#lib';
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet render(props)}<Button {...props} />{/snippet}
	</Popover.Trigger>
</Popover.Root>
<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet render(props)}<Button {...props} />{/snippet}
	</Tooltip.Trigger>
</Tooltip.Root>
<Dialog.Root>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet render(props)}<Dialog.Trigger {...props} />{/snippet}
		</Tooltip.Trigger>
	</Tooltip.Root>
</Dialog.Root>
<Select.Root>
	<Select.Trigger>
		{#snippet render(props)}<Button {...props} />{/snippet}
	</Select.Trigger>
</Select.Root>
<Toolbar.Root>
	<Toolbar.Button>
		{#snippet render(props)}<Toggle {...props} />{/snippet}
	</Toolbar.Button>
	<Toolbar.Button>
		{#snippet render(props)}<Switch.Root {...props} />{/snippet}
	</Toolbar.Button>
</Toolbar.Root>
