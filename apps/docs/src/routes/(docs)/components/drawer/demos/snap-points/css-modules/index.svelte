<script lang="ts">
	import { Drawer, type DrawerSnapPoint } from '@sveltery/base/drawer';
	import styles from './index.module.css';

	const TOP_MARGIN_REM = 1;
	const VISIBLE_SNAP_POINTS_REM = [30];

	function toViewportSnapPoint(heightRem: number) {
		return `${heightRem + TOP_MARGIN_REM}rem`;
	}

	const snapPoints: DrawerSnapPoint[] = [...VISIBLE_SNAP_POINTS_REM.map(toViewportSnapPoint), 1];
</script>

<Drawer.Root {snapPoints}>
	<Drawer.Trigger class={styles.Button}>Open snap drawer</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Backdrop class={styles.Backdrop} />
		<Drawer.Viewport class={styles.Viewport}>
			<Drawer.Popup class={styles.Popup} style="--top-margin: {TOP_MARGIN_REM}rem">
				<div class={styles.DragArea}>
					<div class={styles.Handle}></div>
					<Drawer.Title class={styles.Title}>Snap points</Drawer.Title>
				</div>
				<Drawer.Content class={styles.Scroll}>
					<div class={styles.Content}>
						<Drawer.Description class={styles.Description}>
							Drag the sheet to snap between a compact peek and a near full-height view.
						</Drawer.Description>
						<div class={styles.Cards} aria-hidden="true">
							{#each Array.from({ length: 20 }, (_, index) => index) as index (index)}
								<div class={styles.Card}></div>
							{/each}
						</div>
						<div class={styles.Actions}>
							<Drawer.Close class={styles.Button}>Close</Drawer.Close>
						</div>
					</div>
				</Drawer.Content>
			</Drawer.Popup>
		</Drawer.Viewport>
	</Drawer.Portal>
</Drawer.Root>
