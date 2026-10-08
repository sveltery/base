<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import AvatarFixture from './AvatarFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={AvatarFixture}
	loadReference={async () => {
		const { mountAvatarReference } = await import('./react-reference.js');
		return mountAvatarReference;
	}}
/>
