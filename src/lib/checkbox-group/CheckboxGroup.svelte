<!--
	Provides a shared state to a series of checkboxes. Renders a `<div>`.
	Derived from Base UI v1.8.0 packages/react/src/checkbox-group/CheckboxGroup.tsx
	and packages/react/src/checkbox-group/useCheckboxGroupParent.ts
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
	Field registration, filled/dirty state, and labelable control ownership are not ported.
	The checkboxes are the existing Checkbox parts.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setCheckboxGroupContext } from '../checkbox/group-context.js';
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

	// Copied so a child read during render sees the initial props on the server,
	// before effects run. Later parent updates flow through the pre effect.
	let disabledState = $state(untrack(() => Boolean(disabled)));
	let stored = $state<string[]>(untrack(() => (Array.isArray(value) ? value : [])));

	let writes = 0;
	let seenWrites = 0;
	let seenValue = value;

	function commit(next: string[]) {
		writes += 1;
		value = next;
		stored = next;
	}

	function setValue(next: string[], details: CheckboxGroupChangeEventDetails) {
		onValueChange?.(next, details);
		if (details.isCanceled) return;
		commit(next);
	}

	const parentModel = new CheckboxGroupParent({
		readValue: () => stored,
		readAllValues: () => allValues ?? [],
		commit: setValue
	});

	setCheckboxGroupContext({
		get value() {
			return stored;
		},
		get disabled() {
			return disabledState;
		},
		get parent() {
			return allValues === undefined ? undefined : parentModel;
		},
		setValue
	});

	$effect.pre(() => {
		disabledState = Boolean(disabled);

		const incoming = value;
		if (writes !== seenWrites) {
			seenWrites = writes;
			seenValue = incoming;
			return;
		}
		if (Object.is(incoming, seenValue)) return;
		seenValue = incoming;
		stored = Array.isArray(incoming) ? incoming : [];
	});

	const groupState: CheckboxGroupState = $derived({
		disabled: disabledState
	});

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived.by(() => {
		return {
			...getStateAttributesProps(groupState),
			role: 'group',
			...elementProps
		};
	});
</script>

{#if render}
	{@render render(hostProps, groupState)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
