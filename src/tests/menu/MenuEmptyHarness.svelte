<!--
	An open filterable menu whose Empty message can end with an empty text node.
	Derived from Base UI v1.9.0 packages/react/src/internals/useInitialLiveRegionTextMutation.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu } from '#lib';

	/** Text rendered in its own node after the message. An empty string leaves an empty node. */
	let { trailing }: { trailing?: string } = $props();
</script>

<Menu.FilterProvider>
	<Menu.Root open>
		<Menu.Trigger>Actions</Menu.Trigger>
		<Menu.Portal>
			<Menu.Positioner>
				<Menu.Popup>
					<Menu.Input aria-label="Filter actions" />
					<Menu.List><Menu.Item>Rename</Menu.Item></Menu.List>
					<Menu.Empty data-testid="status"
						>No matches{#if trailing !== undefined}<span>{trailing}</span>{/if}</Menu.Empty
					>
				</Menu.Popup>
			</Menu.Positioner>
		</Menu.Portal>
	</Menu.Root>
</Menu.FilterProvider>
