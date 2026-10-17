<script lang="ts">
	import { Checkbox } from '@sveltery/base/checkbox';
	import { CheckboxGroup } from '@sveltery/base/checkbox-group';

	const fruits = ['fuji-apple', 'gala-apple', 'granny-smith-apple'];
	const id = $props.id();
	let value = $state<string[]>([]);
</script>

<CheckboxGroup
	aria-labelledby={id}
	bind:value
	allValues={fruits}
	class="flex flex-col items-start gap-1 text-neutral-950 dark:text-white"
	style="margin-left: 1rem"
>
	<label class="flex items-center gap-2 text-sm font-normal" {id} style="margin-left: -1rem">
		<Checkbox.Root
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 data-indeterminate:bg-neutral-950 data-indeterminate:text-white dark:data-indeterminate:bg-white dark:data-indeterminate:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
			parent
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
				{#snippet render(props, state)}
					<span {...props}>
						{#if state.indeterminate}
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="currentColor"
								stroke-width="1"
								style="display: block"
							>
								<line
									x1="3"
									y1="12"
									x2="21"
									y2="12"
									stroke="currentColor"
									vector-effect="non-scaling-stroke"
								/>
							</svg>
						{:else}
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
						{/if}
					</span>
				{/snippet}
			</Checkbox.Indicator>
		</Checkbox.Root>
		Apples
	</label>

	<label class="flex items-center gap-2 text-sm font-normal">
		<Checkbox.Root
			value="fuji-apple"
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
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
			</Checkbox.Indicator>
		</Checkbox.Root>
		Fuji
	</label>

	<label class="flex items-center gap-2 text-sm font-normal">
		<Checkbox.Root
			value="gala-apple"
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
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
			</Checkbox.Indicator>
		</Checkbox.Root>
		Gala
	</label>

	<label class="flex items-center gap-2 text-sm font-normal">
		<Checkbox.Root
			value="granny-smith-apple"
			class="flex size-4 shrink-0 items-center justify-center border rounded-none p-0 border-neutral-950 bg-white text-white dark:border-white dark:bg-neutral-950 dark:text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:focus-visible:outline-white"
		>
			<Checkbox.Indicator class="flex data-unchecked:hidden">
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
			</Checkbox.Indicator>
		</Checkbox.Root>
		Granny Smith
	</label>
</CheckboxGroup>
