<!-- The `remount` scenario of ToastRootHarness. Renders inside its Toast.Provider. -->
<script lang="ts">
	import { Toast } from '#lib';

	let { showToasts, longTitle }: { showToasts: boolean; longTitle: boolean } = $props();

	const manager = Toast.getToastManager();
</script>

<button type="button" onclick={() => manager.add({ id: 'save', title: 'Saved', timeout: 0 })}>
	add
</button>
<Toast.Viewport>
	{#if showToasts}
		{#each manager.toasts as toast (toast.id)}
			<Toast.Root {toast} data-testid="root" style="width: 30px">
				{#if longTitle}
					<Toast.Title>This title is much longer than before</Toast.Title>
				{:else}
					<Toast.Title />
				{/if}
			</Toast.Root>
		{/each}
	{/if}
</Toast.Viewport>
