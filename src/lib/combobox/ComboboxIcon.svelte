<!--
	An icon that indicates that the trigger button opens the popup.
	Renders a `<span>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/icon/ComboboxIcon.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ComboboxIconProps, ComboboxIconState } from './types.js';

	let { render, children, ...elementProps }: ComboboxIconProps = $props();

	const partState: ComboboxIconState = {};
	const hostProps: HTMLAttributes<HTMLSpanElement> = $derived({
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
