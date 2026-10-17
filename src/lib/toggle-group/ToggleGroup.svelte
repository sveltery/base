<!--
	Provides a shared state to a series of toggle buttons.
	Derived from Base UI v1.8.0 packages/react/src/toggle-group/ToggleGroup.tsx
	and the linear composite keyboard path it mounts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). Joining a Toolbar's roving focus follows
	v1.9.0 (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { CompositeRoot } from '../internal/composite-root.svelte.js';
	import { useDirection } from '../internal/direction-context.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { findToolbarRootContext, useToolbarGroupContext } from '../toolbar/context.svelte.js';
	import { ToggleGroupContext, setToggleGroupContext } from './context.svelte.js';
	import type { ToggleGroupProps, ToggleGroupState } from './types.js';

	let {
		value = $bindable(),
		defaultValue,
		disabled: disabledProp,
		loopFocus = true,
		onValueChange,
		orientation = 'horizontal',
		multiple = false,
		render,
		children,
		...elementProps
	}: ToggleGroupProps = $props();
	// svelte-ignore state_referenced_locally
	if (value === undefined && defaultValue !== undefined) value = defaultValue;
	const toolbar = findToolbarRootContext();
	const toolbarGroup = useToolbarGroupContext();
	const disabled = $derived(
		(toolbar?.disabled ?? false) || (toolbarGroup?.disabled ?? false) || (disabledProp ?? false)
	);

	// Captured once. Assigning `value` later must not look like the parent passed it.
	const valueProvided = untrack(() => value !== undefined);
	const EMPTY: readonly string[] = [];

	const reading = useDirection();
	// Inside a Toolbar the toolbar owns roving focus, and the toggles are its items.
	const roving =
		toolbar?.roving ??
		new CompositeRoot({
			orientation: () => orientation,
			loopFocus: () => loopFocus,
			direction: () => reading.direction,
			isItemDisabled: (element) =>
				element.matches(':disabled') || element.getAttribute('aria-disabled') === 'true',
			keys: 'composite',
			homeEnd: true,
			stopPropagation: true,
			replacement: 'first',
			keydown: 'item'
		});
	const group = new ToggleGroupContext(
		valueProvided,
		roving,
		() => value ?? EMPTY,
		() => disabled,
		() => multiple,
		() => onValueChange ?? (() => {})
	);
	group.commit = (next) => {
		value = next;
	};
	setToggleGroupContext(group);

	const state: ToggleGroupState = $derived({ disabled, multiple, orientation });

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...getStateAttributesProps(state),
		role: 'group',
		...elementProps,
		// Inside a Toolbar the toolbar root is the scroll container.
		...(toolbar ? {} : roving.rootProps)
	});
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
