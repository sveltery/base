<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import ComboboxFixture from './ComboboxFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={ComboboxFixture}
	loadReference={async () => {
		const { mountComboboxReference } = await import('./react-reference.js');
		return mountComboboxReference;
	}}
/>
