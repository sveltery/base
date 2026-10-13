<!-- Upstream `ListboxFocus` test fixture: an always-open listbox and a button that selects. -->
<script lang="ts">
	import { ListNavigation } from '@sveltery/floating-ui-svelte';
	import { TestFloatingStore } from './TestFloatingStore.svelte.js';

	const labels = ['Apple', 'Blueberry', 'Watermelon', 'Banana'];
	const store = new TestFloatingStore(true);
	const items: Array<HTMLElement | null> = $state([]);
	let activeIndex = $state<number | null>(1);
	let selectedIndex = $state<number | null>(null);

	const nav = new ListNavigation(store, () => ({
		items: () => items,
		activeIndex,
		selectedIndex,
		onNavigate: (index) => (activeIndex = index),
		focusItemOnHover: false
	}));

	function isFocusable(index: number) {
		if (activeIndex !== null) return activeIndex === index;
		if (selectedIndex !== null) return selectedIndex === index;
		return index === 0;
	}
</script>

<button type="button" data-testid="reference" onclick={() => (selectedIndex = 1)}>Select</button>
<div role="listbox" tabindex="-1" bind:this={store.floatingElement} {...nav.floating}>
	{#each labels as label, index (label)}
		<button
			type="button"
			role="option"
			aria-selected={activeIndex === index && selectedIndex === index}
			tabindex={isFocusable(index) ? 0 : -1}
			bind:this={items[index]}
			{...nav.item}
			onclick={(event) => {
				nav.item.onclick?.(event);
				selectedIndex = index;
			}}
		>
			{label}
		</button>
	{/each}
</div>
