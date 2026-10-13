<script lang="ts">
	import type { UseDismissProps } from '../useDismiss.svelte.js';
	import DismissNode from './DismissNode.svelte';

	let { outer, inner }: { outer?: UseDismissProps['bubbles']; inner?: UseDismissProps['bubbles'] } =
		$props();
</script>

<DismissNode testId="outer" open bubbles={outer}>
	<DismissNode testId="inner" bubbles={inner}>
		<button>test button</button>
	</DismissNode>
</DismissNode>
