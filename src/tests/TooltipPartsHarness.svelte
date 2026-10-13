<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		Toolbar,
		Tooltip,
		type TooltipChangeEventDetails,
		type TooltipTriggerHostProps
	} from '#lib';

	let {
		scene,
		keepMounted = false,
		arrowPadding,
		triggerWidth = 20
	}: {
		scene:
			| 'trigger-alone'
			| 'popup-outside-positioner'
			| 'popup'
			| 'positioner-alone'
			| 'positioner-outside-portal'
			| 'arrow'
			| 'portal'
			| 'viewport-left'
			| 'viewport-instant'
			| 'toolbar'
			| 'own-id'
			| 'prevent-unmount';
		keepMounted?: boolean;
		arrowPadding?: number;
		triggerWidth?: number;
	} = $props();

	let open = $state(false);

	function keepMountedOnClose(next: boolean, details: TooltipChangeEventDetails) {
		if (!next) details.preventUnmountOnClose();
	}
</script>

{#snippet toolbarButton(
	props: TooltipTriggerHostProps,
	_state: unknown,
	children: Snippet | undefined
)}
	<Toolbar.Button {...props} disabled data-testid="trigger">{@render children?.()}</Toolbar.Button>
{/snippet}

{#snippet ownId(props: TooltipTriggerHostProps, _state: unknown, children: Snippet | undefined)}
	<button {...props} id="custom-button" data-testid="trigger" type="button">
		{@render children?.()}
	</button>
{/snippet}

{#if scene === 'trigger-alone'}
	<Tooltip.Trigger>Trigger</Tooltip.Trigger>
{:else if scene === 'popup-outside-positioner'}
	<Tooltip.Root open>
		<Tooltip.Portal><Tooltip.Popup /></Tooltip.Portal>
	</Tooltip.Root>
{:else if scene === 'popup'}
	<Tooltip.Root open>
		<Tooltip.Portal>
			<Tooltip.Positioner><Tooltip.Popup>Content</Tooltip.Popup></Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
{:else if scene === 'positioner-alone'}
	<Tooltip.Positioner />
{:else if scene === 'positioner-outside-portal'}
	<Tooltip.Root open><Tooltip.Positioner /></Tooltip.Root>
{:else if scene === 'arrow'}
	<div style="position: fixed; top: 0; left: 0">
		<Tooltip.Root open>
			<Tooltip.Trigger style="width: {triggerWidth}px; height: 20px">T</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Positioner side="bottom" {arrowPadding}>
					<Tooltip.Popup style="width: 200px; height: 40px">
						<Tooltip.Arrow data-testid="arrow" style="width: 10px; height: 10px" />
					</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		</Tooltip.Root>
	</div>
{:else if scene === 'portal'}
	<Tooltip.Root>
		<Tooltip.Trigger>Trigger</Tooltip.Trigger>
		<Tooltip.Portal {keepMounted}>
			<Tooltip.Positioner data-testid="positioner">
				<Tooltip.Popup data-testid="popup">Content</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
{:else if scene === 'viewport-left'}
	<Tooltip.Root>
		<Tooltip.Trigger delay={0} closeDelay={0} style="position: fixed; top: 200px; left: 300px">
			Trigger
		</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Positioner side="left" data-testid="positioner" style="transition: transform 100ms">
				<Tooltip.Popup><Tooltip.Viewport>Content</Tooltip.Viewport></Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
{:else if scene === 'viewport-instant'}
	<Tooltip.Root>
		<Tooltip.Trigger delay={0} closeDelay={0}>Trigger</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Positioner>
				<Tooltip.Popup>
					<Tooltip.Viewport data-testid="viewport">Content</Tooltip.Viewport>
				</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
{:else if scene === 'toolbar'}
	<Toolbar.Root>
		<Tooltip.Root>
			<Tooltip.Trigger delay={20} render={toolbarButton}>Push</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Positioner>
					<Tooltip.Popup data-testid="popup">Nothing to push</Tooltip.Popup>
				</Tooltip.Positioner>
			</Tooltip.Portal>
		</Tooltip.Root>
	</Toolbar.Root>
{:else if scene === 'own-id'}
	<Tooltip.Root>
		<Tooltip.Trigger delay={0} closeDelay={0} render={ownId}>Trigger</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Positioner>
				<Tooltip.Popup data-testid="popup">Content</Tooltip.Popup>
			</Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
{:else if scene === 'prevent-unmount'}
	<Tooltip.Root bind:open onOpenChange={keepMountedOnClose}>
		<Tooltip.Trigger data-testid="trigger" delay={0} closeDelay={0} style="pointer-events: none">
			Trigger
		</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Positioner><Tooltip.Popup>Content</Tooltip.Popup></Tooltip.Positioner>
		</Tooltip.Portal>
	</Tooltip.Root>
{/if}
