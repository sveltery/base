<!--
	An element to attach the tooltip to. Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/tooltip/trigger/TooltipTrigger.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The element stays mounted when a handle receives its root store.
-->
<script lang="ts" generics="Payload = unknown">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { mergeProps } from '../internal/mergeProps.js';
	import { triggerOpenStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { TOOLTIP_TRIGGER_IDENTIFIER } from './constants.js';
	import { findTooltipRoot } from './context.svelte.js';
	import { TooltipStore } from './store.svelte.js';
	import type { TooltipTriggerArmed } from './trigger-armed.js';
	import TooltipTriggerInteractions from './TooltipTriggerInteractions.svelte';
	import type { TooltipTriggerProps, TooltipTriggerState } from './types.js';

	let {
		handle,
		payload,
		disabled: disabledProp = undefined,
		delay = undefined,
		closeOnClick = true,
		closeDelay = undefined,
		id,
		render,
		children,
		...elementProps
	}: TooltipTriggerProps<Payload> = $props();

	const root = findTooltipRoot();
	if (!untrack(() => handle) && !root) {
		throw new Error(
			'Base UI: <Tooltip.Trigger> must be either used within a <Tooltip.Root> component or provided with a handle.'
		);
	}

	const uid = $props.id();
	const triggerId = $derived(id ?? `base-ui-${uid}`);
	const bindKey = createAttachmentKey();
	const hoverKey = createAttachmentKey();
	let triggerEl = $state<HTMLElement | null>(null);
	let armed = $state.raw<TooltipTriggerArmed | null>(null);

	const live = $derived(handle ? handle.attached : (root ?? null));
	const disabled = $derived(disabledProp ?? live?.disabled ?? false);

	function owned() {
		return { payload, closeDelay: closeDelay ?? 0, closeOnClick };
	}

	function readNode() {
		return triggerEl;
	}

	$effect(() => {
		const registeredId = triggerId;
		const node = triggerEl;
		const current = live;
		if (!node) return;
		untrack(() => {
			if (current instanceof TooltipStore) current.noteTrigger(registeredId, node, owned);
			else handle?.fallbackTriggers.add(registeredId, node);
		});
		return () => {
			untrack(() => {
				if (current instanceof TooltipStore) current.forgetTrigger(registeredId, node);
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

	function acceptArmed(next: TooltipTriggerArmed | null) {
		armed = next;
	}

	function attachReference(node: HTMLElement) {
		const attach = armed?.attach;
		if (!attach) return;
		return untrack(() => attach(node));
	}

	const opened = $derived(live?.openedBy(triggerId) ?? false);
	const partState: TooltipTriggerState = $derived({ open: opened });
	const rootTriggerProps = $derived(
		live && (live.mountedBy(triggerId) || live.trackCursorAxis !== 'none')
			? live.rootTriggerProps
			: undefined
	);

	const hostProps = $derived(
		mergeProps(
			armed?.base,
			rootTriggerProps,
			armed?.local,
			{
				id: triggerId,
				...(disabled ? { 'data-trigger-disabled': '' } : { [TOOLTIP_TRIGGER_IDENTIFIER]: '' }),
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
		<TooltipTriggerInteractions
			store={live}
			{triggerId}
			{disabled}
			{delay}
			{closeDelay}
			{closeOnClick}
			triggerEl={readNode}
			onArmed={acceptArmed}
		/>
	{/key}
{/if}
{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
