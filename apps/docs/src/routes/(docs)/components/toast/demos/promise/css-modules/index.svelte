<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
	import styles from './index.module.css';

	const toastManager = Toast.createToastManager();

	function runPromise() {
		toastManager.promise(
			// Simulate an API request with a promise that resolves after 2 seconds
			new Promise<string>((resolve, reject) => {
				const shouldSucceed = Math.random() > 0.3; // 70% success rate
				setTimeout(() => {
					if (shouldSucceed) {
						resolve('operation completed');
					} else {
						reject(new Error('operation failed'));
					}
				}, 2000);
			}),
			{
				loading: 'Loading data…',
				success: (data: string) => `Success: ${data}`,
				error: (err: Error) => `Error: ${err.message}`
			}
		);
	}
</script>

<Toast.Provider {toastManager}>
	<button type="button" class={styles.Button} onclick={runPromise}>Run promise</button>
	<Toast.Portal>
		<Toast.Viewport class={styles.Viewport}>
			{@const manager = Toast.getToastManager()}
			{#each manager.toasts as toast (toast.id)}
				<Toast.Root {toast} class={styles.Toast}>
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
