<!-- Upstream `Autocomplete` in useListNavigation.test.tsx: a virtual list under a text input. -->
<script lang="ts">
	import { DismissInteraction } from '../useDismiss.svelte.js';
	import { ListNavigation } from '../useListNavigation.svelte.js';
	import { mergeProps } from './mergeProps.js';
	import { TestFloatingStore } from './TestFloatingStore.svelte.js';

	const data = ['a', 'ab', 'abc', 'abcd'];
	const store = new TestFloatingStore();
	const items: Array<HTMLElement | null> = $state([]);
	let activeIndex = $state<number | null>(null);
	let inputValue = $state('');

	const dismiss = new DismissInteraction(store);
	const nav = new ListNavigation(store, () => ({
		items: () => items,
		activeIndex,
		onNavigate: (index) => (activeIndex = index),
		virtual: true,
		loopFocus: true
	}));

	const filtered = $derived(
		data.filter((item) => item.toLowerCase().startsWith(inputValue.toLowerCase()))
	);
	const referenceProps = $derived(mergeProps(dismiss.reference, nav.reference));

	function oninput(event: Event & { currentTarget: HTMLInputElement }) {
		inputValue = event.currentTarget.value;
		if (inputValue) {
			activeIndex = null;
			store.open = true;
		} else {
			store.open = false;
		}
	}
</script>

<input
	data-testid="reference"
	aria-autocomplete="list"
	value={inputValue}
	bind:this={store.domReferenceElement}
	{...referenceProps}
	{oninput}
/>
{#if store.open}
	<div data-testid="floating" bind:this={store.floatingElement} {...nav.floating}>
		<ul>
			{#each filtered as item, index (item)}
				<li bind:this={items[index]} {...nav.item}>{item}</li>
			{/each}
		</ul>
	</div>
{/if}
<div data-testid="active-index">{activeIndex}</div>
