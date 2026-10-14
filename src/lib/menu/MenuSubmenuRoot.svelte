<!--
	Groups all parts of a submenu. Does not render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/menu/submenu-root/MenuSubmenuRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Derived also from packages/react/src/menu/filter-submenu-root/MenuFilterSubmenuRoot.tsx, which
	this root becomes inside `Menu.FilterProvider`.
	`close` and `unmount` are exports. Bind the root with `bind:this`.
-->
<script lang="ts">
	import { useDirection } from '../internal/direction-context.js';
	import { useMenuRoot } from './context.svelte.js';
	import { takeMenuFilterProvider } from './filter-root.svelte.js';
	import { MenuFilterSubmenu } from './filter-submenu-root.svelte.js';
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
		children,
		...unsupported
	}: MenuSubmenuRootProps = $props();

	// Throws when the submenu is not inside a menu.
	const parent = useMenuRoot();
	const uid = $props.id();
	const filter = takeMenuFilterProvider();
	const direction = useDirection();
	const navigation = filter
		? new MenuFilterSubmenu(parent, () => direction.direction === 'rtl')
		: null;

	const store = createMenuRoot({
		isSubmenu: true,
		id: uid,
		readOpen: () => open,
		writeOpen: (next) => {
			open = next;
		},
		readTriggerId: () => null,
		writeTriggerId: () => {},
		onOpenChange: () =>
			navigation
				? (next, details) => navigation.handleOpenChange(next, details, onOpenChange)
				: onOpenChange,
		onOpenChangeComplete: () => onOpenChangeComplete,
		onItemHighlighted: () => onItemHighlighted,
		// A filterable submenu follows its parent's disabled state.
		readDisabled: () => disabled || (navigation != null && parent.store.disabled),
		// Only read to warn: a submenu is never modal.
		readModal: () => (unsupported as { modal?: boolean }).modal,
		readHighlightItemOnHover: () => highlightItemOnHover,
		readLoopFocus: () => loopFocus,
		readOrientation: () => orientation,
		readCloseParentOnEsc: () => closeParentOnEsc,
		readHandle: () => undefined,
		filter
	});
	navigation?.attach(store, () => orientation);

	export function close() {
		store.closeImperative();
	}

	export function unmount() {
		store.forceUnmount();
	}
</script>

{@render children?.()}
