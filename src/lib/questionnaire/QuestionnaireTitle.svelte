<!--
	The item title. Renders a `<legend>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/components.tsx
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getItem } from './item-state.svelte.js';
	import type { QuestionnaireTitleProps } from './types.js';

	let { render, children, ...rest }: QuestionnaireTitleProps = $props();
	getItem();
</script>

{#if render}
	{@render render(rest, {}, children)}
{:else}
	<legend {...rest}>{@render children?.()}</legend>
{/if}
