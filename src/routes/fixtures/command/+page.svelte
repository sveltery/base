<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import CommandFixture from './CommandFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={CommandFixture}
	loadReference={async () => {
		const { mountCommandReference } = await import('./react-reference.js');
		return mountCommandReference;
	}}
/>
