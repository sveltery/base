<!-- Upstream `App` in useListNavigation.test.tsx: a click reference and a three-item menu. -->
<script lang="ts">
	import { ClickInteraction } from '../useClick.svelte.js';
	import { ListNavigation, type UseListNavigationProps } from '../useListNavigation.svelte.js';
	import { mergeProps } from './mergeProps.js';
	import { TestFloatingStore } from './TestFloatingStore.svelte.js';

	type Options = Omit<Partial<UseListNavigationProps>, 'items' | 'activeIndex'>;

	let {
		options = {},
		disableFirstItem = false,
		hideFirstItem = false,
		firstItemStyle,
		reference = 'button'
	}: {
		options?: Options;
		disableFirstItem?: boolean;
		hideFirstItem?: boolean;
		firstItemStyle?: string;
		reference?: 'button' | 'combobox';
	} = $props();

	const store = new TestFloatingStore();
	const items: Array<HTMLElement | null> = $state([]);
	let activeIndex = $state<number | null>(null);

	const click = new ClickInteraction(store);
	const nav = new ListNavigation(store, () => ({
		...options,
		items: () => items,
		activeIndex,
		onNavigate(index, event) {
			activeIndex = index;
			options.onNavigate?.(index, event);
		}
	}));

	const referenceProps = $derived(mergeProps(click.reference, nav.reference));

	function isDisabled(index: number) {
		const disabled = options.disabledIndices;
		if (disableFirstItem && index === 0) return true;
		return typeof disabled === 'function' ? disabled(index) : (disabled?.includes(index) ?? false);
	}
</script>

{#if reference === 'combobox'}
	<input
		role="combobox"
		aria-controls="menu"
		aria-expanded={store.open}
		bind:this={store.domReferenceElement}
		{...referenceProps}
	/>
{:else}
	<button type="button" bind:this={store.domReferenceElement} {...referenceProps}>Open</button>
{/if}
{#if store.open}
	<div role="menu" id="menu" tabindex="-1" bind:this={store.floatingElement} {...nav.floating}>
		<ul>
			{#each ['one', 'two', 'three'] as label, index (label)}
				<!-- svelte-ignore a11y_role_supports_aria_props_implicit -->
				<li
					data-testid="item-{index}"
					aria-selected={activeIndex === index}
					style={index === 0 ? (hideFirstItem ? 'display: none' : firstItemStyle) : undefined}
					tabindex="-1"
					aria-disabled={isDisabled(index) ? 'true' : undefined}
					bind:this={items[index]}
					{...nav.item}
				>
					{label}
				</li>
			{/each}
		</ul>
	</div>
{/if}
