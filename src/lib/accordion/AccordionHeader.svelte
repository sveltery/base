<!--
	A heading that labels the corresponding panel. Renders an `<h3>` element.
	Derived from Base UI v1.8.0 packages/react/src/accordion/header/AccordionHeader.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { accordionStateAttributesMapping } from './attributes.js';
	import { useAccordionItemContext } from './context.svelte.js';
	import type { AccordionHeaderProps } from './types.js';

	let { render, children, ...elementProps }: AccordionHeaderProps = $props();

	const item = useAccordionItemContext();
	const state = $derived(item.state);

	const hostProps: HTMLAttributes<HTMLHeadingElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, accordionStateAttributesMapping)
	});
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<h3 {...hostProps}>{@render children?.()}</h3>
{/if}
