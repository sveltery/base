<!--
	The menus that the WebKit `aria-selected` specs open.
	Derived from Base UI v1.9.0 packages/react/src/menu/filter-root/MenuFilterRoot.webkit.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu } from '#lib';

	let {
		scenario = 'basic',
		autofocus = false,
		inputKey = 'first',
		showInput = true,
		close = false
	}: {
		scenario?: 'basic' | 'hover' | 'checked' | 'triggers' | 'submenu-input' | 'plain';
		autofocus?: boolean;
		inputKey?: string;
		showInput?: boolean;
		close?: boolean;
	} = $props();

	let open = $state(true);
	$effect(() => {
		if (close) open = false;
	});
</script>

{#if scenario === 'basic'}
	<Menu.FilterProvider>
		<Menu.Root bind:open>
			<Menu.Trigger>Actions</Menu.Trigger>
			<Menu.Portal>
				<Menu.Positioner>
					<Menu.Popup>
						{#if showInput}
							{#key inputKey}
								<Menu.Input aria-label="Filter actions" {autofocus} />
							{/key}
						{/if}
						<Menu.List>
							<Menu.Item>Apple</Menu.Item>
							<Menu.Item>Banana</Menu.Item>
						</Menu.List>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	</Menu.FilterProvider>
{:else if scenario === 'hover'}
	<Menu.FilterProvider autoHighlight="always">
		<Menu.Root bind:open>
			<Menu.Trigger openOnHover delay={0}>Actions</Menu.Trigger>
			<Menu.Portal>
				<Menu.Positioner>
					<Menu.Popup>
						<Menu.Input aria-label="Filter actions" />
						<Menu.List>
							<Menu.Item>Apple</Menu.Item>
						</Menu.List>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	</Menu.FilterProvider>
{:else if scenario === 'checked'}
	<Menu.FilterProvider>
		<Menu.Root bind:open>
			<Menu.Trigger>Actions</Menu.Trigger>
			<Menu.Portal>
				<Menu.Positioner>
					<Menu.Popup>
						<Menu.Input aria-label="Filter actions" />
						<Menu.List>
							<Menu.CheckboxItem checked>Details</Menu.CheckboxItem>
							<Menu.RadioGroup value="date">
								<Menu.RadioItem value="date">Date</Menu.RadioItem>
							</Menu.RadioGroup>
						</Menu.List>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	</Menu.FilterProvider>
{:else if scenario === 'triggers'}
	<Menu.FilterProvider>
		<Menu.Root bind:open>
			<Menu.Trigger>Actions</Menu.Trigger>
			<Menu.Portal>
				<Menu.Positioner>
					<Menu.Popup>
						<Menu.Input aria-label="Filter actions" />
						<Menu.List>
							<Menu.LinkItem href="#docs">Documentation</Menu.LinkItem>
							<Menu.FilterProvider>
								<Menu.SubmenuRoot>
									<Menu.SubmenuTrigger>More actions</Menu.SubmenuTrigger>
									<Menu.Portal>
										<Menu.Positioner>
											<Menu.Popup>
												<Menu.List>
													<Menu.Item>Share</Menu.Item>
												</Menu.List>
											</Menu.Popup>
										</Menu.Positioner>
									</Menu.Portal>
								</Menu.SubmenuRoot>
							</Menu.FilterProvider>
							<Menu.SubmenuRoot>
								<Menu.SubmenuTrigger>Plain submenu</Menu.SubmenuTrigger>
								<Menu.Portal>
									<Menu.Positioner>
										<Menu.Popup>
											<Menu.Item>Copy</Menu.Item>
										</Menu.Popup>
									</Menu.Positioner>
								</Menu.Portal>
							</Menu.SubmenuRoot>
						</Menu.List>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	</Menu.FilterProvider>
{:else if scenario === 'submenu-input'}
	<Menu.FilterProvider>
		<Menu.Root bind:open>
			<Menu.Trigger>Actions</Menu.Trigger>
			<Menu.Portal>
				<Menu.Positioner>
					<Menu.Popup>
						<Menu.Input aria-label="Filter actions" />
						<Menu.List>
							<Menu.FilterProvider>
								<Menu.SubmenuRoot>
									<Menu.SubmenuTrigger>More actions</Menu.SubmenuTrigger>
									<Menu.Portal>
										<Menu.Positioner>
											<Menu.Popup>
												<Menu.Input aria-label="Filter more actions" />
												<Menu.List>
													<Menu.Item>Share</Menu.Item>
												</Menu.List>
											</Menu.Popup>
										</Menu.Positioner>
									</Menu.Portal>
								</Menu.SubmenuRoot>
							</Menu.FilterProvider>
						</Menu.List>
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	</Menu.FilterProvider>
{:else}
	<Menu.Root bind:open>
		<Menu.Trigger>Actions</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Item>Apple</Menu.Item>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
{/if}
