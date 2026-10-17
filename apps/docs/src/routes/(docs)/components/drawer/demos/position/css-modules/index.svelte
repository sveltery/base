<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';
	import styles from './index.module.css';
</script>

<Drawer.Root>
	<Drawer.Trigger class={styles.Button}>Open bottom drawer</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop class={styles.Backdrop} />
		<Drawer.Viewport class={styles.Viewport}>
			<Drawer.Popup class={styles.Popup}>
				<div class={styles.Handle}></div>
				<Drawer.Content class={styles.Content}>
					<Drawer.Title class={styles.Title}>Notifications</Drawer.Title>
					<Drawer.Description class={styles.Description}>
						You are all caught up. Good job!
					</Drawer.Description>
					<div class={styles.Actions}>
						<Drawer.Close class={styles.Button}>Close</Drawer.Close>
					</div>
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
