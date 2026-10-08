<!--
	Groups all parts of the popover. Does not render its own HTML element.
	Derived from Base UI v1.8.0 packages/react/src/popover/root/PopoverRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import {
		setFloatingTree,
		useDismiss,
		useFloatingParentNodeId
	} from '../internal/floating-ui/index.js';
	import { setPopoverRoot } from './context.svelte.js';
	import { PopoverStore } from './store.svelte.js';
	import type { PopoverRootProps } from './types.js';

	let {
		open = $bindable(undefined),
		onOpenChange,
		onOpenChangeComplete,
		modal = false,
		triggerId = $bindable(null),
		handle,
		actions,
		children
	}: PopoverRootProps = $props();

	const uid = $props.id();
	const nested = useFloatingParentNodeId() != null;
	setFloatingTree();

	const openValue = createControllableValue<boolean>({
		getProp: () => open,
		setProp: (next) => {
			open = next;
		},
		getDefault: () => false
	});

	const store = new PopoverStore({
		open: openValue,
		floatingId: `base-ui-${uid}`,
		nested,
		readModal: () => modal,
		readTriggerId: () => triggerId,
		onOpenChange: () => onOpenChange as PopoverRootProps['onOpenChange'],
		onOpenChangeComplete: () => onOpenChangeComplete
	});
	setPopoverRoot(store);

	const dismiss = useDismiss(store, () => ({
		outsidePressEvent: () => (store.modal === 'trap-focus' ? 'sloppy' : 'intentional')
	}));
	store.dismissReference = dismiss.reference;
	store.dismissFloating = dismiss.floating;

	$effect(() => {
		const detach = handle?.attach(store);
		return () => detach?.();
	});

	$effect(() => {
		if (!actions) return;
		actions.unmount = () => store.forceUnmount();
		actions.close = () => store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	});
</script>

{@render children?.({ payload: store.payload })}
