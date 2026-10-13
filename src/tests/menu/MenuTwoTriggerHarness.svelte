<!--
	One menu with two triggers, contained in the root or detached through a handle, and up to
	two nested submenu levels.
	Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.detached-triggers.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu } from '#lib';

	let {
		mode,
		depth = 1,
		submenuOpenOnHover = true,
		onNestedClick
	}: {
		mode: 'contained' | 'detached';
		/** Submenu levels below the root menu. */
		depth?: 1 | 2;
		submenuOpenOnHover?: boolean;
		onNestedClick?: () => void;
	} = $props();

	const handle = Menu.createHandle();
</script>

{#snippet triggers(withHandle: boolean)}
	<Menu.Trigger handle={withHandle ? handle : undefined}>Trigger 1</Menu.Trigger>
	<Menu.Trigger handle={withHandle ? handle : undefined}>Trigger 2</Menu.Trigger>
{/snippet}

{#snippet content()}
	<Menu.Portal>
		<Menu.Positioner data-testid="level-1">
			<Menu.Popup>
				<Menu.Item>Item 1</Menu.Item>
				<Menu.SubmenuRoot>
					<Menu.SubmenuTrigger data-testid="submenu-trigger-1" openOnHover={submenuOpenOnHover}>
						Level 2
					</Menu.SubmenuTrigger>
					<Menu.Portal>
						<Menu.Positioner data-testid="level-2">
							<Menu.Popup>
								<Menu.Item data-testid="submenu-item" onclick={onNestedClick}>Item 2</Menu.Item>
								{#if depth === 2}
									<Menu.SubmenuRoot>
										<Menu.SubmenuTrigger data-testid="submenu-trigger-2"
											>Level 3</Menu.SubmenuTrigger
										>
										<Menu.Portal>
											<Menu.Positioner data-testid="level-3">
												<Menu.Popup>
													<Menu.Item>Deep Item</Menu.Item>
												</Menu.Popup>
											</Menu.Positioner>
										</Menu.Portal>
									</Menu.SubmenuRoot>
								{/if}
							</Menu.Popup>
						</Menu.Positioner>
					</Menu.Portal>
				</Menu.SubmenuRoot>
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
{/snippet}

{#if mode === 'contained'}
	<Menu.Root>
		{@render triggers(false)}
		{@render content()}
	</Menu.Root>
{:else}
	{@render triggers(true)}
	<Menu.Root {handle}>{@render content()}</Menu.Root>
{/if}
<button type="button" data-testid="outside">Outside</button>
