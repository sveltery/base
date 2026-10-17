<script lang="ts">
	import { Toast } from '@sveltery/base/toast';
	import styles from './index.module.css';

	const toastManager = Toast.createToastManager();
	let count = 0;

	const TEXTS = [
		'Short message.',
		'A bit longer message that spans two lines.',
		'This is a longer description that intentionally takes more vertical space to demonstrate stacking with varying heights.',
		'An even longer description that should span multiple lines so we can verify the clamped collapsed height and smooth expansion animation when hovering or focusing the viewport.'
	];

	function createToast() {
		count += 1;
		const description = TEXTS[Math.floor(Math.random() * TEXTS.length)];
		toastManager.add({
			title: `Toast ${count} created`,
			description
		});
	}
</script>

<Toast.Provider {toastManager}>
	<button type="button" class={styles.Button} onclick={createToast}
		>Create varying height toast</button
	>
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
