<!--
	An individual navigation menu item.
	Renders a `<li>` element.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/item/NavigationMenuItem.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { setNavigationMenuItem } from './context.svelte.js';
	import type { NavigationMenuItemProps, NavigationMenuItemState } from './types.js';

	let { value, render, children, ...elementProps }: NavigationMenuItemProps = $props();

	const uid = $props.id();
	const itemValue = $derived(value ?? `base-ui-${uid}`);

	setNavigationMenuItem({
		get value() {
			return itemValue;
		}
	});

	const state: NavigationMenuItemState = {};
</script>

{#if render}
	{@render render(elementProps, state, children)}
{:else}
	<li {...elementProps}>{@render children?.()}</li>
{/if}
