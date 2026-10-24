<!--
	Groups the answers of an item. Renders a `<div>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/components.tsx
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getItem } from './item-state.svelte.js';
	import type { QuestionnaireChoicesProps } from './types.js';
	import { dataAttributes } from './utils.js';

	let { render, children, ...rest }: QuestionnaireChoicesProps = $props();
	const item = getItem();
	const state = $derived({ shortcuts: item.root.shortcuts });
	const attributes = $derived({ ...dataAttributes(state), ...rest });
</script>

{#if render}
	{@render render(attributes, state, children)}
{:else}
	<div {...attributes}>{@render children?.()}</div>
{/if}
