<script lang="ts">
	import { createChangeEventDetails } from '#lib/internal/event-details.js';
	import { createControllableValue } from '#lib/internal/controllable-value.svelte.js';
	import { PopupStore, useTriggerFocusGuards } from '#lib/internal/popups/index.js';

	let open = $state<boolean | undefined>(undefined);
	let trigger = $state<HTMLButtonElement | null>(null);

	const openValue = createControllableValue<boolean>({
		getProp: () => open,
		setProp: (next) => {
			open = next;
		},
		getDefault: () => false
	});

	const store = new PopupStore<string>({
		open: openValue,
		floatingId: 'focus-guard-popup',
		floatingElement: 'positioner',
		onOpenChange: () => () => {},
		onOpenChangeComplete: () => () => {}
	});

	const guards = useTriggerFocusGuards(store, () => trigger);

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
	<button
		type="button"
		data-testid="pre-guard"
		onfocus={guards.preFocusGuardProps.onfocus}
		{@attach guards.preFocusGuardProps.attach}>Pre</button
	>
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
