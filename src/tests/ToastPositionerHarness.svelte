<!--
	Toasts in Toast.Positioner. The "anchor" button adds a toast anchored to itself;
	the "add" button adds `addOptions`.
-->
<script lang="ts">
	import { Toast, type ToastManager, type ToastManagerAddOptions } from '#lib';
	import ToastPositionerHarnessList from './ToastPositionerHarnessList.svelte';

	let {
		toastManager = undefined,
		timeout = undefined,
		addOptions = { title: 'title' },
		side = undefined,
		arrow = false
	}: {
		toastManager?: ToastManager;
		timeout?: number;
		addOptions?: ToastManagerAddOptions;
		side?: 'top' | 'bottom' | 'left' | 'right';
		arrow?: boolean;
	} = $props();
</script>

<Toast.Provider {toastManager} {timeout}>
	<ToastPositionerHarnessList {addOptions} {side} {arrow} />
</Toast.Provider>
