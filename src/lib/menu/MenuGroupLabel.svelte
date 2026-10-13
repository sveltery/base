<!--
	An accessible label that is associated with its parent group. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/group-label/MenuGroupLabel.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { mergeProps } from '../internal/mergeProps.js';
	import { useMenuGroup } from './context.svelte.js';
	import type { MenuGroupLabelProps, MenuGroupLabelState } from './types.js';

	let { id, render, children, ...elementProps }: MenuGroupLabelProps = $props();

	const uid = $props.id();
	const labelId = $derived(id ?? `base-ui-${uid}`);
	const group = useMenuGroup();

	$effect(() => {
		const current = labelId;
		group.setLabelId(current);
		return () => {
			if (group.labelId === current) group.setLabelId(undefined);
		};
	});

	const partState: MenuGroupLabelState = {};
	const hostProps = $derived(
		mergeProps({ id: labelId, 'aria-hidden': true as const }, elementProps)
	);
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
