<script lang="ts">
	import '../app.css';
	import MobileNav from '#lib/components/MobileNav.svelte';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';

	let { data, children } = $props();
</script>

<header class="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
	<div class="mx-auto flex h-14 max-w-[90rem] items-center gap-2 px-4">
		<MobileNav nav={data.nav} />
		<a href="/" class="font-semibold">Sveltery Base</a>
		<span class="hidden text-sm text-muted sm:inline">Base UI for Svelte</span>
		<div class="ml-auto flex items-center gap-1">
			<a
				href="https://ui.sveltery.dev"
				class="rounded-md px-2 py-1 text-sm text-muted hover:bg-subtle hover:text-fg">Sveltery UI</a
			>
			<a
				href="https://github.com/sveltery/base"
				class="rounded-md px-2 py-1 text-sm text-muted hover:bg-subtle hover:text-fg">GitHub</a
			>
			<ThemeToggle />
		</div>
	</div>
</header>

<div class="mx-auto flex max-w-[90rem]">
	<aside
		class="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-line px-3 py-6 md:block"
	>
		<Sidebar nav={data.nav} />
	</aside>
	<main class="min-w-0 flex-1">
		{@render children()}
	</main>
</div>
