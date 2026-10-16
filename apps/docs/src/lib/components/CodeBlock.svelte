<script lang="ts">
	import { ScrollArea } from '@sveltery/base/scroll-area';
	import CopyButton from './CopyButton.svelte';

	let { html, title }: { html: string; title?: string } = $props();
	const titleId = $props.id();
	let root = $state<HTMLElement>();

	// Base UI's precomputed blocks render the `pre` with these classes.
	const pre = $derived(html.replace('<pre class="', '<pre class="CodeBlockPreInline CodeBlockPre '));
</script>

<figure bind:this={root} class="CodeBlockRoot MdFigure" aria-labelledby={title ? titleId : undefined}>
	{#if title}
		<div class="CodeBlockPanel">
			<div id={titleId} class="CodeBlockPanelTitle">{title}</div>
			<CopyButton text={() => root?.querySelector('pre')?.textContent ?? undefined} />
		</div>
	{/if}
	<ScrollArea.Root class="CodeBlockPreContainer">
		<ScrollArea.Viewport class="ScrollAreaViewport CodeBlockViewport">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- Shiki output, built from repository files. -->
			{@html pre}
		</ScrollArea.Viewport>
		<ScrollArea.Scrollbar class="ScrollAreaScrollbar" orientation="horizontal">
			<ScrollArea.Thumb class="ScrollAreaThumb" />
		</ScrollArea.Scrollbar>
	</ScrollArea.Root>
</figure>
