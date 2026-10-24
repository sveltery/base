<script lang="ts">
	import { Questionnaire } from '#lib';
	import type { QuestionnaireCase } from './cases.js';

	let { scenario }: { scenario: QuestionnaireCase } = $props();

	let submitted = $state('');
</script>

<Questionnaire.Root
	data-testid="root"
	shortcuts={scenario === 'shortcuts' ? 'letters' : undefined}
	onsubmit={(event) => {
		event.preventDefault();
		submitted = JSON.stringify([...new FormData(event.currentTarget)]);
	}}
>
	<Questionnaire.Progress data-testid="progress" />
	<Questionnaire.Item
		name="size"
		required={scenario !== 'optional'}
		multiple={scenario === 'multiple'}
		data-testid="size"
	>
		<Questionnaire.Title>Size</Questionnaire.Title>
		<Questionnaire.Choices data-testid="size-choices">
			{#each ['small', 'large'] as value (value)}
				<Questionnaire.Choice {value} data-testid="size-{value}">
					<Questionnaire.ChoiceInput
						aria-label={value}
						data-testid="size-{value}-input"
						onchange={(event) => {
							if (scenario === 'prevented' && value === 'large') event.preventDefault();
						}}
					/>
					<Questionnaire.ChoiceShortcut data-testid="size-{value}-shortcut" />
					<Questionnaire.ChoiceLabel>{value}</Questionnaire.ChoiceLabel>
				</Questionnaire.Choice>
			{/each}
		</Questionnaire.Choices>
		<Questionnaire.Error data-testid="size-error" />
	</Questionnaire.Item>
	<Questionnaire.Item name="notes" data-testid="notes">
		<Questionnaire.Title>Notes</Questionnaire.Title>
		<Questionnaire.Input
			aria-label="Notes"
			data-testid="notes-input"
			oninput={(event) => {
				if (scenario === 'prevented') event.preventDefault();
			}}
		/>
		<Questionnaire.Error data-testid="notes-error" />
	</Questionnaire.Item>
	<Questionnaire.Previous data-testid="previous" />
	<Questionnaire.Skip data-testid="skip" />
	<Questionnaire.Next data-testid="next" />
	<Questionnaire.Submit data-testid="submit" />
	<button type="reset">Reset</button>
</Questionnaire.Root>
<output data-testid="submitted">{submitted}</output>
