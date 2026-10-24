# Questionnaire

<Subtitle>
  A form that asks one question at a time, with validation, skipping and keyboard shortcuts.
</Subtitle>

<Meta name="description" content="A form that asks one question at a time, with validation, skipping and keyboard shortcuts." />

<DemoQuestionnaireHero />

Questionnaire ports the questionnaire of [`@shadcn/react`](https://github.com/shadcn-ui/ui/tree/main/packages/react) v0.3.1. It follows that package, not Base UI.

## Anatomy

Import the component and assemble its parts:

```svelte title="Anatomy"
<script lang="ts">
	import { Questionnaire } from '@sveltery/base/questionnaire';
</script>

<Questionnaire.Root>
	<Questionnaire.Progress />
	<Questionnaire.Item>
		<Questionnaire.Title />
		<Questionnaire.Description />
		<Questionnaire.Choices>
			<Questionnaire.Choice>
				<Questionnaire.ChoiceInput />
				<Questionnaire.ChoiceShortcut />
				<Questionnaire.ChoiceLabel />
			</Questionnaire.Choice>
			<Questionnaire.Input />
		</Questionnaire.Choices>
		<Questionnaire.Error />
	</Questionnaire.Item>
	<Questionnaire.Previous />
	<Questionnaire.Skip />
	<Questionnaire.Next />
	<Questionnaire.Submit />
</Questionnaire.Root>
```

## Server rendering

Pass `items` to Root to render the active item, the progress and the shortcuts on the server. Without it, Root learns the items as they mount.

## Keyboard

- <kbd>Enter</kbd> on an answer moves to the next item, or submits from the last one.
- <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or <kbd>Cmd</kbd>+<kbd>Enter</kbd> does the same from anywhere in the item.
- <kbd>ArrowUp</kbd> and <kbd>ArrowDown</kbd> move between answers.
- <kbd>ArrowLeft</kbd> and <kbd>ArrowRight</kbd> move between items, outside text fields and radios.
- With `shortcuts`, a letter or a number selects its choice.

## API reference

<script>
	import { DemoQuestionnaireHero } from './demos/hero';
	import { TypesQuestionnaire } from './types';
</script>

### Root

<TypesQuestionnaire.Root />

### Progress

<TypesQuestionnaire.Progress />

### Item

<TypesQuestionnaire.Item />

### Title

<TypesQuestionnaire.Title />

### Description

<TypesQuestionnaire.Description />

### Choices

<TypesQuestionnaire.Choices />

### Choice

<TypesQuestionnaire.Choice />

### ChoiceInput

<TypesQuestionnaire.ChoiceInput />

### ChoiceLabel

<TypesQuestionnaire.ChoiceLabel />

### ChoiceShortcut

<TypesQuestionnaire.ChoiceShortcut />

### Input

<TypesQuestionnaire.Input />

### Error

<TypesQuestionnaire.Error />

### Previous

<TypesQuestionnaire.Previous />

### Skip

<TypesQuestionnaire.Skip />

### Next

<TypesQuestionnaire.Next />

### Submit

<TypesQuestionnaire.Submit />
