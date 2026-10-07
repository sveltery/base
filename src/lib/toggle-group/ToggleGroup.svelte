<!--
	Provides shared pressed state to a series of toggle buttons. Renders a `<div>`.
	Derived from Base UI v1.8.0 packages/react/src/toggle-group/ToggleGroup.tsx
	and the linear composite keyboard path it mounts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Toolbar integration is not ported: the group always owns roving focus.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { ToggleGroupContext, setToggleGroupContext } from './context.svelte.js';
	import type { ToggleGroupProps, ToggleGroupState } from './types.js';

	let {
		value = $bindable(undefined),
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
	const valueProvided = value !== undefined;
	const EMPTY: readonly string[] = [];

	const group = new ToggleGroupContext(valueProvided);
	group.readValues = () => value ?? EMPTY;
	group.readDisabled = () => disabled;
	group.readMultiple = () => multiple;
	group.readOnValueChange = () => onValueChange ?? (() => {});
	group.roving.readLoopFocus = () => loopFocus;
	group.roving.readOrientation = () => orientation;
	group.commit = (next) => {
		value = next;
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
