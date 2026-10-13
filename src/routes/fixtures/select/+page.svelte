<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import SelectFixture from './SelectFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={SelectFixture}
	loadReference={async () => {
		const { mountSelectReference } = await import('./react-reference.js');
		return mountSelectReference;
	}}
/>
