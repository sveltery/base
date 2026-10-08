<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import DialogFixture from './DialogFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={DialogFixture}
	loadReference={async () => {
		const { mountDialogReference } = await import('./react-reference.js');
		return mountDialogReference;
	}}
/>
