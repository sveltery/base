<script lang="ts">
	import { Command } from '@sveltery/base/command';

	const item =
		'flex h-8 cursor-default items-center px-3 text-sm select-none data-[disabled=true]:text-neutral-500 data-[selected=true]:bg-neutral-950 data-[selected=true]:text-white dark:data-[selected=true]:bg-white dark:data-[selected=true]:text-neutral-950';
	const heading =
		'**:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:text-neutral-500';
</script>

<Command.Root
	label="Command menu"
	class="w-72 border border-neutral-950 bg-white text-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white"
>
	<Command.Input
		placeholder="Type a command or search..."
		class="h-10 w-full border-0 border-b border-neutral-950 bg-transparent px-3 text-sm outline-none dark:border-white"
	/>
	<Command.List class="max-h-64 overflow-y-auto py-1">
		<Command.Empty class="px-3 py-6 text-center text-sm">No results found.</Command.Empty>
		<Command.Group heading="Suggestions" class={heading}>
			<Command.Item class={item}>Calendar</Command.Item>
			<Command.Item class={item} keywords={['emoji']}>Search Emoji</Command.Item>
			<Command.Item class={item} disabled>Calculator</Command.Item>
		</Command.Group>
		<Command.Separator class="my-1 h-px bg-neutral-200 dark:bg-neutral-800" />
		<Command.Group heading="Settings" class={heading}>
			<Command.Item class={item}>Profile</Command.Item>
			<Command.Item class={item}>Billing</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Root>
