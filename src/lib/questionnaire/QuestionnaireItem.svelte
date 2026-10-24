<!--
	One step of the questionnaire, hidden while another step is active. Renders a `<fieldset>` element.
	Derived from @shadcn/react v0.3.1 packages/react/src/questionnaire/components.tsx and use-questionnaire-item.ts
	(commit 30a58d4498f270af1c1e981a7d78a15cf5740841). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ItemModel, setItem } from './item-state.svelte.js';
	import { getRoot } from './root-state.svelte.js';
	import type { QuestionnaireItemProps } from './types.js';
	import { dataAttributes } from './utils.js';

	let {
		name,
		required = false,
		multiple = false,
		disabled = false,
		invalid = false,
		onStatusChange,
		'aria-describedby': describedBy,
		'aria-keyshortcuts': keyShortcuts,
		children,
		...rest
	}: QuestionnaireItemProps = $props();

	const root = getRoot();
	const item = new ItemModel(root, {
		get name() {
			return name;
		},
		get required() {
			return required;
		},
		get multiple() {
			return multiple;
		},
		get disabled() {
			return disabled;
		},
		get invalid() {
			return invalid;
		},
		get onStatusChange() {
			return onStatusChange;
		}
	});
	setItem(item);
	root.register(item);
	onDestroy(() => root.unregister(item));
	$effect.pre(() => item.syncMultiple());
	$effect.pre(() => item.clearSkip());
	$effect(() => item.reportStatus());

	const active = $derived(item.active);
	const itemState = $derived({
		active,
		disabled,
		invalid: item.invalid,
		multiple,
		required,
		status: item.status
	});
	const join = (...parts: (string | false | null | undefined)[]) =>
		parts.filter(Boolean).join(' ') || undefined;
</script>

<!-- svelte-ignore a11y_role_supports_aria_props_implicit -->
<fieldset
	aria-describedby={join(...item.descriptions, ...(item.invalid ? item.errors : []), describedBy)}
	aria-invalid={item.invalid || undefined}
	aria-keyshortcuts={join(
		keyShortcuts,
		active && 'Meta+Enter Control+Enter',
		active && item.answers.length > 0 && 'ArrowUp ArrowDown',
		active && !root.state.first && 'ArrowLeft',
		active && !root.state.last && item.status !== 'unanswered' && 'ArrowRight'
	)}
	{disabled}
	hidden={!active}
	inert={!active}
	tabindex="-1"
	{...dataAttributes(itemState)}
	{...rest}
	{@attach item.attach}
>
	{@render children?.()}
</fieldset>
