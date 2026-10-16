<!--
	Groups related items with the corresponding label.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/group/ComboboxGroup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { setComboboxGroup, useComboboxRoot } from './context.svelte.js';
	import type { ComboboxGroupProps, ComboboxGroupState } from './types.js';

	let { items, render, children, ...elementProps }: ComboboxGroupProps = $props();

	const store = useComboboxRoot();
	let labelId = $state<string | undefined>(undefined);
	setComboboxGroup({
		get labelId() {
			return labelId;
		},
		set labelId(next) {
			labelId = next;
		},
		get items() {
			return items;
		}
	});
	const partState: ComboboxGroupState = {};

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		// `group` cannot be owned by a `grid`, and a `row` needs a `grid` or `rowgroup` owner.
		role: store.root.grid ? 'rowgroup' : 'group',
		'aria-labelledby': labelId,
		...elementProps
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
