<!--
	Groups all parts of the popover. Does not render its own HTML element.
	Derived from Base UI v1.8.0 packages/react/src/popover/root/PopoverRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import {
		setFloatingTree,
		useDismiss,
		useFloatingParentNodeId
	} from '../internal/floating-ui/index.js';
	import { setPopoverRoot } from './context.svelte.js';
	import { PopoverStore, type PopoverHooks } from './store.svelte.js';
	import type { PopoverRootProps } from './types.js';

	let {
		open = $bindable(undefined),
		defaultOpen = false,
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
		getDefault: () => defaultOpen
	});

	const triggerValue = createControllableValue<string | null>({
		getProp: () => triggerId,
		setProp: (next) => {
			triggerId = next ?? null;
		},
		getDefault: () => null
	});

	const hooks: PopoverHooks = {
		dismissReference: {},
		dismissFloating: {},
		closeCount: () => 0,
		placement: () => 'bottom',
		triggerSwitch: null
	};

	const store = new PopoverStore({
		open: openValue,
		floatingId: `base-ui-${uid}`,
		nested,
		readModal: () => modal,
		readTriggerId: () => triggerValue.value ?? null,
		writeTriggerId: (id, details) => {
			triggerValue.set(id, details);
		},
		onOpenChange: () => onOpenChange as PopoverRootProps['onOpenChange'],
		onOpenChangeComplete: () => onOpenChangeComplete,
		hooks
	});
	setPopoverRoot(store);

	const dismiss = useDismiss(store, () => ({
		outsidePressEvent: () => (store.modal === 'trap-focus' ? 'sloppy' : 'intentional')
	}));
	hooks.dismissReference = dismiss.reference as HTMLAttributes<HTMLElement>;
	hooks.dismissFloating = dismiss.floating as HTMLAttributes<HTMLElement>;

	if (handle) {
		const detach = handle.attachStore(store);
		onDestroy(detach);
	}

	if (actions) {
		actions.unmount = () => store.forceUnmount();
		actions.close = () => store.closeImperative();
	}
</script>

{@render children?.({ payload: store.payload })}
