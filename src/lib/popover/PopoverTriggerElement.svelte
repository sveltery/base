<!--
	The trigger button. Remounted when a handle swaps the inert store for the live root.
	Derived from Base UI v1.8.0 packages/react/src/popover/trigger/PopoverTrigger.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
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
	import { useTriggerFocusGuards } from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { triggerOpenAttributes } from './attributes.js';
	import { buttonProps, guardDisabled, nonNativeKeys } from './button.js';
	import { OPEN_DELAY } from './constants.js';
	import { openMethodProps } from './open-method.js';
	import { asHost, loose } from './loose-props.js';
	import type { PopoverStore } from './store.svelte.js';
	import type { PopoverTriggerProps, PopoverTriggerState } from './types.js';

	let {
		store,
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
	}: PopoverTriggerProps & { store: PopoverStore } = $props();

	const uid = $props.id();
	const triggerId = $derived(id ?? `base-ui-${uid}`);
	const bindKey = createAttachmentKey();
	// Attachments do not run during SSR. Claim an open popover so aria-expanded is true.
	if (store.open && store.resolvedActiveTriggerId() == null) {
		store.activeTriggerId = triggerId;
	}
	let triggerEl = $state<HTMLElement | null>(null);

	function owned() {
		return { payload, disabled, openOnHover, closeDelay };
	}

	function bindTrigger(node: HTMLElement) {
		triggerEl = node;
		store.noteTrigger(triggerId, node, owned);
		return () => {
			if (triggerEl === node) triggerEl = null;
			store.forgetTrigger(triggerId, node);
		};
	}

	const click = useClick(store, () => ({
		enabled: !disabled,
		stickIfOpen: store.stickIfOpen
	}));
	const hover = useHoverReferenceInteraction(store, () => ({
		enabled:
			!disabled &&
			openOnHover &&
			(store.openMethod !== 'touch' || store.openChangeReason !== REASONS.triggerPress),
		mouseOnly: true,
		move: false,
		handleClose: safePolygon(),
		restMs: delay,
		delay: { close: closeDelay },
		placement: () => store.readPlacement(),
		isActiveTrigger: store.resolvedActiveTriggerId() === triggerId
	}));
	const guards = useTriggerFocusGuards(store, () => triggerEl);

	const opened = $derived(store.openedBy(triggerId));
	const partState: PopoverTriggerState = $derived({ disabled, open: opened });
	const showGuards = $derived(store.mountedBy(triggerId) && !store.focusManagerModal);

	const hostProps = $derived(
		asHost<HTMLElement>(
			mergeProps(
				loose(elementProps),
				loose(guardDisabled(disabled)),
				loose(openMethodProps(store, () => store.open)),
				loose(click.reference),
				loose(hover.reference),
				loose(store.dismissReference),
				loose(nonNativeKeys(disabled, nativeButton)),
				buttonProps(disabled, nativeButton),
				loose({
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
					[bindKey]: bindTrigger
				})
			)
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
