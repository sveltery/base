<!--
	An accessible label that is automatically associated with its parent group.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/group-label/ComboboxGroupLabel.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useComboboxGroup } from './context.svelte.js';
	import type { ComboboxGroupLabelProps, ComboboxGroupLabelState } from './types.js';

	const uid = $props.id();
	let { id: idProp, render, children, ...elementProps }: ComboboxGroupLabelProps = $props();

	const group = useComboboxGroup();
	const id = $derived(idProp ?? `base-ui-${uid}`);
	const partState: ComboboxGroupLabelState = {};

	$effect.pre(() => {
		const current = id;
		group.labelId = current;
		return () => {
			if (group.labelId === current) group.labelId = undefined;
		};
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		id,
		'aria-hidden': true,
		...elementProps
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
