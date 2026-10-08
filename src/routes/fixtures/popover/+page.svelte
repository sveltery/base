<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import PopoverFixture from './PopoverFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={PopoverFixture}
	loadReference={async () => {
		const { mountPopoverReference } = await import('./react-reference.js');
		return mountPopoverReference;
	}}
/>
