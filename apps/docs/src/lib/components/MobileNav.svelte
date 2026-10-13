<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { Dialog } from '@sveltery/base/dialog';
	import type { NavSection } from '#lib/docs/types.ts';
	import Sidebar from './Sidebar.svelte';

	let { nav }: { nav: NavSection[] } = $props();
	let open = $state(false);

	afterNavigate(() => {
		open = false;
	});
</script>

<!-- The site's own menu uses the library's Dialog. -->
<Dialog.Root bind:open>
	<Dialog.Trigger class="rounded-md px-2 py-1 text-sm hover:bg-subtle md:hidden"
		>Menu</Dialog.Trigger
	>
	<Dialog.Portal>
		<Dialog.Backdrop
			class="fixed inset-0 bg-black/30 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
		/>
		<Dialog.Popup
			class="fixed inset-y-0 left-0 w-72 overflow-y-auto border-r border-line bg-bg p-4 transition-transform data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full"
		>
			<div class="mb-4 flex items-center justify-between">
				<Dialog.Title class="text-sm font-medium">Sveltery Base</Dialog.Title>
				<Dialog.Close class="rounded-md px-2 py-1 text-sm hover:bg-subtle">Close</Dialog.Close>
			</div>
			<Sidebar {nav} />
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
