<!--
	The clipping viewport of the navigation menu's current content. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/viewport/NavigationMenuViewport.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Without a positioner, the content moves into an inner `<div>` between the focus guards.
	That `<div>` stays mounted while the guards come and go.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import {
		getNextTabbable,
		getPreviousTabbable,
		isOutsideEvent
	} from '@sveltery/floating-ui-svelte';
	import { contains, FocusGuard } from '@sveltery/utils';
	import { mergeProps } from '../internal/mergeProps.js';
	import { findNavigationMenuPositioner, useNavigationMenuRoot } from './context.svelte.js';
	import type { NavigationMenuViewportProps, NavigationMenuViewportState } from './types.js';

	let { id, render, children, ...elementProps }: NavigationMenuViewportProps = $props();

	const uid = $props.id();
	const root = useNavigationMenuRoot();
	const hasPositioner = findNavigationMenuPositioner() != null;
	const bindKey = createAttachmentKey();
	const state: NavigationMenuViewportState = {};

	const showGuards = $derived(hasPositioner || root.activeTrigger != null);
	const domReference = $derived(root.activeTrigger?.domReferenceElement ?? null);

	$effect(() => {
		if (domReference) root.prevTriggerElement = domReference;
	});

	function bindViewport(node: HTMLElement) {
		root.viewportElement = node;
		return () => {
			if (root.viewportElement === node) root.viewportElement = null;
		};
	}

	function bindTarget(node: HTMLElement) {
		root.viewportTargetElement = node;
		return () => {
			if (root.viewportTargetElement === node) root.viewportTargetElement = null;
		};
	}

	function bindGuard(name: 'beforeInside' | 'afterInside') {
		return (node: HTMLElement) => {
			root.guards[name] = node;
			return () => {
				if (root.guards[name] === node) root.guards[name] = null;
			};
		};
	}
	const bindBeforeInside = bindGuard('beforeInside');
	const bindAfterInside = bindGuard('afterInside');

	function focusBeforeInside(event: FocusEvent) {
		const reference = root.positionerElement ?? root.viewportElement;
		if (reference && isOutsideEvent(event, reference)) getNextTabbable(reference)?.focus();
		else root.guards.beforeOutside?.focus();
	}

	function focusAfterInside(event: FocusEvent) {
		const reference = root.positionerElement ?? root.viewportElement;
		if (reference && isOutsideEvent(event, reference)) getPreviousTabbable(reference)?.focus();
		else root.guards.afterOutside?.focus();
	}

	// Focus leaving for anywhere but the trigger makes the viewport inert, so Tab cannot loop back in.
	function handleFocusOut(event: FocusEvent) {
		const relatedTarget = event.relatedTarget as Element | null;
		if (
			relatedTarget &&
			!contains(event.currentTarget as Element, relatedTarget) &&
			relatedTarget !== domReference
		) {
			root.viewportInert = true;
		}
	}

	const hostProps = $derived(
		mergeProps(
			{
				id: id ?? `base-ui-${uid}`,
				onfocusout: handleFocusOut,
				...(!hasPositioner && root.viewportInert ? { inert: true } : {}),
				[bindKey]: bindViewport
			},
			elementProps
		)
	);
</script>

{#snippet beforeGuard()}
	{#if showGuards}
		<FocusGuard attach={bindBeforeInside} onfocusin={focusBeforeInside} />
	{/if}
{/snippet}

{#snippet afterGuard()}
	{#if showGuards}
		<FocusGuard attach={bindAfterInside} onfocusin={focusAfterInside} />
	{/if}
{/snippet}

{#snippet guarded()}
	{@render beforeGuard()}
	<div {@attach bindTarget}>{@render children?.()}</div>
	{@render afterGuard()}
{/snippet}

{#if hasPositioner}
	{@render beforeGuard()}
	{#if render}
		{@render render(hostProps, state, children)}
	{:else}
		<div {...hostProps}>{@render children?.()}</div>
	{/if}
	{@render afterGuard()}
{:else if render}
	{@render render(hostProps, state, guarded)}
{:else}
	<div {...hostProps}>{@render guarded()}</div>
{/if}
