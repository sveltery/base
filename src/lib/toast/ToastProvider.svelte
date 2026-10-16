<!--
	Provides a context for creating and managing toasts.
	Derived from Base UI v1.9.0 packages/react/src/toast/provider/ToastProvider.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The store reads `timeout` and `limit` through a getter, so a changed prop is current
	before any descendant effect runs, which is what upstream's synchronizer layout effect ensures.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { toastManagerSubscribe } from './create-toast-manager.js';
	import { setToastStore } from './context.js';
	import { ToastStore } from './store.svelte.js';
	import type { ToastProviderProps } from './types.js';

	let { children, timeout = 5000, limit = 3, toastManager }: ToastProviderProps = $props();

	const store = new ToastStore(() => ({ timeout, limit }));
	setToastStore(store);

	$effect(() => () => store.dispose());

	$effect(() => {
		if (!toastManager) return;
		// A manager call can come from inside a consumer's effect. Reading store state there
		// must not subscribe that effect, so each event runs untracked.
		return toastManager[toastManagerSubscribe]((event) =>
			untrack(() => {
				if (event.action === 'promise') {
					const { promise, setPromise, ...options } = event.options;
					setPromise(store.promiseToast(promise, options));
				} else if (event.action === 'update') {
					store.updateToast(event.options.id, event.options.updates);
				} else if (event.action === 'close') {
					store.closeToast(event.options.id);
				} else {
					store.addToast(event.options);
				}
			})
		);
	});
</script>

{@render children?.()}
