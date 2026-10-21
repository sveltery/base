<!--
	An error message displayed if the field control fails validation.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/field/error/FieldError.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { onDestroy, untrack, type Snippet } from 'svelte';
	import { DEV } from 'esm-env';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getStateAttributesProps,
		transitionStatusMapping
	} from '../internal/state-attributes.js';
	import { fieldValidityMapping } from './attributes.js';
	import { DEFAULT_FIELD_ROOT_CONTEXT, useFieldContext } from '../internal/field-root-context.js';
	import { useLabelableContext } from '../internal/labelable-provider.svelte.js';
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
	import type { FieldErrorProps, FieldErrorState } from './types.js';
	import { getShownFieldValidityData } from './validity.js';

	const uid = $props.id();
	const elementKey = createAttachmentKey();

	let { id: idProp, match, render, children, ...elementProps }: FieldErrorProps = $props();

	const field = useFieldContext();
	const detached = field === DEFAULT_FIELD_ROOT_CONTEXT;
	if (DEV && detached) {
		console.warn(
			'Base UI: <Field.Error> must be placed within <Field.Root>. It renders nothing here. For messages that belong to the whole form, use <Form.Error>.'
		);
	}
	const labelable = useLabelableContext();
	// The control lists this id in `aria-describedby` before the error renders.
	const reservedId = labelable.claimReservedId('error');
	onDestroy(() => {
		if (reservedId) labelable.releaseReservedId('error');
	});
	const id = $derived(idProp ?? reservedId ?? `base-ui-${uid}`);

	const shown = $derived(
		getShownFieldValidityData(field.validityData, field.invalid, field.externalErrors)
	);

	const rendered = $derived.by(() => {
		if (detached) return false;
		if (match === true) return true;
		if (field.state.disabled) return false;
		if (typeof match === 'string') return Boolean(shown.state[match]);
		return field.hasExternalErrors || field.validityData.state.valid === false;
	});

	const message = $derived(shown.errors.length > 1 ? shown.errors : shown.error);

	const transition = new TransitionStatus(() => rendered);

	// The message to show while the error animates out.
	let frozen = $state(untrack(() => (rendered ? (message ?? null) : null)));
	$effect.pre(() => {
		if (rendered) frozen = message ?? null;
	});

	let errorEl = $state<HTMLDivElement | null>(null);
	transition.unmountAfterExit(() => errorEl);

	$effect(() => {
		if (!rendered || !id || id === reservedId) return;
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
	const visibleMessages = $derived(
		visibleMessage == null ? [] : ([] as string[]).concat(visibleMessage).filter(Boolean)
	);
	const content = $derived(children as Snippet<[string[]]> | undefined);
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
	{#if content}
		{@render content(visibleMessages)}
	{:else}
		{@render body(visibleMessage)}
	{/if}
{/snippet}

{#if transition.mounted}
	{#if render}
		{@render render(
			hostProps as HTMLAttributes<HTMLElement>,
			errorState,
			content || visibleMessage != null ? messageText : undefined
		)}
	{:else}
		<div {...hostProps}>
			{@render messageText()}
		</div>
	{/if}
{/if}
