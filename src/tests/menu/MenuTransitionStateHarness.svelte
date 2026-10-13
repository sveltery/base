<!--
	A menu whose popup reports each open and transition status pair it renders with.
	Derived from Base UI v1.9.0 packages/react/src/menu/popup/MenuPopupTransitionState.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import { Menu, type MenuPopupState } from '#lib';

	type PopupState = Pick<MenuPopupState, 'open' | 'transitionStatus'>;

	let {
		controlled,
		keepMounted,
		defaultOpen,
		onState,
		onOpenChangeComplete
	}: {
		controlled: boolean;
		keepMounted: boolean;
		defaultOpen: boolean;
		onState: (state: PopupState) => void;
		onOpenChangeComplete: (open: boolean) => void;
	} = $props();

	let open = $state(untrack(() => defaultOpen));
</script>

<svelte:element this={"style"}>
	{`.transition-state-popup { opacity: 0; transition: opacity 10s linear; }
	.transition-state-popup[data-enter] { opacity: 1; }`}
</svelte:element>

{#snippet root(children: import('svelte').Snippet)}
	{#if controlled}
		<Menu.Root bind:open {onOpenChangeComplete}>{@render children()}</Menu.Root>
	{:else}
		<Menu.Root open={defaultOpen} {onOpenChangeComplete}>{@render children()}</Menu.Root>
	{/if}
{/snippet}

{#snippet parts()}
	<Menu.Trigger>Toggle</Menu.Trigger>
	<Menu.Portal {keepMounted}>
		<Menu.Positioner>
			<Menu.Popup class="transition-state-popup">
				{#snippet render(props, state, children)}
					<div
						{...props}
						data-enter={(state.open && state.transitionStatus !== 'starting') || undefined}
						{@attach () => onState({ open: state.open, transitionStatus: state.transitionStatus })}
					>
						{@render children?.()}
					</div>
				{/snippet}
				<Menu.Item>Item</Menu.Item>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
{/snippet}

{@render root(parts)}
