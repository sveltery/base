<script lang="ts">
	import { ContextMenu, Menu } from '#lib';
	let { reasons = [], scenario = 'hover' }: { reasons?: string[]; scenario?: string } = $props();
	const onOpenChange = (open: boolean, d: { reason: string }) => {
		if (!open) reasons.push('outer:' + d.reason);
	};
	const onSub = (open: boolean, d: { reason: string }) => {
		if (!open) reasons.push('sub:' + d.reason);
	};
	const onCtx = (open: boolean, d: { reason: string }) => {
		if (!open) reasons.push('ctx:' + d.reason);
	};
	const onPlain = (open: boolean, d: { reason: string }) => {
		if (!open) reasons.push('plain:' + d.reason);
	};
	let subOpen = $state(false);
	let ctxOpen = $state(false);
	export function openSub() {
		subOpen = true;
	}
</script>

<Menu.Root {onOpenChange} modal={false}>
	<Menu.Trigger data-testid="outer-trigger" openOnHover delay={0}>Open</Menu.Trigger>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup data-testid="outer">
				<Menu.Item data-testid="outer-item">Rename</Menu.Item>
				<Menu.SubmenuRoot onOpenChange={onSub} bind:open={subOpen}>
					<Menu.SubmenuTrigger data-testid="sub-trigger">More</Menu.SubmenuTrigger>
					<Menu.Portal
						><Menu.Positioner
							><Menu.Popup data-testid="sub"><Menu.Item>S1</Menu.Item></Menu.Popup></Menu.Positioner
						></Menu.Portal
					>
				</Menu.SubmenuRoot>
				{#if scenario === 'plain'}
					<Menu.Root modal={false} onOpenChange={onPlain}>
						<Menu.Trigger data-testid="plain-trigger">Plain</Menu.Trigger>
						<Menu.Portal
							><Menu.Positioner
								><Menu.Popup data-testid="plain"><Menu.Item>P1</Menu.Item></Menu.Popup
								></Menu.Positioner
							></Menu.Portal
						>
					</Menu.Root>
				{/if}
				<ContextMenu.Root onOpenChange={onCtx} bind:open={ctxOpen}>
					<ContextMenu.Trigger data-testid="ctx-trigger">Card</ContextMenu.Trigger>
					<ContextMenu.Portal>
						<ContextMenu.Positioner>
							<ContextMenu.Popup data-testid="ctx-menu">
								<ContextMenu.Item data-testid="ctx-item">Item</ContextMenu.Item>
							</ContextMenu.Popup>
						</ContextMenu.Positioner>
					</ContextMenu.Portal>
				</ContextMenu.Root>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
