<script lang="ts">
	import type { Component } from 'svelte';
	import CopyButton from './CopyButton.svelte';

	// `component` is the fence's code compiled as its own file. The markdown pipeline passes it.
	let {
		id,
		component: Example,
		html,
		raw
	}: { id: string; component: Component; html: string; raw: string } = $props();
	let expanded = $state(false);
</script>

<div class="not-typeset my-6 overflow-hidden rounded-lg border border-line" data-demo={id}>
	<div class="flex min-h-48 items-center justify-center bg-canvas px-6 py-12">
		<Example />
	</div>
	<div class="code-block relative border-t border-line">
		<div
			class={expanded ? 'max-h-[32rem] overflow-auto' : 'max-h-28 overflow-hidden'}
			inert={!expanded}
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output, built from repository files. -->
			{@html html}
		</div>
		{#if expanded}
			<CopyButton value={raw} />
		{/if}
		<div
			class={[
				'flex justify-center',
				expanded
					? 'border-t border-line py-2'
					: 'absolute inset-x-0 bottom-0 bg-linear-to-t from-code pt-8 pb-3'
			]}
		>
			<button
				type="button"
				aria-expanded={expanded}
				class="rounded-md border border-line bg-bg px-3 py-1 text-sm hover:bg-subtle"
				onclick={() => (expanded = !expanded)}
			>
				{expanded ? 'Hide code' : 'Show code'}
			</button>
		</div>
	</div>
</div>
