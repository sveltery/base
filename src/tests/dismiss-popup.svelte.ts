import { useDismiss, useFloatingNodeId } from '@sveltery/floating-ui-svelte';
import { PopupStore } from '#lib/internal/popups/index.js';

export function createDismissPopup(floatingId: string) {
	let open = $state<boolean | undefined>(undefined);
	const store = new PopupStore<string>({
		readOpen: () => open ?? true,
		writeOpen: (next) => {
			open = next;
		},
		floatingId,
		floatingElement: 'popup',
		onOpenChange: () => () => {},
		onOpenChangeComplete: () => () => {}
	});
	useFloatingNodeId(store);
	useDismiss(store, () => ({
		escapeKey: true,
		outsidePress: false,
		bubbles: { escapeKey: false, outsidePress: false }
	}));

	function bindFloating(node: HTMLElement) {
		store.floatingElement = node;
		store.popupElement = node;
	}

	return { store, bindFloating };
}
