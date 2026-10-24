<script lang="ts">
	import { Questionnaire } from '#lib';
	import type { QuestionnaireItemProps } from '#lib';
	import Choice from './QuestionnaireChoiceHarness.svelte';
	let props: QuestionnaireItemProps = $props();
</script>

<Questionnaire.Item data-testid={props.name} {...props}>
	<Questionnaire.Title>{props.name}</Questionnaire.Title>
	<Choice data-testid="{props.name}-choice" value="{props.name}-answer">Answer</Choice>
	<Questionnaire.Error data-testid="{props.name}-error" />
</Questionnaire.Item>
