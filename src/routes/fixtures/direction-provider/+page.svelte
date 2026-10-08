<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import DirectionProviderFixture from './DirectionProviderFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={DirectionProviderFixture}
	loadReference={async () => {
		const { mountDirectionProviderReference } = await import('./react-reference.js');
		return mountDirectionProviderReference;
	}}
/>
