<!--
	A container for grouping a set of controls. Renders a `<div>`.
	Derived from Base UI v1.8.0 packages/react/src/toolbar/root/ToolbarRoot.tsx
	and the linear composite keyboard path it mounts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import GroupFrame from '../internal/GroupFrame.svelte';
	import { CompositeRoot } from '../internal/composite-root.svelte.js';
	import { isSkipped } from '../internal/composite-skip.js';
	import { useDirection } from '../internal/direction-context.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { setToolbarRootContext, ToolbarRootContext } from './context.svelte.js';
	import type { ToolbarRootProps, ToolbarRootState } from './types.js';

	let {
		disabled = false,
		orientation = 'horizontal',
		loopFocus = true,
		onkeydown,
		render,
		children,
		...elementProps
	}: ToolbarRootProps = $props();

	const reading = useDirection();
	const roving = new CompositeRoot({
		orientation: () => orientation,
		loopFocus: () => loopFocus,
		direction: () => reading.direction,
		isItemDisabled: (element) => isSkipped(element),
		keys: 'arrows',
		stopPropagation: true,
		replacement: 'index',
		keydown: 'root'
	});
	const root = new ToolbarRootContext(
		() => disabled,
		() => orientation,
		roving
	);
	setToolbarRootContext(root);

	const state: ToolbarRootState = $derived({ disabled, orientation });

	function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		// A child preventDefault (a disabled button swallowing keys) must not cancel
		// arrow navigation. CompositeRoot ignores defaultPrevented. The toolbar's own
		// onkeydown still skips navigation when it calls preventDefault().
		const childPrevented = event.defaultPrevented;
		onkeydown?.(event);
		if (event.defaultPrevented && !childPrevented) return;
		root.roving.keydown(event);
	}

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		role: 'toolbar',
		'aria-orientation': orientation,
		...getStateAttributesProps(state),
		...elementProps,
		onkeydown: handleKeyDown
	});
</script>

<GroupFrame {hostProps} {state} {render} {children} />
