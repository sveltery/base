<script lang="ts">
	import { onMount } from 'svelte';
	import type { NavSection } from '#lib/docs/types.ts';
	import MobileNav from '../MobileNav.svelte';
	import { DocsSearch, loadSearchIndex } from './search.svelte.ts';
	import SearchDialog from './SearchDialog.svelte';

	let {
		nav,
		desktopTriggerClass,
		mobileTriggerClass
	}: { nav: NavSection[]; desktopTriggerClass: string; mobileTriggerClass: string } = $props();

	const search = new DocsSearch();
	let desktopOpen = $state(false);
	let mobileOpen = $state(false);
	let focusMobileSearch = $state(false);
	let isMac = $state(true);

	onMount(() => {
		isMac = /Mac|iPhone|iPad/.test(navigator.platform);
		// Builds the index shortly after hydration, so the first open already lists every page.
		const warmup = setTimeout(() => search.activate().catch(() => {}), 250);
		return () => clearTimeout(warmup);
	});

	function onkeydown(event: KeyboardEvent) {
		if (event.defaultPrevented) return;
		if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
		event.preventDefault();
		event.stopPropagation();
		void loadSearchIndex().catch(() => {});
		// The shortcut opens whichever trigger the layout shows.
		const desktop = document.querySelector(`.${desktopTriggerClass.split(' ').pop()}`);
		if (desktop?.getClientRects().length) {
			desktopOpen = true;
		} else {
			focusMobileSearch = true;
			mobileOpen = true;
		}
	}
</script>

<svelte:window onkeydowncapture={onkeydown} />

<SearchDialog {search} bind:open={desktopOpen} triggerClass={desktopTriggerClass} {isMac} />
<MobileNav
	{nav}
	triggerClass={mobileTriggerClass}
	bind:open={
		() => mobileOpen,
		(next) => {
			mobileOpen = next;
			if (!next) focusMobileSearch = false;
		}
	}
	focusSearch={focusMobileSearch}
/>
