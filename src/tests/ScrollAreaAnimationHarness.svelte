<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { ScrollArea } from '#lib';

	let { setup }: { setup: Attachment<HTMLElement> } = $props();
</script>

<ScrollArea.Root data-testid="root" style="width: 100px; height: 100px">
	<ScrollArea.Viewport data-testid="viewport" style="width: 100%; height: 100%" {@attach setup} />
	<ScrollArea.Scrollbar orientation="horizontal" keepMounted>
		<ScrollArea.Thumb />
	</ScrollArea.Scrollbar>
</ScrollArea.Root>
