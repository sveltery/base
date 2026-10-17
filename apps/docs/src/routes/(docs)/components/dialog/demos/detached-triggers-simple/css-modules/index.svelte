<script lang="ts">
	import { Dialog } from '@sveltery/base/dialog';
	import styles from '../../_index.module.css';

	const demoDialog = Dialog.createHandle();
</script>

<Dialog.Trigger class={styles.Button} handle={demoDialog}>View notifications</Dialog.Trigger>

<Dialog.Root handle={demoDialog}>
	<Dialog.Portal>
		<Dialog.Backdrop class={styles.Backdrop} />
		<Dialog.Popup class={styles.Popup}>
			<div class={styles.Intro}>
				<Dialog.Title class={styles.Title}>Notifications</Dialog.Title>
				<Dialog.Description class={styles.Description}>
					You are all caught up. Good job!
				</Dialog.Description>
			</div>
			<div class={styles.Actions}>
				<Dialog.Close class={styles.Button}>Close</Dialog.Close>
			</div>
		</Dialog.Popup>
	</Dialog.Portal>
</Dialog.Root>
