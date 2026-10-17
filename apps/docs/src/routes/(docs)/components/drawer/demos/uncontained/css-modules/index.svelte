<script lang="ts">
	import { Drawer } from '@sveltery/base/drawer';
	import styles from './index.module.css';

	const ACTIONS = ['Unfollow', 'Mute', 'Add to Favourites', 'Add to Close Friends', 'Restrict'];

	let open = $state(false);
</script>

<Drawer.Root bind:open>
	<Drawer.Trigger class={styles.Button}>Open action sheet</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop class={styles.Backdrop} />
		<Drawer.Viewport class={styles.Viewport}>
			<Drawer.Popup class={styles.Popup}>
				<Drawer.Content class={styles.Surface}>
					<Drawer.Title class={styles.VisuallyHidden}>Profile actions</Drawer.Title>
					<Drawer.Description class={styles.VisuallyHidden}>
						Choose an action for this user.
					</Drawer.Description>

					<ul class={styles.Actions} aria-label="Profile actions">
						{#each ACTIONS as action, index (action)}
							<li class={styles.Action}>
								{#if index === 0}
									<Drawer.Close class={styles.VisuallyHidden}>Close action sheet</Drawer.Close>
								{/if}
								<button type="button" class={styles.ActionButton} onclick={() => (open = false)}>
									{action}
								</button>
							</li>
						{/each}
					</ul>
				</Drawer.Content>
				<div class={styles.DangerSurface}>
					<button type="button" class={styles.DangerButton} onclick={() => (open = false)}>
						Block User
					</button>
				</div>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
