<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import InputFixture from './InputFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={InputFixture}
	loadReference={async () => {
		const { mountInputReference } = await import('./react-reference.js');
		return mountInputReference;
	}}
/>
