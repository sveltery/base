<!--
	Groups all parts of the dialog. Doesn't render its own HTML element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/root/DialogRoot.tsx,
	useRenderDialogRoot.tsx, and useDialogRoot.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts" generics="Payload = unknown">
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import type { ControllableValue } from '../internal/controllable-value.svelte.js';
	import { useClick, useDismiss } from '../internal/floating-ui/index.js';
	import { useScrollLock } from '../internal/popups/index.js';
	import { setDialogRootContext, useDialogRootContext } from './context.svelte.js';
	import { dialogOutsidePress, dialogOutsidePressEvent } from './outside-press.js';
	import { DialogStore } from './store.svelte.js';
	import type { DialogActions, DialogRootProps } from './types.js';

	let {
		open = $bindable(false),
		modal = true,
		onOpenChange,
		onOpenChangeComplete,
		disablePointerDismissal = false,
		actions = $bindable(),
		handle,
		triggerId = $bindable(null),
		children
	}: DialogRootProps<Payload> = $props();

	const parent = useDialogRootContext(true);
	const uid = $props.id();
	const floatingId = `base-ui-${uid}`;

	const openValue: ControllableValue<boolean> = {
		get value() {
			return open;
		},
		get controlled() {
			return false;
		},
		set(next) {
			open = next === true;
		}
	};

	const store = new DialogStore<Payload>({
		open: openValue,
		floatingId,
		nested: parent != null,
		onOpenChange: () => onOpenChange,
		onOpenChangeComplete: () => onOpenChangeComplete
	});
	setDialogRootContext(store as DialogStore<unknown>);

	store.readModal = () => modal;
	store.readDisablePointerDismissal = () => disablePointerDismissal;
	store.publishTriggerId = (id) => {
		triggerId = id;
	};

	const dismiss = useDismiss(store, () => ({
		escapeKey: store.nestedOpenDialogCount === 0,
		outsidePress: (event) => dialogOutsidePress(store, event),
		outsidePressEvent: () => dialogOutsidePressEvent(store)
	}));
	store.dismissOnKeyDown = dismiss.floating.onkeydown;
	store.clickReference = useClick(store).reference;

	useScrollLock(() => ({
		enabled: store.open && store.modal === true,
		referenceElement: store.popupElement
	}));

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
		const drawers = openNow ? store.nestedOpenDrawerCount : 0;
		notify(dialogs, drawers);
		return () => {
			if (openNow) notify(0, 0);
		};
	});

	const actionsHandle: DialogActions = {
		unmount: () => store.forceUnmount(),
		close: () => store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction))
	};
	actions = actionsHandle;
</script>

{@render children?.({ payload: store.payload })}
