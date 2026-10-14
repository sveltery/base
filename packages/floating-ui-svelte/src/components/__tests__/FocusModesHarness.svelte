<script lang="ts">
	import { createChangeEventDetails, REASONS, type OpenInteractionType } from '@sveltery/utils';
	import FloatingFocusManager from '../FloatingFocusManager.svelte';
	import { TestStore } from '../../hooks/__tests__/TestStore.svelte.js';

	let {
		modal = true,
		initialFocus = true,
		combobox = false,
		positioner = false,
		controls = 1,
		withInsideElement = false
	}: {
		modal?: boolean;
		initialFocus?: boolean;
		/** The reference is a typeable `role="combobox"` input outside the popup. */
		combobox?: boolean;
		/** The floating element is a positioner that holds the focus manager and its guards. */
		positioner?: boolean;
		/** Buttons inside the popup: `first`, then `last` when there are two. */
		controls?: 0 | 1 | 2;
		/** A button outside the popup passed through `getInsideElements`. */
		withInsideElement?: boolean;
	} = $props();

	export const store = new TestStore();
	let reference = $state<HTMLElement | null>(null);
	let insideElement = $state<HTMLElement | null>(null);

	export function show(method: OpenInteractionType | null) {
		store.openMethod = method;
		store.setOpen(
			true,
			createChangeEventDetails(REASONS.imperativeAction, undefined, reference ?? undefined)
		);
	}

	export function hide() {
		store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}
</script>

{#snippet popupContent()}
	{#if controls > 0}<button data-testid="first">first</button>{/if}
	{#if controls > 1}<button data-testid="last">last</button>{/if}
{/snippet}

{#snippet manager(registerPopup: boolean)}
	<FloatingFocusManager
		{store}
		{modal}
		{initialFocus}
		getInsideElements={withInsideElement ? () => [insideElement] : undefined}
	>
		{#if registerPopup}
			<div
				id="focus-modes-popup"
				data-testid="popup"
				tabindex="-1"
				{@attach store.registerFloating}
			>
				{@render popupContent()}
			</div>
		{:else}
			<div id="focus-modes-popup" data-testid="popup" tabindex="-1" data-base-ui-focusable>
				{@render popupContent()}
			</div>
		{/if}
	</FloatingFocusManager>
{/snippet}

<button data-testid="before">before</button>
{#if combobox}
	<input
		data-testid="reference"
		role="combobox"
		aria-controls="focus-modes-popup"
		aria-expanded={store.open}
		bind:this={reference}
		{@attach store.registerTrigger}
	/>
{:else}
	<button data-testid="reference" bind:this={reference} {@attach store.registerTrigger}>
		reference
	</button>
{/if}
{#if withInsideElement}
	<button data-testid="inside-element" bind:this={insideElement}>inside element</button>
{/if}
{#if store.open}
	{#if positioner}
		<div data-testid="positioner" {@attach store.registerFloating}>
			{@render manager(false)}
		</div>
	{:else}
		{@render manager(true)}
	{/if}
{/if}
<button data-testid="after">after</button>
