<script lang="ts">
	import { useTabsRootContext } from '../lib/tabs/context.svelte.js';
	import type { TabRecord } from '../lib/tabs/context.svelte.js';

	let { count = $bindable(0) }: { count?: number } = $props();

	const tabs = useTabsRootContext();
	const original = tabs.registerTab.bind(tabs);
	tabs.registerTab = (element: HTMLElement, read: () => TabRecord) => {
		count += 1;
		return original(element, read);
	};
</script>

<span hidden>{count}</span>
