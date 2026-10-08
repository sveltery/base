<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import ToggleGroupFixture from './ToggleGroupFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={ToggleGroupFixture}
	loadReference={async () => {
		const { mountToggleGroupReference } = await import('./react-reference.js');
		return mountToggleGroupReference;
	}}
/>
