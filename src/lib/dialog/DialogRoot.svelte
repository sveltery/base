<!--
	Groups all parts of the dialog. Doesn't render its own HTML element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/root/DialogRoot.tsx,
	useRenderDialogRoot.tsx, and useDialogRoot.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createChangeEventDetails, REASONS, contains, getTarget } from '@sveltery/utils';
	import {
		setFloatingTree,
		useClick,
		useDismiss,
		useFloatingNodeId
	} from '@sveltery/floating-ui-svelte';
	import { useScrollLock } from '../internal/popups/index.js';
	import { setDialogRootContext, useDialogRootContext } from './context.svelte.js';
	import { DialogStore } from './store.svelte.js';
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

	const parent = useDialogRootContext(true);
	setFloatingTree();
	const uid = $props.id();
	const floatingId = `base-ui-${uid}`;

	const store = new DialogStore({
		readOpen: () => open,
		writeOpen: (next) => {
			open = next;
		},
		floatingId,
		nested: parent != null,
		onOpenChange: () => onOpenChange,
		onOpenChangeComplete: () => onOpenChangeComplete,
		readModal: () => modal,
		readDisablePointerDismissal: () => disablePointerDismissal,
		publishTriggerId: (id) => {
			if ((triggerId ?? null) !== id) triggerId = id;
		}
	});
	useFloatingNodeId(store);
	const click = useClick(store).reference;
	store.click = click;
	setDialogRootContext({ store: store as DialogStore<unknown>, click });

	useDismiss(store, () => ({
		escapeKey: store.nestedOpenDialogCount === 0,
		outsidePress(event) {
			if ('button' in event && event.button !== 0) return false;
			if ('touches' in event) {
				const touch = event as unknown as TouchEvent;
				if (touch.type === 'touchend') {
					if (touch.changedTouches.length !== 1 || touch.touches.length !== 0) return false;
				} else if (touch.touches.length !== 1) return false;
			}
			if (store.nestedOpenDialogCount !== 0 || store.disablePointerDismissal) return false;
			const target = getTarget(event);
			if (!(target instanceof Element)) return false;
			if (contains(store.popupElement, target)) return false;
			if (store.modal) {
				const internalBackdrop = store.internalBackdropElement;
				const backdrop = store.backdropElement;
				if (internalBackdrop || backdrop) {
					return (
						target === internalBackdrop ||
						target === backdrop ||
						(contains(target, store.popupElement) && !target.hasAttribute('data-base-ui-portal'))
					);
				}
			}
			return true;
		},
		outsidePressEvent() {
			if (store.internalBackdropElement || store.backdropElement) return 'intentional';
			return {
				mouse: store.modal === 'trap-focus' ? 'sloppy' : 'intentional',
				touch: 'sloppy' as const
			};
		}
	}));

	useScrollLock(() => ({
		enabled: store.open && store.modal === true,
		referenceElement: store.popupElement
	}));

	$effect(() => {
		const id = triggerId;
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
