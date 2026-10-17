<script lang="ts">
	import { page } from '$app/state';
	import WebsiteLayout from './(website)/+layout.svelte';
</script>

<!-- Base UI's `global-not-found.tsx`, inside the website layout. -->
<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<WebsiteLayout data={{ nav: page.data.nav }}>
	<section class="contents">
		<h1 class="Text sz-3 md:sz-4 col-start-1 col-end-9 xl:col-end-5">
			{page.status === 404 ? 'Page not found' : page.error?.message}
		</h1>
		{#if page.status === 404}
			<div class="col-start-1 col-end-9">
				<p class="Text sz-2">
					This page couldn't be found. Please return to the
					<a class="Link" href="/overview/quick-start">docs</a> or create a corresponding issue on
					<a class="Link" href="https://github.com/sveltery/base">GitHub</a>.
				</p>
			</div>
		{/if}
	</section>
</WebsiteLayout>
