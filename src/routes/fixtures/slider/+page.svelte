<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import SliderFixture from './SliderFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={SliderFixture}
	loadReference={async () => {
		const { mountSliderReference } = await import('./react-reference.js');
		return mountSliderReference;
	}}
/>
