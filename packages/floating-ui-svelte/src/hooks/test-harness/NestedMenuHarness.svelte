<script lang="ts">
	import { setFloatingTree } from '../../components/FloatingTree.svelte.js';
	import type { ListOrientation } from '../../utils/listOrientation.js';
	import NestedMenu from './NestedMenu.svelte';

	let { orientation = 'vertical' }: { orientation?: ListOrientation } = $props();

	setFloatingTree();
</script>

<NestedMenu
	label="Edit"
	{orientation}
	entries={['Undo', 'Redo', { label: 'Copy as', entries: ['Text', 'Video'] }, 'Paste']}
/>
