<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import NumberFieldFixture from './NumberFieldFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={NumberFieldFixture}
	loadReference={async () => {
		const { mountNumberFieldReference } = await import('./react-reference.js');
		return mountNumberFieldReference;
	}}
/>
