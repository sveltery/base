<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import OverlayFoundationFixture from './OverlayFoundationFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={OverlayFoundationFixture}
	loadReference={async () => {
		const { mountOverlayFoundationReference } = await import('./react-reference.js');
		return mountOverlayFoundationReference;
	}}
/>
