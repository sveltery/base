<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import MessageScrollerFixture from './MessageScrollerFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={MessageScrollerFixture}
	loadReference={async () => {
		const { mountMessageScrollerReference } = await import('./react-reference.js');
		return mountMessageScrollerReference;
	}}
/>
