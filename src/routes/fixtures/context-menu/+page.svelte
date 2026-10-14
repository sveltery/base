<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import ContextMenuFixture from './ContextMenuFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={ContextMenuFixture}
	loadReference={async () => {
		const { mountContextMenuReference } = await import('./react-reference.js');
		return mountContextMenuReference;
	}}
/>
