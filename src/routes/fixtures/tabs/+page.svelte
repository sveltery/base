<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import TabsFixture from './TabsFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={TabsFixture}
	loadReference={async () => {
		const { mountTabsReference } = await import('./react-reference.js');
		return mountTabsReference;
	}}
/>
