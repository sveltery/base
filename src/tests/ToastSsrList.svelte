<!-- Adds a toast in its script, so the add runs during a server render. -->
<script lang="ts">
	import { Toast } from '#lib';

	let { portal }: { portal: boolean } = $props();

	const manager = Toast.getToastManager();
	manager.add({ title: 'Saved', timeout: 1000 });
</script>

{#snippet viewport()}
	<Toast.Viewport>
		{#each manager.toasts as toast (toast.id)}
			<Toast.Root {toast}><Toast.Title /></Toast.Root>
		{/each}
	</Toast.Viewport>
{/snippet}

{#if portal}
	<Toast.Portal>{@render viewport()}</Toast.Portal>
{:else}
	{@render viewport()}
{/if}
