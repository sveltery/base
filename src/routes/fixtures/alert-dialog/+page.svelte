<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import AlertDialogFixture from './AlertDialogFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={AlertDialogFixture}
	loadReference={async () => {
		const { mountAlertDialogReference } = await import('./react-reference.js');
		return mountAlertDialogReference;
	}}
/>

<!-- The internal backdrop is position:fixed. A static popup paints under it, so clicks hit the backdrop. -->
<style>
	:global([data-testid='popup']),
	:global([data-testid='parent-popup']) {
		position: relative;
		z-index: 1;
	}
</style>
