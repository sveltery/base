<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import MenubarFixture from './MenubarFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={MenubarFixture}
	loadReference={async () => {
		const { mountMenubarReference } = await import('./react-reference.js');
		return mountMenubarReference;
	}}
/>
