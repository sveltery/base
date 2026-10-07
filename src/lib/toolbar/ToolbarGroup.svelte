<!--
	Groups several toolbar items. Renders a `<div>`.
	Derived from Base UI v1.8.0 packages/react/src/toolbar/group/ToolbarGroup.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import {
		setToolbarGroupContext,
		ToolbarGroupContext,
		useToolbarRootContext
	} from './context.svelte.js';
	import type { ToolbarGroupProps, ToolbarGroupState } from './types.js';

	let {
		disabled: disabledProp = false,
		render,
		children,
		...elementProps
	}: ToolbarGroupProps = $props();

	const toolbar = useToolbarRootContext();
	const group = new ToolbarGroupContext(() => toolbar.disabled || disabledProp);
	setToolbarGroupContext(group);

	const disabled = $derived(group.disabled);
	const state: ToolbarGroupState = $derived({
		disabled,
		orientation: toolbar.orientation
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		role: 'group',
		...getStateAttributesProps(state),
		...elementProps
	});
</script>

{#if render}
	{@render render(hostProps, state)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
