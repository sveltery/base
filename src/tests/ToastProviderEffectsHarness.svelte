<!-- Descendant effects that add and observe toasts while provider props change. -->
<script lang="ts">
	import { Toast, type GetToastManagerReturnValue, type ToastManager } from '#lib';
	import ToastEffectProbe from './ToastEffectProbe.svelte';

	let {
		timeout = undefined,
		limit = undefined,
		toastManager = undefined,
		active = false,
		add,
		observe = () => {}
	}: {
		timeout?: number;
		limit?: number;
		toastManager?: ToastManager;
		active?: boolean;
		add: (manager: GetToastManagerReturnValue) => void;
		observe?: (manager: GetToastManagerReturnValue) => void;
	} = $props();
</script>

<Toast.Provider {timeout} {limit} {toastManager}>
	<ToastEffectProbe {active} run={add} />
	<ToastEffectProbe {active} run={observe} />
</Toast.Provider>
