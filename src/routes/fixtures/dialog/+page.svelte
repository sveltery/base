<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import DialogFixture from './DialogFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={DialogFixture}
	loadReference={async () => {
		const { mountDialogReference } = await import('./react-reference.js');
		return mountDialogReference;
	}}
/>

<!-- The internal backdrop is position:fixed. A static popup paints under it, so clicks hit the backdrop. -->
<style>
	:global([data-testid='popup']),
	:global([data-testid='nested-popup']),
	:global([data-testid='parent-popup']),
	:global([data-testid='popup-a']),
	:global([data-testid='popup-b']) {
		position: relative;
		z-index: 1;
	}
</style>
