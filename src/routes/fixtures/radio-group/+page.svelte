<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import RadioGroupFixture from './RadioGroupFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={RadioGroupFixture}
	loadReference={async () => {
		const { mountRadioGroupReference } = await import('./react-reference.js');
		return mountRadioGroupReference;
	}}
/>
