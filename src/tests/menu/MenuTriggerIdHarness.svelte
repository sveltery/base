<!--
	One menu with a lone trigger that a key remounts under a new id, bound `open` and `triggerId`,
	standalone or inside a menubar. `setTriggerId` plays the parent that writes the bound id.
	Derived from Base UI v1.9.0 packages/react/src/utils/popups/popupStoreUtils.ts
	(`useImplicitActiveTrigger`, `useOpenStateTransitions`)
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu, Menubar } from '#lib';

	let {
		open = $bindable(false),
		triggerKey = 0,
		menubar = false
	}: {
		open?: boolean;
		triggerKey?: number;
		menubar?: boolean;
	} = $props();

	// Local state, so a `rerender` of other props keeps the id the store wrote.
	let triggerId = $state<string | null>();

	export function setTriggerId(id: string | null) {
		triggerId = id;
	}
</script>

{#snippet menu()}
	<Menu.Root bind:open bind:triggerId>
		{#key triggerKey}
			<Menu.Trigger
				data-testid="trigger"
				style="width: 72px; height: 36px; box-sizing: border-box; padding: 0; border: 0"
				>Trigger</Menu.Trigger
			>
		{/key}
		<Menu.Portal>
			<Menu.Positioner data-testid="positioner" side="bottom" align="start">
				<Menu.Popup style="width: 52px; height: 24px">
					<Menu.Item>Item</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
{/snippet}

<div style="position: fixed; top: 100px; left: 100px">
	{#if menubar}
		<Menubar>{@render menu()}</Menubar>
	{:else}
		{@render menu()}
	{/if}
</div>
<span data-testid="trigger-id">{triggerId ?? ''}</span>
