<script lang="ts">
	import { createChangeEventDetails } from '@sveltery/utils';
	import { PopupStore, TriggerFocusGuards } from '#lib/internal/popups/index.js';

	let open = $state<boolean | undefined>(undefined);
	let trigger = $state<HTMLButtonElement | null>(null);

	const store = new PopupStore<string>({
		readOpen: () => open ?? false,
		writeOpen: (next) => {
			open = next;
		},
		floatingId: 'focus-guard-popup',
		floatingElement: 'positioner',
		onOpenChange: () => () => {},
		onOpenChangeComplete: () => () => {}
	});

	const guards = new TriggerFocusGuards(store, () => trigger);

	function bindPositioner(node: HTMLElement) {
		store.positionerElement = node;
		return () => {
			if (store.positionerElement === node) store.positionerElement = null;
		};
	}

	function bindPopup(node: HTMLElement) {
		store.popupElement = node;
		return () => {
			if (store.popupElement === node) store.popupElement = null;
		};
	}

	function show() {
		store.setOpen(true, createChangeEventDetails('imperative-action'));
	}
</script>

<button type="button">Before</button>
<button type="button" bind:this={trigger} onclick={show}>Open</button>
<pre data-testid="open">{store.open}</pre>
{#if store.mounted}
	<button type="button" data-testid="pre-guard" {...guards.preFocusGuardProps}>Pre</button>
	<div data-testid="positioner" {@attach bindPositioner}>
		<button
			type="button"
			data-testid="before-content"
			{@attach guards.beforeContentFocusGuardProps.attach}>Inside</button
		>
		<div role="dialog" {@attach bindPopup}>Notice</div>
	</div>
	<button
		type="button"
		data-testid="focus-target"
		onfocus={guards.focusTargetProps.onfocus}
		{@attach guards.focusTargetProps.attach}>Target</button
	>
{/if}
<button type="button">After</button>
