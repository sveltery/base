import { createControllableValue } from '#lib/internal/controllable-value.svelte.js';
import { useDismiss, useFloatingNodeId } from '#lib/internal/floating-ui/index.js';
import { PopupStore } from '#lib/internal/popups/index.js';

export function createDismissPopup(floatingId: string) {
	let open = $state<boolean | undefined>(undefined);
	const openValue = createControllableValue<boolean>({
		getProp: () => open,
		setProp: (next) => {
			open = next;
		},
		getDefault: () => true
	});
	const store = new PopupStore<string>({
		open: openValue,
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
