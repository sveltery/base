<!--
	Provides shared pressed state to a series of toggle buttons. Renders a `<div>`.
	Derived from Base UI v1.8.0 packages/react/src/toggle-group/ToggleGroup.tsx
	and the linear composite keyboard path it mounts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Toolbar integration is not ported: the group always owns roving focus.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { CompositeRoot } from '../internal/composite-root.svelte.js';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import { useDirection } from '../internal/direction-context.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { ToggleGroupContext, setToggleGroupContext } from './context.svelte.js';
	import type {
		ToggleGroupChangeEventDetails,
		ToggleGroupProps,
		ToggleGroupState
	} from './types.js';

	let {
		value = $bindable(undefined),
		defaultValue,
		disabled = false,
		loopFocus = true,
		onValueChange,
		orientation = 'horizontal',
		multiple = false,
		render,
		children,
		...elementProps
	}: ToggleGroupProps = $props();

	// Captured once. Assigning `value` later must not look like the parent passed it.
	const valueProvided = untrack(() => value !== undefined || defaultValue !== undefined);
	const EMPTY: readonly string[] = [];
	const controllable = createControllableValue<readonly string[], ToggleGroupChangeEventDetails>({
		getProp: () => value,
		setProp: (next) => {
			value = next;
		},
		getDefault: () => defaultValue ?? EMPTY
	});

	const reading = useDirection();
	const roving = new CompositeRoot({
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
		() => controllable.value ?? EMPTY,
		() => disabled,
		() => multiple,
		() => onValueChange ?? (() => {})
	);
	group.commit = (next, details) => {
		controllable.set(next, details);
	};
	setToggleGroupContext(group);

	const state: ToggleGroupState = $derived({ disabled, multiple, orientation });

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...getStateAttributesProps(state),
		role: 'group',
		...elementProps
	});
</script>

{#if render}
	{@render render(hostProps, state)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
