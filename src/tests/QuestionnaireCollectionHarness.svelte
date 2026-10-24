<script lang="ts">
	import { Questionnaire } from '#lib';
	import type { QuestionnaireItemDefinition } from '#lib';
	import Choice from './QuestionnaireChoiceHarness.svelte';

	const scopeItems = [
		{
			choices: [
				{ value: 'delegation' },
				{ disabled: true, value: 'automatic' },
				{ value: 'questions' }
			],
			name: 'scope',
			required: true
		},
		{ choices: [{ value: 'ignored' }], disabled: true, name: 'disabled' },
		{ choices: [{ value: 'focused' }, { value: 'complete' }], name: 'detail' }
	] satisfies QuestionnaireItemDefinition[];
	const numericChoices = Array.from({ length: 10 }, (_, index) => ({
		value: `choice-${index + 1}`
	}));
	const middleItems = [{ name: 'first' }, { name: 'middle' }, { name: 'last' }];

	let {
		scenario,
		defaultItem,
		item = $bindable(),
		definitions = $bindable([{ name: 'first' }, { name: 'second' }, { name: 'third' }]),
		includeChoice = $bindable(true),
		onItemChange
	}: {
		scenario: string;
		defaultItem?: string;
		item?: string;
		definitions?: QuestionnaireItemDefinition[];
		includeChoice?: boolean;
		onItemChange?: (item: string) => void;
	} = $props();

	export function setItem(next: string) {
		item = next;
	}
	export function setDefinitions(next: QuestionnaireItemDefinition[]) {
		definitions = next;
	}
	export function setIncludeChoice(next: boolean) {
		includeChoice = next;
	}
</script>

{#if scenario === 'scope'}
	<Questionnaire.Root
		data-testid="root"
		{defaultItem}
		bind:item
		items={scopeItems}
		shortcuts="letters"
	>
		<Questionnaire.Progress data-testid="progress" />
		<Questionnaire.Item data-testid="scope" name="scope" required>
			<Questionnaire.Title>Choose the scope</Questionnaire.Title>
			<Choice value="delegation" />
			<Choice disabled value="automatic" />
			<Choice value="questions" />
		</Questionnaire.Item>
		<Questionnaire.Item data-testid="disabled" disabled name="disabled">
			<Questionnaire.Title>Disabled question</Questionnaire.Title>
			<Choice value="ignored" />
		</Questionnaire.Item>
		<Questionnaire.Item data-testid="detail" name="detail">
			<Questionnaire.Title>Choose the detail</Questionnaire.Title>
			<Choice value="focused" />
			<Choice value="complete" />
		</Questionnaire.Item>
		<Questionnaire.Previous data-testid="previous" />
		<Questionnaire.Skip data-testid="skip" />
		<Questionnaire.Next data-testid="next" />
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'numeric'}
	<Questionnaire.Root items={[{ choices: numericChoices, name: 'numeric' }]} shortcuts="numbers">
		<Questionnaire.Item name="numeric">
			<Questionnaire.Title>Choose a number</Questionnaire.Title>
			{#each numericChoices as choice (choice.value)}<Choice value={choice.value} />{/each}
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'input-only'}
	<Questionnaire.Root items={[{ name: 'input' }]}>
		<Questionnaire.Progress data-testid="progress" />
		<Questionnaire.Item data-testid="input" name="input">
			<Questionnaire.Title>Describe the result</Questionnaire.Title>
			<Questionnaire.Input data-testid="input-control" aria-label="Result" defaultValue="Draft" />
		</Questionnaire.Item>
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'middle'}
	<Questionnaire.Root defaultItem="middle" items={middleItems}>
		<Questionnaire.Progress data-testid="progress" />
		{#each middleItems as definition (definition.name)}
			<Questionnaire.Item data-testid={definition.name} name={definition.name}>
				<Questionnaire.Title>{definition.name}</Questionnaire.Title>
			</Questionnaire.Item>
		{/each}
		<Questionnaire.Previous data-testid="previous" />
		<Questionnaire.Next data-testid="next" />
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'default-checked'}
	<Questionnaire.Root items={[{ choices: [{ value: 'default' }], name: 'answer' }]}>
		<Questionnaire.Item data-testid="answer" name="answer">
			<Choice defaultChecked value="default" />
		</Questionnaire.Item>
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'order'}
	<Questionnaire.Root
		items={[{ choices: [{ value: 'second' }, { value: 'first' }], name: 'order' }]}
		shortcuts="letters"
	>
		<Questionnaire.Item data-testid="order" name="order">
			<Choice value="first" />
			<Choice value="second" />
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'mismatch'}
	<Questionnaire.Root
		items={[{ choices: [{ disabled: true, value: 'fixed' }], name: 'answer', required: true }]}
	>
		<Questionnaire.Item name="answer">
			<Choice value="fixed" />
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'duplicates'}
	<Questionnaire.Root
		items={[
			{ choices: [{ value: 'fixed' }, { value: 'fixed' }], name: 'answer' },
			{ disabled: true, name: 'answer' }
		]}
	>
		<Questionnaire.Item name="answer">
			<Choice value="fixed" />
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'omitted'}
	<Questionnaire.Root items={[{ name: 'answer' }]} shortcuts="letters">
		<Questionnaire.Item name="answer">
			<Choice value="fixed" />
			<Questionnaire.Input aria-label="Another answer" />
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'dynamic'}
	<Questionnaire.Root data-testid="root" defaultItem="second" items={definitions} {onItemChange}>
		<Questionnaire.Progress data-testid="progress" />
		{#each definitions as definition (definition.name)}
			<Questionnaire.Item
				data-testid={definition.name}
				disabled={definition.disabled}
				name={definition.name}
			>
				<Questionnaire.Title>{definition.name}</Questionnaire.Title>
			</Questionnaire.Item>
		{/each}
		<Questionnaire.Previous data-testid="previous" />
		<Questionnaire.Next data-testid="next" />
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'recur'}
	<Questionnaire.Root
		items={[{ choices: includeChoice ? [{ value: 'fixed' }] : undefined, name: 'answer' }]}
		shortcuts="letters"
	>
		<Questionnaire.Item name="answer">
			<Choice value="fixed" />
		</Questionnaire.Item>
	</Questionnaire.Root>
{/if}
