<!--
	Groups all parts of the navigation menu.
	Renders a `<nav>` element at the root, or `<div>` element when nested.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/root/NavigationMenuRoot.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`close` and `unmount` are exports. Bind the root with `bind:this`.
-->
<script lang="ts" generics="Value = unknown">
	import { createAttachmentKey } from 'svelte/attachments';
	import {
		setFloatingTree,
		useFloatingNodeId,
		useFloatingParentNodeId,
		useFloatingTree
	} from '@sveltery/floating-ui-svelte';
	import { mergeProps } from '../internal/mergeProps.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { CLOSE_DELAY, OPEN_DELAY } from './constants.js';
	import { findNavigationMenuRoot, setNavigationMenuRoot } from './context.svelte.js';
	import { NavigationMenuRootStore } from './root-store.svelte.js';
	import type {
		NavigationMenuChangeEventDetails,
		NavigationMenuRootProps,
		NavigationMenuRootState
	} from './types.js';

	let {
		value = $bindable(),
		defaultValue = null,
		onValueChange,
		onOpenChangeComplete,
		delay = OPEN_DELAY,
		closeDelay = CLOSE_DELAY,
		orientation = 'horizontal',
		render,
		children,
		...elementProps
	}: NavigationMenuRootProps<Value> = $props();
	// svelte-ignore state_referenced_locally
	if (value === undefined) value = defaultValue;

	const uid = $props.id();
	const nested = useFloatingParentNodeId() != null;
	const parent = findNavigationMenuRoot();
	if (!nested) setFloatingTree();
	const tree = useFloatingTree();

	const root = new NavigationMenuRootStore({
		readValue: () => value,
		writeValue: (next) => {
			value = next as Value | null;
		},
		onValueChange: () =>
			onValueChange as
				((value: unknown, details: NavigationMenuChangeEventDetails) => void) | undefined,
		onOpenChangeComplete: () => onOpenChangeComplete,
		delay: () => delay,
		closeDelay: () => closeDelay,
		orientation: () => orientation,
		nested,
		parent,
		floatingId: `base-ui-${uid}`
	});
	root.nodeId = useFloatingNodeId(root.floating);
	setNavigationMenuRoot(root);

	// The tree node carries the active trigger's store once a positioner places the popup,
	// like upstream's `useFloating`. Dismiss and hover read it to find open child menus.
	$effect(() => {
		const node = tree?.nodes.find((record) => record.id === root.nodeId);
		if (!node) return;
		node.context = root.positionerElement && root.activeTrigger ? root.activeTrigger : undefined;
	});

	export function close() {
		root.close();
	}

	export function unmount() {
		root.forceUnmount();
	}

	const bindKey = createAttachmentKey();
	function bindRoot(node: HTMLElement) {
		root.rootElement = node;
		return () => {
			if (root.rootElement === node) root.rootElement = null;
		};
	}

	const state: NavigationMenuRootState = $derived({ open: root.open, nested });
	const hostProps = $derived(
		mergeProps({ ...getStateAttributesProps(state), [bindKey]: bindRoot }, elementProps)
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else if nested}
	<div {...hostProps}>{@render children?.()}</div>
{:else}
	<nav {...hostProps}>{@render children?.()}</nav>
{/if}
