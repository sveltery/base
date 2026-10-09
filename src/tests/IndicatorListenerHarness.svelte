<script lang="ts">
	import { callPublic } from '../lib/internal/callPublic.js';
	import { CompositeRoot } from '../lib/internal/composite-root.svelte.js';
	import { TabsListModel } from '../lib/tabs/context.svelte.js';

	let { onModel }: { onModel: (model: TabsListModel) => void } = $props();

	const roving = new CompositeRoot({});
	const list = new TabsListModel(roving, () => false);

	$effect(() => {
		callPublic(onModel, list);
	});
</script>
