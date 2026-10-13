<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import NavigationMenuFixture from './NavigationMenuFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={NavigationMenuFixture}
	loadReference={async () => {
		const { mountNavigationMenuReference } = await import('./react-reference.js');
		return mountNavigationMenuReference;
	}}
/>
