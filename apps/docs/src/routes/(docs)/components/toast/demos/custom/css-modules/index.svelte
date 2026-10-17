<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
	import type { ToastObject } from '@sveltery/base/toast';
	import styles from './index.module.css';

	interface CustomToastData {
		userId: string;
	}

	function isCustomToast(toast: ToastObject): toast is ToastObject<CustomToastData> {
		return toast.data?.userId !== undefined;
	}

	const toastManager = Toast.createToastManager();

	function action() {
		const data: CustomToastData = {
			userId: '123'
		};

		toastManager.add({
			title: 'Toast with custom data',
			data
		});
	}
</script>

<Toast.Provider {toastManager}>
	<button type="button" class={styles.Button} onclick={action}>Create custom toast</button>
	<Toast.Portal>
		<Toast.Viewport class={styles.Viewport}>
			{@const manager = Toast.getToastManager()}
			{#each manager.toasts as toast (toast.id)}
				<Toast.Root {toast} class={styles.Toast}>
					<Toast.Content class={styles.Content}>
						<div class={styles.Text}>
							<Toast.Title class={styles.Title}>{toast.title}</Toast.Title>
							{#if isCustomToast(toast) && toast.data}
								<Toast.Description class={styles.Description}
									>data.userId is {toast.data.userId}</Toast.Description
								>
							{:else}
								<Toast.Description class={styles.Description} />
							{/if}
						</div>
						<Toast.Close class={styles.Close}>Dismiss</Toast.Close>
					</Toast.Content>
				</Toast.Root>
			{/each}
		</Toast.Viewport>
	</Toast.Portal>
</Toast.Provider>
