<!--
	A progress bar for items that are still loading. Renders a `<div>` element.
	Derived from cmdk v1.1.1 cmdk/src/index.tsx (commit dd2250ed608443e8f32bafc5fa2d1d07a3746aa3).
	MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { cmdk } from './utils.js';
	import PartAnchor from './PartAnchor.svelte';
	import { usePart, type Part } from './parts.svelte.js';
	import { getCommand } from './root-state.svelte.js';
	import type { CommandLoadingProps } from './types.js';

	let { progress, label = 'Loading...', children, ...rest }: CommandLoadingProps = $props();

	const anchor = $props.id();
	const root = getCommand();
	const part: Part = { anchor, sequence: root.sequence(), kind: 'other', view };
	const container = usePart(root, part);
</script>

{#snippet view()}
	<div
		{...rest}
		{...cmdk.loading}
		role="progressbar"
		aria-valuenow={progress}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-label={label}
	>
		<div aria-hidden="true">{@render children?.()}</div>
	</div>
{/snippet}

<PartAnchor {part} />{#if !container}{@render view()}{/if}
