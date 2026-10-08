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

	let {
		scenario = 'placed'
	}: {
		scenario?:
			| 'placed'
			| 'hover'
			| 'block'
			| 'switch'
			| 'refuse'
			| 'delay'
			| 'closing'
			| 'pixels'
			| 'unmount'
			| 'retain';
	} = $props();

	let open = $state<boolean | undefined>(undefined);
	let reason = $state('');
	let seenTrigger = $state('');
	let closeDelay = $state(600);
	let showTrigger = $state(true);
	const hover = $derived(
		scenario === 'hover' ||
			scenario === 'block' ||
			scenario === 'switch' ||
			scenario === 'delay' ||
			scenario === 'unmount'
	);
	const many = $derived(scenario === 'switch' || scenario === 'refuse' || scenario === 'retain');

	const fractionalAnchor = {
		getBoundingClientRect: () => new DOMRect(10.2, 20.2, 40, 16)
	};

	const openValue = createControllableValue<boolean>({
		getProp: () => open,
		setProp: (next) => {
			open = next;
		},
		getDefault: () => false
	});

	function handleOpen(next: boolean, details: PopupChangeEventDetails<string>) {
		reason = details.reason;
		seenTrigger = store.activeTriggerId ?? '';
	}

	const store = new PopupStore<string>({
		open: openValue,
		floatingId: 'anchored-popup',
		floatingElement: 'positioner',
		onOpenChange: () => handleOpen,
		onOpenChangeComplete: () => () => {}
	});

	const click = useClick(store, () => ({ enabled: !hover }));
	const polygon = $derived(safePolygon({ blockPointerEvents: scenario === 'block' }));
	const hoverReference = useHoverReferenceInteraction(store, () => ({
		enabled: hover && !many,
		mouseOnly: true,
		move: false,
		handleClose: scenario === 'delay' ? null : polygon,
		restMs: 0,
		delay: { close: scenario === 'delay' ? closeDelay : 0 },
		placement: () => positioning.physicalSide,
		shouldOpen: () => scenario !== 'refuse'
	}));
	const hoverA = useHoverReferenceInteraction(store, () => ({
		enabled: many && scenario !== 'retain',
		mouseOnly: true,
		move: false,
		handleClose: polygon,
		delay: { close: 0 },
		shouldOpen: () => scenario !== 'refuse',
		placement: () => positioning.physicalSide
	}));
	const hoverB = useHoverReferenceInteraction(store, () => ({
		enabled: many && scenario !== 'retain',
		mouseOnly: true,
		move: false,
		handleClose: polygon,
		delay: { close: 0 },
		shouldOpen: () => scenario !== 'refuse',
		placement: () => positioning.physicalSide
	}));
	useHoverFloatingInteraction(store, () => ({
		enabled: (hover || many) && scenario !== 'retain',
		closeDelay: scenario === 'delay' ? closeDelay : 0
	}));

	const positioning = useAnchorPositioning(store, () => ({
		mounted: store.mounted,
		anchor: scenario === 'pixels' ? fractionalAnchor : undefined,
		disableAnchorTracking: false,
		positionMethod: 'fixed',
		side: 'bottom',
		align: 'start',
		sideOffset: scenario === 'unmount' ? 30 : 0,
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
	const triggerAProps = $derived(
		mergeProps(
			{ id: 'trigger-a', type: 'button' },
			click.reference,
			hoverA.reference
		) as HTMLButtonAttributes
	);
	const triggerBProps = $derived(
		mergeProps(
			{ id: 'trigger-b', type: 'button' },
			scenario === 'retain' ? click.reference : {},
			hoverB.reference
		) as HTMLButtonAttributes
	);
</script>

<div data-testid="anchor" data-active={store.activeTriggerId}>
	{#if many}
		<button
			{...triggerAProps}
			style="position: fixed; left: 20px; top: 40px"
			{@attach registerTrigger(store, () => 'trigger-a')}
			{@attach hoverA.attachReference}>A</button
		>
		<button
			{...triggerBProps}
			style="position: fixed; left: 240px; top: 40px"
			{@attach registerTrigger(store, () => 'trigger-b')}
			{@attach hoverB.attachReference}>B</button
		>
	{:else if showTrigger}
		<button
			{...triggerProps}
			style={scenario === 'delay'
				? 'position: fixed; left: 300px; top: 220px'
				: scenario === 'unmount'
					? 'position: fixed; left: 100px; top: 100px; width: 80px; height: 20px; padding: 0'
					: undefined}
			{@attach registerTrigger(store, () => 'open-trigger')}
			{@attach hoverReference.attachReference}>Open</button
		>
	{/if}
	<div data-testid="outside" style={hover ? 'position: fixed; top: 0; right: 0' : undefined}>
		Outside
	</div>
	{#if scenario === 'delay'}
		<button
			type="button"
			data-testid="longer"
			style="position: fixed; left: 8px; top: 8px"
			onclick={() => (closeDelay = 5000)}>Longer</button
		>
	{/if}
	{#if scenario === 'unmount'}
		<button type="button" data-testid="remove" onclick={() => (showTrigger = false)}>Remove</button>
	{/if}
	<pre data-testid="calls">{JSON.stringify([{ open: store.open, reason, canceled: false }])}</pre>
	<pre data-testid="active">{store.activeTriggerId}</pre>
	<pre data-testid="seen">{seenTrigger}</pre>
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
				class:hold={scenario === 'closing'}
				class:wide={scenario === 'unmount'}
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

<style>
	.hold {
		animation: sveltery-hold 3s linear both;
	}

	.wide {
		box-sizing: border-box;
		width: 240px;
	}

	@keyframes sveltery-hold {
		from {
			opacity: 1;
		}
		to {
			opacity: 0.5;
		}
	}
</style>
