<!-- The managed scenarios of ToastRootHarness. Renders inside its Toast.Provider. -->
<script lang="ts">
	import { Toast } from '#lib';

	let {
		scenario,
		showToasts,
		longTitle
	}: { scenario: 'remount' | 'portal'; showToasts: boolean; longTitle: boolean } = $props();

	const manager = Toast.getToastManager();

	function toBody(node: HTMLElement) {
		document.body.appendChild(node);
		return () => node.remove();
	}
</script>

<button type="button" onclick={() => manager.add({ id: 'save', title: 'Saved', timeout: 0 })}>
	add
</button>
<Toast.Viewport>
	{#if showToasts}
		{#each manager.toasts as toast (toast.id)}
			<Toast.Root {toast} data-testid="root" style="width: 30px">
				{#if scenario === 'portal'}
					<Toast.Title />
					<button type="button" data-testid="portaled" {@attach toBody}>portaled</button>
				{:else if longTitle}
					<Toast.Title>This title is much longer than before</Toast.Title>
				{:else}
					<Toast.Title />
				{/if}
			</Toast.Root>
		{/each}
	{/if}
</Toast.Viewport>
