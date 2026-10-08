<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import CSPProviderFixture from './CSPProviderFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={CSPProviderFixture}
	loadReference={async () => {
		const { mountCSPProviderReference } = await import('./react-reference.js');
		return mountCSPProviderReference;
	}}
/>
