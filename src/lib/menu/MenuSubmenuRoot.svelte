<!--
	Groups all parts of a submenu. Does not render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/menu/submenu-root/MenuSubmenuRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`close` and `unmount` are exports. Bind the root with `bind:this`.
-->
<script lang="ts">
	import { useMenuRoot } from './context.svelte.js';
	import { createMenuRoot } from './root.svelte.js';
	import type { MenuSubmenuRootProps } from './types.js';

	let {
		open = $bindable(),
		onOpenChange,
		onOpenChangeComplete,
		onItemHighlighted,
		loopFocus = true,
		highlightItemOnHover = true,
		orientation = 'vertical',
		disabled = false,
		closeParentOnEsc = false,
		children
	}: MenuSubmenuRootProps = $props();

	// Throws when the submenu is not inside a menu.
	useMenuRoot();
	const uid = $props.id();

	const store = createMenuRoot({
		isSubmenu: true,
		id: uid,
		readOpen: () => open,
		writeOpen: (next) => {
			open = next;
		},
		readTriggerId: () => null,
		writeTriggerId: () => {},
		onOpenChange: () => onOpenChange,
		onOpenChangeComplete: () => onOpenChangeComplete,
		onItemHighlighted: () => onItemHighlighted,
		readDisabled: () => disabled,
		readModal: () => undefined,
		readHighlightItemOnHover: () => highlightItemOnHover,
		readLoopFocus: () => loopFocus,
		readOrientation: () => orientation,
		readCloseParentOnEsc: () => closeParentOnEsc,
		readHandle: () => undefined
	});

	export function close() {
		store.closeImperative();
	}

	export function unmount() {
		store.forceUnmount();
	}
</script>

{@render children?.()}
