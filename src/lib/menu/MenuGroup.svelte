<!--
	Groups related menu items with the corresponding label. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/group/MenuGroup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { mergeProps } from '../internal/mergeProps.js';
	import { setMenuGroup } from './context.svelte.js';
	import type { MenuGroupProps, MenuGroupState } from './types.js';

	let { render, children, ...elementProps }: MenuGroupProps = $props();

	let labelId = $state<string | undefined>(undefined);
	setMenuGroup({
		get labelId() {
			return labelId;
		},
		setLabelId(id) {
			labelId = id;
		}
	});

	const partState: MenuGroupState = {};
	const hostProps = $derived(
		mergeProps({ role: 'group' as const, 'aria-labelledby': labelId }, elementProps)
	);
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
