<!--
	Groups and group labels, for their roles and label links.
	Derived from Base UI v1.9.0 packages/react/src/menu/group/MenuGroup.test.tsx and group-label/MenuGroupLabel.test.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { Menu } from '#lib';

	let {
		labels = 'old',
		radio = false,
		labelProps = {}
	}: {
		labels?: 'old' | 'both' | 'new' | 'one';
		radio?: boolean;
		labelProps?: Record<string, unknown>;
	} = $props();
</script>

{#snippet content()}
	{#if labels === 'one'}
		<Menu.GroupLabel {...labelProps}>Test group</Menu.GroupLabel>
	{:else}
		{#if labels !== 'new'}<Menu.GroupLabel id="old-label">Old</Menu.GroupLabel>{/if}
		{#if labels !== 'old'}<Menu.GroupLabel id="new-label">New</Menu.GroupLabel>{/if}
	{/if}
{/snippet}

<Menu.Root open>
	<Menu.Portal>
		<Menu.Positioner>
			<Menu.Popup>
				{#if radio}
					<Menu.RadioGroup>{@render content()}</Menu.RadioGroup>
				{:else}
					<Menu.Group>{@render content()}</Menu.Group>
				{/if}
			</Menu.Popup>
		</Menu.Positioner>
	</Menu.Portal>
</Menu.Root>
