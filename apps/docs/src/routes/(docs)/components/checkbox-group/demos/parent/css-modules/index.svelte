<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';
	import styles from './index.module.css';

	const fruits = ['fuji-apple', 'gala-apple', 'granny-smith-apple'];
	const id = $props.id();
	let value = $state<string[]>([]);
</script>

<CheckboxGroup
	aria-labelledby={id}
	bind:value
	allValues={fruits}
	class={styles.CheckboxGroup}
	style="margin-left: 1rem"
>
	<label class={styles.Item} {id} style="margin-left: -1rem">
		<Checkbox.Root class={styles.Checkbox} parent>
			<Checkbox.Indicator class={styles.Indicator}>
				{#snippet render(props, state)}
					<span {...props}>
						{#if state.indeterminate}
							{@render horizontalRuleIcon()}
						{:else}
							{@render checkIcon()}
						{/if}
					</span>
				{/snippet}
			</Checkbox.Indicator>
		</Checkbox.Root>
		Apples
	</label>

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

{#snippet horizontalRuleIcon()}
	<svg
		width="12"
		height="12"
		viewBox="0 0 24 24"
		fill="currentColor"
		stroke-width="1"
		style="display: block"
	>
		<line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" vector-effect="non-scaling-stroke" />
	</svg>
{/snippet}
