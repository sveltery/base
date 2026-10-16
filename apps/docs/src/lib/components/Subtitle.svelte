<script lang="ts">
	import { inlineMarkdown } from '../../../markdown/reference.ts';
	import { sourceUrl } from '#lib/docs/links.ts';
	import { markdownIcon } from './DocIcons.svelte';
	import { githubIcon } from './Icons.svelte';

	let { text, href }: { text: string; href: string } = $props();
	const source = $derived(sourceUrl(href));
</script>

<svelte:head>
	<link rel="alternate" type="text/markdown" href="{href}.md" />
</svelte:head>

<div class="Subtitle">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- the page's own front matter, escaped by inlineMarkdown. -->
	<p>{@html inlineMarkdown(text)}</p>
	<div class="SubtitleLinks">
		<a
			href="{href}.md"
			class="SubtitleLink"
			aria-label="View markdown source"
			rel="alternate"
			type="text/markdown"
			data-sveltekit-reload
		>
			<span class="SubtitleLinkText">{@render markdownIcon()}View as Markdown</span>
		</a>
		{#if source}
			<a
				href={source}
				class="SubtitleLink"
				aria-label="View source on GitHub"
				target="_blank"
				rel="noopener noreferrer"
			>
				<span class="SubtitleLinkText">{@render githubIcon()}View source</span>
			</a>
		{/if}
	</div>
</div>
