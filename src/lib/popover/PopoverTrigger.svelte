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
	const hoverKey = createAttachmentKey();
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

	function bindTrigger(node: HTMLElement) {
		triggerEl = node;
		return () => {
			if (triggerEl === node) triggerEl = null;
		};
	}

	// These three do not bubble, so Svelte registers them on the element. Swapping
	// the handler leaves the first listener in place, and destroying the element
	// does not remove it. Own them here so root and trigger teardown remove them.
	const localHoverEvents = ['onmouseenter', 'onmouseleave', 'onpointerenter'] as const;

	function hoverListener(
		node: HTMLElement,
		key: (typeof localHoverEvents)[number]
	): EventListener | null {
		const consumer = elementProps[key];
		const ours = armed?.hover?.[key];
		if (typeof consumer !== 'function' && typeof ours !== 'function') return null;
		return (event: Event) => {
			if (typeof consumer === 'function') {
				(consumer as EventListener).call(node, event);
				if (event.defaultPrevented) return;
			}
			if (typeof ours === 'function') (ours as EventListener).call(node, event);
		};
	}

	function attachHover(node: HTMLElement) {
		const removals: Array<() => void> = [];
		for (const key of localHoverEvents) {
			const listener = hoverListener(node, key);
			if (!listener) continue;
			const type = key.slice(2);
			node.addEventListener(type, listener);
			removals.push(() => node.removeEventListener(type, listener));
		}
		const attach = armed?.attach;
		const detach = attach ? untrack(() => attach(node)) : undefined;
		return () => {
			for (const remove of removals) remove();
			detach?.();
		};
	}

	function acceptArmed(next: TriggerArmed | null) {
		armed = next;
	}

	const opened = $derived(live?.openedBy(triggerId) ?? false);
	const partState: PopoverTriggerState = $derived({ disabled, open: opened });
	const showGuards = $derived(Boolean(live?.mountedBy(triggerId) && !live.focusManagerModal));

	const hostProps = $derived.by(() => {
		const merged = mergeProps(
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
				[bindKey]: bindTrigger,
				[hoverKey]: attachHover
			}
		);
		const record = merged as Record<string, unknown>;
		for (const key of localHoverEvents) delete record[key];
		return merged;
	});
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
			onArmed={acceptArmed}
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
