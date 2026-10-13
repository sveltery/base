<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import TooltipFixture from './TooltipFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={TooltipFixture}
	loadReference={async () => {
		const { mountTooltipReference } = await import('./react-reference.js');
		return mountTooltipReference;
	}}
/>
