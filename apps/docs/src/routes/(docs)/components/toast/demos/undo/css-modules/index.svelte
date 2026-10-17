<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
	import styles from './index.module.css';

	const toastManager = Toast.createToastManager();

	function action() {
		const id = toastManager.add({
			title: 'Action performed',
			description: 'You can undo this action.',
			type: 'success',
			timeout: 10000,
			actionProps: {
				children: 'Undo',
				onclick() {
					toastManager.close(id);
					toastManager.add({
						title: 'Action undone'
					});
				}
			}
		});
	}
</script>

<Toast.Provider {toastManager}>
	<button type="button" class={styles.Button} onclick={action}>Perform action</button>
	<Toast.Portal>
		<Toast.Viewport class={styles.Viewport}>
			{@const manager = Toast.getToastManager()}
			{#each manager.toasts as toast (toast.id)}
				<Toast.Root {toast} class={styles.Toast}>
					<Toast.Content class={styles.Content}>
						<div class={styles.Text}>
							<div class={styles.Message}>
								<Toast.Title class={styles.Title} />
								<Toast.Description class={styles.Description} />
							</div>
							<Toast.Action class={styles.UndoButton} />
						</div>
					</Toast.Content>
				</Toast.Root>
			{/each}
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
