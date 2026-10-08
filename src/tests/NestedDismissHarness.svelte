<script lang="ts">
	import { setFloatingTree } from '#lib/internal/floating-ui/index.js';
	import { createDismissPopup } from './dismiss-popup.svelte.js';
	import NestedDismissChild from './NestedDismissChild.svelte';

	setFloatingTree();

	const popup = createDismissPopup('parent-popup');
</script>

<div
	data-testid="parent"
	data-open={popup.store.open ? '' : undefined}
	{@attach popup.bindFloating}
>
	<button type="button">Parent</button>
	{#if popup.store.mounted}
		<NestedDismissChild />
	{/if}
</div>
