<!--
	An overlay displayed beneath the popup. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/backdrop/ComboboxBackdrop.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useComboboxRoot } from './context.svelte.js';
	import type { ComboboxBackdropProps, ComboboxBackdropState } from './types.js';

	let { render, children, ...elementProps }: ComboboxBackdropProps = $props();

	const store = useComboboxRoot();
	const partState: ComboboxBackdropState = $derived({
		open: store.open,
		transitionStatus: store.transitionStatus
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...getStateAttributesProps({ ...partState, anchorHidden: false }, popupTransitionStateMapping),
		role: 'presentation',
		hidden: store.mounted ? undefined : true,
		style: 'user-select: none; -webkit-user-select: none',
		...elementProps
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
