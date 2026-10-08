<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import SeparatorFixture from './SeparatorFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={SeparatorFixture}
	loadReference={async () => {
		const { mountSeparatorReference } = await import('./react-reference.js');
		return mountSeparatorReference;
	}}
/>
