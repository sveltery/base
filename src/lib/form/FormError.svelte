<!--
	Messages no field shows: the source's root issues, issues on paths no mounted Field claims,
	and `errors` entries no registered Field has. Renders a `<div>` element.
	Sveltery addition with no Base UI counterpart. Before hydration only root issues render,
	because Fields later in the markup have not claimed their paths yet.
-->
<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getStateAttributesProps,
		transitionStatusMapping
	} from '../internal/state-attributes.js';
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
	import { useFormContext } from './context.js';
	import type { FormErrorProps, FormErrorState } from './types.js';

	const elementKey = createAttachmentKey();

	let { role = 'alert', render, children, ...elementProps }: FormErrorProps = $props();

	const form = useFormContext();
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	const messages = $derived.by(() => {
		const issues = form.issues.unclaimedIssues;
		if (!mounted) return issues.filter((issue) => issue.path.length === 0).map((i) => i.message);
		const list = issues.map((issue) => issue.message);
		for (const [key, error] of Object.entries(form.errors)) {
			if (!form.issues.isClaimed(key)) list.push(...([] as string[]).concat(error));
		}
		return list;
	});

	const rendered = $derived(messages.length > 0);
	const transition = new TransitionStatus(() => rendered);

	// The messages to show while the error animates out.
	let frozen = $state(untrack(() => messages));
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
		role,
		...getStateAttributesProps(errorState, transitionStatusMapping),
		[elementKey]: remember
	});

	const visibleMessages = $derived(rendered ? messages : frozen);
</script>

{#snippet messageText()}
	{#if visibleMessages.length > 1}
		<ul>
			{#each visibleMessages as item, index (index)}
				<li>{item}</li>
			{/each}
		</ul>
	{:else}
		{visibleMessages[0]}
	{/if}
{/snippet}

{#if transition.mounted}
	{#if render}
		{@render render(hostProps as HTMLAttributes<HTMLElement>, errorState, children ?? messageText)}
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
