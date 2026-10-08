<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import SwitchFixture from './SwitchFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={SwitchFixture}
	loadReference={async () => {
		const { mountSwitchReference } = await import('./react-reference.js');
		return mountSwitchReference;
	}}
/>
