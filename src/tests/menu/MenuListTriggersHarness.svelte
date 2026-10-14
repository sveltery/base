<!--
	A menu whose items sit in `Menu.List`, opened by two detached triggers. With `filter`, it is
	filterable.
	Derived from Base UI v1.9.0 packages/react/src/menu/list/MenuList.test.tsx and
	packages/react/src/menu/filter-root/MenuFilterRoot.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu, type MenuRootProps } from '#lib';

	let {
		filter = false,
		onItemHighlighted
	}: { filter?: boolean; onItemHighlighted?: MenuRootProps['onItemHighlighted'] } = $props();

	const handle = Menu.createHandle();
</script>

{#snippet menu()}
	<Menu.Root {handle} {onItemHighlighted}>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					{#if filter}<Menu.Input aria-label="Filter actions" />{/if}
					<Menu.List data-testid="list">
						<Menu.Item>Rename</Menu.Item>
						{#if filter}<Menu.Item>Delete</Menu.Item>{/if}
					</Menu.List>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
{/snippet}

<Menu.Trigger {handle}>First</Menu.Trigger>
<Menu.Trigger {handle}>Second</Menu.Trigger>
{#if filter}
	<Menu.FilterProvider>{@render menu()}</Menu.FilterProvider>
{:else}
	{@render menu()}
{/if}
