<script lang="ts">
	import { NumberField } from '@sveltery/base/number-field';
	import styles from './index.module.css';

	const id = $props.id();
</script>

<NumberField.Root {id} defaultValue={100} class={styles.Field}>
	<NumberField.ScrubArea class={styles.ScrubArea}>
		<label for={id} class={styles.Label}>Amount</label>
		<NumberField.ScrubAreaCursor class={styles.ScrubAreaCursor}>
			{@render cursorGrowIcon()}
		</NumberField.ScrubAreaCursor>
	</NumberField.ScrubArea>

	<NumberField.Group class={styles.Group}>
		<NumberField.Decrement class={styles.Decrement}>
			{@render minusIcon()}
		</NumberField.Decrement>
		<NumberField.Input class={styles.Input} />
		<NumberField.Increment class={styles.Increment}>
			{@render plusIcon()}
		</NumberField.Increment>
	</NumberField.Group>
</NumberField.Root>

{#snippet cursorGrowIcon()}
	<svg
		width="26"
		height="14"
		viewBox="0 0 24 14"
		fill="black"
		stroke="white"
		style="display: block"
	>
		<path
			d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z"
		/>
	</svg>
{/snippet}

{#snippet plusIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="M1.5 8h13M8 14.5v-13" />
	</svg>
{/snippet}

{#snippet minusIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		stroke-linecap="square"
		stroke-linejoin="round"
		style="display: block"
	>
		<path d="M1.5 8h13" />
	</svg>
{/snippet}
