<script lang="ts">
	import '#lib/components/website/website.css';
	import { onMount } from 'svelte';
	import { svelteryMark } from '#lib/components/Icons.svelte';

	let { children } = $props();

	let isMac = $state(true);
	onMount(() => {
		isMac = /Mac|iPhone|iPad/.test(navigator.platform);
	});
</script>

<div class="Website p-6 md:px-12 md:py-8">
	<div class="mx-auto grid max-w-[1480px] grid-cols-8 gap-10 md:gap-12">
		<header class="contents">
			<div class="col-start-1 col-end-4">
				<span class="flex" role="img" aria-label="Sveltery Base">{@render svelteryMark(24)}</span>
			</div>
			<nav
				class="col-start-5 col-end-8 flex flex-col gap-2 md:col-end-9 lg:col-end-7"
				aria-label="social links"
			>
				<a class="Link Text sz-1" href="https://github.com/sveltery/base">GitHub</a>
				<a class="Link Text sz-1" href="https://ui.sveltery.dev">Sveltery UI</a>
			</nav>
			<div class="col-start-7 col-end-9 hidden flex-col items-start gap-2 lg:flex">
				<button type="button" class="WebsiteSearchTrigger">
					Search
					<span class="WebsiteSearchTriggerShortcut"
						>({#if isMac}<kbd>⌘</kbd>{:else}<kbd>Ctrl+</kbd>{/if}<kbd>k</kbd>)</span
					>
				</button>
			</div>
		</header>
		<main id="main" class="contents">
			{@render children()}
		</main>
		<div class="col-start-1 col-end-9 lg:col-start-3">
			<div class="Separator" role="separator" aria-hidden="true"></div>
		</div>
		<footer class="contents">
			<div class="col-start-1 col-end-9 md:col-end-3">
				<span class="Text sz-1">© Sveltery Base</span>
			</div>
			<nav
				class="col-start-1 col-end-9 flex flex-col gap-2 md:col-start-3 xl:col-end-7"
				aria-label="social links"
			>
				<a class="Link Text sz-1" href="https://github.com/sveltery/base">GitHub</a>
			</nav>
		</footer>
	</div>
</div>
