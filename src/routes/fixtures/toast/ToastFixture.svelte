<script lang="ts" module>
	import { createToastManager } from '#lib';

	// Created outside any component, the way an app imports one from a module.
	const globalManager = createToastManager();
</script>

<script lang="ts">
	import { Toast } from '#lib';
	import { caseOptions, type ToastCase } from './cases.js';
	import ToastControls from './ToastControls.svelte';
	import ToastList from './ToastList.svelte';

	let { scenario = 'basic' as ToastCase } = $props();

	const options = $derived(caseOptions[scenario]);
	let log = $state<string[]>([]);
</script>

<Toast.Provider timeout={options.timeout} limit={options.limit} toastManager={globalManager}>
	<ToastControls {globalManager} log={(entry) => log.push(entry)} />
	<Toast.Portal>
		<Toast.Viewport data-testid="viewport" class={[options.anchored && 'anchored']}>
			<ToastList anchored={options.anchored} />
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>

<output data-testid="log">{JSON.stringify(log)}</output>
