<!--
	Shows the key that selects a choice. Renders a `<span>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/components.tsx
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getChoice } from './item-state.svelte.js';
	import type { QuestionnaireChoiceShortcutProps } from './types.js';
	import { dataAttributes } from './utils.js';

	let { render, children, ...rest }: QuestionnaireChoiceShortcutProps = $props();
	const choice = getChoice();
	const state = $derived({ shortcut: choice.shortcut });
	const attributes = $derived({
		'aria-hidden': true,
		hidden: state.shortcut === null,
		...dataAttributes(state),
		...rest
	});
</script>

{#snippet fallback()}{state.shortcut}{/snippet}
{#if render}
	{@render render(attributes, state, children ?? fallback)}
{:else}
	<span {...attributes}>{@render (children ?? fallback)()}</span>
{/if}
