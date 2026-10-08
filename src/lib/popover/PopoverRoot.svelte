<!--
	Groups all parts of the popover. Does not render its own HTML element.
	Derived from Base UI v1.8.0 packages/react/src/popover/root/PopoverRoot.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	`close` and `unmount` are exports. Bind the root with `bind:this`.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
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
		defaultOpen = false,
		onOpenChange,
		onOpenChangeComplete,
		modal = false,
		triggerId = $bindable(undefined),
		defaultTriggerId = null,
		handle,
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
		getDefault: () => defaultTriggerId
	});

	let dismissReference: HTMLAttributes<HTMLElement> = {};
	let dismissFloating: HTMLAttributes<HTMLElement> = {};

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
		readDismissReference: () => dismissReference,
		readDismissFloating: () => dismissFloating
	});
	setPopoverRoot(store);

	const dismiss = useDismiss(store, () => ({
		outsidePressEvent: () => (store.modal === 'trap-focus' ? 'sloppy' : 'intentional')
	}));
	dismissReference = dismiss.reference as HTMLAttributes<HTMLElement>;
	dismissFloating = dismiss.floating as HTMLAttributes<HTMLElement>;

	$effect(() => {
		const current = handle;
		if (!current) return;
		return current.attachStore(store);
	});

	export function close() {
		store.closeImperative();
	}

	export function unmount() {
		store.forceUnmount();
	}
</script>

{@render children?.({ payload: store.payload })}
