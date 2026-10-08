<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import OTPFieldFixture from './OTPFieldFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={OTPFieldFixture}
	loadReference={async () => {
		const { mountOTPFieldReference } = await import('./react-reference.js');
		return mountOTPFieldReference;
	}}
/>
