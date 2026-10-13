<!--
	Toast.Provider around ToastHarnessList: the upstream `List` and `Button` test helpers.
	`onManager` hands the test the manager the list renders from.
-->
<script lang="ts">
	import { Toast, type ToastManager } from '#lib';
	import ToastHarnessList, { type ToastHarnessListProps } from './ToastHarnessList.svelte';

	let {
		timeout = undefined,
		limit = undefined,
		toastManager = undefined,
		...listProps
	}: ToastHarnessListProps & {
		timeout?: number;
		limit?: number;
		toastManager?: ToastManager;
	} = $props();
</script>

<Toast.Provider {timeout} {limit} {toastManager}>
	<ToastHarnessList {...listProps} />
</Toast.Provider>
