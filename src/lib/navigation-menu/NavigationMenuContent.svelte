<!--
	A container for the content of the navigation menu item that is moved into the popup
	when the item is active.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/content/NavigationMenuContent.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	An attachment moves the element into the viewport. It stays in the item's component tree.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { setFloatingPopupScope } from '@sveltery/floating-ui-svelte';
	import { getTarget, contains } from '@sveltery/utils';
	import { CompositeRoot } from '../internal/composite-root.svelte.js';
	import { useDirection } from '../internal/direction-context.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupStateMapping } from '../internal/popups/index.js';
	import {
		getStateAttributesProps,
		transitionStatusMapping,
		type StateAttributesMapping
	} from '../internal/state-attributes.js';
	import { useOpenChangeComplete } from '../internal/useOpenChangeComplete.svelte.js';
	import { TransitionStatus } from '../internal/useTransitionStatus.svelte.js';
	import {
		setNavigationMenuComposite,
		useNavigationMenuItem,
		useNavigationMenuRoot
	} from './context.svelte.js';
	import type { NavigationMenuContentProps, NavigationMenuContentState } from './types.js';

	let {
		keepMounted = false,
		render,
		children,
		...elementProps
	}: NavigationMenuContentProps = $props();

	const root = useNavigationMenuRoot();
	const item = useNavigationMenuItem();
	setFloatingPopupScope(root.floating);
	const reading = useDirection();

	const open = $derived(root.mounted && root.value === item.value);
	const transition = new TransitionStatus(() => open);
	let element = $state<HTMLElement | null>(null);
	let focusInside = $state(false);
	let hasMountedInPortal = $state(false);

	const composite = new CompositeRoot({
		orientation: () => 'both',
		loopFocus: () => true,
		direction: () => reading.direction,
		keys: 'arrows',
		stopPropagation: true,
		keydown: 'root'
	});
	setNavigationMenuComposite(composite);

	const portalContainer = $derived(root.viewportTargetElement ?? root.viewportElement);

	$effect.pre(() => {
		// A popup that unmounts before this exit animation ends resets the content, so the
		// next open enters with `starting` again.
		if (transition.mounted && !root.mounted) transition.setMounted(false);
		if (keepMounted && portalContainer && !hasMountedInPortal) hasMountedInPortal = true;
	});

	useOpenChangeComplete(() => ({
		open,
		element,
		onComplete() {
			if (!open) transition.setMounted(false);
		}
	}));

	// Content that enters again before its exit ends keeps its element. Point the size observer back at it.
	$effect(() => {
		if (open && element) root.currentContent = element;
	});

	const shouldRenderInline = $derived(keepMounted && !portalContainer && !hasMountedInPortal);
	const shouldRender = $derived(
		shouldRenderInline || (portalContainer != null && (transition.mounted || keepMounted))
	);
	const hidden = $derived(shouldRenderInline || (keepMounted && !transition.mounted));

	const moveKey = createAttachmentKey();
	function moveIntoViewport(node: HTMLElement) {
		element = node;
		const container = portalContainer;
		if (container) container.append(node);
		return () => {
			if (container) node.remove();
			if (element === node) element = null;
		};
	}

	function handleFocusIn(event: FocusEvent) {
		const target = getTarget(event);
		if (target instanceof Element && target.hasAttribute('data-base-ui-focus-guard')) return;
		focusInside = true;
	}

	function handleFocusOut(event: FocusEvent) {
		if (!contains(event.currentTarget as Element, event.relatedTarget)) focusInside = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		composite.keydown(event);
	}

	const stateAttributesMapping: StateAttributesMapping<NavigationMenuContentState> = {
		open: popupStateMapping.open,
		transitionStatus: transitionStatusMapping.transitionStatus,
		activationDirection(value) {
			return value ? { 'data-activation-direction': value } : null;
		}
	};

	const partState: NavigationMenuContentState = $derived({
		open,
		transitionStatus: transition.transitionStatus,
		activationDirection: root.activationDirection
	});

	const hostProps = $derived(
		mergeProps(
			{
				onfocusin: handleFocusIn,
				onfocusout: handleFocusOut,
				onkeydown: handleKeyDown,
				...(!open && transition.mounted
					? {
							style: 'position: absolute; top: 0px; left: 0px',
							inert: !focusInside
						}
					: {}),
				...(hidden ? { hidden: true } : {}),
				...getStateAttributesProps(partState, stateAttributesMapping),
				[moveKey]: moveIntoViewport,
				...composite.rootProps
			},
			elementProps
		)
	);
</script>

{#if shouldRender}
	{#if render}
		{@render render(hostProps, partState, children)}
	{:else}
		<div {...hostProps}>{@render children?.()}</div>
	{/if}
{/if}
