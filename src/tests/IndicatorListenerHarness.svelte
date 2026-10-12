<script lang="ts">
	import { untrack } from 'svelte';
	import { CompositeRoot } from '../lib/internal/composite-root.svelte.js';
	import { TabsListModel } from '../lib/tabs/context.svelte.js';

	let { onModel }: { onModel: (model: TabsListModel) => void } = $props();

	const roving = new CompositeRoot({});
	const list = new TabsListModel(roving, () => false);

	$effect(() => {
		untrack(() => onModel?.(list));
	});
</script>
