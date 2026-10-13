<script lang="ts">
	import { setFloatingTree } from '@sveltery/floating-ui-svelte';
	import type { ListOrientation } from '@sveltery/floating-ui-svelte';
	import NestedMenu from './NestedMenu.svelte';

	let { orientation = 'vertical' }: { orientation?: ListOrientation } = $props();

	setFloatingTree();
</script>

<NestedMenu
	label="Edit"
	{orientation}
	entries={['Undo', 'Redo', { label: 'Copy as', entries: ['Text', 'Video'] }, 'Paste']}
/>
