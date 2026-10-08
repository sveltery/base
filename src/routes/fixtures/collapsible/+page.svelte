<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import CollapsibleFixture from './CollapsibleFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={CollapsibleFixture}
	loadReference={async () => {
		const { mountCollapsibleReference } = await import('./react-reference.js');
		return mountCollapsibleReference;
	}}
/>
