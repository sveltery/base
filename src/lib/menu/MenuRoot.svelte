<!--
	Groups all parts of the menu. Does not render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/menu/root/MenuRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`close` and `unmount` are exports. Bind the root with `bind:this`.
-->
<script lang="ts" generics="Payload = unknown">
	import { takeMenuFilterProvider } from './filter-root.svelte.js';
	import { createMenuRoot } from './root.svelte.js';
	import type { MenuRootProps } from './types.js';

	let {
		open = $bindable(),
		onOpenChange,
		onOpenChangeComplete,
		onItemHighlighted,
		loopFocus = true,
		highlightItemOnHover = true,
		modal,
		orientation = 'vertical',
		disabled = false,
		closeParentOnEsc = false,
		triggerId = $bindable(),
		handle,
		children
	}: MenuRootProps<Payload> = $props();

	const uid = $props.id();

	const store = createMenuRoot({
		isSubmenu: false,
		id: uid,
		readOpen: () => open,
		writeOpen: (next) => {
			open = next;
		},
		readTriggerId: () => triggerId ?? null,
		writeTriggerId: (id) => {
			triggerId = id;
		},
		onOpenChange: () => onOpenChange,
		onOpenChangeComplete: () => onOpenChangeComplete,
		onItemHighlighted: () => onItemHighlighted,
		readDisabled: () => disabled,
		readModal: () => modal,
		readHighlightItemOnHover: () => highlightItemOnHover,
		readLoopFocus: () => loopFocus,
		readOrientation: () => orientation,
		readCloseParentOnEsc: () => closeParentOnEsc,
		readHandle: () => handle as never,
		filter: takeMenuFilterProvider()
	});

	export function close() {
		store.closeImperative();
	}

	export function unmount() {
		store.forceUnmount();
	}
</script>

{@render children?.({ payload: store.payload as Payload | undefined })}
