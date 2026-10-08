<!--
	Provides a shared state to a series of checkboxes. Renders a `<div>`.
	Derived from Base UI v1.8.0 packages/react/src/checkbox-group/CheckboxGroup.tsx
	and packages/react/src/checkbox-group/useCheckboxGroupParent.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Field registration, filled/dirty state, and labelable control ownership are not ported.
	The checkboxes are the existing Checkbox parts.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { setCheckboxGroupContext } from '../checkbox/group-context.js';
	import { createControllableValue } from '../internal/controllable-value.svelte.js';
	import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
	import GroupFrame from '../internal/GroupFrame.svelte';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { CheckboxGroupParent } from './parent.svelte.js';
	import type {
		CheckboxGroupChangeEventDetails,
		CheckboxGroupProps,
		CheckboxGroupState
	} from './types.js';

	let {
		value = $bindable(undefined),
		defaultValue,
		allValues,
		disabled = false,
		onValueChange,
		render,
		children,
		...elementProps
	}: CheckboxGroupProps = $props();

	const EMPTY: string[] = [];
	function publishValue(next: string[] | undefined) {
		value = next;
	}
	const controllable = createControllableValue<string[], CheckboxGroupChangeEventDetails>({
		getProp: () => value,
		setProp: publishValue,
		getDefault: () => defaultValue ?? EMPTY,
		onChange(next, details) {
			if (details || next === undefined) return;
			onValueChange?.(next, createChangeEventDetails(REASONS.none));
		}
	});

	function currentValue() {
		const next = controllable.value;
		return Array.isArray(next) ? next : EMPTY;
	}

	function setValue(next: string[], details: CheckboxGroupChangeEventDetails) {
		onValueChange?.(next, details);
		if (details.isCanceled) return;
		controllable.set(next, details);
	}

	const parentModel = new CheckboxGroupParent({
		readValue: () => currentValue(),
		readAllValues: () => allValues ?? [],
		commit: setValue
	});

	setCheckboxGroupContext({
		get value() {
			return currentValue();
		},
		get disabled() {
			return Boolean(disabled);
		},
		get parent() {
			return allValues === undefined ? undefined : parentModel;
		},
		setValue
	});

	const groupState: CheckboxGroupState = $derived({
		disabled: Boolean(disabled)
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived.by(() => {
		return {
			...getStateAttributesProps(groupState),
			role: 'group',
			...elementProps
		};
	});
</script>

<GroupFrame {hostProps} state={groupState} {render} {children} />
