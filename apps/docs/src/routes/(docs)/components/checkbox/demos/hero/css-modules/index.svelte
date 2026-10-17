<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import styles from './index.module.css';
</script>

<label class={styles.Label}>
	<Checkbox.Root defaultChecked class={styles.Checkbox}>
		<Checkbox.Indicator class={styles.Indicator}>
			{@render checkIcon()}
		</Checkbox.Indicator>
	</Checkbox.Root>
	Enable notifications
</label>

{#snippet checkIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}
