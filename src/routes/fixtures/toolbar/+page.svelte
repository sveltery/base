<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import ToolbarFixture from './ToolbarFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={ToolbarFixture}
	loadReference={async () => {
		const { mountToolbarReference } = await import('./react-reference.js');
		return mountToolbarReference;
	}}
/>
