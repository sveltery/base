<script lang="ts">
	import { ScrollArea } from '@sveltery/base/scroll-area';
	import styles from './index.module.css';
</script>

<ScrollArea.Root class={styles.ScrollArea}>
	<ScrollArea.Viewport class={styles.Viewport}>
		<ScrollArea.Content class={styles.Content}>
			<ul class={styles.Grid}>
				{#each Array.from({ length: 100 }, (_, i) => i + 1) as n (n)}
					<li class={styles.Item}>
						{n}
					</li>
				{/each}
			</ul>
		</ScrollArea.Content>
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar class={styles.Scrollbar}>
		<ScrollArea.Thumb class={styles.Thumb} />
	</ScrollArea.Scrollbar>
	<ScrollArea.Scrollbar class={styles.Scrollbar} orientation="horizontal">
		<ScrollArea.Thumb class={styles.Thumb} />
	</ScrollArea.Scrollbar>
	<ScrollArea.Corner />
</ScrollArea.Root>
