<!--
	A button that opens the popover. Renders a `<button>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/trigger/PopoverTrigger.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The element stays mounted when a handle swaps the fallback registry for the live root.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import FocusGuard from '../internal/FocusGuard.svelte';
	import { REASONS } from '../internal/event-details.js';
	import {
		CLICK_TRIGGER_IDENTIFIER,
		safePolygon,
		useClick,
		useHoverReferenceInteraction
	} from '../internal/floating-ui/index.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { openInteractionProps } from '../internal/openInteraction.js';
	import { useTriggerFocusGuards } from '../internal/popups/index.js';
	import type { PopupHandleStore } from '../internal/popups/popupHandle.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useButton } from '../internal/useButton.js';
	import { triggerOpenAttributes } from './attributes.js';
	import { OPEN_DELAY } from './constants.js';
	import { usePopoverRoot } from './context.svelte.js';
	import { followPopupStore } from './follow-store.js';
	import type { PopoverHandle } from './handle.js';
	import { PopoverStore } from './store.svelte.js';
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
	let epoch = $state(0);
	let triggerEl = $state<HTMLElement | null>(null);

	function readStore(): PopoverStore | null {
		if (root) return root;
		const current = (handle as PopoverHandle | undefined)?.rootStore ?? null;
		return current;
	}

	const store = root
		? root
		: followPopupStore(readStore, (handle as PopoverHandle).fallback.triggers);

	$effect(() => {
		if (!handle) return;
		return handle.subscribe(() => {
			epoch += 1;
		});
	});

	const initial = readStore();
	const initialId = id ?? `base-ui-${uid}`;
	if (initial?.open && initial.resolvedActiveTriggerId() == null) {
		initial.writeTriggerId(initialId);
	}

	function owned() {
		return { payload, disabled, openOnHover, closeDelay };
	}

	function bindTo(target: PopoverStore | PopupHandleStore, node: HTMLElement) {
		if (target instanceof PopoverStore) target.noteTrigger(triggerId, node, owned);
		else target.triggers.add(triggerId, node);
	}

	function unbindFrom(target: PopoverStore | PopupHandleStore, node: HTMLElement) {
		if (target instanceof PopoverStore) target.forgetTrigger(triggerId, node);
		else if (target.triggers.getById(triggerId) === node) target.triggers.delete(triggerId);
	}

	function locate(): PopoverStore | PopupHandleStore {
		return readStore() ?? (handle as PopoverHandle).fallback;
	}

	function register(node: HTMLElement) {
		triggerEl = node;
		let current = locate();
		bindTo(current, node);
		const stop = handle?.subscribe(() => {
			const next = locate();
			if (next === current) return;
			unbindFrom(current, node);
			current = next;
			bindTo(next, node);
		});
		const clearHover = hover.attachReference(node);
		return () => {
			stop?.();
			clearHover();
			unbindFrom(current, node);
			handle?.forgetPayload(triggerId);
			if (triggerEl === node) triggerEl = null;
		};
	}

	$effect(() => {
		handle?.setPayload(triggerId, payload as never);
		return () => handle?.forgetPayload(triggerId);
	});

	const click = useClick(store, () => ({
		enabled: !disabled && readStore() != null,
		stickIfOpen: store.stickIfOpen
	}));
	const hover = useHoverReferenceInteraction(store, () => {
		void epoch;
		const current = readStore();
		return {
			enabled:
				current != null &&
				!disabled &&
				openOnHover &&
				(current.openMethod !== 'touch' || current.openChangeReason !== REASONS.triggerPress),
			mouseOnly: true,
			move: false,
			handleClose: safePolygon(),
			restMs: delay,
			delay: { close: closeDelay },
			placement: () => current?.readPlacement() ?? 'bottom'
		};
	});
	const guards = useTriggerFocusGuards(store, () => triggerEl);

	const opened = $derived(store.openedBy(triggerId));
	const partState: PopoverTriggerState = $derived({ disabled, open: opened });
	const showGuards = $derived(Boolean(store.mountedBy(triggerId) && !store.focusManagerModal));

	const hostProps = $derived(
		mergeProps(
			elementProps,
			openInteractionProps(store),
			useButton(disabled, nativeButton),
			click.reference,
			hover.reference,
			store.dismissReference,
			{
				id: triggerId,
				'aria-haspopup': 'dialog' as const,
				'aria-expanded': opened,
				...(store.popupIdFor(triggerId) ? { 'aria-controls': store.popupIdFor(triggerId) } : {}),
				[CLICK_TRIGGER_IDENTIFIER]: '',
				...(disabled ? { 'data-disabled': '' } : {}),
				...getStateAttributesProps(
					{ open: opened },
					triggerOpenAttributes(opened, store.openChangeReason)
				),
				[bindKey]: register
			}
		)
	);
</script>

{#if showGuards}
	<FocusGuard {...guards.preFocusGuardProps} />
{/if}
{#if render}
	{@render render(hostProps, partState, childrenSnippet)}
{:else}
	<button {...hostProps}>{@render childrenSnippet()}</button>
{/if}
{#if showGuards}
	<FocusGuard {...guards.focusTargetProps} />
{/if}

{#snippet childrenSnippet()}
	{@render children?.()}
{/snippet}
