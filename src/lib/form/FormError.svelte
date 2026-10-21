<!--
	Messages that belong to the form and to no field, such as a remote form's
	`invalid('Too many attempts')` or a form action's `errors['']`.
	Renders a `<div>` element. Sveltery addition, with no Base UI counterpart.
-->
<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { DEV } from 'esm-env';
	import type { HTMLAttributes } from 'svelte/elements';
	import { isFormProvided, useFormContext } from '../internal/form-context.js';
	import {
		getStateAttributesProps,
		transitionStatusMapping
	} from '../internal/state-attributes.js';
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
	import type { FormErrorProps, FormErrorState } from './types.js';

	const elementKey = createAttachmentKey();

	let { id: idProp, match, render, children, ...elementProps }: FormErrorProps = $props();

	const form = useFormContext();
	const provided = isFormProvided(form);
	if (DEV && !provided) {
		console.warn('Base UI: <Form.Error> must be placed within <Form>. It renders nothing here.');
	}

	const id = $derived(idProp ?? form.errorId);
	const messages = $derived([...form.formMessages]);

	const rendered = $derived.by(() => {
		if (!provided) return false;
		if (match === true) return true;
		if (typeof match === 'string' && match !== 'customError') return false;
		return messages.length > 0;
	});

	const transition = new TransitionStatus(() => rendered);

	// The messages to show while the error animates out.
	let frozen = $state(untrack(() => (rendered ? messages : [])));
	$effect.pre(() => {
		if (rendered) frozen = messages;
	});

	let errorEl = $state<HTMLDivElement | null>(null);
	transition.unmountAfterExit(() => errorEl);

	function remember(node: HTMLElement) {
		if (node instanceof HTMLDivElement) errorEl = node;
		return () => {
			if (errorEl === node) errorEl = null;
		};
	}

	const errorState: FormErrorState = $derived({ transitionStatus: transition.transitionStatus });

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(errorState, transitionStatusMapping),
		id,
		[elementKey]: remember
	});

	const visible = $derived(rendered ? messages : frozen);
	const content = $derived(children as Snippet<[string[]]> | undefined);
</script>

{#snippet messageText()}
	{#if content}
		{@render content(visible)}
	{:else if visible.length > 1}
		<ul>
			{#each visible as item, index (index)}
				<li>{item}</li>
			{/each}
		</ul>
	{:else}
		{visible[0]}
	{/if}
{/snippet}

{#if transition.mounted}
	{#if render}
		{@render render(hostProps as HTMLAttributes<HTMLElement>, errorState, messageText)}
	{:else}
		<div {...hostProps}>{@render messageText()}</div>
	{/if}
{/if}
