<script lang="ts">
	import { useTabsRootContext } from '../lib/tabs/context.svelte.js';
	import type { TabsValue } from '../lib/tabs/types.js';

	let { count = $bindable(0) }: { count?: number } = $props();

	const tabs = useTabsRootContext();
	const original = tabs.registerTab.bind(tabs);
	tabs.registerTab = (element: HTMLElement, value: TabsValue, disabled: boolean, id: string) => {
		count += 1;
		return original(element, value, disabled, id);
	};
</script>
