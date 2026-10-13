<!--
	Upstream `Combobox`, `ComboboxWithElementsRef` and `App1` in useTypeahead.test.tsx.
	`input` is a combobox input. `within` is a combobox that holds the focusable input.
	`elements` also renders the options and passes their elements.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { ClickInteraction } from '@sveltery/floating-ui-svelte';
	import { Typeahead } from '@sveltery/floating-ui-svelte';
	import { mergeProps } from './mergeProps.js';
	import { TestFloatingStore } from './TestFloatingStore.svelte.js';

	let {
		list = ['one', 'two', 'three'],
		open,
		variant = 'input',
		hiddenIndices = [],
		disabledIndices,
		onMatch,
		onTyping
	}: {
		list?: string[];
		open?: boolean;
		variant?: 'input' | 'within' | 'elements';
		hiddenIndices?: number[];
		disabledIndices?: number[];
		onMatch?: (index: number, event: KeyboardEvent) => void;
		onTyping?: (typing: boolean) => void;
	} = $props();

	const store = new TestFloatingStore(true, false, () => open);
	const elements: Array<HTMLElement | null> = $state([]);
	const labels = untrack(() => list);
	let activeIndex = $state<number | null>(null);
	let input = $state<HTMLInputElement | null>(null);

	const click = new ClickInteraction(store, () => ({ enabled: false }));
	const typeahead = new Typeahead(store, () => ({
		labels: () => labels,
		elements: variant === 'elements' ? () => elements : undefined,
		activeIndex,
		onMatch(index, event) {
			activeIndex = index;
			onMatch?.(index, event);
		},
		onTyping,
		disabledIndices
	}));

	const referenceProps = $derived(mergeProps(typeahead.reference, click.reference));
</script>

{#if variant === 'within'}
	<div
		role="combobox"
		aria-controls="listbox"
		aria-expanded={store.isOpen()}
		tabindex="-1"
		bind:this={store.domReferenceElement}
		{...referenceProps}
		onclick={() => input?.focus()}
	>
		<input readonly bind:this={input} />
	</div>
{:else}
	<input
		role="combobox"
		aria-controls="listbox"
		aria-expanded={store.isOpen()}
		bind:this={store.domReferenceElement}
		{...referenceProps}
	/>
{/if}
{#if store.isOpen()}
	<div role="listbox" id="listbox" bind:this={store.floatingElement} {...typeahead.floating}>
		{#if variant !== 'input'}
			{#each labels as label, index (label)}
				<div
					role="option"
					tabindex={index === activeIndex ? 0 : -1}
					aria-selected={index === activeIndex}
					style={hiddenIndices.includes(index) ? 'display: none' : undefined}
					bind:this={elements[index]}
				>
					{label}
				</div>
			{/each}
		{/if}
	</div>
{/if}
