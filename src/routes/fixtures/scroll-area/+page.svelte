<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import ScrollAreaFixture from './ScrollAreaFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={ScrollAreaFixture}
	loadReference={async () => {
		const { mountScrollAreaReference } = await import('./react-reference.js');
		return mountScrollAreaReference;
	}}
/>
