<script lang="ts">
	import { onMount } from 'svelte';

	let dark = $state(false);

	// app.html picks the theme before first paint. The button reads it once the page is interactive.
	onMount(() => {
		dark = document.documentElement.classList.contains('dark');
	});

	function toggle() {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
		try {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		} catch {
			// Storage can be blocked. The choice then lasts until the page reloads.
		}
	}
</script>

<button
	type="button"
	class="rounded-md px-2 py-1 text-sm text-muted hover:bg-subtle hover:text-fg"
	aria-label={dark ? 'Use light theme' : 'Use dark theme'}
	onclick={toggle}
>
	{dark ? 'Light' : 'Dark'}
</button>
