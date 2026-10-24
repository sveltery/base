<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import ResizableFixture from './ResizableFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={ResizableFixture}
	loadReference={async () => {
		const { mountResizableReference } = await import('./react-reference.js');
		return mountResizableReference;
	}}
/>
