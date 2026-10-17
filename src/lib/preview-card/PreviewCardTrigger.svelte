<!--
	A link that opens the preview card. Renders an `<a>` element.
	Derived from Base UI v1.9.0 packages/react/src/preview-card/trigger/PreviewCardTrigger.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The link stays mounted when a handle receives its root store.
-->
<script lang="ts" generics="Payload = unknown">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { triggerOpenStateMapping } from '../internal/popups/index.js';
	import { CLOSE_DELAY, OPEN_DELAY } from './constants.js';
	import { findPreviewCardRoot } from './context.svelte.js';
	import PreviewCardTriggerInteractions from './PreviewCardTriggerInteractions.svelte';
	import { PreviewCardStore } from './store.svelte.js';
	import type { TriggerArmed } from './trigger-armed.js';
	import type { PreviewCardTriggerProps, PreviewCardTriggerState } from './types.js';

	let {
		handle,
		payload,
		id,
		delay = OPEN_DELAY,
		closeDelay = CLOSE_DELAY,
		render,
		children,
		...elementProps
	}: PreviewCardTriggerProps<Payload> = $props();

	const root = findPreviewCardRoot();
	if (!untrack(() => handle) && !root) {
		throw new Error(
			'Base UI: <PreviewCard.Trigger> must be either used within a <PreviewCard.Root> component or provided with a handle.'
		);
	}

	const uid = $props.id();
	const triggerId = $derived(id ?? `base-ui-${uid}`);
	const bindKey = createAttachmentKey();
	const hoverKey = createAttachmentKey();
	let triggerEl = $state<HTMLElement | null>(null);
	let armed = $state.raw<TriggerArmed | null>(null);

	const live = $derived(handle ? handle.attached : (root ?? null));

	function owned() {
		return { payload, closeDelay };
	}

	$effect(() => {
		const registeredId = triggerId;
		const node = triggerEl;
		const current = live;
		if (!node) return;
		untrack(() => {
			if (current instanceof PreviewCardStore) current.noteTrigger(registeredId, node, owned);
			else handle?.fallbackTriggers.add(registeredId, node);
		});
		return () => {
			untrack(() => {
				if (current instanceof PreviewCardStore) current.forgetTrigger(registeredId, node);
				else if (handle?.fallbackTriggers.getById(registeredId) === node) {
					handle.fallbackTriggers.delete(registeredId);
				}
			});
		};
	});

	function bindTrigger(node: HTMLElement) {
		triggerEl = node;
		return () => {
			if (triggerEl === node) triggerEl = null;
		};
	}

	function acceptArmed(next: TriggerArmed | null) {
		armed = next;
	}

	function attachReference(node: HTMLElement) {
		const attach = armed?.attach;
		if (!attach) return;
		return untrack(() => attach(node));
	}

	const opened = $derived(live?.openedBy(triggerId) ?? false);
	const partState: PreviewCardTriggerState = $derived({ open: opened });

	const hostProps = $derived(
		mergeProps(
			armed?.hover,
			armed?.focus,
			live?.dismissReference,
			armed?.inline,
			{
				id: triggerId,
				...getStateAttributesProps(partState, triggerOpenStateMapping),
				[bindKey]: bindTrigger,
				[hoverKey]: attachReference
			},
			elementProps
		)
	);
</script>

{#if live}
	{#key live}
		<PreviewCardTriggerInteractions
			store={live}
			{delay}
			{closeDelay}
			isOpen={() => opened}
			onArmed={acceptArmed}
		/>
	{/key}
{/if}
{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<a {...hostProps}>{@render children?.()}</a>
{/if}
