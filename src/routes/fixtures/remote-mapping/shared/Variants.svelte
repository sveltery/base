<!-- Links to each variant of a fixture. The variant comes from `?v=`. -->
<script lang="ts">
	let { variants }: { variants: string[] } = $props();
</script>

<nav>
	{#each variants as variant (variant)}<a href="?v={variant}">{variant}</a>
	{/each}
</nav>
