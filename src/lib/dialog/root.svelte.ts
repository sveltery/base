// Derived from Base UI v1.9.0 packages/react/src/dialog/root/useRenderDialogRoot.tsx
// and useDialogRoot.ts (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.
// Dialog.Root and AlertDialog.Root share this setup. AlertDialog.Root passes the alert
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

export interface DialogRootOptions extends Omit<DialogStoreOptions, 'nested'> {
	readTriggerId: () => string | null | undefined;
	readHandle: () => DialogHandle<unknown> | undefined;
}

export function createDialogRoot(options: DialogRootOptions): DialogStore<unknown> {
	const parent = findDialogRoot()?.store;
	setFloatingTree();

	const store = new DialogStore({ ...options, nested: parent != null });
	useFloatingNodeId(store);
	const click = new ClickInteraction(store).reference;
	store.click = click;
	setDialogRootContext({ store, click });

	new DismissInteraction(store, () => ({
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
		const id = options.readTriggerId();
		if (id == null) return;
		const node = store.triggers.getById(id);
		if (node && store.domReferenceElement !== node) store.domReferenceElement = node;
	});

	$effect(() => {
		const current = options.readHandle();
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

	return store;
}
