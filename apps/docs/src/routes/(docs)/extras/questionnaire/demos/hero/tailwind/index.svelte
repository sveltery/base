<script lang="ts">
	import { Questionnaire } from '@sveltery/base/questionnaire';

	const button =
		'h-8 border border-neutral-950 px-3 text-sm font-bold text-neutral-950 data-hidden:hidden dark:border-white dark:text-white';
	const choice =
		'flex items-center gap-2 border border-neutral-950 px-3 py-2 text-sm text-neutral-950 data-checked:bg-neutral-950 data-checked:text-white dark:border-white dark:text-white dark:data-checked:bg-white dark:data-checked:text-neutral-950';
</script>

<Questionnaire.Root
	class="flex w-full max-w-72 flex-col gap-4"
	items={[
		{
			name: 'size',
			required: true,
			choices: [{ value: 'small' }, { value: 'large' }]
		},
		{ name: 'notes' }
	]}
	shortcuts="letters"
	onsubmit={(event) => event.preventDefault()}
>
	<Questionnaire.Progress class="text-sm text-neutral-500 dark:text-neutral-400" />
	<Questionnaire.Item name="size" required class="flex flex-col gap-2">
		<Questionnaire.Title class="text-base font-bold text-neutral-950 dark:text-white">
			Pick a size
		</Questionnaire.Title>
		<Questionnaire.Choices class="flex flex-col gap-2">
			<Questionnaire.Choice value="small" class={choice}>
				<Questionnaire.ChoiceInput class="sr-only" />
				<Questionnaire.ChoiceShortcut class="font-mono text-xs" />
				<Questionnaire.ChoiceLabel>Small</Questionnaire.ChoiceLabel>
			</Questionnaire.Choice>
			<Questionnaire.Choice value="large" class={choice}>
				<Questionnaire.ChoiceInput class="sr-only" />
				<Questionnaire.ChoiceShortcut class="font-mono text-xs" />
				<Questionnaire.ChoiceLabel>Large</Questionnaire.ChoiceLabel>
			</Questionnaire.Choice>
		</Questionnaire.Choices>
		<Questionnaire.Error class="text-sm text-red-700 dark:text-red-400" />
	</Questionnaire.Item>
	<Questionnaire.Item name="notes" class="flex flex-col gap-2">
		<Questionnaire.Title class="text-base font-bold text-neutral-950 dark:text-white">
			Anything else?
		</Questionnaire.Title>
		<Questionnaire.Input
			aria-label="Notes"
			class="h-8 border border-neutral-950 bg-white px-2 text-sm text-neutral-950 dark:border-white dark:bg-neutral-950 dark:text-white"
		/>
	</Questionnaire.Item>
	<div class="flex gap-2">
		<Questionnaire.Previous class={button} />
		<Questionnaire.Skip class={button} />
		<Questionnaire.Next class={button} />
		<Questionnaire.Submit class={button} />
	</div>
</Questionnaire.Root>
