<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import PreviewCardFixture from './PreviewCardFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={PreviewCardFixture}
	loadReference={async () => {
		const { mountPreviewCardReference } = await import('./react-reference.js');
		return mountPreviewCardReference;
	}}
/>
