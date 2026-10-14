<!--
	Positions the select popup. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/positioner/SelectPositioner.tsx
	and packages/react/src/utils/usePositioner.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useFloatingNodeId } from '@sveltery/floating-ui-svelte';
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
	import { toCssStyle } from '../internal/css-style.js';
	import InternalBackdrop from '../internal/InternalBackdrop.svelte';
	import { findItemIndex } from '../internal/listbox/itemEquality.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import {
		AnchorPositioning,
		popupStateMapping,
		useAnchoredPopupScrollLock
	} from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { DROPDOWN_COLLISION_AVOIDANCE } from './constants.js';
	import { setSelectPositioner, useSelectRoot } from './context.svelte.js';
	import type { SelectPositionerProps, SelectPositionerState } from './types.js';

	let {
		alignItemWithTrigger = true,
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
		disableAnchorTracking = undefined,
		collisionAvoidance = DROPDOWN_COLLISION_AVOIDANCE,
		render,
		children,
		...elementProps
	}: SelectPositionerProps = $props();

	const store = useSelectRoot();
	const attachKey = createAttachmentKey();
	// Upstream presses inside a portaled child bubble through the React tree to a parent popup.
	// Here the select joins the parent's floating tree, so the parent sees it as a child.
	useFloatingNodeId(store);

	// A fallback to regular anchoring lasts until the popup mounts or unmounts again.
	let alignFallback = $derived.by((): boolean => {
		void store.mounted;
		return false;
	});

	const alignItemWithTriggerActive = $derived(
		store.mounted && alignItemWithTrigger && !alignFallback && store.renderedOpenMethod !== 'touch'
	);

	useAnchoredPopupScrollLock(() => ({
		enabled: (alignItemWithTriggerActive || store.root.modal) && store.open,
		touchOpen: store.renderedOpenMethod === 'touch',
		positionerElement: store.positionerElement,
		referenceElement: store.triggerElement
	}));

	const positioning = new AnchorPositioning(store, () => ({
		anchor,
		positionMethod,
		side,
		align,
		sideOffset,
		alignOffset,
		collisionBoundary,
		collisionPadding,
		arrowPadding,
		sticky,
		disableAnchorTracking: disableAnchorTracking ?? alignItemWithTriggerActive,
		collisionAvoidance,
		mounted: store.mounted
	}));

	$effect(() =>
		store.publishPositioner({
			get alignItemWithTriggerActive() {
				return alignItemWithTriggerActive;
			},
			get side() {
				return positioning.side;
			}
		})
	);

	const renderedSide = $derived(alignItemWithTriggerActive ? 'none' : positioning.side);

	setSelectPositioner({
		positioning,
		get side() {
			return renderedSide;
		},
		get align() {
			return positioning.align;
		},
		get alignItemWithTriggerActive() {
			return alignItemWithTriggerActive;
		},
		disableAlignItemWithTrigger() {
			alignFallback = true;
		}
	});

	// Upstream `onMapChange`: a selected item that leaves the list takes its value with it.
	let previousSize = 0;
	$effect(() => {
		const { length } = store.values;
		untrack(() => {
			if (length === 0) return;
			const previous = previousSize;
			previousSize = length;
			itemsChanged(previous !== 0);
		});
	});

	function itemsChanged(updateValue: boolean) {
		const { value, multiple, isItemEqualToValue } = store.root;
		const values = store.values;
		const details = createChangeEventDetails(REASONS.none);

		if (updateValue && !multiple && value !== null) {
			if (findItemIndex(values, value, isItemEqualToValue) === -1) {
				const initial = store.initialValue;
				const hasInitial =
					initial != null && findItemIndex(values, initial, isItemEqualToValue) !== -1;
				store.setValue(hasInitial ? initial : null, details);
			}
		}

		if (updateValue && multiple && Array.isArray(value)) {
			const next = value.filter((item) => findItemIndex(values, item, isItemEqualToValue) !== -1);
			if (next.length !== value.length) store.setValue(next, details);
		}

		if (store.open && alignItemWithTriggerActive) {
			store.scrollUpArrowVisible = false;
			store.scrollDownArrowVisible = false;
			store.writeAlignedStyles('positioner', { height: '' });
			store.writeAlignedStyles('popup', { height: '' });
		}
	}

	/** The aligned popup still sizes itself with the anchor's CSS variables. */
	function anchorVars() {
		return Object.fromEntries(
			Object.entries(positioning.positionerStyles).filter(([key]) => key.startsWith('--'))
		);
	}

	const partState: SelectPositionerState = $derived({
		open: store.open,
		side: renderedSide,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived(
		mergeProps(
			{
				role: 'presentation' as const,
				hidden: store.mounted ? undefined : true,
				style: toCssStyle({
					...(alignItemWithTriggerActive
						? { position: 'fixed', ...anchorVars(), ...store.alignedPositionerStyle }
						: positioning.positionerStyles),
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
	<InternalBackdrop inert={!store.open} cutout={store.triggerElement} />
{/if}
{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
