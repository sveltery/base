<script lang="ts">
	import { Popover } from '#lib';
	import type { HTMLAttributes } from 'svelte/elements';
	import StateRecorder from './StateRecorder.svelte';

	interface PopupState {
		open: boolean;
		transitionStatus: string | undefined;
	}

	let {
		part,
		bound = false,
		onState,
		onOpenChangeComplete
	}: {
		/** `backdrop` renders an initially open Root with only a Backdrop. */
		part: 'backdrop' | 'popup';
		/** Opens the backdrop Root through `bind:open` instead of a one-way `open`. */
		bound?: boolean;
		onState: (state: PopupState) => void;
		onOpenChangeComplete?: (open: boolean) => void;
	} = $props();

	let open = $state(true);
</script>

{#snippet recorded(props: HTMLAttributes<HTMLDivElement>, state: PopupState)}
	<div {...props} data-enter={(state.open && state.transitionStatus !== 'starting') || undefined}>
		<StateRecorder
			value={{ open: state.open, transitionStatus: state.transitionStatus }}
			onValue={onState}
		/>
		{#if part === 'popup'}Content{/if}
	</div>
{/snippet}

{#if part === 'backdrop'}
	{#if bound}
		<Popover.Root bind:open><Popover.Backdrop render={recorded} /></Popover.Root>
	{:else}
		<Popover.Root open={true}><Popover.Backdrop render={recorded} /></Popover.Root>
	{/if}
{:else}
	<svelte:element this={"style"}>
		{`.transition-state-popup { opacity: 0; transition: opacity 10s linear; }
		.transition-state-popup[data-enter] { opacity: 1; }`}
	</svelte:element>
	<Popover.Root {onOpenChangeComplete}>
		<Popover.Trigger>Toggle</Popover.Trigger>
		<Popover.Portal keepMounted>
			<Popover.Positioner>
				<Popover.Popup class="transition-state-popup" render={recorded} />
			</Popover.Positioner>
		</Popover.Portal>
	</Popover.Root>
{/if}
