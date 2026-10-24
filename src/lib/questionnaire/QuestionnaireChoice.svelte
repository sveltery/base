<!--
	A fixed answer, with its native control inside. Renders a `<label>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/components.tsx and use-questionnaire-choice.ts
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { ChoiceModel, getItem, setChoice } from './item-state.svelte.js';
	import type { QuestionnaireChoiceProps, QuestionnaireChoiceState } from './types.js';
	import { dataAttributes } from './utils.js';

	const id = $props.id();
	let {
		value,
		checked = $bindable(),
		defaultChecked,
		disabled = false,
		onchange,
		render,
		children,
		...rest
	}: QuestionnaireChoiceProps = $props();

	const item = getItem();
	checked ??= untrack(() => defaultChecked) ?? false;
	const choice = new ChoiceModel(item, {
		id,
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		get checked() {
			return checked ?? false;
		},
		set checked(next) {
			checked = next;
		},
		get defaultChecked() {
			return defaultChecked;
		},
		get onchange() {
			return onchange;
		}
	});
	setChoice(choice);

	const state: QuestionnaireChoiceState = $derived({
		checked: choice.checked,
		disabled: choice.disabled,
		invalid: item.invalid,
		shortcut: choice.shortcut,
		type: choice.type
	});
	const attributes = $derived({
		...dataAttributes(state, { checked: ['checked', 'unchecked'] }),
		...rest
	});
</script>

{#if render}
	{@render render(attributes, state, children)}
{:else}
	<label {...attributes}>{@render children?.()}</label>
{/if}
