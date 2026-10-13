<!--
	A button that opens the menu. Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/trigger/MenuTrigger.tsx and
	packages/react/src/utils/useMixedToggleClickHandler.ts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The button stays mounted when a handle receives its root store.
-->
<script lang="ts" generics="Payload = unknown">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import {
		REASONS,
		FocusGuard,
		contains,
		createChangeEventDetails,
		ownerDocument
	} from '@sveltery/utils';
	import { ButtonBehavior } from '../internal/button.svelte.js';
	import { mergePropsN } from '../internal/mergeProps.js';
	import { pressableTriggerOpenStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { ScopedTimeout } from '@sveltery/utils';
	import { findMenuRoot } from './context.svelte.js';
	import { findRootOwnerId, isMouseWithinBounds } from './dom.js';
	import type { MenuHandle } from './handle.svelte.js';
	import MenuTriggerInteractions from './MenuTriggerInteractions.svelte';
	import { findMenubarParent } from './parent.svelte.js';
	import { MenuStore } from './store.svelte.js';
	import type { TriggerArmed } from './trigger-armed.js';
	import type { MenuTriggerProps, MenuTriggerState } from './types.js';

	let {
		handle,
		disabled: disabledProp = false,
		nativeButton = true,
		payload,
		id,
		openOnHover: openOnHoverProp,
		delay = 100,
		closeDelay = 0,
		render,
		children,
		...elementProps
	}: MenuTriggerProps<Payload> = $props();

	const root = findMenuRoot()?.store;
	if (!untrack(() => handle) && !root) {
		throw new Error(
			'Base UI: <Menu.Trigger> must be either used within a <Menu.Root> component or provided with a handle.'
		);
	}

	const menubar = findMenubarParent();
	const uid = $props.id();
	const triggerId = $derived(id ?? `base-ui-${uid}`);
	const bindKey = createAttachmentKey();
	const hoverKey = createAttachmentKey();
	let triggerEl = $state<HTMLElement | null>(null);
	let armed = $state<TriggerArmed | null>(null);
	const mouseUpTimeout = new ScopedTimeout();
	let stopDocumentMouseUp: (() => void) | null = null;

	const live = $derived(root ?? (handle as MenuHandle | undefined)?.attached ?? null);

	function owned() {
		return { payload, closeDelay };
	}

	$effect(() => {
		const registeredId = triggerId;
		const node = triggerEl;
		const current = live;
		if (!node) return;
		untrack(() => {
			if (current instanceof MenuStore) current.noteTrigger(registeredId, node, owned);
			else handle?.fallbackTriggers.add(registeredId, node);
		});
		return () => {
			untrack(() => {
				if (current instanceof MenuStore) current.forgetTrigger(registeredId, node);
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
	const mountedByThis = $derived(live?.mountedBy(triggerId) ?? false);
	const disabled = $derived(
		disabledProp || (live?.disabled ?? false) || (menubar?.disabled ?? false)
	);
	const menubarHasSubmenuOpen = $derived(menubar?.hasSubmenuOpen ?? false);
	const openOnHover = $derived(openOnHoverProp ?? menubarHasSubmenuOpen);
	const partState: MenuTriggerState = $derived({ disabled, open: opened });
	const button = new ButtonBehavior(() => ({ disabled, native: nativeButton }));
	const menubarItem = menubar?.createItem(() => disabled);

	// A trigger in a menubar takes over the menu's parent while it owns the menu, so a detached
	// popup still forwards keys to the menubar.
	$effect(() => {
		const current = live;
		if (!menubar || !current || !mountedByThis) return;
		untrack(() => {
			current.parent = { type: 'menubar', context: menubar };
			current.ownKeyboardEventRelay = menubar.relayKeyboardEvent;
		});
	});

	$effect(() => {
		const current = live;
		if (!current || opened || menubar) return;
		untrack(() => {
			current.mouseUpGate.allow = false;
		});
	});

	function handleDocumentMouseUp(event: MouseEvent) {
		stopDocumentMouseUp?.();
		stopDocumentMouseUp = null;
		const current = live;
		const node = triggerEl;
		if (!current || !node) return;
		mouseUpTimeout.clear();
		current.mouseUpGate.allow = false;
		const target = event.target instanceof Element ? event.target : null;
		if (contains(node, target) || contains(current.positionerElement, target) || target === node) {
			return;
		}
		if (target != null && findRootOwnerId(target) === current.rootId) return;
		if (isMouseWithinBounds(event, node)) return;
		current.tree?.events.emit('close', { domEvent: event, reason: REASONS.cancelOpen });
	}

	function listenForMouseUp(doc: Document) {
		stopDocumentMouseUp?.();
		const stop = on(doc, 'mouseup', handleDocumentMouseUp);
		stopDocumentMouseUp = stop;
	}

	// A hover open lets a press-drag-release on an outside point cancel the open.
	$effect(() => {
		const current = live;
		if (!current || !opened || current.openChangeReason !== REASONS.triggerHover) return;
		untrack(() => listenForMouseUp(ownerDocument(triggerEl)));
		return () => {
			stopDocumentMouseUp?.();
			stopDocumentMouseUp = null;
		};
	});

	let ignoreNextClick = false;
	const ownProps = {
		onmousedown(event: MouseEvent) {
			const current = live;
			if (menubar && !opened) {
				// The menubar opens on mousedown. The click that follows must not close it.
				ignoreNextClick = true;
				on(
					ownerDocument(event.currentTarget as Element),
					'click',
					() => {
						ignoreNextClick = false;
					},
					{ once: true }
				);
			}
			if (!current || current.open) return;
			// A mousedown, move, and mouseup on an item within 200ms does not activate it.
			mouseUpTimeout.start(200, () => {
				current.mouseUpGate.allow = true;
			});
			listenForMouseUp(ownerDocument(event.currentTarget as Element));
		},
		onclick(event: MouseEvent) {
			if (!ignoreNextClick) return;
			ignoreNextClick = false;
			event.preventDefault();
		},
		onfocus(event: FocusEvent) {
			// With a menubar submenu open, focusing another trigger opens its menu.
			const current = live;
			if (!current || disabled || !menubarHasSubmenuOpen || current.open) return;
			current.setOpen(
				true,
				createChangeEventDetails(REASONS.triggerFocus, event, event.currentTarget as HTMLElement)
			);
		}
	};

	$effect(() => () => stopDocumentMouseUp?.());

	const hostProps = $derived.by(() =>
		button.props(
			mergePropsN([
				armed?.click,
				armed?.hover,
				live?.triggerProps(mountedByThis),
				{
					id: triggerId,
					'aria-haspopup': 'menu' as const,
					'aria-expanded': triggerEl != null && opened,
					...(live?.popupIdFor(triggerId) ? { 'aria-controls': live.popupIdFor(triggerId) } : {}),
					...getStateAttributesProps(partState, pressableTriggerOpenStateMapping),
					[bindKey]: bindTrigger,
					[hoverKey]: attachReference
				},
				ownProps,
				menubar ? { role: 'menuitem' as const } : {},
				menubarItem?.props,
				elementProps
			])
		)
	);
	// Upstream renders the guards only while open and anchors on the trigger once the guard is
	// gone. The shared guards here need their own element, so they stay until the popup unmounts.
	const showGuards = $derived(Boolean(!menubar && mountedByThis && armed));
</script>

{#if live}
	{#key live}
		<MenuTriggerInteractions
			store={live}
			{menubar}
			{disabled}
			{openOnHover}
			{opened}
			{mountedByThis}
			{delay}
			{closeDelay}
			triggerEl={() => triggerEl}
			onArmed={acceptArmed}
		/>
	{/key}
{/if}
{#if showGuards && armed}
	<FocusGuard {...armed.guards.preFocusGuardProps} />
{/if}
{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<button {...hostProps}>{@render children?.()}</button>
{/if}
{#if showGuards && armed}
	<FocusGuard {...armed.guards.focusTargetProps} />
{/if}
