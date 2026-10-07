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

	const group = new ToggleGroupContext(valueProvided);
	group.values = value ?? [];
	// Distinguishes a parent push from our own commit. A one-way `value` stays
	// at the clicked array until the parent passes a different one.
	let writes = 0;
	let seenWrites = 0;
	let seenValue = value;
	group.commit = (next) => {
		writes += 1;
		value = next;
		group.values = next;
	};
	setToggleGroupContext(group);

	$effect.pre(() => {
		group.disabled = disabled;
		group.multiple = multiple;
		group.onValueChange = onValueChange ?? (() => {});
		group.roving.loopFocus = loopFocus;
		group.roving.orientation = orientation;

		const incoming = value;
		if (writes !== seenWrites) {
			seenWrites = writes;
			seenValue = incoming;
			return;
		}
		if (incoming === seenValue) return;
		seenValue = incoming;
		group.values = incoming ?? [];
	});

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
