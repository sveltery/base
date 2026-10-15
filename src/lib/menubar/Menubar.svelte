<!--
	The container for menus. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menubar/Menubar.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The menubar starts its own floating tree, even inside another popup, and its node is the
	parent node of its menus.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { on } from 'svelte/events';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setFloatingTree, useFloatingNodeId } from '@sveltery/floating-ui-svelte';
	import { REASONS } from '@sveltery/utils';
	import {
		getStateAttributesProps,
		type StateAttributesMapping
	} from '../internal/state-attributes.js';
	import { setMenubarParent } from '../menu/parent.svelte.js';
	import { MenubarContext } from './context.svelte.js';
	import type { MenubarProps, MenubarState } from './types.js';

	let {
		modal = true,
		disabled,
		orientation = 'horizontal',
		loopFocus = true,
		id,
		onkeydown,
		render,
		children,
		...elementProps
	}: MenubarProps = $props();

	interface MenuOpenEventDetails {
		open: boolean;
		reason: string | null;
		nodeId: string | null;
		parentNodeId: string | null;
	}

	const stateMapping: StateAttributesMapping<MenubarState> = {
		hasSubmenuOpen: (value) => (value ? { 'data-has-submenu-open': '' } : null)
	};

	const uid = $props.id();
	const rootId = $derived(id ?? `base-ui-${uid}`);
	const tree = setFloatingTree({ fresh: true });
	// The menubar node has no floating context, so tree queries skip it and look at its menus.
	const nodeId = useFloatingNodeId();
	const context = new MenubarContext(
		() => ({ modal, disabled: disabled ?? false, orientation, loopFocus, rootId }),
		tree,
		nodeId
	);
	setMenubarParent(context);

	// Upstream `MenubarContent`: a top-level menu that opens marks the menubar. Moving to a
	// sibling menu keeps the mark, so hovering another trigger still switches menus.
	// Menus emit from their own effects, so the listener reads untracked.
	function onMenuOpenChange(data: unknown) {
		const details = data as MenuOpenEventDetails;
		if (!details.nodeId || details.parentNodeId !== nodeId) return;
		if (details.open) {
			context.setHasSubmenuOpen(true);
		} else if (
			details.reason !== REASONS.siblingOpen &&
			details.reason !== REASONS.listNavigation
		) {
			context.setHasSubmenuOpen(false);
		}
	}
	$effect(() =>
		on(context.menuEvents, 'menuopenchange', (event) =>
			untrack(() => onMenuOpenChange((event as CustomEvent).detail))
		)
	);

	const state: MenubarState = $derived({
		orientation,
		modal,
		hasSubmenuOpen: context.hasSubmenuOpen
	});

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		const childPrevented = event.defaultPrevented;
		onkeydown?.(event);
		if (event.defaultPrevented && !childPrevented) return;
		context.roving.keydown(event);
	}

	const contentKey = createAttachmentKey();
	function bindContent(node: HTMLElement) {
		context.contentElement = node;
		return () => {
			if (context.contentElement === node) context.contentElement = null;
		};
	}

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		role: 'menubar',
		id: rootId,
		'aria-orientation': orientation,
		...getStateAttributesProps(state, stateMapping),
		...elementProps,
		onkeydown: handleKeyDown,
		[contentKey]: bindContent,
		...context.roving.rootProps
	});
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
