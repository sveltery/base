<!--
	A component that creates a context menu activated by right clicking or long pressing.
	Does not render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/context-menu/root/ContextMenuRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`close` and `unmount` are exports. Bind the root with `bind:this`.
-->
<script lang="ts">
	import { setMenuRoot, type MenuRootContext } from '../menu/context.svelte.js';
	import MenuRoot from '../menu/MenuRoot.svelte';
	import { setContextMenuParent } from '../menu/parent.svelte.js';
	import { ContextMenuRootContext, setContextMenuRoot } from './context.svelte.js';
	import type { ContextMenuRootProps } from './types.js';

	let {
		open = $bindable(),
		onOpenChange,
		onOpenChangeComplete,
		onItemHighlighted,
		loopFocus = true,
		highlightItemOnHover = true,
		orientation = 'vertical',
		disabled = false,
		children
	}: ContextMenuRootProps = $props();

	const uid = $props.id();
	const context = new ContextMenuRootContext(`base-ui-${uid}`);
	setContextMenuRoot(context);
	setContextMenuParent(context);
	// Upstream renders `<MenuRootContext.Provider value={undefined}>`: a context menu inside another
	// menu's popup is its own root, not a submenu of that menu.
	setMenuRoot(undefined as unknown as MenuRootContext);

	let root: MenuRoot<unknown> | undefined = $state();

	export function close() {
		root?.close();
	}

	export function unmount() {
		root?.unmount();
	}
</script>

<MenuRoot
	bind:this={root}
	bind:open
	{onOpenChange}
	{onOpenChangeComplete}
	{onItemHighlighted}
	{loopFocus}
	{highlightItemOnHover}
	{orientation}
	{disabled}
>
	{@render children?.()}
</MenuRoot>
