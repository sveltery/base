<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import FormFixture from './FormFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={FormFixture}
	loadReference={async () => {
		const { mountFormReference } = await import('./react-reference.js');
		return mountFormReference;
	}}
/>
