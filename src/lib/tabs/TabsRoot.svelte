<!--
	Groups the tabs and the corresponding panels. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/tabs/root/TabsRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	There is no defaultValue and no locked controlled mode. Omit `value` and the
	root owns selection, including automatic fallbacks. Pass `value` to hold it.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { tabsStateAttributesMapping } from './attributes.js';
	import { setTabsRootContext, TabsRootModel } from './context.svelte.js';
	import type { TabsRootProps, TabsRootState } from './types.js';

	let {
		value = $bindable(undefined),
		orientation = 'horizontal',
		onValueChange,
		render,
		children,
		...elementProps
	}: TabsRootProps = $props();

	// Captured once. A later click must not turn an omitted value into a parent-owned one.
	const parentOwned = value !== undefined;
	const tabs = new TabsRootModel(parentOwned, parentOwned ? (value ?? null) : 0);
	tabs.readOrientation = () => orientation;
	tabs.readOnValueChange = () => onValueChange;
	tabs.readExternal = () => (value == null ? null : value);
	tabs.writeValue = (next) => {
		value = next;
	};
	tabs.publish = (next) => {
		tabs.value = next;
		value = next;
	};
	setTabsRootContext(tabs);

	const state: TabsRootState = $derived({
		orientation: tabs.orientation,
		tabActivationDirection: tabs.tabActivationDirection
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...getStateAttributesProps(state, tabsStateAttributesMapping),
		...elementProps
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, state, content)}
{:else}
	<div {...hostProps}>{@render content()}</div>
{/if}
