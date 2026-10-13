<script lang="ts">
	let { data } = $props();
	const components = $derived(
		data.nav.find((section) => section.title === 'Components')?.pages ?? []
	);
</script>

<svelte:head>
	<title>Sveltery Base</title>
	<meta
		name="description"
		content="Unstyled, accessible Svelte 5 components ported from Base UI."
	/>
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<h1 class="text-4xl font-semibold tracking-tight">Unstyled UI components for Svelte</h1>
	<p class="mt-4 text-lg text-muted">
		Sveltery Base is a Svelte 5 port of Base UI. Its components handle accessibility, focus,
		keyboard interaction, and form state. You bring the styles.
	</p>
	<div class="mt-8 flex gap-3">
		<a href="/overview/quick-start" class="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg"
			>Quick start</a
		>
		<a
			href="/handbook/styling"
			class="rounded-md border border-line px-4 py-2 text-sm font-medium hover:bg-subtle">Styling</a
		>
	</div>
	<h2 class="mt-16 text-sm font-medium text-muted">Components</h2>
	<ul class="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
		{#each components as item (item.href)}
			<li><a href={item.href} class="text-sm hover:underline">{item.title}</a></li>
		{/each}
	</ul>
</div>
