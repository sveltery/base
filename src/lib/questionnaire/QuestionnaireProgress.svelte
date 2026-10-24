<!--
	Shows the position of the active item among the enabled items. Renders a `<div>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/components.tsx
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getRoot } from './root-state.svelte.js';
	import type { QuestionnaireProgressProps } from './types.js';
	import { dataAttributes } from './utils.js';

	let { render, children, ...rest }: QuestionnaireProgressProps = $props();

	const root = getRoot();
	const state = $derived(root.state);
	const label = $derived(state.total ? `Question ${state.current} of ${state.total}` : undefined);
	const attributes = $derived({
		'aria-label': 'Questionnaire progress',
		'aria-live': 'polite' as const,
		'aria-valuemax': state.total || undefined,
		'aria-valuemin': state.total ? 1 : undefined,
		'aria-valuenow': state.total ? state.current : undefined,
		'aria-valuetext': label,
		role: 'progressbar',
		...dataAttributes(state),
		...rest
	});
</script>

{#snippet fallback()}{label}{/snippet}
{#if render}
	{@render render(attributes, state, children ?? fallback)}
{:else}
	<div {...attributes}>{@render (children ?? fallback)()}</div>
{/if}
