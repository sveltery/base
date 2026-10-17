<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';
	import styles from './index.module.css';

	const id = $props.id();
</script>

<CheckboxGroup aria-labelledby={id} defaultValue={['fuji-apple']} class={styles.CheckboxGroup}>
	<div class={styles.Caption} {id}>Apples</div>

	<label class={styles.Item}>
		<Checkbox.Root value="fuji-apple" class={styles.Checkbox}>
			<Checkbox.Indicator class={styles.Indicator}>
				{@render checkIcon()}
			</Checkbox.Indicator>
		</Checkbox.Root>
		Fuji
	</label>

	<label class={styles.Item}>
		<Checkbox.Root value="gala-apple" class={styles.Checkbox}>
			<Checkbox.Indicator class={styles.Indicator}>
				{@render checkIcon()}
			</Checkbox.Indicator>
		</Checkbox.Root>
		Gala
	</label>

	<label class={styles.Item}>
		<Checkbox.Root value="granny-smith-apple" class={styles.Checkbox}>
			<Checkbox.Indicator class={styles.Indicator}>
				{@render checkIcon()}
			</Checkbox.Indicator>
		</Checkbox.Root>
		Granny Smith
	</label>
</CheckboxGroup>

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
