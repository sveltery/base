<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import MeterFixture from './MeterFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={MeterFixture}
	loadReference={async () => {
		const { mountMeterReference } = await import('./react-reference.js');
		return mountMeterReference;
	}}
/>
