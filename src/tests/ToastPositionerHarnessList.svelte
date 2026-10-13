<!-- The list inside ToastPositionerHarness. -->
<script lang="ts">
	import { Toast, type ToastManagerAddOptions } from '#lib';

	let {
		addOptions,
		side,
		arrow
	}: {
		addOptions: ToastManagerAddOptions;
		side: 'top' | 'bottom' | 'left' | 'right' | undefined;
		arrow: boolean;
	} = $props();

	const manager = Toast.getToastManager();
	let anchor = $state<HTMLButtonElement>();
</script>

<button
	type="button"
	bind:this={anchor}
	style="position: absolute; top: 200px; left: 100px; width: 80px; height: 20px"
	onclick={() =>
		manager.add({
			id: 'anchored',
			title: 'title',
			positionerProps: { anchor, side: 'bottom', sideOffset: 8 }
		})}
>
	anchor
</button>
<button type="button" onclick={() => manager.add(addOptions)}>add</button>
<Toast.Viewport>
	{#each manager.toasts as toast (toast.id)}
		<Toast.Positioner {toast} {side} data-testid={toast.id}>
			<Toast.Root {toast} data-testid="root-{toast.id}">
				{#if arrow}
					<Toast.Arrow data-testid="arrow" />
				{/if}
				<Toast.Title />
			</Toast.Root>
		</Toast.Positioner>
	{/each}
</Toast.Viewport>
