<!--
	Positions the toast against the anchor. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/toast/positioner/ToastPositioner.tsx
	and packages/react/src/utils/usePositioner.ts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Each option falls back to the toast's `positionerProps`. The floating root is always open.
-->
<script lang="ts">
	import { isElement } from '@floating-ui/utils/dom';
	import { createAttachmentKey } from 'svelte/attachments';
	import { FloatingRootStore } from '@sveltery/floating-ui-svelte';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { AnchorPositioning, popupStateMapping } from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { ToastRootCssVariables } from './constants.js';
	import { setToastPositioner, useToastStore } from './context.js';
	import type { ToastPositionerProps, ToastPositionerState } from './types.js';

	const POPUP_COLLISION_AVOIDANCE = { fallbackAxisSide: 'end' } as const;

	let {
		toast,
		anchor = undefined,
		positionMethod = undefined,
		side = undefined,
		align = undefined,
		sideOffset = undefined,
		alignOffset = undefined,
		collisionBoundary = undefined,
		collisionPadding = undefined,
		arrowPadding = undefined,
		sticky = undefined,
		disableAnchorTracking = undefined,
		collisionAvoidance = undefined,
		render,
		children,
		...elementProps
	}: ToastPositionerProps = $props();

	const store = useToastStore();
	const uid = $props.id();
	const attachKey = createAttachmentKey();
	const floatingStore = new FloatingRootStore({
		nested: false,
		floatingId: uid,
		floatingElementKind: 'positioner'
	});

	const options = $derived(toast.positionerProps ?? {});
	const anchorElement = $derived.by(() => {
		const value = anchor === undefined ? options.anchor : anchor;
		return isElement(value) ? value : null;
	});

	const positioning = new AnchorPositioning(floatingStore, () => ({
		anchor: anchorElement,
		positionMethod: positionMethod ?? options.positionMethod ?? 'absolute',
		side: side ?? options.side ?? 'top',
		align: align ?? options.align ?? 'center',
		sideOffset: sideOffset ?? options.sideOffset ?? 0,
		alignOffset: alignOffset ?? options.alignOffset ?? 0,
		collisionBoundary: collisionBoundary ?? options.collisionBoundary ?? 'clipping-ancestors',
		collisionPadding: collisionPadding ?? options.collisionPadding ?? 5,
		arrowPadding: arrowPadding ?? options.arrowPadding ?? 5,
		sticky: sticky ?? options.sticky ?? false,
		disableAnchorTracking: disableAnchorTracking ?? options.disableAnchorTracking ?? false,
		collisionAvoidance:
			collisionAvoidance ?? options.collisionAvoidance ?? POPUP_COLLISION_AVOIDANCE,
		mounted: true
	}));
	setToastPositioner(positioning);

	const domIndex = $derived(store.toastIndex(toast.id));
	const visibleIndex = $derived(store.toastVisibleIndex(toast.id));

	const state: ToastPositionerState = $derived({
		side: positioning.side,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden
	});

	const hostProps = $derived(
		mergeProps(
			{
				role: 'presentation' as const,
				style: toCssStyle({
					...positioning.positionerStyles,
					[ToastRootCssVariables.index]:
						toast.transitionStatus === 'ending' ? domIndex : visibleIndex,
					...(toast.transitionStatus === 'starting' ? { transition: 'none' } : {})
				}),
				...getStateAttributesProps(state, popupStateMapping),
				[attachKey]: positioning.positionerProps.attach
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
