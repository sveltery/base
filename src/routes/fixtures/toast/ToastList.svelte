<script lang="ts">
	import { Toast, getToastManager } from '#lib';

	let { anchored = false } = $props();

	const manager = getToastManager();
</script>

{#snippet toastBody(toast: (typeof manager.toasts)[number])}
	<Toast.Root {toast} data-testid="toast">
		{#if anchored}<Toast.Arrow data-testid="arrow" />{/if}
		<Toast.Content data-testid="content">
			<Toast.Title data-testid="title" />
			<Toast.Description data-testid="description" />
			<Toast.Action data-testid="action" />
			<Toast.Close data-testid="close">Close</Toast.Close>
		</Toast.Content>
	</Toast.Root>
{/snippet}

{#each manager.toasts as toast (toast.id)}
	{#if anchored}
		<Toast.Positioner {toast} data-testid="positioner">
			{@render toastBody(toast)}
		</Toast.Positioner>
	{:else}
		{@render toastBody(toast)}
	{/if}
{/each}
