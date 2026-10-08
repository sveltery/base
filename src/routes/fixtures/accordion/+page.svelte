<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import AccordionFixture from './AccordionFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={AccordionFixture}
	loadReference={async () => {
		const { mountAccordionReference } = await import('./react-reference.js');
		return mountAccordionReference;
	}}
/>
