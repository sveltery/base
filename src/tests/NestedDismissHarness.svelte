<script lang="ts">
	import { createControllableValue } from '#lib/internal/controllable-value.svelte.js';
	import {
		setFloatingTree,
		useDismiss,
		useFloatingNodeId
	} from '#lib/internal/floating-ui/index.js';
	import { PopupStore } from '#lib/internal/popups/index.js';
	import NestedDismissChild from './NestedDismissChild.svelte';

	setFloatingTree();

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
		floatingId: 'parent-popup',
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
</script>

<div data-testid="parent" data-open={store.open ? '' : undefined} {@attach bindFloating}>
	<button type="button">Parent</button>
	{#if store.mounted}
		<NestedDismissChild />
	{/if}
</div>
