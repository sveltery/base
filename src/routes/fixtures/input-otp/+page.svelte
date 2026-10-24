<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import InputOTPFixture from './InputOTPFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={InputOTPFixture}
	loadReference={async () => {
		const { mountInputOTPReference } = await import('./react-reference.js');
		return mountInputOTPReference;
	}}
/>
