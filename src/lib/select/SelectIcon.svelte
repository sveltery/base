<!--
	An icon that indicates that the trigger button opens a select popup.
	Renders a `<span>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/icon/SelectIcon.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { triggerOpenStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useSelectRoot } from './context.svelte.js';
	import type { SelectIconProps, SelectIconState } from './types.js';

	let { render, children, ...elementProps }: SelectIconProps = $props();

	const store = useSelectRoot();
	const partState: SelectIconState = $derived({ open: store.open });
	const hostProps: HTMLAttributes<HTMLSpanElement> = $derived({
		...getStateAttributesProps(partState, triggerOpenStateMapping),
		'aria-hidden': true,
		...elementProps
	});
</script>

{#snippet arrow()}▼{/snippet}

{#if render}
	{@render render(hostProps, partState, children ?? arrow)}
{:else}
	<span {...hostProps}>{@render (children ?? arrow)()}</span>
{/if}
