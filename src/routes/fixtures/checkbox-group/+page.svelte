<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import CheckboxGroupFixture from './CheckboxGroupFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={CheckboxGroupFixture}
	loadReference={async () => {
		const { mountCheckboxGroupReference } = await import('./react-reference.js');
		return mountCheckboxGroupReference;
	}}
/>
