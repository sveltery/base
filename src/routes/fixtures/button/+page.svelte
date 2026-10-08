<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import ButtonFixture from './ButtonFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={ButtonFixture}
	loadReference={async () => {
		const { mountButtonReference } = await import('./react-reference.js');
		return mountButtonReference;
	}}
/>
