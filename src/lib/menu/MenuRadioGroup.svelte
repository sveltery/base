<!--
	Groups related radio items. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/menu/radio-group/MenuRadioGroup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { setMenuGroup, setMenuRadioGroup } from './context.svelte.js';
	import type { MenuRadioGroupProps, MenuRadioGroupState } from './types.js';

	let {
		value = $bindable(),
		onValueChange,
		disabled = false,
		'aria-labelledby': ariaLabelledBy,
		render,
		children,
		...elementProps
	}: MenuRadioGroupProps = $props();

	let labelId = $state<string | undefined>(undefined);
	setMenuGroup({
		get labelId() {
			return labelId;
		},
		setLabelId(id) {
			labelId = id;
		}
	});
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
		...elementProps
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
