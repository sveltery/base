<!--
	A row of items in a grid list. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/row/ComboboxRow.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { setComboboxRow } from './context.svelte.js';
	import type { ComboboxRowProps, ComboboxRowState } from './types.js';

	let { render, children, ...elementProps }: ComboboxRowProps = $props();

	setComboboxRow(true);
	const partState: ComboboxRowState = {};
	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({ role: 'row', ...elementProps });
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
