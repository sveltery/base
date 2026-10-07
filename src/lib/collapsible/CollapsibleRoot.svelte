<!--
	Groups all parts of the collapsible. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/collapsible/root/CollapsibleRoot.tsx
	and packages/react/src/collapsible/root/useCollapsibleRoot.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { collapsibleStateAttributesMapping } from './attributes.js';
	import { CollapsibleRoot, setCollapsibleRootContext } from './context.svelte.js';
	import type { CollapsibleRootProps, CollapsibleRootState } from './types.js';

	const uid = $props.id();

	let {
		open = $bindable(false),
		disabled = false,
		onOpenChange,
		render,
		children,
		...elementProps
	}: CollapsibleRootProps = $props();

	const collapsible = new CollapsibleRoot(
		() => open,
		(next) => {
			open = next;
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

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, state, content)}
{:else}
	<div {...hostProps}>{@render content()}</div>
{/if}
