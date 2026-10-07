<script lang="ts">
	import { ScrollArea } from '#lib';
	import type { ScrollAreaCase } from './cases.js';

	let { scenario }: { scenario: ScrollAreaCase } = $props();

	const overflowing = $derived(scenario !== 'none');
	const rtl = $derived(scenario === 'rtl');
</script>

<ScrollArea.Root
	data-testid="root"
	style="width: 200px; height: 200px{rtl ? '; direction: rtl' : ''}"
>
	<ScrollArea.Viewport data-testid="viewport" style="width: 100%; height: 100%">
		<div style={overflowing ? 'width: 1000px; height: 1000px' : 'width: 40px; height: 40px'}></div>
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar orientation="vertical" data-testid="scrollbar-y">
		<ScrollArea.Thumb />
	</ScrollArea.Scrollbar>
	<ScrollArea.Scrollbar orientation="horizontal" data-testid="scrollbar-x">
		<ScrollArea.Thumb />
	</ScrollArea.Scrollbar>
	<ScrollArea.Corner data-testid="corner" />
</ScrollArea.Root>
