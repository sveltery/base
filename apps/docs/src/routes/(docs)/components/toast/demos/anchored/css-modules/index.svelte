<script lang="ts">
	import { Button } from '@sveltery/base/button';
	import { Toast } from '@sveltery/base/toast';
	import { Tooltip } from '@sveltery/base/tooltip';
	import styles from './index.module.css';

	const anchoredToastManager = Toast.createToastManager();
	const stackedToastManager = Toast.createToastManager();

	let copied = $state(false);

	function handleCopy(event: MouseEvent) {
		copied = true;

		anchoredToastManager.add({
			description: 'Copied',
			positionerProps: {
				anchor: event.currentTarget as HTMLElement,
				sideOffset: 10
			},
			timeout: 1500,
			onClose() {
				copied = false;
			}
		});
	}

	function createStackedToast() {
		stackedToastManager.add({
			description: 'Copied'
		});
	}
</script>

<Tooltip.Provider>
	<Toast.Provider toastManager={anchoredToastManager}>
		<Toast.Portal>
			<Toast.Viewport class={styles.AnchoredViewport}>
				{@const manager = Toast.getToastManager()}
				{#each manager.toasts as toast (toast.id)}
					<Toast.Positioner {toast} class={styles.AnchoredPositioner}>
						<Toast.Root {toast} class={styles.AnchoredToast}>
							<Toast.Arrow class={styles.Arrow} />
							<Toast.Content>
								<Toast.Description class={styles.AnchoredDescription} />
							</Toast.Content>
						</Toast.Root>
					</Toast.Positioner>
				{/each}
			</Toast.Viewport>
		</Toast.Portal>
	</Toast.Provider>
	<Toast.Provider toastManager={stackedToastManager}>
		<Toast.Portal>
			<Toast.Viewport class={styles.StackedViewport}>
				{@const manager = Toast.getToastManager()}
				{#each manager.toasts as toast (toast.id)}
					<Toast.Root {toast} class={styles.StackedToast}>
						<Toast.Content class={styles.Content}>
							<div class={styles.Text}>
								<Toast.Title class={styles.Title} />
								<Toast.Description class={styles.Description} />
							</div>
							<Toast.Close class={styles.Close}>Dismiss</Toast.Close>
						</Toast.Content>
					</Toast.Root>
				{/each}
			</Toast.Viewport>
		</Toast.Portal>
	</Toast.Provider>

	<div class={styles.ButtonGroup}>
		<Tooltip.Root disabled={copied}>
			<Tooltip.Trigger closeOnClick={false} class={styles.CopyButton} onclick={handleCopy}>
				{#snippet render(props, _state, children)}
					<Button {...props} disabled={copied} focusableWhenDisabled aria-label="Copy to clipboard">
						{@render children?.()}
					</Button>
				{/snippet}
				{#if copied}
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						style="display: block"
					>
						<path d="m2.5 8.5 4 4 7-9" />
					</svg>
				{:else}
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						style="display: block"
					>
						<rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
						<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
					</svg>
				{/if}
			</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Positioner sideOffset={10}>
					<Tooltip.Popup class={styles.Tooltip}>
						<Tooltip.Arrow class={styles.Arrow} />
						Copy
					</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		</Tooltip.Root>
		<button type="button" class={styles.Button} onclick={createStackedToast}>Stacked toast</button>
	</div>
</Tooltip.Provider>
