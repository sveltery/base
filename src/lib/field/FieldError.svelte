<!--
	An error message displayed if the field control fails validation.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/field/error/FieldError.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getStateAttributesProps,
		transitionStatusMapping
	} from '../internal/state-attributes.js';
	import { fieldValidityMapping } from './attributes.js';
	import { useFieldContext } from '../internal/field-root-context.js';
	import { useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
	import type { FieldErrorProps, FieldErrorState } from './types.js';

	const uid = $props.id();
	const elementKey = createAttachmentKey();

	let { id: idProp, match, render, children, ...elementProps }: FieldErrorProps = $props();

	const field = useFieldContext();
	const labelable = useLabelableContext();
	const id = $derived(idProp ?? `base-ui-${uid}`);

	const hasSpecificMatch = $derived(typeof match === 'string');
	const formError = $derived(field.formError);
	const hasFormError = $derived(field.hasFormError);

	const rendered = $derived.by(() => {
		if (match === true) return true;
		if (field.state.disabled) return false;
		if (hasSpecificMatch && match) return Boolean(field.validityData.state[match]);
		return hasFormError || field.validityData.state.valid === false;
	});

	const message = $derived.by(() => {
		if (!hasSpecificMatch && hasFormError) return formError;
		if (field.validityData.errors.length > 1) return field.validityData.errors;
		return field.validityData.error;
	});

	const transition = new TransitionStatus(() => rendered);

	// The message to show while the error animates out.
	let frozen = $state(untrack(() => (rendered ? (message ?? null) : null)));
	$effect.pre(() => {
		if (rendered) frozen = message ?? null;
	});

	let errorEl = $state<HTMLDivElement | null>(null);
	transition.unmountAfterExit(() => errorEl);

	$effect(() => {
		if (!rendered || !id) return;
		const messageId = id;
		labelable.addMessageId(messageId);
		return () => {
			labelable.deleteMessageId(messageId);
		};
	});

	function remember(node: HTMLElement) {
		if (node instanceof HTMLDivElement) errorEl = node;
		return () => {
			if (errorEl === node) errorEl = null;
		};
	}

	const errorState: FieldErrorState = $derived({
		...field.state,
		transitionStatus: transition.transitionStatus
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(errorState, { ...fieldValidityMapping, ...transitionStatusMapping }),
		id,
		[elementKey]: remember
	});

	const visibleMessage = $derived(rendered ? message : frozen);
</script>

{#snippet body(content: string | string[] | null)}
	{#if Array.isArray(content)}
		{#if content.length > 1}
			<ul>
				{#each content as item, index (index)}
					<li>{item}</li>
				{/each}
			</ul>
		{:else}
			{content[0]}
		{/if}
	{:else}
		{content}
	{/if}
{/snippet}

{#snippet messageText()}
	{@render body(visibleMessage)}
{/snippet}

{#if transition.mounted}
	{#if render}
		{@render render(
			hostProps as HTMLAttributes<HTMLElement>,
			errorState,
			children ?? (visibleMessage != null ? messageText : undefined)
		)}
	{:else}
		<div {...hostProps}>
			{#if children}
				{@render children()}
			{:else}
				{@render messageText()}
			{/if}
		</div>
	{/if}
{/if}
