<!--
	Groups all parts of the dialog. Doesn't render its own HTML element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/root/DialogRoot.tsx,
	useRenderDialogRoot.tsx, and useDialogRoot.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Open and triggerId use the shared controllable-value helper.
-->
<script lang="ts">
	import {
		createChangeEventDetails,
		REASONS,
		type BaseUIChangeEventDetails
	} from '../internal/event-details.js';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import {
		setFloatingTree,
		useClick,
		useDismiss,
		useFloatingNodeId
	} from '../internal/floating-ui/index.js';
	import { useScrollLock } from '../internal/popups/index.js';
	import { setDialogRootContext, useDialogRootContext } from './context.svelte.js';
	import { installDialogOutsidePress } from './outside-press.js';
	import { DialogStore } from './store.svelte.js';
	import type { DialogChangeEventReason, DialogRootProps } from './types.js';

	let {
		open = $bindable(undefined),
		defaultOpen = false,
		modal = true,
		onOpenChange,
		onOpenChangeComplete,
		disablePointerDismissal = false,
		handle,
		triggerId = $bindable(undefined),
		defaultTriggerId = null,
		children
	}: DialogRootProps = $props();

	const parent = useDialogRootContext(true);
	setFloatingTree();
	const uid = $props.id();
	const floatingId = `base-ui-${uid}`;

	const openValue = createControllableValue<boolean>({
		getProp: () => open,
		setProp: (next) => {
			open = next;
		},
		getDefault: () => defaultOpen
	});
	const triggerValue = createControllableValue<
		string | null,
		BaseUIChangeEventDetails<DialogChangeEventReason>
	>({
		getProp: () => triggerId,
		setProp: (next) => {
			triggerId = next ?? null;
		},
		getDefault: () => defaultTriggerId
	});

	const store = new DialogStore({
		open: openValue,
		floatingId,
		nested: parent != null,
		onOpenChange: () => onOpenChange,
		onOpenChangeComplete: () => onOpenChangeComplete,
		readModal: () => modal,
		readDisablePointerDismissal: () => disablePointerDismissal,
		publishTriggerId: (id, details) => {
			triggerValue.set(id, details);
		}
	});
	useFloatingNodeId(store);
	const click = useClick(store).reference;
	store.click = click;
	setDialogRootContext({ store: store as DialogStore<unknown>, click });

	useDismiss(store, () => ({
		escapeKey: store.nestedOpenDialogCount === 0,
		outsidePress: false
	}));

	useScrollLock(() => ({
		enabled: store.open && store.modal === true,
		referenceElement: store.popupElement
	}));

	$effect(() => installDialogOutsidePress(store));

	$effect(() => {
		const id = triggerValue.value;
		if (id == null || store.triggerCount === 0) return;
		const node = store.triggers.getById(id);
		if (node && store.domReferenceElement !== node) store.domReferenceElement = node;
	});

	$effect(() => {
		const current = handle;
		if (!current) return;
		return current.attach(store);
	});

	$effect(() => {
		const notify = parent?.onNestedDialogOpen.bind(parent);
		if (!notify) return;
		const openNow = store.open;
		const dialogs = openNow ? store.nestedOpenDialogCount + 1 : 0;
		notify(dialogs);
		return () => {
			if (openNow) notify(0);
		};
	});

	export function close() {
		store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}

	export function unmount() {
		store.forceUnmount();
	}
</script>

{@render children?.({ payload: store.payload })}
