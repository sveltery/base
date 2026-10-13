<script lang="ts">
	import { NavigationMenu, type NavigationMenuChangeEventDetails } from '#lib';

	type Variant =
		| 'portal'
		| 'portalCloseOnClick'
		| 'orientation'
		| 'inline'
		| 'dynamic'
		| 'tabBoundary'
		| 'tabFlow'
		| 'deep'
		| 'deepCloseOnClick';

	let {
		variant = 'inline',
		closeDelay,
		onValueChange,
		nestedDefaultValue = 'nested-item-1',
		nestedItem1Value = 'nested-item-1',
		keepMountedContent = false,
		nestedLinkCloseOnClick = false,
		initialContentStage = 0,
		outside = false
	}: {
		variant?: Variant;
		closeDelay?: number;
		onValueChange?: (value: unknown, details: NavigationMenuChangeEventDetails) => void;
		nestedDefaultValue?: unknown;
		nestedItem1Value?: unknown;
		keepMountedContent?: boolean;
		nestedLinkCloseOnClick?: boolean;
		initialContentStage?: number;
		outside?: boolean;
	} = $props();

	// svelte-ignore state_referenced_locally
	let contentStage = $state(initialContentStage);
</script>

{#snippet topLevelPortal(positionerId?: string, popupId?: string)}
	<NavigationMenu.Portal>
		<NavigationMenu.Positioner data-testid={positionerId}>
			<NavigationMenu.Popup data-testid={popupId}>
				<NavigationMenu.Viewport />
			</NavigationMenu.Popup>
		</NavigationMenu.Positioner>
	</NavigationMenu.Portal>
{/snippet}

{#if variant === 'portal' || variant === 'portalCloseOnClick'}
	{@const closeOnClick = variant === 'portalCloseOnClick'}
	<NavigationMenu.Root {closeDelay} {onValueChange}>
		<NavigationMenu.List>
			<NavigationMenu.Item value="item-1">
				<NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
				<NavigationMenu.Content data-testid="popup-1">
					<NavigationMenu.Link href="#link-1" {closeOnClick}>Link 1</NavigationMenu.Link>
					<NavigationMenu.Root>
						<NavigationMenu.List>
							<NavigationMenu.Item value="nested-item-1">
								<NavigationMenu.Trigger data-testid="nested-trigger-1">
									Nested Item 1
								</NavigationMenu.Trigger>
								<NavigationMenu.Content data-testid="nested-popup-1">
									<NavigationMenu.Link
										href="#nested-link-1"
										{closeOnClick}
										data-testid="nested-link-1"
									>
										Nested Link 1
									</NavigationMenu.Link>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
						</NavigationMenu.List>
						<NavigationMenu.Portal>
							<NavigationMenu.Positioner side="right" data-testid="nested-positioner">
								<NavigationMenu.Popup>
									<NavigationMenu.Viewport />
								</NavigationMenu.Popup>
							</NavigationMenu.Positioner>
						</NavigationMenu.Portal>
					</NavigationMenu.Root>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			{#if !closeOnClick}
				<NavigationMenu.Item value="item-2">
					<NavigationMenu.Trigger data-testid="trigger-2">Item 2</NavigationMenu.Trigger>
					<NavigationMenu.Content data-testid="popup-2">
						<NavigationMenu.Link href="#link-3">Link 3</NavigationMenu.Link>
					</NavigationMenu.Content>
				</NavigationMenu.Item>
			{/if}
		</NavigationMenu.List>
		{@render topLevelPortal('top-level-positioner')}
	</NavigationMenu.Root>
{:else if variant === 'orientation'}
	<NavigationMenu.Root data-testid="top-level-root" value="item-1" orientation="vertical">
		<NavigationMenu.List data-testid="top-level-list">
			<NavigationMenu.Item value="item-1">
				<NavigationMenu.Trigger>Item 1</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<NavigationMenu.Root
						data-testid="nested-root"
						value="nested-item-1"
						orientation="vertical"
					>
						<NavigationMenu.List data-testid="nested-list">
							<NavigationMenu.Item value="nested-item-1">
								<NavigationMenu.Trigger>Nested Item 1</NavigationMenu.Trigger>
								<NavigationMenu.Content>
									<NavigationMenu.Link href="#nested-link-1">Nested Link 1</NavigationMenu.Link>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
						</NavigationMenu.List>
						<NavigationMenu.Viewport />
					</NavigationMenu.Root>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render topLevelPortal()}
	</NavigationMenu.Root>
{:else if variant === 'inline'}
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item value="item-1">
				<NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
				<NavigationMenu.Content data-testid="popup-1" keepMounted={keepMountedContent}>
					<NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
					<NavigationMenu.Root value={nestedDefaultValue}>
						<NavigationMenu.List data-testid="inline-nested-list">
							<NavigationMenu.Item value={nestedItem1Value}>
								<NavigationMenu.Trigger data-testid="nested-trigger-1">
									Nested Item 1
								</NavigationMenu.Trigger>
								<NavigationMenu.Content
									data-testid="nested-popup-1"
									keepMounted={keepMountedContent}
								>
									<NavigationMenu.Link href="#nested-link-1" closeOnClick={nestedLinkCloseOnClick}>
										Nested Link 1
									</NavigationMenu.Link>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
							<NavigationMenu.Item value="nested-item-2">
								<NavigationMenu.Trigger data-testid="nested-trigger-2">
									Nested Item 2
								</NavigationMenu.Trigger>
								<NavigationMenu.Content
									data-testid="nested-popup-2"
									keepMounted={keepMountedContent}
								>
									<NavigationMenu.Link href="#nested-link-2">Nested Link 2</NavigationMenu.Link>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
						</NavigationMenu.List>
						<NavigationMenu.Viewport data-testid="inline-nested-viewport" />
					</NavigationMenu.Root>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item value="item-2">
				<NavigationMenu.Trigger data-testid="trigger-2">Item 2</NavigationMenu.Trigger>
				<NavigationMenu.Content data-testid="popup-2" keepMounted={keepMountedContent}>
					<NavigationMenu.Link href="#link-3">Link 3</NavigationMenu.Link>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render topLevelPortal('positioner', 'popup-root')}
	</NavigationMenu.Root>
	{#if outside}
		<button type="button" data-testid="outside" style="position: fixed; right: 0; bottom: 0">
			Outside
		</button>
	{/if}
{:else if variant === 'dynamic'}
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item value="item-1">
				<NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
				<NavigationMenu.Content data-testid="popup-1">
					<NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
					<NavigationMenu.Root value="nested-item-1">
						<NavigationMenu.List>
							<NavigationMenu.Item value="nested-item-1">
								<NavigationMenu.Trigger data-testid="nested-trigger-1">
									Nested Item 1
								</NavigationMenu.Trigger>
								<NavigationMenu.Content data-testid="nested-popup-1">
									<button
										type="button"
										data-testid="insert-content"
										onclick={() => (contentStage = Math.min(contentStage + 1, 2))}
									>
										Insert content
									</button>
									{#if contentStage >= 1}
										<div data-testid="extra-content">
											<NavigationMenu.Link href="#nested-link-1">Nested Link 1</NavigationMenu.Link>
											<NavigationMenu.Link href="#nested-link-2">Nested Link 2</NavigationMenu.Link>
											<NavigationMenu.Link href="#nested-link-3">Nested Link 3</NavigationMenu.Link>
										</div>
									{/if}
									{#if contentStage >= 2}
										<div data-testid="extra-content-2">
											<NavigationMenu.Link href="#nested-link-4">Nested Link 4</NavigationMenu.Link>
											<NavigationMenu.Link href="#nested-link-5">Nested Link 5</NavigationMenu.Link>
										</div>
									{/if}
								</NavigationMenu.Content>
							</NavigationMenu.Item>
						</NavigationMenu.List>
						<NavigationMenu.Viewport />
					</NavigationMenu.Root>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render topLevelPortal('positioner', 'popup-root')}
	</NavigationMenu.Root>
{:else if variant === 'tabBoundary'}
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item value="item-1">
				<NavigationMenu.Trigger data-testid="trigger-1">Product</NavigationMenu.Trigger>
				<NavigationMenu.Content data-testid="popup-1">
					<NavigationMenu.Root value="nested-item-2">
						<NavigationMenu.List>
							<NavigationMenu.Item value="nested-item-1">
								<NavigationMenu.Trigger data-testid="nested-trigger-1">
									Engineering Leads
								</NavigationMenu.Trigger>
								<NavigationMenu.Content data-testid="nested-popup-1">
									<NavigationMenu.Link href="#releases">Releases</NavigationMenu.Link>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
							<NavigationMenu.Item value="nested-item-2">
								<NavigationMenu.Trigger data-testid="nested-trigger-2"
									>Startups</NavigationMenu.Trigger
								>
								<NavigationMenu.Content data-testid="nested-popup-2">
									<NavigationMenu.Link href="#quick-start">Quick start</NavigationMenu.Link>
									<NavigationMenu.Link href="#menu">Menu</NavigationMenu.Link>
									<NavigationMenu.Link href="#select" data-testid="nested-last-link">
										Select
									</NavigationMenu.Link>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
						</NavigationMenu.List>
						<NavigationMenu.Viewport />
					</NavigationMenu.Root>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item value="item-2">
				<NavigationMenu.Trigger data-testid="trigger-2">Learn</NavigationMenu.Trigger>
				<NavigationMenu.Content data-testid="popup-2">
					<NavigationMenu.Link href="#learn">Learn link</NavigationMenu.Link>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render topLevelPortal()}
	</NavigationMenu.Root>
{:else if variant === 'tabFlow'}
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item value="item-1">
				<NavigationMenu.Trigger data-testid="trigger-product">Product</NavigationMenu.Trigger>
				<NavigationMenu.Content data-testid="popup-product">
					<NavigationMenu.Root value="developers" orientation="vertical">
						<NavigationMenu.List>
							<NavigationMenu.Item value="developers">
								<NavigationMenu.Trigger data-testid="nested-trigger-developers">
									Developers
								</NavigationMenu.Trigger>
								<NavigationMenu.Content data-testid="nested-popup-developers">
									<NavigationMenu.Link href="#get-started" data-testid="nested-link-get-started">
										Get started
									</NavigationMenu.Link>
									<NavigationMenu.Link href="#composition" data-testid="nested-link-composition">
										Composition
									</NavigationMenu.Link>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
							<NavigationMenu.Item value="design-systems">
								<NavigationMenu.Trigger data-testid="nested-trigger-design-systems">
									Design Systems
								</NavigationMenu.Trigger>
								<NavigationMenu.Content data-testid="nested-popup-design-systems">
									<NavigationMenu.Link
										href="#styling"
										data-testid="nested-link-design-systems-styling"
									>
										Styling
									</NavigationMenu.Link>
									<NavigationMenu.Link href="#accessibility">Accessibility</NavigationMenu.Link>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
							<NavigationMenu.Item value="engineering-leads">
								<NavigationMenu.Trigger data-testid="nested-trigger-engineering-leads">
									Engineering Leads
								</NavigationMenu.Trigger>
								<NavigationMenu.Content>
									<NavigationMenu.Link href="#releases">Releases</NavigationMenu.Link>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
						</NavigationMenu.List>
						<NavigationMenu.Viewport />
					</NavigationMenu.Root>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item value="item-2">
				<NavigationMenu.Trigger data-testid="trigger-learn">Learn</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<NavigationMenu.Link href="#learn">Learn link</NavigationMenu.Link>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render topLevelPortal()}
	</NavigationMenu.Root>
{:else if variant === 'deep'}
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item value="item-1">
				<NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
				<NavigationMenu.Content data-testid="content-1">
					<NavigationMenu.Link href="#link-1" data-testid="link-1">Link 1</NavigationMenu.Link>
					<NavigationMenu.Root value="level2-item-1">
						<NavigationMenu.List>
							<NavigationMenu.Item value="level2-item-1">
								<NavigationMenu.Trigger data-testid="level2-trigger-1">
									Level 2 Item 1
								</NavigationMenu.Trigger>
								<NavigationMenu.Content data-testid="level2-content-1">
									<NavigationMenu.Link href="#level2-link-1" data-testid="level2-link-1">
										Level 2 Link 1
									</NavigationMenu.Link>
									<NavigationMenu.Root value="level3-item-1">
										<NavigationMenu.List>
											<NavigationMenu.Item value="level3-item-1">
												<NavigationMenu.Trigger data-testid="level3-trigger-1">
													Level 3 Item 1
												</NavigationMenu.Trigger>
												<NavigationMenu.Content data-testid="level3-content-1">
													<NavigationMenu.Link href="#level3-link-1"
														>Level 3 Link 1</NavigationMenu.Link
													>
												</NavigationMenu.Content>
											</NavigationMenu.Item>
											<NavigationMenu.Item value="level3-item-2">
												<NavigationMenu.Trigger data-testid="level3-trigger-2">
													Level 3 Item 2
												</NavigationMenu.Trigger>
												<NavigationMenu.Content data-testid="level3-content-2">
													<NavigationMenu.Link href="#level3-link-2"
														>Level 3 Link 2</NavigationMenu.Link
													>
												</NavigationMenu.Content>
											</NavigationMenu.Item>
										</NavigationMenu.List>
										<NavigationMenu.Viewport />
									</NavigationMenu.Root>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
							<NavigationMenu.Item value="level2-item-2">
								<NavigationMenu.Trigger data-testid="level2-trigger-2">
									Level 2 Item 2
								</NavigationMenu.Trigger>
								<NavigationMenu.Content data-testid="level2-content-2">
									<NavigationMenu.Link href="#level2-link-2">Level 2 Link 2</NavigationMenu.Link>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
						</NavigationMenu.List>
						<NavigationMenu.Viewport />
					</NavigationMenu.Root>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render topLevelPortal()}
	</NavigationMenu.Root>
{:else}
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item value="item-1">
				<NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
				<NavigationMenu.Content data-testid="content-1">
					<NavigationMenu.Root value="level2-item-1">
						<NavigationMenu.List>
							<NavigationMenu.Item value="level2-item-1">
								<NavigationMenu.Trigger data-testid="level2-trigger-1">
									Level 2 Item 1
								</NavigationMenu.Trigger>
								<NavigationMenu.Content data-testid="level2-content-1">
									<NavigationMenu.Root value="level3-item-1">
										<NavigationMenu.List>
											<NavigationMenu.Item value="level3-item-1">
												<NavigationMenu.Trigger data-testid="level3-trigger-1">
													Level 3 Item 1
												</NavigationMenu.Trigger>
												<NavigationMenu.Content data-testid="level3-content-1">
													<NavigationMenu.Link
														href="#level3-link-1"
														closeOnClick
														data-testid="level3-link-1"
													>
														Level 3 Link 1
													</NavigationMenu.Link>
												</NavigationMenu.Content>
											</NavigationMenu.Item>
										</NavigationMenu.List>
										<NavigationMenu.Viewport />
									</NavigationMenu.Root>
								</NavigationMenu.Content>
							</NavigationMenu.Item>
						</NavigationMenu.List>
						<NavigationMenu.Viewport />
					</NavigationMenu.Root>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
		</NavigationMenu.List>
		{@render topLevelPortal()}
	</NavigationMenu.Root>
{/if}
