<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import ToggleFixture from './ToggleFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={ToggleFixture}
	loadReference={async () => {
		const { mountToggleReference } = await import('./react-reference.js');
		return mountToggleReference;
	}}
/>
