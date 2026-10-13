<!--
	Toast.Provider with a child that adds a toast while it renders, then the viewport,
	portaled by default, listing the toasts.
-->
<script lang="ts">
	import { Toast } from '#lib';
	import ToastSsrList from './ToastSsrList.svelte';

	let { portal = true }: { portal?: boolean } = $props();
</script>

<Toast.Provider>
	<ToastSsrList {portal} />
</Toast.Provider>
