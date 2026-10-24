<!--
	The native radio or checkbox of a choice. Renders an `<input>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/components.tsx and use-questionnaire-choice.ts
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { chain } from '../internal/mergeProps.js';
	import { getChoice } from './item-state.svelte.js';
	import type { QuestionnaireChoiceInputProps, QuestionnaireChoiceState } from './types.js';
	import { dataAttributes, getAnswerKeyShortcuts } from './utils.js';

	let { render, onchange, ...rest }: QuestionnaireChoiceInputProps = $props();

	const choice = getChoice();
	const item = choice.item;
	item.register(choice);
	onDestroy(() => item.unregister(choice));

	const attachment = createAttachmentKey();
	const state: QuestionnaireChoiceState = $derived({
		checked: choice.checked,
		disabled: choice.disabled,
		invalid: item.invalid,
		shortcut: choice.shortcut,
		type: choice.type
	});
	const attributes = $derived({
		'aria-invalid': item.invalid || undefined,
		'aria-keyshortcuts': getAnswerKeyShortcuts(choice.shortcut, !choice.disabled && choice.checked),
		checked: choice.checked,
		defaultChecked: choice.default,
		disabled: choice.disabled,
		id: choice.id,
		name: item.status === 'skipped' ? undefined : item.name,
		required: item.required && !item.multiple && !item.hasInputAnswer,
		type: choice.type,
		value: choice.value,
		...dataAttributes(state, { checked: ['checked', 'unchecked'] }),
		...rest,
		onchange: chain(choice.change, onchange),
		[attachment]: choice.attach
	});
</script>

{#if render}
	{@render render(attributes, state)}
{:else}
	<input {...attributes} />
{/if}
