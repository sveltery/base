<!--
	Groups all parts of the collapsible. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/collapsible/root/CollapsibleRoot.tsx
	and packages/react/src/collapsible/root/useCollapsibleRoot.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import PartHost from '../internal/PartHost.svelte';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { collapsibleStateAttributesMapping } from './attributes.js';
	import { CollapsibleRoot, setCollapsibleRootContext } from './context.svelte.js';
	import type {
		CollapsibleRootChangeEventDetails,
		CollapsibleRootProps,
		CollapsibleRootState
	} from './types.js';

	const uid = $props.id();

	let {
		open = $bindable(undefined),
		defaultOpen = false,
		disabled = false,
		onOpenChange,
		render,
		children,
		...elementProps
	}: CollapsibleRootProps = $props();

	const controllable = createControllableValue<boolean, CollapsibleRootChangeEventDetails>({
		getProp: () => open,
		setProp: (next) => {
			open = next;
		},
		getDefault: () => defaultOpen
	});

	const collapsible = new CollapsibleRoot(
		() => controllable.value === true,
		(next, details) => {
			controllable.set(next, details);
		},
		() => disabled,
		(next, details) => onOpenChange?.(next, details),
		`base-ui-${uid}`
	);
	setCollapsibleRootContext(collapsible);

	const state: CollapsibleRootState = $derived(collapsible.state);

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, collapsibleStateAttributesMapping)
	});
</script>

<PartHost tag="div" {render} {children} elementProps={hostProps} partState={state} />
