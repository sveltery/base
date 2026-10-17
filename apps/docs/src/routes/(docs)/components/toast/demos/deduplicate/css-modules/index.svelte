<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
	import styles from './index.module.css';

	const toastManager = Toast.createToastManager();

	function createToast() {
		toastManager.add({
			id: 'save-status',
			title: 'Draft saved',
			description: 'Click again while it is visible to replay the pulse.'
		});
	}
</script>

<Toast.Provider {toastManager}>
	<button type="button" class={styles.Button} onclick={createToast}>Save draft</button>
	<Toast.Portal>
		<Toast.Viewport class={styles.Viewport}>
			{@const manager = Toast.getToastManager()}
			{#each manager.toasts as toast (toast.id)}
				<!-- New toasts start with `updateKey: 0`, so the first add skips the replay pulse. -->
				{@const pulse = toast.updateKey
					? toast.updateKey % 2 === 0
						? styles.PulseEven
						: styles.PulseOdd
					: null}
				<Toast.Root {toast} class={[styles.Toast, pulse]}>
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
