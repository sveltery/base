<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import FieldFixture from './FieldFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={FieldFixture}
	loadReference={async () => {
		const { mountFieldReference } = await import('./react-reference.js');
		return mountFieldReference;
	}}
/>
