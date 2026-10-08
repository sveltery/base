<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { toCssStyle } from '#lib/internal/css-style.js';
	import { createControllableValue } from '#lib/internal/controllable-value.svelte.js';
	import {
		safePolygon,
		useClick,
		useHoverFloatingInteraction,
		useHoverReferenceInteraction
	} from '#lib/internal/floating-ui/index.js';
	import { mergeProps } from '#lib/internal/mergeProps.js';
	import {
		PopupStore,
		popupTransitionStateMapping,
		registerTrigger,
		useAnchorPositioning,
		useAnchoredPopupScrollLock
	} from '#lib/internal/popups/index.js';
	import type { PopupChangeEventDetails } from '#lib/internal/popups/index.js';
	import { getStateAttributesProps } from '#lib/internal/state-attributes.js';

	let { scenario = 'placed' }: { scenario?: 'placed' | 'hover' } = $props();

	let open = $state<boolean | undefined>(undefined);
	let reason = $state('');
	const hover = $derived(scenario === 'hover');

	const openValue = createControllableValue<boolean>({
		getProp: () => open,
		setProp: (next) => {
			open = next;
		},
		getDefault: () => false
	});

	function handleOpen(next: boolean, details: PopupChangeEventDetails<string>) {
		reason = details.reason;
	}

	const store = new PopupStore<string>({
		open: openValue,
		floatingId: 'anchored-popup',
		floatingElement: 'positioner',
		onOpenChange: () => handleOpen,
		onOpenChangeComplete: () => () => {}
	});

	const click = useClick(store, () => ({ enabled: !hover }));
	const hoverReference = useHoverReferenceInteraction(store, () => ({
		enabled: hover,
		mouseOnly: true,
		move: false,
		handleClose: safePolygon(),
		restMs: 0,
		delay: { close: 0 },
		placement: () => positioning.physicalSide
	}));
	useHoverFloatingInteraction(store, () => ({ enabled: hover, closeDelay: 0 }));

	const positioning = useAnchorPositioning(store, () => ({
		mounted: store.mounted,
		disableAnchorTracking: false,
		positionMethod: 'fixed',
		side: 'bottom',
		align: 'start',
		sideOffset: 0,
		collisionAvoidance: { side: 'flip', align: 'shift', fallbackAxisSide: 'end' },
		collisionPadding: 0
	}));

	function bindPopup(node: HTMLElement) {
		store.popupElement = node;
		return () => {
			if (store.popupElement === node) store.popupElement = null;
		};
	}

	useAnchoredPopupScrollLock(() => ({
		enabled: store.open && reason !== 'trigger-hover',
		touchOpen: false,
		positionerElement: store.positionerElement,
		referenceElement: store.domReferenceElement
	}));

	const triggerProps = $derived(
		mergeProps(
			{ id: 'open-trigger', type: 'button' },
			click.reference,
			hoverReference.reference
		) as HTMLButtonAttributes
	);
</script>

<div data-testid="anchor">
	<button {...triggerProps} {@attach registerTrigger(store, () => 'open-trigger')}>Open</button>
	<div data-testid="outside" style={hover ? 'position: fixed; top: 0; right: 0' : undefined}>
		Outside
	</div>
	<pre data-testid="calls">{JSON.stringify([{ open: store.open, reason, canceled: false }])}</pre>
	{#if store.mounted}
		<div
			data-testid="positioner"
			data-side={positioning.side}
			data-positioned={positioning.isPositioned ? '' : undefined}
			style={toCssStyle(positioning.positionerStyles)}
			{@attach positioning.positionerProps.attach}
		>
			<div
				role="dialog"
				aria-labelledby="anchored-title"
				data-testid="popup"
				{@attach bindPopup}
				{...getStateAttributesProps(
					{
						open: store.open,
						anchorHidden: positioning.anchorHidden,
						transitionStatus: store.transitionStatus
					},
					popupTransitionStateMapping
				)}
			>
				<h2 id="anchored-title">Notice</h2>
			</div>
		</div>
	{/if}
</div>
