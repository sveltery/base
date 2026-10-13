<!--
	A menu item that opens a submenu. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/submenu-trigger/MenuSubmenuTrigger.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import { REASONS, createChangeEventDetails, platform } from '@sveltery/utils';
	import {
		ClickInteraction,
		HoverReferenceInteraction,
		safePolygon
	} from '@sveltery/floating-ui-svelte';
	import { triggerOpenStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { findMenuRoot } from './context.svelte.js';
	import { MenuItemBehavior } from './item.svelte.js';
	import type { MenuSubmenuTriggerProps, MenuSubmenuTriggerState } from './types.js';

	let {
		id,
		label,
		nativeButton = false,
		openOnHover = true,
		delay = 100,
		closeDelay = 0,
		disabled: disabledProp = false,
		render,
		children,
		...elementProps
	}: MenuSubmenuTriggerProps = $props();

	const root = findMenuRoot();
	if (root?.parent.type !== 'menu') {
		throw new Error('Base UI: <Menu.SubmenuTrigger> must be placed in <Menu.SubmenuRoot>.');
	}
	const store = root.store;
	const parentStore = root.parent.store;
	const uid = $props.id();
	const triggerId = $derived(id ?? `base-ui-${uid}`);
	const hoverKey = createAttachmentKey();

	const disabled = $derived(disabledProp || store.disabled || parentStore.disabled);

	const item = new MenuItemBehavior(
		parentStore,
		() => ({ id: triggerId, label, disabled, closeOnClick: false, nativeButton }),
		'submenu-trigger'
	);

	function owned() {
		return { payload: undefined, closeDelay };
	}

	$effect(() => {
		const node = item.node;
		const registeredId = triggerId;
		if (!node) return;
		untrack(() => {
			store.noteTrigger(registeredId, node, owned);
			store.domReferenceElement = node;
		});
		return () => {
			untrack(() => {
				store.forgetTrigger(registeredId, node);
				if (store.domReferenceElement === node) store.domReferenceElement = null;
			});
		};
	});

	// One polygon per trigger. The options getter runs on every event.
	// The parent popup is the scope upstream reaches through the floating tree. The internal
	// trigger mousemove would otherwise scope to the body, and clearing that would reset the
	// body's own `pointer-events`.
	const handleClose = safePolygon({
		blockPointerEvents: true,
		getScope: () => parentStore.floatingElement
	});
	const hover = new HoverReferenceInteraction(store, () => ({
		enabled: store.hoverEnabled && openOnHover && !disabled,
		handleClose,
		mouseOnly: true,
		move: true,
		restMs: delay,
		delay: { open: delay, close: closeDelay },
		shouldOpen: delay > 0 ? () => parentStore.allowMouseEnter : undefined,
		// A fast pointer sweep can drop the trigger's `mouseleave` and leave a stale submenu open.
		guardStaleOpen: true,
		placement: () => store.placement
	}));

	const click = new ClickInteraction(store, () => ({
		enabled: !disabled,
		event: 'mousedown',
		// Toggling lets TalkBack users close the submenu by activating its trigger again.
		toggle: true,
		ignoreMouse: openOnHover,
		stickIfOpen: openOnHover
	}));

	// Chrome performs a screen reader activation as a 1x1, zero-pressure mouse `pointerdown` with
	// no pressed button. v1.9 opens on it at once. The click interaction here predates that and
	// ignores it as a mouse press while `openOnHover` is on, so the trigger handles it itself.
	let screenReaderPress = false;
	const screenReaderProps = {
		onpointerdown(event: PointerEvent) {
			screenReaderPress =
				event.pointerType === 'mouse' &&
				event.width === 1 &&
				event.height === 1 &&
				event.pressure === 0 &&
				event.detail === 0 &&
				(platform.os.android || event.buttons === 0);
		},
		onmousedown(event: MouseEvent) {
			const pressed = screenReaderPress;
			screenReaderPress = false;
			if (!pressed || !openOnHover || disabled || event.button !== 0 || !item.node) return;
			store.setOpen(!store.open, createChangeEventDetails(REASONS.triggerPress, event, item.node));
		}
	};

	function attachHover(node: HTMLElement) {
		return untrack(() => hover.attachReference(node));
	}

	// Focus that comes back to the trigger through the submenu's leading focus guard closes the
	// submenu, so screen reader users can move past the trigger. Focus from a submenu item, such
	// as on hover, leaves it open. The guard is the one before the popup in the positioner.
	let returnedThroughGuard = false;
	$effect(() => {
		const positioner = store.positionerElement;
		if (!store.open || !positioner) return;
		const stop = on(
			positioner,
			'focusout',
			(event) => {
				const guard = event.target;
				const popup = store.popupElement;
				if (!(guard instanceof Element) || !guard.hasAttribute('data-base-ui-focus-guard')) return;
				if (!popup || !(guard.compareDocumentPosition(popup) & Node.DOCUMENT_POSITION_FOLLOWING)) {
					return;
				}
				returnedThroughGuard = event.relatedTarget === item.node;
			},
			{ capture: true }
		);
		return () => {
			returnedThroughGuard = false;
			stop();
		};
	});

	const open = $derived(store.open);
	const highlighted = $derived(item.highlighted);
	const state: MenuSubmenuTriggerState = $derived({ disabled, highlighted, open });

	// VoiceOver announces the expanded change instead of the submenu item that takes focus next.
	const omitExpanded = $derived(
		open &&
			(store.openChangeReason === REASONS.listNavigation || store.openMethod === 'keyboard') &&
			platform.screenReader.voiceOver
	);

	const childTriggerProps = $derived.by(() => {
		const { id: _id, ...rest } = store.triggerProps(true);
		return rest;
	});

	const hostProps = $derived(
		item.props(
			[
				click.reference,
				screenReaderProps,
				hover.reference,
				childTriggerProps,
				{
					'aria-haspopup': 'menu' as const,
					'aria-expanded': omitExpanded ? undefined : open,
					'aria-controls': store.popupIdFor(triggerId),
					// The item takes focus only while its submenu is open or it is highlighted.
					tabindex: open || highlighted ? 0 : -1,
					onfocus(event: FocusEvent) {
						if (!store.open || !returnedThroughGuard) return;
						returnedThroughGuard = false;
						store.setOpen(false, createChangeEventDetails(REASONS.focusOut, event));
					},
					onblur() {
						if (highlighted) parentStore.setActiveIndex(null, REASONS.none);
					},
					onmouseenter(event: MouseEvent) {
						if (parentStore.highlightItemOnHover) {
							parentStore.highlightItem(event.currentTarget as Element, REASONS.pointer, event);
						}
					},
					...getStateAttributesProps(state, triggerOpenStateMapping),
					[hoverKey]: attachHover
				}
			],
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
