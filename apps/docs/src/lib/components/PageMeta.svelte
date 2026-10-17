<script lang="ts">
	import { page } from '$app/state';
	import { SITE } from '#lib/docs/links.ts';

	// Base UI's `metadata` exports: the docs layout's article tags and the website's, each with its
	// route group's Open Graph image.
	let {
		title,
		description,
		group
	}: { title: string; description?: string; group: 'docs' | 'website' } = $props();

	const url = $derived(`${SITE}${page.url.pathname === '/' ? '' : page.url.pathname}`);
	const image = $derived(`${SITE}/og/${group}.png`);
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
	<link rel="canonical" href={url} />
	<meta property="og:title" content={title} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:url" content={url} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:ttl" content="604800" />
	<meta property="og:image" content={image} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	{#if group === 'docs'}
		<meta property="og:type" content="article" />
		<meta property="article:author" content={SITE} />
	{:else}
		<meta property="og:type" content="website" />
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}
	<meta name="twitter:image" content={image} />
</svelte:head>
