<!--
	Groups all parts of the alert dialog.
	Doesn't render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/alert-dialog/root/AlertDialogRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts" generics="Payload = unknown">
	import { createChangeEventDetails, REASONS } from '@sveltery/utils';
	import { createDialogRoot } from '../dialog/root.svelte.js';
	import type { AlertDialogRootProps } from './types.js';

	let {
		open = $bindable(),
		defaultOpen,
		onOpenChange,
		onOpenChangeComplete,
		handle,
		triggerId = $bindable(),
		defaultTriggerId,
		children
	}: AlertDialogRootProps<Payload> = $props();
	// svelte-ignore state_referenced_locally
	if (open === undefined && defaultOpen !== undefined) open = defaultOpen;
	// svelte-ignore state_referenced_locally
	if (triggerId === undefined && defaultTriggerId !== undefined) triggerId = defaultTriggerId;

	const uid = $props.id();
	const store = createDialogRoot({
		role: 'alertdialog',
		floatingId: `base-ui-${uid}`,
		readOpen: () => open,
		writeOpen: (next) => {
			open = next;
		},
		onOpenChange: () => onOpenChange,
		onOpenChangeComplete: () => onOpenChangeComplete,
		readModal: () => true,
		readDisablePointerDismissal: () => true,
		readTriggerId: () => triggerId,
		writeTriggerId: (id) => {
			triggerId = id;
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
