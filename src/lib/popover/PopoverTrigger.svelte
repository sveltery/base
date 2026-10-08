<!--
	A button that opens the popover. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/trigger/PopoverTrigger.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The button stays mounted when a handle receives its root store.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import FocusGuard from '../internal/FocusGuard.svelte';
	import { CLICK_TRIGGER_IDENTIFIER } from '../internal/floating-ui/index.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useButton } from '../internal/useButton.js';
	import { triggerOpenAttributes } from './attributes.js';
	import { OPEN_DELAY } from './constants.js';
	import { usePopoverRoot } from './context.svelte.js';
	import type { PopoverHandle } from './handle.svelte.js';
	import PopoverTriggerInteractions from './PopoverTriggerInteractions.svelte';
	import { PopoverStore } from './store.svelte.js';
	import type { TriggerArmed } from './trigger-armed.js';
	import type { PopoverTriggerProps, PopoverTriggerState } from './types.js';

	let {
		handle,
		disabled = false,
		nativeButton = true,
		payload,
		id,
		openOnHover = false,
		delay = OPEN_DELAY,
		closeDelay = 0,
		render,
		children,
		...elementProps
	}: PopoverTriggerProps = $props();

	const root = usePopoverRoot(true);
	if (!handle && !root) {
		throw new Error(
			'Base UI: <Popover.Trigger> must be either used within a <Popover.Root> component or provided with a handle.'
		);
	}

	const uid = $props.id();
	const triggerId = $derived(id ?? `base-ui-${uid}`);
	const bindKey = createAttachmentKey();
	let triggerEl = $state<HTMLElement | null>(null);
	let armed = $state<TriggerArmed | null>(null);

	const live = $derived(root ?? (handle as PopoverHandle | undefined)?.attached ?? null);

	const seedStore = root;
	const seedId = id ?? `base-ui-${uid}`;
	if (seedStore?.open && seedStore.resolvedActiveTriggerId() == null) {
		seedStore.writeTriggerId(seedId);
	}

	function owned() {
		return { payload, disabled, openOnHover, closeDelay };
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
			if (current instanceof PopoverStore) current.noteTrigger(registeredId, node, owned);
			else handle?.fallbackTriggers.add(registeredId, node);
		});
		return () => {
			untrack(() => {
				if (current instanceof PopoverStore) current.forgetTrigger(registeredId, node);
				else if (handle?.fallbackTriggers.getById(registeredId) === node) {
					handle.fallbackTriggers.delete(registeredId);
				}
			});
		};
	});

	$effect(() => {
		const node = triggerEl;
		const attachHover = armed?.attach;
		if (!node || !attachHover) return;
		const clearHover = untrack(() => attachHover(node));
		return () => clearHover();
	});

	$effect(() => {
		handle?.setPayload(triggerId, payload as never);
		return () => handle?.forgetPayload(triggerId);
	});

	const opened = $derived(live?.openedBy(triggerId) ?? false);
	const partState: PopoverTriggerState = $derived({ disabled, open: opened });
	const showGuards = $derived(Boolean(live?.mountedBy(triggerId) && !live.focusManagerModal));

	const hostProps = $derived(
		mergeProps(
			elementProps,
			useButton(disabled, nativeButton),
			armed?.click,
			armed?.hover,
			live?.dismissReference,
			{
				id: triggerId,
				'aria-haspopup': 'dialog' as const,
				'aria-expanded': opened,
				...(live?.popupIdFor(triggerId) ? { 'aria-controls': live.popupIdFor(triggerId) } : {}),
				[CLICK_TRIGGER_IDENTIFIER]: '',
				...(disabled ? { 'data-disabled': '' } : {}),
				...getStateAttributesProps(
					{ open: opened },
					triggerOpenAttributes(opened, live?.openChangeReason ?? null)
				),
				[bindKey]: (node: HTMLElement) => {
					triggerEl = node;
					return () => {
						if (triggerEl === node) triggerEl = null;
					};
				}
			}
		)
	);
</script>

{#if live}
	{#key live}
		<PopoverTriggerInteractions
			store={live}
			{disabled}
			{openOnHover}
			{delay}
			{closeDelay}
			triggerEl={readNode}
			bind:armed
		/>
	{/key}
{/if}
{#if showGuards && armed}
	<FocusGuard {...armed.guards.preFocusGuardProps} />
{/if}
{#if render}
	{@render render(hostProps, partState, childrenSnippet)}
{:else}
	<button {...hostProps}>{@render childrenSnippet()}</button>
{/if}
{#if showGuards && armed}
	<FocusGuard {...armed.guards.focusTargetProps} />
{/if}

{#snippet childrenSnippet()}
	{@render children?.()}
{/snippet}
