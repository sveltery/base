<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
	import styles from './index.module.css';

	const toastManager = Toast.createToastManager();
	let count = 0;

	function createToast() {
		count += 1;
		toastManager.add({
			title: `Toast ${count} created`,
			description: 'This is a toast notification.'
		});
	}
</script>

<Toast.Provider {toastManager}>
	<button type="button" class={styles.Button} onclick={createToast}>Create toast</button>
	<Toast.Portal>
		<Toast.Viewport class={styles.Viewport}>
			{@const manager = Toast.getToastManager()}
			{#each manager.toasts as toast (toast.id)}
				<Toast.Root {toast} swipeDirection="up" class={styles.Toast}>
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
