<!--
	Groups related radio items. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/radio-group/MenuRadioGroup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { findMenuRoot, setMenuGroup, setMenuRadioGroup } from './context.svelte.js';
	import {
		MenuFilterGroup,
		findMenuFilterGroup,
		setMenuFilterGroup
	} from './filter-root.svelte.js';
	import type { MenuRadioGroupProps, MenuRadioGroupState } from './types.js';

	let {
		value = $bindable(),
		defaultValue,
		onValueChange,
		disabled: disabledProp,
		'aria-labelledby': ariaLabelledBy,
		hidden,
		render,
		children,
		...elementProps
	}: MenuRadioGroupProps = $props();
	// svelte-ignore state_referenced_locally
	if (value === undefined && defaultValue !== undefined) value = defaultValue;

	// A filterable menu hides the group once the query filters out all its items.
	const filter = findMenuRoot()?.store.filter;
	const filterGroup = filter ? new MenuFilterGroup(filter, findMenuFilterGroup()) : null;
	if (filterGroup) setMenuFilterGroup(filterGroup);

	let labelId = $state<string | undefined>(undefined);
	setMenuGroup({
		get labelId() {
			return labelId;
		},
		setLabelId(id) {
			labelId = id;
		}
	});
	const disabled = $derived(disabledProp ?? false);
	setMenuRadioGroup({
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		setValue(next, details) {
			onValueChange?.(next, details);
			if (!details.isCanceled) value = next;
		}
	});

	const partState: MenuRadioGroupState = $derived({ disabled });
	const hostProps = $derived({
		role: 'group' as const,
		'aria-labelledby': ariaLabelledBy ?? labelId,
		'aria-disabled': disabled || undefined,
		hidden: filterGroup?.hidden || hidden || undefined,
		...getStateAttributesProps(partState),
		...elementProps
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
