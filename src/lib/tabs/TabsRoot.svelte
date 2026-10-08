<!--
	Groups the tabs and the corresponding panels. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/tabs/root/TabsRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	`defaultValue` is the uncontrolled start and the fallback when a controlled
	value is cleared. Omit `value` and the root owns selection, including
	automatic fallbacks. Pass `value` to hold it.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import PartHost from '../internal/PartHost.svelte';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { tabsStateAttributesMapping } from './attributes.js';
	import { setTabsRootContext, TabsRootModel } from './context.svelte.js';
	import type { TabsRootChangeEventDetails, TabsRootProps, TabsRootState } from './types.js';

	let {
		value = $bindable(undefined),
		defaultValue = 0,
		orientation = 'horizontal',
		onValueChange,
		render,
		children,
		...elementProps
	}: TabsRootProps = $props();

	let tabs: TabsRootModel;
	const controllable = createControllableValue<typeof value, TabsRootChangeEventDetails>({
		getProp: () => value,
		setProp: (next) => {
			value = next;
		},
		getDefault: () => defaultValue,
		onChange(next, details) {
			if (details) {
				onValueChange?.(next ?? null, details);
				return;
			}
			tabs.refineDirection(next ?? null);
		}
	});
	tabs = new TabsRootModel(
		controllable,
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
