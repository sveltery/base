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
	import GroupFrame from '../internal/GroupFrame.svelte';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { CheckboxGroupParent } from './parent.svelte.js';
	import type {
		CheckboxGroupChangeEventDetails,
		CheckboxGroupProps,
		CheckboxGroupState
	} from './types.js';

	let {
		value = $bindable(),
		allValues,
		disabled = false,
		onValueChange,
		render,
		children,
		...elementProps
	}: CheckboxGroupProps = $props();

	const EMPTY: string[] = [];

	function setValue(next: string[], details: CheckboxGroupChangeEventDetails) {
		onValueChange?.(next, details);
		if (details.isCanceled) return;
		value = next;
	}

	const parentModel = new CheckboxGroupParent({
		readValue: () => (Array.isArray(value) ? value : EMPTY),
		readAllValues: () => allValues ?? [],
		commit: setValue
	});

	setCheckboxGroupContext({
		get value() {
			return Array.isArray(value) ? value : EMPTY;
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
