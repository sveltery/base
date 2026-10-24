<script lang="ts">
	import { Resizable } from '@sveltery/base/resizable';

	const panel = 'flex h-full items-center justify-center text-sm text-neutral-950 dark:text-white';
</script>

<div class="h-48 w-96 max-w-full rounded-md border border-neutral-300 dark:border-neutral-700">
	<Resizable.Group>
		<Resizable.Panel defaultSize="30%" minSize="20%" class={panel}>Sidebar</Resizable.Panel>
		<Resizable.Separator
			class="w-px bg-neutral-300 outline-0 focus-visible:bg-neutral-500 data-[separator=active]:bg-neutral-500 data-[separator=hover]:bg-neutral-500 dark:bg-neutral-700"
		/>
		<Resizable.Panel minSize="30%" class={panel}>Content</Resizable.Panel>
	</Resizable.Group>
</div>
