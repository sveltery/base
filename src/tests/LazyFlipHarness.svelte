<script lang="ts">
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
	import { toCssStyle } from '#lib/internal/css-style.js';
	import { AnchorPositioning, PopupStore, registerTrigger } from '#lib/internal/popups/index.js';

	let { lazyFlip = false, width = 200 }: { lazyFlip?: boolean | 'placement'; width?: number } =
		$props();

	let open = $state(false);
	const store = new PopupStore<string>({
		readOpen: () => open,
		writeOpen: (next) => {
			open = next;
		},
		floatingId: 'lazy-flip',
		floatingElement: 'positioner',
		onOpenChange: () => undefined,
		onOpenChangeComplete: () => undefined
	});

	const positioning = new AnchorPositioning(store, () => ({
		mounted: store.mounted,
		disableAnchorTracking: false,
		positionMethod: 'fixed',
		side: 'bottom',
		align: 'start',
		collisionAvoidance: { side: 'flip', align: 'flip', fallbackAxisSide: 'end' },
		collisionPadding: 0,
		lazyFlip
	}));
</script>

<!-- Near the right edge, so a wide popup cannot start at the trigger's left edge. -->
<button
	type="button"
	style="position: fixed; right: 20px; top: 20px; width: 60px"
	onclick={(event) =>
		store.setOpen(true, createChangeEventDetails(REASONS.triggerPress, event, event.currentTarget))}
	{@attach registerTrigger(store.triggers, () => 'lazy-flip-trigger')}>Open</button
>
{#if store.mounted}
	<div
		data-testid="positioner"
		data-align={positioning.align}
		data-positioned={positioning.isPositioned ? '' : undefined}
		style={toCssStyle(positioning.positionerStyles)}
		{@attach positioning.positionerProps.attach}
	>
		<div style="width: {width}px; height: 20px">popup</div>
	</div>
{/if}
