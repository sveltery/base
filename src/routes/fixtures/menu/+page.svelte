<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import MenuFixture from './MenuFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={MenuFixture}
	loadReference={async () => {
		const { mountMenuReference } = await import('./react-reference.js');
		return mountMenuReference;
	}}
/>
