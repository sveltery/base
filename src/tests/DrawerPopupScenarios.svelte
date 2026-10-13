<script lang="ts">
	import { AlertDialog } from '../lib/alert-dialog/index.js';
	import { Dialog } from '../lib/dialog/index.js';
	import { Drawer, type DrawerHandle } from '../lib/drawer/index.js';

	let {
		scenario,
		initialFocus = undefined,
		showPopup = true,
		childOpen = $bindable(false),
		childKeepMounted = false,
		parentClass = undefined,
		childClass = undefined,
		handle = undefined
	}: {
		scenario:
			| 'no-viewport'
			| 'focus'
			| 'composite-keys'
			| 'upward-snap'
			| 'render-nothing'
			| 'toggle-popup'
			| 'nested-border'
			| 'nested-open'
			| 'nested-handle'
			| 'nested-dialog'
			| 'nested-alert-dialog'
			| 'nested-trigger';
		initialFocus?: false;
		showPopup?: boolean;
		childOpen?: boolean;
		childKeepMounted?: boolean;
		parentClass?: string;
		childClass?: string;
		handle?: DrawerHandle;
	} = $props();
</script>

{#snippet nothing()}{/snippet}

{#if scenario === 'no-viewport'}
	<Drawer.Root open={true}>
		<Drawer.Portal>
			<Drawer.Popup>Drawer</Drawer.Popup>
		</Drawer.Portal>
	</Drawer.Root>
{:else if scenario === 'focus'}
	<input aria-label="Outside" />
	<Drawer.Root modal={false}>
		<Drawer.Trigger>Open</Drawer.Trigger>
		<Drawer.Portal>
			<Drawer.Viewport>
				<Drawer.Popup data-testid="popup" {initialFocus}>
					<input data-testid="popup-input" />
				</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.Root>
{:else if scenario === 'composite-keys'}
	<Drawer.Root open={true} modal={false}>
		<Drawer.Portal>
			<Drawer.Viewport>
				<Drawer.Popup>
					<input aria-label="Field" />
				</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.Root>
{:else if scenario === 'upward-snap'}
	<Drawer.Root
		defaultSnapPoint="100px"
		open={true}
		modal={false}
		snapPoints={['100px', '300px']}
		swipeDirection="up"
	>
		<Drawer.Portal>
			<Drawer.Viewport style="height: 400px">
				<Drawer.Popup data-testid="popup" style="height: 300px">Drawer</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.Root>
{:else if scenario === 'render-nothing'}
	<Drawer.Root open={true} modal={false}>
		<Drawer.Portal>
			<Drawer.Viewport data-testid="viewport">
				<Drawer.Popup render={nothing}>Drawer</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.Root>
{:else if scenario === 'toggle-popup'}
	<Drawer.Root open={true} modal={false}>
		<Drawer.Portal>
			<Drawer.Viewport>
				{#if showPopup}
					<Drawer.Popup data-testid="popup">Drawer</Drawer.Popup>
				{/if}
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.Root>
{:else}
	<Drawer.Root open={true} modal={false}>
		<Drawer.Portal>
			<Drawer.Viewport>
				<Drawer.Popup data-testid="parent-popup" class={parentClass}>
					{#if scenario === 'nested-border'}
						<Drawer.Root open={true}>
							<Drawer.Portal>
								<Drawer.Viewport>
									<Drawer.Popup
										data-testid="child-popup"
										style="height: 100px; border-top: 2px solid transparent; border-bottom: 2px solid transparent"
									>
										<div style="height: 10px">Child drawer</div>
									</Drawer.Popup>
								</Drawer.Viewport>
							</Drawer.Portal>
						</Drawer.Root>
					{:else if scenario === 'nested-open'}
						<Drawer.Root open={childOpen} modal={false}>
							<Drawer.Portal keepMounted>
								<Drawer.Viewport>
									<Drawer.Popup initialFocus={false} style="height: 100px">Child drawer</Drawer.Popup>
								</Drawer.Viewport>
							</Drawer.Portal>
						</Drawer.Root>
					{:else if scenario === 'nested-handle'}
						<Drawer.Root open={true} modal={false}>
							<Drawer.Portal>
								<Drawer.Viewport>
									<Drawer.Popup>Open child</Drawer.Popup>
								</Drawer.Viewport>
							</Drawer.Portal>
						</Drawer.Root>
						<Drawer.Root {handle} modal={false}>
							<Drawer.Portal>
								<Drawer.Viewport>
									<Drawer.Popup>Closed child</Drawer.Popup>
								</Drawer.Viewport>
							</Drawer.Portal>
						</Drawer.Root>
					{:else if scenario === 'nested-dialog' || scenario === 'nested-alert-dialog'}
						<Drawer.Root open={true} modal={false}>
							<Drawer.Portal>
								<Drawer.Viewport>
									<Drawer.Popup data-testid="child-popup">
										{#if scenario === 'nested-dialog'}
											<Dialog.Root modal={false}>
												<Dialog.Trigger>Open dialog</Dialog.Trigger>
												<Dialog.Portal>
													<Dialog.Popup data-testid="dialog-popup">Dialog</Dialog.Popup>
												</Dialog.Portal>
											</Dialog.Root>
										{:else}
											<AlertDialog.Root>
												<AlertDialog.Trigger>Open alert dialog</AlertDialog.Trigger>
												<AlertDialog.Portal>
													<AlertDialog.Popup data-testid="alert-dialog-popup">
														Alert dialog
														<AlertDialog.Close>Close alert dialog</AlertDialog.Close>
													</AlertDialog.Popup>
												</AlertDialog.Portal>
											</AlertDialog.Root>
										{/if}
									</Drawer.Popup>
								</Drawer.Viewport>
							</Drawer.Portal>
						</Drawer.Root>
					{:else if scenario === 'nested-trigger'}
						<div class="animation-test-parent-content"></div>
						<Drawer.Root bind:open={childOpen} modal={false}>
							<Drawer.Trigger>Open nested drawer</Drawer.Trigger>
							<Drawer.Portal keepMounted={childKeepMounted}>
								<Drawer.Viewport>
									<Drawer.Popup data-testid="child-popup" class={childClass}>
										<div class="animation-test-child-content"></div>
										<Drawer.Close>Close nested drawer</Drawer.Close>
									</Drawer.Popup>
								</Drawer.Viewport>
							</Drawer.Portal>
						</Drawer.Root>
					{/if}
				</Drawer.Popup>
			</Drawer.Viewport>
		</Drawer.Portal>
	</Drawer.Root>
{/if}
