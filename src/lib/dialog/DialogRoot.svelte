<!--
	Groups all parts of the dialog. Doesn't render its own HTML element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/root/DialogRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	The shared setup is `createDialogRoot` in root.svelte.ts.
-->
<script lang="ts">
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
	import { createDialogRoot } from './root.svelte.js';
	import type { DialogRootProps } from './types.js';

	let {
		open = $bindable(),
		modal = true,
		onOpenChange,
		onOpenChangeComplete,
		disablePointerDismissal = false,
		handle,
		triggerId = $bindable(),
		children
	}: DialogRootProps = $props();

	const uid = $props.id();
	const store = createDialogRoot({
		role: 'dialog',
		floatingId: `base-ui-${uid}`,
		readOpen: () => open,
		writeOpen: (next) => {
			open = next;
		},
		onOpenChange: () => onOpenChange,
		onOpenChangeComplete: () => onOpenChangeComplete,
		readModal: () => modal,
		readDisablePointerDismissal: () => disablePointerDismissal,
		readTriggerId: () => triggerId,
		publishTriggerId: (id) => {
			if ((triggerId ?? null) !== id) triggerId = id;
		},
		readHandle: () => handle
	});

	export function close() {
		store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}

	export function unmount() {
		store.forceUnmount();
	}
</script>

{@render children?.({ payload: store.payload })}
