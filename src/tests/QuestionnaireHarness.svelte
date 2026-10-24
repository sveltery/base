<script lang="ts">
	import { Questionnaire } from '#lib';
	import type {
		QuestionnaireInputType,
		QuestionnaireItemStatus,
		QuestionnaireShortcutMode
	} from '#lib';
	import Choice from './QuestionnaireChoiceHarness.svelte';
	import TestItem from './QuestionnaireItemHarness.svelte';

	let {
		scenario,
		onsubmit = (event: SubmitEvent) => event.preventDefault(),
		onItemChange,
		onStatusChange,
		type = 'text',
		count = 0,
		shortcuts
	}: {
		scenario: string;
		onsubmit?: (event: SubmitEvent) => void;
		onItemChange?: (item: string) => void;
		onStatusChange?: (status: QuestionnaireItemStatus) => void;
		type?: QuestionnaireInputType;
		count?: number;
		shortcuts?: QuestionnaireShortcutMode;
	} = $props();

	let item = $state('first');
	let flag = $state(false);
	let checked = $state(false);
	let text = $state('');
	let preventKeys = $state(false);
	export function toggle() {
		flag = !flag;
	}
	export function write(next: string) {
		text = next;
	}
	export function preventKeydown() {
		preventKeys = true;
	}
	export function bound() {
		return { item, checked, text };
	}
</script>

{#if scenario === 'main'}
	<Questionnaire.Root data-testid="root" defaultItem="scope" {onsubmit} {onItemChange}>
		<Questionnaire.Progress data-testid="progress" />
		<Questionnaire.Item data-testid="scope" required name="scope">
			<Questionnaire.Title>What should come next?</Questionnaire.Title>
			<Questionnaire.Description id="scope-description"
				>Choose one or write another answer.</Questionnaire.Description
			>
			<Questionnaire.Choices>
				<Choice data-testid="scope-delegation" value="delegation">Delegation</Choice>
				<Choice data-testid="scope-questions" value="questions">Question prompts</Choice>
				<Questionnaire.Input data-testid="scope-input" aria-label="Another answer" />
			</Questionnaire.Choices>
			<Questionnaire.Error data-testid="scope-error" id="scope-error-message" />
		</Questionnaire.Item>
		<Questionnaire.Item data-testid="detail" required name="detail">
			<Questionnaire.Title>How much detail?</Questionnaire.Title>
			<Questionnaire.Choices>
				<Choice data-testid="detail-focused" value="focused">Focused</Choice>
				<Choice data-testid="detail-complete" value="complete">Complete</Choice>
			</Questionnaire.Choices>
			<Questionnaire.Error data-testid="detail-error" />
		</Questionnaire.Item>
		<Questionnaire.Previous data-testid="previous" />
		<Questionnaire.Skip data-testid="skip" />
		<Questionnaire.Next data-testid="next" />
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'multiple-focus'}
	<Questionnaire.Root data-testid="root" defaultItem="multiple">
		<Questionnaire.Item data-testid="multiple" multiple required name="multiple">
			<Questionnaire.Title>Choose several</Questionnaire.Title>
			<Choice data-testid="first" value="first">First</Choice>
			<Choice data-testid="second" value="second">Second</Choice>
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'input-type'}
	<Questionnaire.Root data-testid="root" defaultItem="answer">
		<Questionnaire.Item data-testid="answer" name="answer">
			<Questionnaire.Title>Enter an answer</Questionnaire.Title>
			<Choice data-testid="fixed" value="fixed">Fixed</Choice>
			<Questionnaire.Input data-testid="answer-input" aria-label="Custom answer" {type} />
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'disabled-answer'}
	<Questionnaire.Root data-testid="root" defaultItem="approval" shortcuts="letters">
		<Questionnaire.Item data-testid="approval" name="approval" required>
			<Questionnaire.Title>Choose approval</Questionnaire.Title>
			<Choice data-testid="automatic" disabled value="automatic">Automatic</Choice>
			<Choice data-testid="review" value="review">Review</Choice>
			<Questionnaire.Input data-testid="approval-input" aria-label="Another approval" />
			<Questionnaire.Error data-testid="approval-error" />
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'availability'}
	<Questionnaire.Root data-testid="root" defaultItem="answers" {onsubmit}>
		<Questionnaire.Item data-testid="answers" multiple required name="answers" {onStatusChange}>
			<Questionnaire.Title>Choose answers</Questionnaire.Title>
			<Choice data-testid="fixed-answer" defaultChecked disabled={flag} value="fixed">Fixed</Choice>
			<Questionnaire.Input
				data-testid="custom-answer"
				aria-label="Custom answer"
				defaultValue="Custom"
				disabled={flag}
			/>
			<Questionnaire.Error data-testid="answers-error" />
		</Questionnaire.Item>
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'external'}
	<Questionnaire.Root
		data-testid="root"
		bind:item
		onsubmit={(event) => {
			event.preventDefault();
			flag = true;
			item = 'first';
		}}
	>
		<Questionnaire.Item data-testid="first" invalid={flag} name="first" required>
			<Questionnaire.Title>First</Questionnaire.Title>
			<Choice data-testid="first-choice" value="first">First answer</Choice>
			<Choice data-testid="first-alternative" value="alternative" onchange={() => (flag = false)}
				>Alternative answer</Choice
			>
			<Questionnaire.Error data-testid="first-error" id="first-error"
				>Choose the alternative answer.</Questionnaire.Error
			>
		</Questionnaire.Item>
		<Questionnaire.Item data-testid="second" name="second" required>
			<Questionnaire.Title>Second</Questionnaire.Title>
			<Choice data-testid="second-choice" value="second">Second answer</Choice>
		</Questionnaire.Item>
		<Questionnaire.Next data-testid="next" />
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'arrow-skip'}
	<Questionnaire.Root data-testid="root" defaultItem="optional">
		<TestItem name="optional" {onStatusChange} />
		<TestItem required name="next" />
		<Questionnaire.Previous data-testid="previous" />
		<Questionnaire.Skip data-testid="skip" />
	</Questionnaire.Root>
{:else if scenario === 'first-enabled'}
	<Questionnaire.Root data-testid="root" {onItemChange}>
		<Questionnaire.Progress data-testid="progress" />
		<TestItem disabled name="disabled" />
		<TestItem required name="first" />
		<TestItem required name="second" />
	</Questionnaire.Root>
{:else if scenario === 'controlled'}
	<Questionnaire.Root data-testid="root" bind:item {onItemChange}>
		<TestItem required name="first" />
		<TestItem required name="second" />
		<Questionnaire.Previous data-testid="previous" />
		<Questionnaire.Next data-testid="next" />
	</Questionnaire.Root>
{:else if scenario === 'bound-answers'}
	<Questionnaire.Root data-testid="root" defaultItem="answers">
		<Questionnaire.Item data-testid="answers" multiple required name="answers">
			<Questionnaire.Title>Answers</Questionnaire.Title>
			<Choice data-testid="bound-choice" bind:checked value="fixed">Fixed</Choice>
			<Questionnaire.Input data-testid="bound-input" aria-label="Custom answer" bind:value={text} />
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'bound-single'}
	<Questionnaire.Root data-testid="root" defaultItem="answer">
		<Questionnaire.Item data-testid="answer" required name="answer">
			<Questionnaire.Title>Answer</Questionnaire.Title>
			<Choice data-testid="bound-choice" bind:checked value="fixed">Fixed</Choice>
			<Questionnaire.Input data-testid="bound-input" aria-label="Custom answer" bind:value={text} />
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'skip-checked'}
	<Questionnaire.Root data-testid="root" defaultItem="answer" {onsubmit}>
		<Questionnaire.Item data-testid="answer" name="answer" {onStatusChange}>
			<Questionnaire.Title>Answer</Questionnaire.Title>
			<Choice data-testid="checked-answer" checked value="checked">Checked</Choice>
		</Questionnaire.Item>
		<Questionnaire.Skip data-testid="skip" />
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'skip-bound'}
	<Questionnaire.Root data-testid="root" defaultItem="answer" {onsubmit}>
		<Questionnaire.Item data-testid="answer" name="answer">
			<Questionnaire.Title>Answer</Questionnaire.Title>
			<Choice data-testid="bound-answer" bind:checked={flag} value="bound">Bound</Choice>
			<Questionnaire.Input data-testid="bound-input" aria-label="Custom answer" bind:value={text} />
		</Questionnaire.Item>
		<TestItem name="after" />
		<Questionnaire.Previous data-testid="previous" />
		<Questionnaire.Skip data-testid="skip" />
		<Questionnaire.Next data-testid="next" />
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'submit-earlier'}
	<Questionnaire.Root data-testid="root" defaultItem="second" {onsubmit}>
		<TestItem required name="first" />
		<TestItem required name="second" />
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'native-input'}
	<Questionnaire.Root data-testid="root" defaultItem="answer" novalidate={false}>
		<Questionnaire.Item data-testid="answer" required name="answer">
			<Questionnaire.Title>Answer</Questionnaire.Title>
			<Choice data-testid="fixed" value="fixed">Fixed</Choice>
			<Questionnaire.Input data-testid="answer-input" aria-label="Another answer" />
		</Questionnaire.Item>
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'signals'}
	<Questionnaire.Root data-testid="root" defaultItem="signals" {onsubmit}>
		<Questionnaire.Item data-testid="signals" multiple required name="signals">
			<Questionnaire.Title>Signals</Questionnaire.Title>
			<Choice data-testid="progress" value="progress">Progress</Choice>
			<Choice data-testid="risks" value="risks">Risks</Choice>
			<Questionnaire.Input data-testid="signals-input" aria-label="Another signal" />
		</Questionnaire.Item>
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'dynamic-multiple'}
	<Questionnaire.Root data-testid="root" defaultItem="signals">
		<Questionnaire.Item data-testid="signals" multiple={!flag} name="signals" required>
			<Questionnaire.Title>Signals</Questionnaire.Title>
			<Choice data-testid="first-signal" value="first">First</Choice>
			<Choice data-testid="second-signal" value="second">Second</Choice>
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'skip-record'}
	<Questionnaire.Root data-testid="root" defaultItem="plan">
		<TestItem required name="plan" />
		<TestItem name="timing" {onStatusChange} />
		<TestItem required name="owner" />
		<Questionnaire.Previous data-testid="previous" />
		<Questionnaire.Skip data-testid="skip" />
		<Questionnaire.Next data-testid="next" />
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'optional-invalid'}
	<Questionnaire.Root data-testid="root" defaultItem="optional">
		<Questionnaire.Item data-testid="optional" invalid name="optional">
			<Questionnaire.Title>Optional</Questionnaire.Title>
			<Choice data-testid="optional-choice" value="answer">Answer</Choice>
			<Questionnaire.Error data-testid="optional-error"
				>This answer is not valid.</Questionnaire.Error
			>
		</Questionnaire.Item>
		<TestItem required name="required" />
		<Questionnaire.Previous data-testid="previous" />
		<Questionnaire.Skip data-testid="skip" />
		<Questionnaire.Next data-testid="next" />
	</Questionnaire.Root>
{:else if scenario === 'final-skip'}
	<Questionnaire.Root data-testid="root" defaultItem="timing" {onsubmit}>
		<TestItem name="timing" {onStatusChange} />
		<Questionnaire.Skip data-testid="skip" />
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'attempted'}
	<Questionnaire.Root data-testid="root" defaultItem="answer">
		<Questionnaire.Item data-testid="answer" multiple required name="answer">
			<Questionnaire.Title>Answer</Questionnaire.Title>
			<Choice data-testid="fixed" value="fixed">Fixed</Choice>
			<Questionnaire.Input data-testid="answer-input" aria-label="Another answer" />
			<Questionnaire.Error data-testid="answer-error" />
		</Questionnaire.Item>
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'changing-defaults'}
	<Questionnaire.Root data-testid="root" defaultItem="defaults">
		<Questionnaire.Item data-testid="defaults" multiple required name="defaults">
			<Questionnaire.Title>Defaults</Questionnaire.Title>
			<Choice data-testid="primary-choice" defaultChecked={flag} value="primary">Primary</Choice>
			<Choice data-testid="secondary-choice" value="secondary">Secondary</Choice>
			<Questionnaire.Input
				data-testid="default-input"
				aria-label="Default input"
				defaultValue={flag ? '' : 'Initial'}
			/>
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'enter-meta'}
	<Questionnaire.Root data-testid="root" defaultItem="answer" shortcuts="letters">
		<Questionnaire.Item data-testid="answer" required name="answer">
			<Questionnaire.Title>Answer</Questionnaire.Title>
			<Choice data-testid="fixed" value="fixed">Fixed</Choice>
			<Questionnaire.Input data-testid="answer-input" aria-label="Another answer" />
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'descriptions'}
	<Questionnaire.Root data-testid="root" defaultItem="answer">
		<Questionnaire.Item data-testid="answer" required name="answer">
			<Questionnaire.Title>Answer</Questionnaire.Title>
			<Questionnaire.Description id="description-one">First description</Questionnaire.Description>
			{#if !flag}<Questionnaire.Description id="description-two"
					>Second description</Questionnaire.Description
				>{/if}
			<Choice value="answer">Answer</Choice>
			<Questionnaire.Error id="error-one">First error</Questionnaire.Error>
			{#if !flag}<Questionnaire.Error id="error-two">Second error</Questionnaire.Error>{/if}
		</Questionnaire.Item>
		<Questionnaire.Submit />
	</Questionnaire.Root>
{:else if scenario === 'reset'}
	<Questionnaire.Root data-testid="root" defaultItem="channels">
		<Questionnaire.Item data-testid="channels" multiple name="channels">
			<Questionnaire.Title>Channels</Questionnaire.Title>
			<Choice data-testid="email" defaultChecked value="email">Email</Choice>
			<Choice data-testid="chat" value="chat">Chat</Choice>
		</Questionnaire.Item>
		<TestItem required name="detail" />
		<Questionnaire.Previous data-testid="previous" />
		<Questionnaire.Skip data-testid="skip" />
		<Questionnaire.Next data-testid="next" />
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'disabled-item'}
	<Questionnaire.Root data-testid="root" defaultItem="first">
		<Questionnaire.Progress data-testid="progress" />
		<TestItem required name="first" />
		<TestItem disabled required name="disabled" />
		<TestItem required name="last" />
		<Questionnaire.Next data-testid="next" />
	</Questionnaire.Root>
{:else if scenario === 'dynamic-items'}
	<Questionnaire.Root data-testid="root" defaultItem="first" {onItemChange}>
		<Questionnaire.Progress data-testid="progress" />
		<TestItem required name="first" />
		{#if flag}<TestItem required name="middle" />{/if}
		<TestItem required name="last" />
		<Questionnaire.Next data-testid="next" />
	</Questionnaire.Root>
{:else if scenario === 'dynamic-answers'}
	<Questionnaire.Root data-testid="root" defaultItem="answers" shortcuts="letters">
		<Questionnaire.Item data-testid="answers" name="answers">
			<Questionnaire.Title>Choose an answer</Questionnaire.Title>
			<Choice data-testid="first-answer" value="first">First</Choice>
			{#if flag}<Choice data-testid="middle-answer" value="middle">Middle</Choice>{/if}
			<Choice data-testid="last-answer" value="last">Last</Choice>
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'keyed-order'}
	<Questionnaire.Root data-testid="root" defaultItem="first" shortcuts="letters">
		<Questionnaire.Progress data-testid="progress" />
		{#each flag ? ['last', 'first'] : ['first', 'last'] as name (name)}
			<Questionnaire.Item data-testid={name} {name}>
				<Questionnaire.Title>{name}</Questionnaire.Title>
				{#each flag ? ['b', 'a'] : ['a', 'b'] as value (value)}
					<Choice data-testid="{name}-{value}" {value}>{value}</Choice>
				{/each}
			</Questionnaire.Item>
		{/each}
	</Questionnaire.Root>
{:else if scenario === 'overflow'}
	<Questionnaire.Root data-testid="root" defaultItem="answers" {shortcuts}>
		<Questionnaire.Item data-testid="answers" name="answers">
			<Questionnaire.Title>Choose an answer</Questionnaire.Title>
			{#each Array.from({ length: count }, (_, index) => index) as index (index)}
				<Choice data-testid="answer-{index}" value="answer-{index}">Answer {index + 1}</Choice>
			{/each}
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'letters'}
	<Questionnaire.Root data-testid="root" defaultItem="answers" {onsubmit} shortcuts="letters">
		<Questionnaire.Item data-testid="answers" required name="answers">
			<Questionnaire.Title>Choose an answer</Questionnaire.Title>
			<Questionnaire.Choices data-testid="choices">
				<Choice data-testid="disabled-answer" disabled value="disabled">Disabled</Choice>
				<Choice data-testid="first-answer" value="first">First</Choice>
				<Choice data-testid="second-answer" value="second">Second</Choice>
				<Questionnaire.Input data-testid="other-answer" aria-label="Other answer" />
			</Questionnaire.Choices>
		</Questionnaire.Item>
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'numbers'}
	<Questionnaire.Root data-testid="root" defaultItem="first" {onsubmit} shortcuts="numbers">
		<TestItem required name="first" />
		<Questionnaire.Item data-testid="second" required name="second">
			<Questionnaire.Title>Explain</Questionnaire.Title>
			<Questionnaire.Input data-testid="second-input" aria-label="Explanation" />
		</Questionnaire.Item>
		<Questionnaire.Next data-testid="next" />
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'guards'}
	<Questionnaire.Root
		data-testid="root"
		defaultItem="answer"
		{onsubmit}
		onkeydown={(event) => {
			if (preventKeys) event.preventDefault();
		}}
		shortcuts="letters"
	>
		<Questionnaire.Item data-testid="answer" required name="answer">
			<Questionnaire.Title>Answer</Questionnaire.Title>
			<Choice data-testid="answer-choice" value="choice">Choice</Choice>
			<Questionnaire.Input data-testid="answer-input" aria-label="Other answer" />
		</Questionnaire.Item>
		<Questionnaire.Submit data-testid="submit" />
	</Questionnaire.Root>
{:else if scenario === 'composed'}
	<Questionnaire.Root data-testid="root" defaultItem="answer" shortcuts="letters">
		<Questionnaire.Item data-testid="answer" name="answer">
			<Questionnaire.Title>Answer</Questionnaire.Title>
			<Questionnaire.Choice data-testid="fixed" value="fixed">
				<Questionnaire.ChoiceInput data-testid="fixed-input" />
				<Questionnaire.ChoiceLabel data-testid="fixed-label">Fixed</Questionnaire.ChoiceLabel>
				<Questionnaire.ChoiceShortcut data-testid="fixed-shortcut" />
			</Questionnaire.Choice>
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'conditional-input'}
	<Questionnaire.Root data-testid="root" defaultItem="answer" shortcuts="letters">
		<Questionnaire.Item data-testid="answer" name="answer" required>
			<Questionnaire.Title>Answer</Questionnaire.Title>
			<Questionnaire.Choice data-testid="conditional-choice" value="conditional">
				{#if flag}<Questionnaire.ChoiceInput data-testid="conditional-input" />{/if}
				<Questionnaire.ChoiceLabel>Conditional</Questionnaire.ChoiceLabel>
				<Questionnaire.ChoiceShortcut />
			</Questionnaire.Choice>
		</Questionnaire.Item>
	</Questionnaire.Root>
{:else if scenario === 'render'}
	<Questionnaire.Root data-testid="root" defaultItem="only">
		<Questionnaire.Progress data-testid="progress">
			{#snippet render(props, state)}
				<output {...props}>{state.current}/{state.total}</output>
			{/snippet}
		</Questionnaire.Progress>
		<TestItem required name="only" />
		<Questionnaire.Submit data-testid="submit">
			{#snippet render(props, state, children)}
				<button
					{...props}
					data-render-status={state.status}
					disabled={state.status === 'unanswered'}>{@render children?.()}</button
				>
			{/snippet}
		</Questionnaire.Submit>
	</Questionnaire.Root>
{:else if scenario === 'custom-title'}
	<Questionnaire.Root defaultItem="only">
		<Questionnaire.Item aria-labelledby="only-title" data-testid="only" name="only">
			<Questionnaire.Title id="only-title" data-testid="custom-title">
				{#snippet render(props, _state, children)}
					<h2 {...props}>{@render children?.()}</h2>
				{/snippet}
				Custom title
			</Questionnaire.Title>
			<Choice value="answer">Answer</Choice>
		</Questionnaire.Item>
	</Questionnaire.Root>
{/if}
