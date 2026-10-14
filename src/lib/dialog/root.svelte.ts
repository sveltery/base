// Derived from Base UI v1.9.0 packages/react/src/dialog/root/useRenderDialogRoot.tsx
// and useDialogRoot.ts (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
// Dialog.Root, AlertDialog.Root, and Drawer.Root share this setup. AlertDialog.Root passes the alert
// dialog role, `modal: true`, and disabled pointer dismissal.
// Call it during component init: it sets context and registers effects.

import { contains, getTarget } from '@sveltery/utils';
import {
	setFloatingTree,
	ClickInteraction,
	DismissInteraction,
	useFloatingNodeId
} from '@sveltery/floating-ui-svelte';
import { useScrollLock } from '../internal/popups/index.js';
import { findDialogRoot, setDialogRootContext } from './context.svelte.js';
import type { DialogHandle } from './handle.svelte.js';
import { DialogStore, type DialogStoreOptions } from './store.svelte.js';

export interface DialogRootOptions<Payload> extends Omit<DialogStoreOptions, 'nested'> {
	readHandle: () => DialogHandle<Payload> | undefined;
}

export function createDialogRoot<Payload>(
	options: DialogRootOptions<Payload>
): DialogStore<Payload> {
	const parent = findDialogRoot()?.store;
	setFloatingTree();

	const store = new DialogStore<Payload>({ ...options, nested: parent != null });
	useFloatingNodeId(store);
	const click = new ClickInteraction(store).reference;
	store.click = click;
	setDialogRootContext({ store, click });

	new DismissInteraction(store, () => ({
		escapeKey: store.nestedOpenDialogCount === 0,
		outsidePress(event) {
			if (!store.outsidePressEnabled) return false;
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
		const id = store.boundTriggerId.read();
		if (id == null) return;
		const node = store.triggers.getById(id);
		if (node && store.domReferenceElement !== node) store.domReferenceElement = node;
	});

	// Upstream useImplicitActiveTrigger: a dialog opened without naming a trigger, such as through
	// `bind:open`, claims its only trigger. The trigger stays active until the dialog unmounts.
	$effect(() => {
		if (!store.open || store.openedWithoutTrigger || store.domReferenceElement) return;
		if (store.triggers.size !== 1) return;
		const [only] = store.triggers.elements();
		store.domReferenceElement = only;
	});

	$effect(() => {
		const current = options.readHandle();
		if (!current) return;
		return current.attach(store);
	});

	$effect(() => {
		if (!store.open && !store.mounted) {
			store.nestedOpenDialogCount = 0;
			store.nestedOpenDrawerCount = 0;
		}
	});

	// Only an open root reports to its parent. A closed sibling must not reset the count.
	$effect(() => {
		if (!parent || !store.open) return;
		parent.onNestedDialogOpen(
			store.nestedOpenDialogCount + 1,
			store.nestedOpenDrawerCount + (store.drawer ? 1 : 0)
		);
		return () => parent.onNestedDialogOpen(0, 0);
	});

	return store;
}
