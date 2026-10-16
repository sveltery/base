<script lang="ts">
	import { page } from '$app/state';
	import Subtitle from '#lib/components/Subtitle.svelte';
	import Toc from '#lib/components/Toc.svelte';
	import { plainText } from '../../../../../markdown/reference.ts';
	import '#lib/docs/css/index.css';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.metadata.title} · Sveltery Base</title>
	<meta name="description" content={plainText(data.metadata.description)} />
</svelte:head>

<Toc title={data.metadata.title} toc={data.metadata.toc} />
<div class="QuickNavContent">
	<h1 class="MdH1">{data.metadata.title}</h1>
	<Subtitle text={data.metadata.description} href={page.url.pathname} />
	<data.content />
</div>

<style>
	.QuickNavContent {
		padding-top: 1.5rem;
		padding-bottom: 4rem;

		@media (width >= 64rem) {
			padding-top: 0;
		}
	}
</style>
