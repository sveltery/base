<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import RadioFixture from './RadioFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={RadioFixture}
	loadReference={async () => {
		const { mountRadioReference } = await import('./react-reference.js');
		return mountRadioReference;
	}}
/>
