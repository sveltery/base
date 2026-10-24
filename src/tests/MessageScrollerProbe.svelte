<script lang="ts">
	import { untrack } from 'svelte';
	import { getMessageScroller, type MessageScrollerController } from '#lib';

	let {
		capture,
		restore,
		onscrollable
	}: {
		capture: (scroller: MessageScrollerController) => void;
		restore?: string;
		onscrollable: () => void;
	} = $props();
	const scroller = getMessageScroller();
	untrack(() => capture(scroller));
	$effect(() => {
		void scroller.scrollable;
		onscrollable();
	});
	$effect(() => {
		if (restore) scroller.scrollToMessage(restore);
	});
</script>
