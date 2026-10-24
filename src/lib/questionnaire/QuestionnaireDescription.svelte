<!--
	Supporting text that describes the item. Renders a `<p>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/components.tsx
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getItem } from './item-state.svelte.js';
	import type { QuestionnaireDescriptionProps } from './types.js';

	const generatedId = $props.id();
	let { id: idProp, render, children, ...rest }: QuestionnaireDescriptionProps = $props();
	const item = getItem();
	const id = $derived(idProp ?? generatedId);
	$effect(() => item.describe(id));
	const attributes = $derived({ id, ...rest });
</script>

{#if render}
	{@render render(attributes, {}, children)}
{:else}
	<p {...attributes}>{@render children?.()}</p>
{/if}
