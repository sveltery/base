<!--
	Groups related select items with the corresponding label.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/group/SelectGroup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { setSelectGroup } from './context.svelte.js';
	import type { SelectGroupProps, SelectGroupState } from './types.js';

	let { render, children, ...elementProps }: SelectGroupProps = $props();

	const group = $state({ labelId: undefined as string | undefined });
	setSelectGroup(group);
	const partState: SelectGroupState = {};

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		role: 'group',
		'aria-labelledby': group.labelId,
		...elementProps
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
