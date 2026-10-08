<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import ProgressFixture from './ProgressFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={ProgressFixture}
	loadReference={async () => {
		const { mountProgressReference } = await import('./react-reference.js');
		return mountProgressReference;
	}}
/>
