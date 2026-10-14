<script lang="ts">
	import DismissNode from './DismissNode.svelte';
</script>

<DismissNode testId="outer" open portaled>
	<DismissNode testId="inner" portaled freshTree>
		<button>test button</button>
	</DismissNode>
</DismissNode>
