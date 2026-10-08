<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import FieldsetFixture from './FieldsetFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={FieldsetFixture}
	loadReference={async () => {
		const { mountFieldsetReference } = await import('./react-reference.js');
		return mountFieldsetReference;
	}}
/>
