<script lang="ts">
	import FixtureHost from '../FixtureHost.svelte';
	import ToastFixture from './ToastFixture.svelte';

	let { data } = $props();
</script>

<FixtureHost
	{data}
	Fixture={ToastFixture}
	loadReference={async () => {
		const { mountToastReference } = await import('./react-reference.js');
		return mountToastReference;
	}}
/>

<!-- The viewport and the toasts render in a portal, outside the host. Both frameworks share this CSS. -->
<style>
	:global([data-testid='viewport']) {
		position: fixed;
		right: 16px;
		bottom: 16px;
		width: 280px;
	}
	:global([data-testid='viewport'].anchored) {
		position: static;
		width: auto;
	}
	:global([data-testid='toast']) {
		position: absolute;
		right: 0;
		bottom: 0;
		box-sizing: border-box;
		width: 100%;
		padding: 8px;
		border: 1px solid #000;
		background: #fff;
		z-index: calc(1000 - var(--toast-index));
		transform: translateX(var(--toast-swipe-movement-x))
			translateY(calc(var(--toast-swipe-movement-y) - var(--toast-index) * 8px));
		transition:
			transform 100ms,
			opacity 100ms;
	}
	:global([data-testid='toast'][data-expanded]) {
		transform: translateX(var(--toast-swipe-movement-x))
			translateY(calc(var(--toast-offset-y) * -1 + var(--toast-swipe-movement-y)));
	}
	:global([data-testid='toast'][data-starting-style]) {
		transform: translateY(150%);
	}
	:global([data-testid='toast'][data-ending-style]),
	:global([data-testid='toast'][data-limited]) {
		opacity: 0;
	}
	:global([data-testid='viewport'].slow [data-testid='toast']) {
		transition:
			transform 100ms,
			opacity 1500ms;
	}
	:global([data-testid='positioner'] [data-testid='toast']) {
		position: relative;
		right: auto;
		bottom: auto;
		width: max-content;
		transform: none;
	}
	:global([data-testid='arrow']) {
		width: 10px;
		height: 10px;
		background: #000;
	}
	:global([data-testid='arrow'][data-side='top']) {
		bottom: -6px;
	}
	:global([data-testid='arrow'][data-side='bottom']) {
		top: -6px;
	}
</style>
