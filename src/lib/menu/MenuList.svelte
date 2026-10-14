<!--
	Groups menu items so other content, such as a filter input, can share the popup.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/list/MenuList.tsx,
	packages/react/src/menu/filter-root/MenuFilterList.tsx and
	packages/react/src/filter-dropdown/list/FilterDropdownList.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { isHTMLElement } from '@floating-ui/utils/dom';
	import { activeElement, contains, getTarget, ownerDocument } from '@sveltery/utils';
	import { isMainOrientationKey } from '@sveltery/floating-ui-svelte';
	import { useDirection } from '../internal/direction-context.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { useMenuRoot } from './context.svelte.js';
	import { handleMenuFilterKeyDown, moveHighlightFrom, refocusOwner } from './filter-keydown.js';
	import { setMenuFilterGroup } from './filter-root.svelte.js';
	import type { MenuListProps, MenuListState } from './types.js';

	let { id, render, children, ...elementProps }: MenuListProps = $props();

	const root = useMenuRoot();
	const store = root.store;
	const filter = store.filter;
	const direction = useDirection();
	const uid = $props.id();
	const bindKey = createAttachmentKey();
	const rtl = $derived(direction.direction === 'rtl');

	// The list's groups and items belong to this menu's query. A nested menu's list renders inside
	// an enclosing group, which must not count them as its own.
	setMenuFilterGroup(null);

	const resolvedId = $derived(filter ? (id ?? filter.defaultListId) : (id ?? `base-ui-${uid}`));

	// A filterable list records an explicit id. The generated one is never an override.
	$effect(() => {
		if (!filter) return;
		const explicit = resolvedId === filter.defaultListId ? undefined : resolvedId;
		filter.renderedListId = explicit;
		return () => {
			if (filter.renderedListId === explicit) filter.renderedListId = undefined;
		};
	});

	function bindList(node: HTMLElement) {
		// A filterable menu's popup keeps the dialog role, so only a plain list takes it over.
		if (filter) return;
		store.listElement = node;
		return () => {
			if (store.listElement === node) store.listElement = null;
		};
	}

	$effect(() => {
		if (filter) return;
		store.listId = resolvedId;
	});

	// The item whose `aria-controls` popup holds `target`. The popup shares the target's root.
	function nestedPopupTrigger(target: Element) {
		const rootNode = target.getRootNode() as Document | ShadowRoot;
		return store.items.elements.find((item) => {
			const popupId = item.getAttribute('aria-controls');
			return (
				popupId != null && isHTMLElement(item) && contains(rootNode.getElementById(popupId), target)
			);
		});
	}

	/** A key on the list, or relayed from a portaled submenu (`fromNested`). */
	function listKeyDown(event: KeyboardEvent, fromNested: boolean) {
		const owner = store.focusOwner;
		const target = getTarget(event) as Element;
		const ownerFocused = owner != null && activeElement(ownerDocument(owner)) === owner;
		// Keys the input forwards to its highlighted item arrive while the input holds focus.
		if (owner == null || ownerFocused || fromNested) {
			if (
				event.which !== 229 &&
				!event.shiftKey &&
				!event.ctrlKey &&
				!event.metaKey &&
				!event.altKey &&
				isMainOrientationKey(event.key, root.orientation)
			) {
				// Keep main-axis keys from this popup's own list navigation, which lost its place while
				// the nested popup held focus. A plain submenu that closes on the key hands focus back,
				// so move on from its trigger as a plain parent would.
				event.stopPropagation();
				const trigger = fromNested && ownerFocused ? nestedPopupTrigger(target) : undefined;
				if (trigger) {
					moveHighlightFrom(store, trigger, event, {
						orientation: root.orientation,
						rtl,
						loopFocus: root.loopFocus,
						allowEscape: root.allowEscape
					});
				}
			}
			return;
		}
		// An item that already acted on the key (Enter and Space activate it) keeps it.
		if (event.defaultPrevented) return;
		// Real focus can land in the list while the input owns the keyboard: a scrollbar press
		// focuses the list, and a screen reader focuses the highlighted item. Hand focus back and
		// route the key as the input would.
		refocusOwner(owner);
		handleMenuFilterKeyDown(
			{
				store,
				get orientation() {
					return root.orientation;
				},
				rtl
			},
			event,
			filter!.value !== ''
		);
	}

	$effect(() => {
		if (!filter) return;
		store.listKeyDown = listKeyDown;
		return () => {
			if (store.listKeyDown === listKeyDown) store.listKeyDown = undefined;
		};
	});

	// `null` tells the first registration apart from a list emptied by filtering.
	let previousItems: readonly HTMLElement[] | null = null;
	$effect(() => {
		if (!filter) return;
		const items = store.items.elements;
		untrack(() => {
			const previous = previousItems;
			previousItems = items;
			const changed =
				previous !== null &&
				(previous.length !== items.length || items.some((item, index) => item !== previous[index]));
			if (changed) filter.onItemsChange(previous);
		});
	});

	// The trigger names the list unless the consumer labels it.
	const labelledBy = $derived.by(() => {
		if (elementProps['aria-labelledby'] != null || elementProps['aria-label']) return undefined;
		if (filter) return filter.triggerId;
		const trigger = store.activeTriggerElement;
		return trigger ? trigger.id || undefined : store.resolvedActiveTriggerId() || undefined;
	});

	const filterProps = filter
		? {
				onkeydown: (event: KeyboardEvent) => listKeyDown(event, false),
				onfocusin(event: FocusEvent) {
					// A press on the list's own content, such as its background or a group label,
					// focuses the list. Hand focus back to the input.
					const owner = store.focusOwner;
					if (owner && event.relatedTarget === owner && getTarget(event) === event.currentTarget) {
						refocusOwner(owner);
					}
				},
				onpointermove() {
					filter.keyboardModality = false;
				},
				onpointerdown() {
					filter.keyboardModality = false;
				}
			}
		: undefined;

	const partState: MenuListState = {};
	const hostProps = $derived(
		mergeProps(
			{
				id: resolvedId,
				role: 'menu' as const,
				// The popup focuses the list on a pointer open, and Chromium includes scrollable
				// elements in sequential focus navigation.
				tabindex: -1,
				...(root.orientation === 'horizontal' ? { 'aria-orientation': 'horizontal' as const } : {}),
				...(labelledBy ? { 'aria-labelledby': labelledBy } : {}),
				[bindKey]: bindList
			},
			filterProps,
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
