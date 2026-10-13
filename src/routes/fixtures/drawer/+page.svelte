<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import DrawerFixture from './DrawerFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={DrawerFixture}
	loadReference={async () => {
		const { mountDrawerReference } = await import('./react-reference.js');
		return mountDrawerReference;
	}}
/>

<!-- A bottom sheet as in the Base UI docs, so swipes and snap points have real geometry. -->
<style>
	:global([data-testid='backdrop']) {
		position: fixed;
		inset: 0;
		background: rgb(0 0 0 / 0.2);
	}
	:global([data-testid='viewport']),
	:global([data-testid='nested-viewport']) {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}
	:global([data-testid='popup']),
	:global([data-testid='nested-popup']) {
		box-sizing: border-box;
		width: 100%;
		height: 400px;
		padding: 16px;
		background: white;
		transform: translateY(
			calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px))
		);
	}
	:global([data-testid='swipe-area']) {
		position: fixed;
		right: 0;
		bottom: 0;
		left: 0;
		height: 40px;
	}
</style>
