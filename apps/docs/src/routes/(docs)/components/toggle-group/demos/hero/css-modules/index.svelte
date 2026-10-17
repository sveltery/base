<script lang="ts">
	import { Toggle } from '@sveltery/base/toggle';
	import { ToggleGroup } from '@sveltery/base/toggle-group';
	import styles from './index.module.css';

	let value = $state(['left']);
</script>

<ToggleGroup bind:value aria-label="Text alignment" class={styles.Panel}>
	<Toggle aria-label="Align left" value="left" class={styles.Button}>
		<svg
			width="16"
			height="16"
			fill="none"
			viewBox="0 0 16 16"
			stroke="currentColor"
			style="display: block"
		>
			<path stroke-linecap="square" stroke-linejoin="round" d="M2.5 4.5h11m-11 7h9M2.5 8h5" />
		</svg>
	</Toggle>
	<Toggle aria-label="Align center" value="center" class={styles.Button}>
		<svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" style="display: block">
			<path stroke-linecap="square" stroke-linejoin="round" d="M2.5 4.5h11m-10 7h9M5.5 8h5" />
		</svg>
	</Toggle>
	<Toggle aria-label="Align right" value="right" class={styles.Button}>
		<svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" style="display: block">
			<path stroke-linecap="square" stroke-linejoin="round" d="M2.5 4.5h11m-9 7h9M8.5 8h5" />
		</svg>
	</Toggle>
</ToggleGroup>
