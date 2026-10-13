<!--
	Positions the popup against the input, input group or trigger. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/positioner/ComboboxPositioner.tsx
	and packages/react/src/utils/usePositioner.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useFloatingNodeId } from '@sveltery/floating-ui-svelte';
	import { toCssStyle } from '../internal/css-style.js';
	import InternalBackdrop from '../internal/InternalBackdrop.svelte';
	import { mergeProps } from '../internal/mergeProps.js';
	import {
		AnchorPositioning,
		popupStateMapping,
		useAnchoredPopupScrollLock
	} from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { DROPDOWN_COLLISION_AVOIDANCE } from '../select/constants.js';
	import { setComboboxPositioner, useComboboxRoot } from './context.svelte.js';
	import type { ComboboxPositionerProps, ComboboxPositionerState } from './types.js';

	let {
		anchor = undefined,
		positionMethod = undefined,
		side = undefined,
		align = undefined,
		sideOffset = undefined,
		alignOffset = undefined,
		collisionBoundary = 'clipping-ancestors',
		collisionPadding = undefined,
		arrowPadding = undefined,
		sticky = undefined,
		disableAnchorTracking = false,
		collisionAvoidance = DROPDOWN_COLLISION_AVOIDANCE,
		render,
		children,
		...elementProps
	}: ComboboxPositionerProps = $props();

	const store = useComboboxRoot();
	// A press inside a portaled combobox popup stays inside a parent popup's floating tree.
	useFloatingNodeId(store);
	const attachKey = createAttachmentKey();

	const positioning = new AnchorPositioning(store, () => ({
		anchor:
			anchor ??
			(store.inputInsidePopup
				? store.triggerElement
				: (store.inputGroupElement ?? store.inputElement)),
		positionMethod,
		side,
		align,
		sideOffset,
		alignOffset,
		collisionBoundary,
		collisionPadding,
		arrowPadding,
		sticky,
		disableAnchorTracking,
		collisionAvoidance,
		mounted: store.mounted,
		lazyFlip: true
	}));
	setComboboxPositioner(positioning);

	$effect.pre(() => store.publishPopupSide(() => positioning.side));

	useAnchoredPopupScrollLock(() => ({
		enabled: store.open && store.root.modal,
		touchOpen: store.openMethod === 'touch',
		positionerElement: store.positionerElement,
		referenceElement: store.triggerElement
	}));

	const partState: ComboboxPositionerState = $derived({
		open: store.open,
		side: positioning.side,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden,
		empty: store.listEmpty
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		mergeProps(
			{
				role: 'presentation' as const,
				hidden: store.mounted ? undefined : true,
				style: toCssStyle({
					...positioning.positionerStyles,
					...(store.open ? {} : { pointerEvents: 'none' }),
					...(store.transitionStatus === 'starting' ? { transition: 'none' } : {})
				}),
				...getStateAttributesProps(partState, popupStateMapping),
				[attachKey]: positioning.positionerProps.attach
			},
			elementProps
		)
	);
</script>

{#if store.mounted && store.root.modal}
	<InternalBackdrop
		inert={!store.open}
		cutout={store.inputGroupElement ?? store.inputElement ?? store.triggerElement}
	/>
{/if}
{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
