<!--
	A freeform answer, named by its item. Renders an `<input>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/components.tsx and use-questionnaire-input.ts
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { chain } from '../internal/mergeProps.js';
	import { getItem, InputModel } from './item-state.svelte.js';
	import type { QuestionnaireInputProps, QuestionnaireInputState } from './types.js';
	import { dataAttributes, getAnswerKeyShortcuts } from './utils.js';

	const id = $props.id();
	let {
		value = $bindable(),
		defaultValue,
		type = 'text',
		disabled = false,
		oninput,
		render,
		...rest
	}: QuestionnaireInputProps = $props();

	const item = getItem();
	value ??= untrack(() => defaultValue);
	const input = new InputModel(item, {
		get value() {
			return value;
		},
		set value(next) {
			value = next;
		},
		get defaultValue() {
			return defaultValue;
		},
		get disabled() {
			return disabled;
		}
	});
	item.register(input);
	onDestroy(() => item.unregister(input));

	const attachment = createAttachmentKey();
	const state: QuestionnaireInputState = $derived({
		disabled: input.disabled,
		filled: input.filled,
		invalid: item.invalid
	});
	const attributes = $derived({
		'aria-invalid': item.invalid || undefined,
		'aria-keyshortcuts': getAnswerKeyShortcuts(null, !input.disabled && input.answered),
		value,
		defaultValue: input.default,
		disabled: input.disabled,
		form: input.selected ? undefined : '',
		id,
		name: input.selected ? item.name : undefined,
		type,
		...dataAttributes(state, { filled: ['filled', 'empty'] }),
		...rest,
		oninput: chain(
			(event: Event & { currentTarget: EventTarget & HTMLInputElement }) =>
				input.input(event.currentTarget),
			oninput
		),
		[attachment]: input.attach
	});
</script>

{#if render}
	{@render render(attributes, state)}
{:else}
	<input {...attributes} />
{/if}
