<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import CheckboxFixture from './CheckboxFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={CheckboxFixture}
	loadReference={async () => {
		const { mountCheckboxReference } = await import('./react-reference.js');
		return mountCheckboxReference;
	}}
/>
