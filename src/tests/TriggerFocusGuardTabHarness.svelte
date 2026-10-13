<script lang="ts">
	import { createChangeEventDetails } from '@sveltery/utils';
	import { FocusGuard, PopupStore, TriggerFocusGuards } from '#lib/internal/popups/index.js';

	// As upstream v1.9.0 Popover and Menu triggers do, the guards render only while open.
	let { tabIndex = 0, neighbors = true }: { tabIndex?: number; neighbors?: boolean } = $props();

	let open = $state(false);
	let trigger = $state<HTMLButtonElement | null>(null);

	const store = new PopupStore<string>({
		readOpen: () => open,
		writeOpen: (next) => {
			open = next;
		},
		floatingId: 'tab-guard-popup',
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
</script>

{#if neighbors}<button type="button">Before</button>{/if}
{#if open}<FocusGuard {...guards.preFocusGuardProps} />{/if}
<button
	type="button"
	tabindex={tabIndex}
	bind:this={trigger}
	onclick={() => store.setOpen(true, createChangeEventDetails('imperative-action'))}>Toggle</button
>
{#if open}<FocusGuard {...guards.focusTargetProps} />{/if}
{#if neighbors}<button type="button">After</button>{/if}
<pre data-testid="open">{open}</pre>
{#if open}
	<div data-testid="positioner" {@attach bindPositioner}>
		<button type="button">Inside</button>
	</div>
{/if}
