<!--
	Groups the tabs and the corresponding panels. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/tabs/root/TabsRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import PartHost from '../internal/PartHost.svelte';
	import { WrittenReference } from '../internal/written-reference.svelte.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { tabsStateAttributesMapping } from './attributes.js';
	import { setTabsRootContext, TabsRootModel } from './context.svelte.js';
	import type { TabsRootProps, TabsRootState, TabsValue } from './types.js';

	let {
		value = $bindable(),
		orientation = 'horizontal',
		onValueChange,
		render,
		children,
		...elementProps
	}: TabsRootProps = $props();

	const selection = new WrittenReference<TabsValue | null | undefined>(
		() => value,
		(next) => {
			value = next;
		}
	);
	const tabs = new TabsRootModel(
		() => selection.current,
		(next) => selection.set(next),
		() => orientation,
		() => onValueChange
	);
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

<PartHost tag="div" {render} {children} elementProps={hostProps} partState={state} />
